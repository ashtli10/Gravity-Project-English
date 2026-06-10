// requestAnimationFrame loop with a capped delta-time, shared by all games.

export class Loop {
  private raf = 0;
  private last = 0;
  private running = false;
  private cb: (dt: number) => void;

  constructor(cb: (dt: number) => void) {
    this.cb = cb;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const tick = (now: number) => {
      if (!this.running) return;
      // Cap dt so tab-switches / breakpoints don't teleport the world.
      const dt = Math.min((now - this.last) / 1000, 0.033);
      this.last = now;
      this.cb(dt);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
}
