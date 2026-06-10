// Lightweight canvas helpers shared across all Frontier 2200 games.

/**
 * Resize a canvas for crisp rendering on high-DPI screens.
 * Sets the backing store to cssSize * dpr and scales the context so all
 * subsequent drawing can use CSS pixel coordinates. Returns logical w/h.
 */
export function fitCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): { width: number; height: number; dpr: number } {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width, height, dpr };
}

/** Rounded rectangle path (does not stroke/fill itself). */
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Draw glowing text centered (or left) at x,y. */
export function glowText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: {
    color: string;
    size: number;
    glow?: number;
    align?: CanvasTextAlign;
    weight?: number | string;
    mono?: boolean;
  }
): void {
  ctx.save();
  ctx.textAlign = opts.align ?? "center";
  ctx.textBaseline = "middle";
  const family = opts.mono
    ? "'JetBrains Mono', monospace"
    : "'Inter', system-ui, sans-serif";
  ctx.font = `${opts.weight ?? 700} ${opts.size}px ${family}`;
  if (opts.glow) {
    ctx.shadowColor = opts.color;
    ctx.shadowBlur = opts.glow;
  }
  ctx.fillStyle = opts.color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Eased ramp 0..1 used by difficulty curves. */
export function easeOut(t: number): number {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 2);
}
