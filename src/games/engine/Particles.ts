import { Particle, Vec2 } from "./types";

export function emitImpact(
  particles: Particle[],
  pos: Vec2,
  color: string,
  count: number
): void {
  for (let i = 0; i < count; i++) {
    particles.push({
      pos: { x: pos.x, y: pos.y },
      vel: {
        x: (Math.random() - 0.5) * 300,
        y: -Math.random() * 200 - 50,
      },
      life: 0.3 + Math.random() * 0.4,
      maxLife: 0.7,
      color,
      size: 2 + Math.random() * 4,
    });
  }
}

export function emitTrail(
  particles: Particle[],
  pos: Vec2,
  color: string
): void {
  particles.push({
    pos: { x: pos.x, y: pos.y },
    vel: { x: -30 + Math.random() * 10, y: (Math.random() - 0.5) * 20 },
    life: 0.15 + Math.random() * 0.15,
    maxLife: 0.3,
    color,
    size: 1.5 + Math.random() * 2,
  });
}

export function emitDeath(
  particles: Particle[],
  pos: Vec2,
  color: string
): void {
  for (let i = 0; i < 25; i++) {
    const angle = (Math.PI * 2 * i) / 25;
    const speed = 100 + Math.random() * 200;
    particles.push({
      pos: { x: pos.x, y: pos.y },
      vel: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
      life: 0.4 + Math.random() * 0.6,
      maxLife: 1,
      color,
      size: 3 + Math.random() * 5,
    });
  }
}

export function updateParticles(particles: Particle[], dt: number): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
    p.vel.y += 200 * dt; // particle gravity
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}
