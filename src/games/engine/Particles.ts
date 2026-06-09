// Simple particle system shared across games (bursts, trails, sparks).

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
}

export class Particles {
  private list: Particle[] = [];

  /** Radial burst — used for explosions / deaths. */
  burst(
    x: number,
    y: number,
    count: number,
    color: string,
    opts: { speed?: number; size?: number; gravity?: number; life?: number } = {}
  ) {
    const speed = opts.speed ?? 320;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.3 + Math.random() * 0.7);
      const life = opts.life ?? 0.6 + Math.random() * 0.5;
      this.list.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life,
        maxLife: life,
        size: (opts.size ?? 4) * (0.5 + Math.random()),
        color,
        gravity: opts.gravity ?? 0,
      });
    }
  }

  /** Single trailing particle — call each frame behind a moving body. */
  trail(x: number, y: number, color: string, size = 3, life = 0.4) {
    this.list.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 30,
      vy: (Math.random() - 0.5) * 30,
      life,
      maxLife: life,
      size,
      color,
      gravity: 0,
    });
  }

  update(dt: number) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.list.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.list) {
      const a = p.life / p.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  clear() {
    this.list = [];
  }
}
