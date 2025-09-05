(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Veritas = {}));
})(this, (function (exports) { 'use strict';

  let mouseEvents = [];
  let keyboardEvents = [];
  let focusEvents = [];
  let scrollEvents = [];

  let listenersInitialized = false;

  // Funções auxiliares
  function getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      vendorSub: navigator.vendorSub
    };
  }

  function getScreenInfo() {
    return {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      orientation: window.screen.orientation?.type || null,
      devicePixelRatio: window.devicePixelRatio
    };
  }

  function getTimezoneInfo() {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      timestamp: Date.now(),
      locale: navigator.language
    };
  }

  function getPlugins() {
    return Array.from(navigator.plugins || []).map(p => p.name);
  }

  function getStorageInfo() {
    return {
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      indexedDB: !!window.indexedDB,
      cookies: navigator.cookieEnabled
    };
  }

  function getBehavior() {
    return {
      mouseEvents: [...mouseEvents],
      keyboardEvents: [...keyboardEvents],
      focusEvents: [...focusEvents],
      scrollEvents: [...scrollEvents]
    };
  }

  // Função principal de coleta
  function collectData(options = {}) {
    if (!listenersInitialized && typeof window !== 'undefined' && options.collectBehavior !== false) {
      // Mouse
      window.addEventListener('mousemove', (e) => {
        mouseEvents.push({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
        if (mouseEvents.length > 100) mouseEvents.shift();
      });
      // Teclado
      window.addEventListener('keydown', (e) => {
        keyboardEvents.push({
          key: e.key,
          timestamp: Date.now(),
          ctrlKey: e.ctrlKey,
          altKey: e.altKey,
          shiftKey: e.shiftKey
        });
        if (keyboardEvents.length > 100) keyboardEvents.shift();
      });
      // Foco
      window.addEventListener('focus', (e) => {
        focusEvents.push({ type: 'focus', timestamp: Date.now(), target: e.target?.tagName || '' });
      }, true);
      window.addEventListener('blur', (e) => {
        focusEvents.push({ type: 'blur', timestamp: Date.now(), target: e.target?.tagName || '' });
      }, true);
      // Scroll
      window.addEventListener('scroll', (e) => {
        scrollEvents.push({ x: window.scrollX, y: window.scrollY, timestamp: Date.now() });
        if (scrollEvents.length > 100) scrollEvents.shift();
      });

      listenersInitialized = true;
    }

    return {
      timestamp: Date.now(),
      browser: getBrowserInfo(),
      screen: getScreenInfo(),
      timezone: getTimezoneInfo(),
      plugins: options.collectPlugins !== false ? getPlugins() : undefined,
      storage: options.collectStorage !== false ? getStorageInfo() : undefined,
      behavior: options.collectBehavior !== false ? getBehavior() : undefined
    };
  }

  function isBrowser() {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined';
  }

  function isNode() {
    return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
  }

  // HMAC para browser
  async function browserHmac(message, secret) {
    if (!crypto || !crypto.subtle) {
      throw new Error('Web Crypto API não disponível');
    }
    
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(message)
    );
    
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  // HMAC para Node.js
  async function nodeHmac(message, secret) {
    try {
      let crypto;
      if (typeof require !== 'undefined') {
        // CommonJS
        crypto = require('crypto');
      } else if (typeof process !== 'undefined' && process.versions?.node) {
        // ESM
        crypto = (await import('crypto')).default;
      }
      if (crypto?.createHmac) {
        return crypto.createHmac('sha256', secret).update(message).digest('base64');
      } else {
        throw new Error('createHmac não disponível');
      }
    } catch (error) {
      throw new Error('Módulo crypto do Node.js não disponível');
    }
  }

  // Função universal para HMAC
  async function createHmac(message, secret) {
    if (isBrowser()) {
      return await browserHmac(message, secret);
    } else if (isNode()) {
      return nodeHmac(message, secret);
    } else {
      throw new Error('Ambiente não suportado para HMAC');
    }
  }

  // Verificação de assinatura
  async function verifyHmac(message, signature, secret) {
    try {
      const expectedSignature = await createHmac(message, secret);
      return expectedSignature === signature;
    } catch (error) {
      return false;
    }
  }

  async function sendToBackend(data, options) {
    const signature = await createHmac(JSON.stringify(data), options.secret);

    const response = await fetch(options.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SDK-Signature': signature
      },
      body: JSON.stringify(data)
    });

    return response;
  }

  /**
   * @typedef {Object} CollectOptions
   * @property {boolean} [collectPlugins]
   * @property {boolean} [collectStorage]
   * @property {boolean} [collectBehavior]
   */

  // Classe principal da SDK
  class Veritas {
    /**
     * @param {Object} options
     * @param {CollectOptions} [options.collectOptions]
     */
    constructor(options = {}) {
      this.options = options;
      this.collectOptions = { collectPlugins: false, collectStorage: false, collectBehavior: false, ...(options.collectOptions || {}) };
    }

    /**
     * @param {CollectOptions} options
     */
    configureCollect(options = {}) {
      this.collectOptions = { ...this.collectOptions, ...options };
    }

    async collect() {
      return await collectData(this.collectOptions);
    }

    async send(data) {
      return await sendToBackend(data, this.options);
    }

    async collectAndSend() {
      const data = await this.collect();
      return await this.send(data);
    }

    async checkRisk(actionData) {
      const data = await this.collect();
      data.action = actionData;
      const response = await this.send(data);
      return await response.json();
    }
    startAutoCollection() {}
    stopAutoCollection() {}
    configure(newOptions) { Object.assign(this.options, newOptions); }
    destroy() {}
  }

  // Função de conveniência
  function init(options = {}) {
    const sdk = new Veritas(options);
    return sdk;
  }

  exports.Veritas = Veritas;
  exports.createHmac = createHmac;
  exports.default = Veritas;
  exports.init = init;
  exports.verifyHmac = verifyHmac;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=veritas-sdk.umd.js.map
