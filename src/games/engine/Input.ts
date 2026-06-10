// Unified pointer + keyboard input for the canvas games.
// A "tap" is any pointerdown, mousedown, touchstart, or jump-key press.
// Games poll consumeTap() once per frame and read isHolding() for variable jumps.

export class Input {
  private tapQueued = false;
  private holding = false;
  private el: HTMLElement | Window;
  private bound: Array<[string, EventListener]> = [];

  constructor(target?: HTMLElement) {
    this.el = target ?? window;

    const press = (e: Event) => {
      // Ignore multi-touch extras; any press counts as a tap.
      this.tapQueued = true;
      this.holding = true;
      if (e.cancelable) e.preventDefault();
    };
    const release = () => {
      this.holding = false;
    };
    const keyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" ||
        e.code === "ArrowUp" ||
        e.code === "ArrowDown" ||
        e.code === "KeyW"
      ) {
        if (!e.repeat) {
          this.tapQueued = true;
          this.holding = true;
        }
        e.preventDefault();
      }
    };
    const keyUp = (e: KeyboardEvent) => {
      if (
        e.code === "Space" ||
        e.code === "ArrowUp" ||
        e.code === "ArrowDown" ||
        e.code === "KeyW"
      ) {
        this.holding = false;
      }
    };

    this.add("pointerdown", press as EventListener);
    this.add("pointerup", release as EventListener);
    this.add("pointercancel", release as EventListener);
    this.add("touchstart", press as EventListener);
    this.add("touchend", release as EventListener);
    this.add("mousedown", press as EventListener);
    this.add("mouseup", release as EventListener);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    this.bound.push(["keydown", keyDown as EventListener]);
    this.bound.push(["keyup", keyUp as EventListener]);
  }

  private add(type: string, fn: EventListener) {
    this.el.addEventListener(type, fn, { passive: false } as AddEventListenerOptions);
    this.bound.push([type, fn]);
  }

  /** Returns true once per queued tap, then clears it. */
  consumeTap(): boolean {
    if (this.tapQueued) {
      this.tapQueued = false;
      return true;
    }
    return false;
  }

  isHolding(): boolean {
    return this.holding;
  }

  destroy() {
    for (const [type, fn] of this.bound) {
      if (type === "keydown" || type === "keyup") {
        window.removeEventListener(type, fn);
      } else {
        this.el.removeEventListener(type, fn);
      }
    }
    this.bound = [];
  }
}
