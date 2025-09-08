export class BehaviorCollector {
  constructor() {
    this.mouseEvents = [];
    this.keyboardEvents = [];
    this.focusEvents = [];
    this.scrollEvents = [];
    this.clickEvents = [];
    this.listenersInitialized = false;
  }

  initListeners() {
    if (this.listenersInitialized || typeof window === 'undefined') return;

    // Mouse
    window.addEventListener('mousemove', (e) => {
      this.mouseEvents.push({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
      if (this.mouseEvents.length > 100) this.mouseEvents.shift();
    });

    // Teclado
    window.addEventListener('keydown', (e) => {
      this.keyboardEvents.push({
        key: e.key,
        timestamp: Date.now(),
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey
      });
      if (this.keyboardEvents.length > 100) this.keyboardEvents.shift();
    });

    // Foco
    window.addEventListener('focus', (e) => {
      this.focusEvents.push({ type: 'focus', timestamp: Date.now(), target: e.target?.tagName || '' });
    }, true);

    window.addEventListener('blur', (e) => {
      this.focusEvents.push({ type: 'blur', timestamp: Date.now(), target: e.target?.tagName || '' });
    }, true);

    // Scroll
    window.addEventListener('scroll', () => {
      this.scrollEvents.push({ x: window.scrollX, y: window.scrollY, timestamp: Date.now() });
      if (this.scrollEvents.length > 100) this.scrollEvents.shift();
    });

    // Click
    window.addEventListener('click', (e) => {
      this.clickEvents.push({ timestamp: Date.now(), x: e.clientX, y: e.clientY });
      if (this.clickEvents.length > 100) this.clickEvents.shift();
    });

    this.listenersInitialized = true;
  }

  clickFrequency(windowMs = 10000) {
    const now = Date.now();
    const recentClicks = this.clickEvents.filter(c => now - c.timestamp <= windowMs);
    return recentClicks.length / (windowMs / 1000); // cliques por segundo
  }

  avgClickInterval() {
    if (this.clickEvents.length < 2) return null;
    let intervals = [];
    for (let i = 1; i < this.clickEvents.length; i++) {
      intervals.push(this.clickEvents[i].timestamp - this.clickEvents[i - 1].timestamp);
    }
    return intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  getBehavior() {
    return {
      mouseEvents: [...this.mouseEvents],
      keyboardEvents: [...this.keyboardEvents],
      focusEvents: [...this.focusEvents],
      scrollEvents: [...this.scrollEvents],
      clickEvents: [...this.clickEvents],
      clickFrequency: this.clickFrequency(),
      avgClickInterval: this.avgClickInterval()
    };
  }
}
