export class InputManager {
  private canvas: HTMLCanvasElement;
  private _jumpPressed = false;
  private _holdingJump = false;
  private _swipeDown = false;
  private touchStartY = 0;
  private touchStartTime = 0;
  private touching = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.bindEvents();
  }

  private bindEvents(): void {
    const opts = { passive: false } as AddEventListenerOptions;

    this.canvas.addEventListener("touchstart", this.onTouchStart, opts);
    this.canvas.addEventListener("touchmove", this.onTouchMove, opts);
    this.canvas.addEventListener("touchend", this.onTouchEnd, opts);

    // Mouse fallback for desktop testing
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mouseup", this.onMouseUp);
  }

  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    this.touching = true;
    this.touchStartY = e.touches[0].clientY;
    this.touchStartTime = performance.now();
    this._jumpPressed = true;
    this._holdingJump = true;
    this._swipeDown = false;
  };

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    if (this.touching) {
      const dy = e.touches[0].clientY - this.touchStartY;
      if (dy > 40) {
        this._swipeDown = true;
        this._holdingJump = false;
      }
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();
    this.touching = false;
    this._holdingJump = false;
  };

  private onMouseDown = (): void => {
    this._jumpPressed = true;
    this._holdingJump = true;
  };

  private onMouseUp = (): void => {
    this._holdingJump = false;
  };

  consumeJump(): boolean {
    if (this._jumpPressed) {
      this._jumpPressed = false;
      return true;
    }
    return false;
  }

  isHolding(): boolean {
    return this._holdingJump;
  }

  consumeSwipeDown(): boolean {
    if (this._swipeDown) {
      this._swipeDown = false;
      return true;
    }
    return false;
  }

  destroy(): void {
    this.canvas.removeEventListener("touchstart", this.onTouchStart);
    this.canvas.removeEventListener("touchmove", this.onTouchMove);
    this.canvas.removeEventListener("touchend", this.onTouchEnd);
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener("mouseup", this.onMouseUp);
  }
}
