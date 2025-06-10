(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Veritas = {}));
})(this, (function (exports) { 'use strict';

  // Utilitários compartilhados entre browser e Node.js
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  function isNode() {
    return typeof window === 'undefined' && typeof global !== 'undefined';
  }

  function isBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  // Hash simples para fingerprinting
  function simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  class DataCollector {
    constructor() {
      this.mouseEvents = [];
      this.keyboardEvents = [];
      this.focusEvents = [];
      this.scrollEvents = [];
      this.sessionData = {};
      
      if (isBrowser()) {
        this.initBrowserCollectors();
      }
    }

    initBrowserCollectors() {
      // Coleta de movimentos do mouse (debounced)
      const debouncedMouseMove = debounce((e) => {
        this.mouseEvents.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now()
        });
        
        // Manter apenas os últimos 50 eventos
        if (this.mouseEvents.length > 50) {
          this.mouseEvents = this.mouseEvents.slice(-50);
        }
      }, 100);

      // Coleta de eventos de teclado (sem capturar conteúdo)
      const debouncedKeyboard = debounce((e) => {
        this.keyboardEvents.push({
          key: e.key.length === 1 ? 'char' : e.key, // Não captura caracteres específicos
          timestamp: Date.now(),
          ctrlKey: e.ctrlKey,
          altKey: e.altKey,
          shiftKey: e.shiftKey
        });
        
        if (this.keyboardEvents.length > 30) {
          this.keyboardEvents = this.keyboardEvents.slice(-30);
        }
      }, 50);

      // Eventos de foco
      const focusHandler = (e) => {
        this.focusEvents.push({
          type: e.type,
          timestamp: Date.now(),
          target: e.target.tagName
        });
        
        if (this.focusEvents.length > 20) {
          this.focusEvents = this.focusEvents.slice(-20);
        }
      };

      // Eventos de scroll
      const debouncedScroll = debounce(() => {
        this.scrollEvents.push({
          x: window.scrollX,
          y: window.scrollY,
          timestamp: Date.now()
        });
        
        if (this.scrollEvents.length > 20) {
          this.scrollEvents = this.scrollEvents.slice(-20);
        }
      }, 200);

      // Adicionar listeners
      document.addEventListener('mousemove', debouncedMouseMove);
      document.addEventListener('keydown', debouncedKeyboard);
      document.addEventListener('focus', focusHandler, true);
      document.addEventListener('blur', focusHandler, true);
      window.addEventListener('scroll', debouncedScroll);
    }

    // Coleta informações básicas do navegador
    getBrowserInfo() {
      if (!isBrowser()) return {};

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

    // Coleta informações da tela
    getScreenInfo() {
      if (!isBrowser()) return {};

      return {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        orientation: screen.orientation ? screen.orientation.type : null,
        devicePixelRatio: window.devicePixelRatio
      };
    }

    // Coleta informações de timezone
    getTimezoneInfo() {
      const now = new Date();
      return {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: now.getTimezoneOffset(),
        timestamp: now.getTime(),
        locale: Intl.DateTimeFormat().resolvedOptions().locale
      };
    }

    // Canvas fingerprinting
    getCanvasFingerprint() {
      if (!isBrowser()) return null;

      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Desenhar texto e formas para criar fingerprint único
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Veritas SDK Canvas Test 🔒', 2, 2);
        
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillRect(100, 5, 80, 20);
        
        const dataURL = canvas.toDataURL();
        return simpleHash(dataURL);
      } catch (error) {
        return null;
      }
    }

    // WebGL fingerprinting
    getWebGLFingerprint() {
      if (!isBrowser()) return null;

      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return null;

        const renderer = gl.getParameter(gl.RENDERER);
        const vendor = gl.getParameter(gl.VENDOR);
        const version = gl.getParameter(gl.VERSION);
        const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
        
        const fingerprint = `${renderer}|${vendor}|${version}|${shadingLanguageVersion}`;
        return simpleHash(fingerprint);
      } catch (error) {
        return null;
      }
    }

    // Audio fingerprinting
    getAudioFingerprint() {
      if (!isBrowser()) return null;

      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const analyser = audioContext.createAnalyser();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 1000;
        gainNode.gain.value = 0;
        
        const fingerprint = `${audioContext.sampleRate}|${audioContext.state}|${analyser.frequencyBinCount}`;
        
        audioContext.close();
        return simpleHash(fingerprint);
      } catch (error) {
        return null;
      }
    }

    // Coleta informações de plugins (limitado por segurança moderna)
    getPluginsInfo() {
      if (!isBrowser() || !navigator.plugins) return [];

      const plugins = [];
      for (let i = 0; i < navigator.plugins.length; i++) {
        const plugin = navigator.plugins[i];
        plugins.push({
          name: plugin.name,
          description: plugin.description,
          filename: plugin.filename
        });
      }
      return plugins;
    }

    // Coleta dados de armazenamento local
    getStorageInfo() {
      if (!isBrowser()) return {};

      const storage = {};
      
      try {
        storage.localStorage = !!window.localStorage;
        storage.sessionStorage = !!window.sessionStorage;
        storage.indexedDB = !!window.indexedDB;
        storage.webSQL = !!window.openDatabase;
      } catch (error) {
        // Alguns navegadores podem bloquear acesso ao storage
      }

      return storage;
    }

    // Método principal para coletar todos os dados
    collectAll() {
      const data = {
        sessionId: this.sessionData.sessionId || (this.sessionData.sessionId = Date.now().toString(36)),
        timestamp: Date.now(),
        browser: this.getBrowserInfo(),
        screen: this.getScreenInfo(),
        timezone: this.getTimezoneInfo(),
        fingerprints: {
          canvas: this.getCanvasFingerprint(),
          webgl: this.getWebGLFingerprint(),
          audio: this.getAudioFingerprint()
        },
        plugins: this.getPluginsInfo(),
        storage: this.getStorageInfo(),
        behavior: {
          mouseEvents: [...this.mouseEvents],
          keyboardEvents: [...this.keyboardEvents],
          focusEvents: [...this.focusEvents],
          scrollEvents: [...this.scrollEvents]
        }
      };

      return data;
    }
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
  function nodeHmac(message, secret) {
    try {
      // Tentar importação dinâmica primeiro
      const crypto = globalThis.crypto || require('crypto');
      if (crypto.createHmac) {
        return crypto.createHmac('sha256', secret).update(message).digest('base64');
      } else {
        throw new Error('createHmac não disponível');
      }
    } catch (error) {
      throw new Error('Módulo crypto do Node.js não disponível');
    }
  }

  // Função HMAC
  async function createHmac(message, secret) {
    if (isBrowser()) {
      return await browserHmac(message, secret);
    } else if (isNode()) {
      return nodeHmac(message, secret);
    } else {
      throw new Error('Ambiente não suportado para HMAC');
    }
  }

  class DataSender {
    constructor(options = {}) {
      this.endpoint = options.endpoint;
      this.secret = options.secret;
      this.timeout = options.timeout || 5000;
      this.retries = options.retries || 2;
    }

    async sendData(data) {
      if (!this.endpoint) {
        throw new Error('Endpoint não configurado');
      }

      const payload = JSON.stringify(data);
      let signature = null;

      // Criar assinatura se secret estiver configurado
      if (this.secret) {
        try {
          signature = await createHmac(payload, this.secret);
        } catch (error) {
          console.warn('Falha ao criar assinatura HMAC:', error.message);
        }
      }

      const headers = {
        'Content-Type': 'application/json'
      };

      if (signature) {
        headers['X-SDK-Signature'] = signature;
      }

      // Tentar enviar com retry
      for (let attempt = 0; attempt <= this.retries; attempt++) {
        try {
          const response = await this.makeRequest(this.endpoint, {
            method: 'POST',
            headers,
            body: payload
          });

          if (response.ok) {
            const result = await response.json();
            return result;
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          if (attempt === this.retries) {
            throw error;
          }
          
          // Aguardar antes de tentar novamente
          await this.delay(1000 * (attempt + 1));
        }
      }
    }

    async makeRequest(url, options) {
      if (isBrowser()) {
        return await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(this.timeout)
        });
      } else if (isNode()) {
        // Para Node.js, usar fetch nativo (Node 18+) ou implementação alternativa
        try {
          const fetch = globalThis.fetch || require('node-fetch');
          return await fetch(url, options);
        } catch (error) {
          throw new Error('Fetch não disponível no Node.js. Instale node-fetch ou use Node.js 18+');
        }
      } else {
        throw new Error('Ambiente não suportado para requisições HTTP');
      }
    }

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  class Veritas {
    constructor(options = {}) {
      this.options = {
        endpoint: options.endpoint,
        secret: options.secret,
        autoCollect: options.autoCollect !== false, // true por padrão
        collectInterval: options.collectInterval || 30000, // 30 segundos
        timeout: options.timeout || 5000,
        retries: options.retries || 2,
        debug: options.debug || false,
        ...options
      };

      this.collector = new DataCollector();
      this.sender = new DataSender({
        endpoint: this.options.endpoint,
        secret: this.options.secret,
        timeout: this.options.timeout,
        retries: this.options.retries
      });

      this.sessionId = generateId();
      this.isInitialized = false;
      this.collectTimer = null;

      if (this.options.debug) {
        console.log('Veritas inicializado com opções:', this.options);
      }
    }

    // Inicializar o SDK
    init() {
      if (this.isInitialized) {
        console.warn('SDK já foi inicializado');
        return;
      }

      this.isInitialized = true;

      if (this.options.autoCollect && isBrowser()) {
        this.startAutoCollection();
      }

      if (this.options.debug) {
        console.log('SDK inicializado com sucesso');
      }

      return this;
    }

    // Iniciar coleta automática (apenas no browser)
    startAutoCollection() {
      if (!isBrowser()) {
        console.warn('Coleta automática disponível apenas no browser');
        return;
      }

      if (this.collectTimer) {
        clearInterval(this.collectTimer);
      }

      this.collectTimer = setInterval(() => {
        this.collectAndSend().catch(error => {
          if (this.options.debug) {
            console.error('Erro na coleta automática:', error);
          }
        });
      }, this.options.collectInterval);

      if (this.options.debug) {
        console.log('Coleta automática iniciada');
      }
    }

    // Parar coleta automática
    stopAutoCollection() {
      if (this.collectTimer) {
        clearInterval(this.collectTimer);
        this.collectTimer = null;
        
        if (this.options.debug) {
          console.log('Coleta automática parada');
        }
      }
    }

    // Coletar dados manualmente
    collect() {
      try {
        const data = this.collector.collectAll();
        data.sdkVersion = '1.0.0';
        data.sdkSessionId = this.sessionId;
        
        if (this.options.debug) {
          console.log('Dados coletados:', data);
        }
        
        return data;
      } catch (error) {
        if (this.options.debug) {
          console.error('Erro ao coletar dados:', error);
        }
        throw error;
      }
    }

    // Enviar dados manualmente
    async send(data) {
      if (!this.options.endpoint) {
        throw new Error('Endpoint não configurado');
      }

      try {
        const result = await this.sender.sendData(data);
        
        if (this.options.debug) {
          console.log('Dados enviados com sucesso:', result);
        }
        
        return result;
      } catch (error) {
        if (this.options.debug) {
          console.error('Erro ao enviar dados:', error);
        }
        throw error;
      }
    }

    // Coletar e enviar dados
    async collectAndSend() {
      const data = this.collect();
      return await this.send(data);
    }

    // Verificar risco de uma ação específica
    async checkRisk(actionData = {}) {
      const data = this.collect();
      data.action = actionData;
      
      return await this.send(data);
    }

    // Destruir o SDK
    destroy() {
      this.stopAutoCollection();
      this.isInitialized = false;
      
      if (this.options.debug) {
        console.log('SDK destruído');
      }
    }

    // Atualizar configurações
    configure(newOptions) {
      this.options = { ...this.options, ...newOptions };
      
      // Atualizar sender com novas configurações
      this.sender = new DataSender({
        endpoint: this.options.endpoint,
        secret: this.options.secret,
        timeout: this.options.timeout,
        retries: this.options.retries
      });

      if (this.options.debug) {
        console.log('SDK reconfigurado:', this.options);
      }
    }
  }

  // Função de conveniência para inicialização rápida
  function initSDK(options = {}) {
    const sdk = new Veritas(options);
    return sdk.init();
  }

  exports.Veritas = Veritas;
  exports.default = Veritas;
  exports.initSDK = initSDK;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=veritas-sdk.umd.js.map
