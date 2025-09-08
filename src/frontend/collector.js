import { BehaviorCollector } from './BehaviorCollector.js';

// ==================== Helpers ====================

function getBrowserInfo() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
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

function collectFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125,1,62,20);
    ctx.fillStyle = '#069';
    ctx.fillText('fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('fingerprint', 4, 17);
    return canvas.toDataURL();
  } catch (e) {
    return 'unavailable';
  }
}

// ==================== Main Collector ====================

const behaviorCollector = new BehaviorCollector();

export function collectData(options = {}) {
  if (options.collectBehavior !== false) {
    behaviorCollector.initListeners();
  }

  return {
    timestamp: Date.now(),
    browser: getBrowserInfo(),
    fingerprint: options.collectFingerprint !== false ? collectFingerprint() : undefined,
    timezone: getTimezoneInfo(),
    plugins: options.collectPlugins !== false ? getPlugins() : undefined,
    storage: options.collectStorage !== false ? getStorageInfo() : undefined,
    behavior: options.collectBehavior !== false ? {
      screen: getScreenInfo(),
      ...behaviorCollector.getBehavior()
    } : undefined
  };
}
