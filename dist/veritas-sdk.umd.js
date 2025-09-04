(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Veritas = {}));
})(this, (function (exports) { 'use strict';

  function collectData() {
    const mouseMoves = [];
    const focusEvents = [];

    // Coletar movimentos do mouse
    window.addEventListener('mousemove', (e) => {
      mouseMoves.push({ x: e.clientX, y: e.clientY, t: Date.now() });
      // Limite para não crescer indefinidamente
      if (mouseMoves.length > 100) mouseMoves.shift();
    });

    // Coletar eventos de foco
    window.addEventListener('focus', (e) => {
      focusEvents.push({ type: 'focus', t: Date.now() });
    });
    window.addEventListener('blur', (e) => {
      focusEvents.push({ type: 'blur', t: Date.now() });
    });

    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      mouseMoves,
      focusEvents,
    };
  }

  function isBrowser() {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined';
  }

  function isNode() {
    return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
  }

  // Implementação HMAC para browser
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

  // Implementação HMAC para Node.js
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

  const weights = {
      canvas: 20,
      webgl: 15,
      audio: 5,
      mouseEvents: 25,
      keyboardEvents: 20,
      timezoneUTC: 10,
      highValuePurchase: 30
  };

  function evaluateRisk(data) {
      let score = 0;
      score += !data.fingerprints?.canvas ? weights.canvas : 0;
      score += !data.fingerprints?.webgl ? weights.webgl : 0;
      score += !data.fingerprints?.audio ? weights.audio : 0;
      score += (data.behavior?.mouseEvents?.length < 5) ? weights.mouseEvents : 0;
      score += (data.behavior?.keyboardEvents?.length < 3) ? weights.keyboardEvents : 0;
      score += (data.timezone?.timezone === 'UTC') ? weights.timezoneUTC : 0;
      score += (data.action?.action === 'purchase' && data.action?.amount > 1000) ? weights.highValuePurchase : 0;
      return Math.min(100, score);
  }

  function riskDecision(score, data, threshold = 45) {
      let decision = 'allow';
      if (score >= threshold) decision = 'deny';
      else if (score >= threshold * 0.7) decision = 'review';
      else decision = 'allow';

      const reasons = [];
      if (score >= 50) reasons.push('Comportamento suspeito detectado');
      if (!data.fingerprints?.canvas) reasons.push('Fingerprint de canvas ausente');
      if (data.action?.amount > 1000) reasons.push('Valor de transação alto');
      return { decision, reasons };
  }

  // Classe principal da SDK
  class Veritas {
    constructor(options = {}) {
      this.options = options;
    }
    collect() { return collectData(); }
    async send(data) { return sendToBackend(data, this.options); }
    async collectAndSend() {
      const data = this.collect();
      return this.send(data);
    }
    async checkRisk(actionData) {
      const data = this.collect();
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
  exports.evaluateRisk = evaluateRisk;
  exports.init = init;
  exports.riskDecision = riskDecision;
  exports.verifyHmac = verifyHmac;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=veritas-sdk.umd.js.map
