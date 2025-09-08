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
export function collectData(options = {}) {
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
