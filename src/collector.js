export function collectData() {
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
