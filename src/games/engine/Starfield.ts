// Parallax starfield — the shared sci-fi backdrop for all Frontier 2200 games.

interface Star {
  x: number;
  y: number;
  z: number; // depth 0..1 (drives size, brightness, parallax speed)
  tw: number; // twinkle phase
}

export class Starfield {
  private stars: Star[] = [];
  private w: number;
  private h: number;

  constructor(width: number, height: number, count = 90) {
    this.w = width;
    this.h = height;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random(),
        tw: Math.random() * Math.PI * 2,
      });
    }
  }

  resize(width: number, height: number) {
    this.w = width;
    this.h = height;
  }

  /** scrollX = world scroll in px; stars drift left proportional to depth. */
  update(dt: number, scrollSpeed: number) {
    for (const s of this.stars) {
      s.x -= scrollSpeed * (0.2 + s.z * 0.8) * dt;
      s.tw += dt * (1 + s.z * 2);
      if (s.x < 0) {
        s.x += this.w;
        s.y = Math.random() * this.h;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, tint = "200,210,255") {
    ctx.save();
    for (const s of this.stars) {
      const size = 0.5 + s.z * 1.8;
      const alpha = 0.3 + 0.5 * s.z + 0.2 * Math.sin(s.tw);
      ctx.fillStyle = `rgba(${tint},${Math.max(0, alpha).toFixed(3)})`;
      ctx.fillRect(s.x, s.y, size, size);
    }
    ctx.restore();
  }
}
