// Based on space-invaders by Piotr Nalepa (github.com/sunpietro/space-invaders), MIT License. Entity logic ported; touch controls, waves, power-ups, enemy variety, bosses and theme added.
//
// DRONE DEFENSE — Frontier 2200
// Rogue drones are attacking the city of 2200. Drag the hover interceptor to
// steer; it auto-fires. Destroy drones to drop power-ups and fill the booster
// meter, which auto-triggers a short OVERDRIVE ultra-shooting burst. Survive
// escalating waves and the boss carrier that arrives every fifth wave.
//
// Ported from the original Space-Invaders: the flat `bodies` array world, the
// pairwise `colliding()` overlap filter, patrol movement with `patrolX`
// direction flipping, the "fire only when no drone is below" gate, and the
// loop being started directly (no sound-load gate). Everything else — touch
// steering, power-ups, the booster/OVERDRIVE system, enemy variety, bosses,
// formation patterns and live scoring — is original work for this project.

import { useEffect, useRef } from "react";
import { Loop } from "./engine/Loop";
import { Particles } from "./engine/Particles";
import { Starfield } from "./engine/Starfield";
import { fitCanvas, glowText, clamp, roundRect } from "./engine/draw";

// ── Palette ──────────────────────────────────────────────────────────────────
const GOLD = "#ffc107";
const CYAN = "#00e5ff";
const RED = "#ff5252";
const BG = "#0a0a0f";
const MAGENTA = "#ff2d7b"; // OVERDRIVE / ULTRA
const GREEN = "#00e676"; // SHIELD
const ORANGE = "#ff6b35"; // BOMB
const ROW_COLORS = ["#b388ff", "#ff6b35", "#26c6a2", "#7986cb", "#f48fb1", "#ffd54f"];

const BEST_KEY = "droneDefense_best";

// ── Tunables (CSS px / seconds) ──────────────────────────────────────────────
const FIELD_MAX = 600; // max playfield width (CSS px); centered on wide iPads
const PATROL_RANGE = 30; // patrol amplitude (~30 px)
const FLIP_DESCENT = 11; // gentle sink on every patrol direction flip
const FIRE_PERIOD = 0.34; // base interceptor auto-fire cadence
const PLAYER_BOLT_SPEED = 540;
const DRONE_SPEED_BASE = 26; // ported feel, scaled for a phone canvas
const KEY_SPEED = 380; // optional desktop arrow keys
const MAX_SHIELDS = 5;
const START_SHIELDS = 3;

// Power-up timings.
const RAPID_TIME = 7;
const SPREAD_TIME = 8;
const OVERDRIVE_TIME = 5;
const BOOST_OVERDRIVE_TIME = 3.2; // shorter burst from the booster meter
const POWERUP_FALL_SPEED = 95;
const POWERUP_CHANCE = 0.15; // ~15% drop chance (within the 12-18% spec range)
const BOOST_MAX = 100; // booster meter fills as enemies die

// Live-scoring cadence: report current score to the leaderboard every 0.7s.
const REPORT_INTERVAL = 0.7;

type PowerKind = "RAPID" | "SPREAD" | "ULTRA" | "SHIELD" | "BOMB";

const POWER_COLOR: Record<PowerKind, string> = {
  RAPID: CYAN,
  SPREAD: GOLD,
  ULTRA: MAGENTA,
  SHIELD: GREEN,
  BOMB: ORANGE,
};

// ── Entity architecture (ported from the original's bodies array) ────────────

interface Vec {
  x: number;
  y: number;
}

/** Written by the pointer/keyboard listeners, read by the Player each frame. */
interface Controls {
  targetX: number;
  left: boolean;
  right: boolean;
}

abstract class Body {
  abstract center: Vec;
  abstract size: Vec;
  abstract update(dt: number): void;
  abstract draw(ctx: CanvasRenderingContext2D, t: number): void;
  /** Called when the pairwise filter finds an overlap; return true to remove. */
  onCollision(): boolean {
    return true;
  }
}

/** Ported verbatim: axis-aligned overlap test that is never true for self. */
function colliding(body1: Body, body2: Body): boolean {
  return !(
    body1 === body2 ||
    body1.center.x + body1.size.x / 2 < body2.center.x - body2.size.x / 2 ||
    body1.center.y + body1.size.y / 2 < body2.center.y - body2.size.y / 2 ||
    body1.center.x - body1.size.x / 2 > body2.center.x + body2.size.x / 2 ||
    body1.center.y - body1.size.y / 2 > body2.center.y + body2.size.y / 2
  );
}

// ── Bolts ──────────────────────────────────────────────────────────────────

class Bolt extends Body {
  size: Vec;
  /** Friendly bolts with pierce > 0 survive hits and pass through enemies. */
  pierce = 0;

  constructor(
    public center: Vec,
    public velocity: Vec,
    public friendly: boolean,
    public color = friendly ? CYAN : RED
  ) {
    super();
    this.size = friendly ? { x: 4, y: 14 } : { x: 5, y: 11 };
  }

  update(dt: number) {
    this.center.x += this.velocity.x * dt;
    this.center.y += this.velocity.y * dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.pierce > 0 ? 16 : 10;
    ctx.fillStyle = this.color;
    roundRect(
      ctx,
      this.center.x - this.size.x / 2,
      this.center.y - this.size.y / 2,
      this.size.x,
      this.size.y,
      2.5
    );
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(this.center.x - 1, this.center.y - this.size.y * 0.25, 2, this.size.y * 0.5);
    ctx.restore();
  }
}

// ── Enemies ──────────────────────────────────────────────────────────────────

type DroneKind = "grunt" | "diver" | "tank" | "boss";

const KIND_SCORE: Record<DroneKind, number> = {
  grunt: 10,
  diver: 20,
  tank: 40,
  boss: 300,
};

class Drone extends Body {
  patrolX = 0;
  speedX: number;
  size: Vec;
  hp: number;
  maxHp: number;
  kind: DroneKind;
  row: number;

  // Diver state machine: patrol → dive (toward player X) → recover.
  diveState: "formation" | "diving" | "leaving" = "formation";
  diveTimer: number;
  baseY: number;

  // Boss-only: pattern cadence + horizontal drift.
  bossDir = 1;
  bossFireTimer = 1.2;

  constructor(
    private game: Game,
    public center: Vec,
    row: number,
    kind: DroneKind,
    hp: number
  ) {
    super();
    this.kind = kind;
    this.row = row;
    this.hp = hp;
    this.maxHp = hp;
    this.baseY = center.y;
    this.diveTimer = 2 + Math.random() * 4;
    if (kind === "boss") {
      this.size = { x: Math.min(150, game.fieldW * 0.5), y: 56 };
    } else if (kind === "tank") {
      this.size = { x: game.droneSize.x + 8, y: game.droneSize.y + 6 };
    } else {
      this.size = { x: game.droneSize.x, y: game.droneSize.y };
    }
    this.speedX = game.droneSpeed * (kind === "tank" ? 0.7 : kind === "diver" ? 1.25 : 1);
  }

  private patrol(dt: number) {
    if (this.patrolX < 0 || this.patrolX > PATROL_RANGE) {
      this.speedX = -this.speedX;
      this.patrolX = clamp(this.patrolX, 0, PATROL_RANGE);
      this.center.y += FLIP_DESCENT;
      this.baseY += FLIP_DESCENT;
    }
    this.center.x += this.speedX * dt;
    this.patrolX += this.speedX * dt;
  }

  update(dt: number) {
    const g = this.game;
    if (this.kind === "boss") {
      this.updateBoss(dt);
      return;
    }

    if (this.kind === "diver") {
      this.updateDiver(dt);
    } else {
      this.patrol(dt);
    }

    // Ported firing gate: only drones with clear airspace below may shoot.
    // Tanks fire more often; divers don't shoot while swooping.
    const rate = g.fireRate * (this.kind === "tank" ? 2 : 1);
    const canShoot = this.kind !== "diver" || this.diveState === "formation";
    if (canShoot && Math.random() < rate * dt && !g.dronesBelow(this)) {
      g.addBody(
        new Bolt(
          { x: this.center.x, y: this.center.y + this.size.y / 2 + 8 },
          { x: (Math.random() - 0.5) * 50, y: g.boltSpeed },
          false
        )
      );
    }
  }

  private updateDiver(dt: number) {
    const g = this.game;
    if (this.diveState === "formation") {
      this.patrol(dt);
      this.diveTimer -= dt;
      if (this.diveTimer <= 0) {
        this.diveState = "diving";
      }
    } else if (this.diveState === "diving") {
      // Swoop toward the player's current X while diving fast.
      const dx = g.player.center.x - this.center.x;
      this.center.x += clamp(dx, -160 * dt, 160 * dt);
      this.center.y += (g.droneSpeed * 4.4) * dt;
      if (this.center.y > g.defenseY - 60) {
        this.diveState = "leaving";
      }
    } else {
      // Climb back up off-screen, then re-enter at the top of formation.
      this.center.y -= (g.droneSpeed * 5) * dt;
      if (this.center.y < 70) {
        this.center.y = 70;
        this.baseY = 70;
        this.diveState = "formation";
        this.diveTimer = 4 + Math.random() * 4;
        this.patrolX = PATROL_RANGE / 2;
      }
    }
  }

  private updateBoss(dt: number) {
    const g = this.game;
    // Drift across the upper field, bouncing off the playfield edges.
    this.center.x += this.bossDir * g.droneSpeed * 1.6 * dt;
    const margin = this.size.x / 2 + 6;
    if (this.center.x < g.fieldX + margin) {
      this.center.x = g.fieldX + margin;
      this.bossDir = 1;
    } else if (this.center.x > g.fieldX + g.fieldW - margin) {
      this.center.x = g.fieldX + g.fieldW - margin;
      this.bossDir = -1;
    }
    // Slow descent toward the city to keep pressure on.
    this.center.y += 3.5 * dt;

    this.bossFireTimer -= dt;
    if (this.bossFireTimer <= 0) {
      this.bossFireTimer = Math.max(0.7, 1.6 - 0.06 * g.wave);
      const y = this.center.y + this.size.y / 2;
      if (Math.random() < 0.5) {
        // Radial spread pattern.
        const n = 5 + Math.floor(g.wave / 5);
        for (let i = 0; i < n; i++) {
          const a = Math.PI / 2 + (i - (n - 1) / 2) * 0.32;
          g.addBody(
            new Bolt(
              { x: this.center.x, y },
              { x: Math.cos(a) * g.boltSpeed, y: Math.sin(a) * g.boltSpeed },
              false
            )
          );
        }
      } else {
        // Aimed burst at the player.
        const dx = g.player.center.x - this.center.x;
        const dy = g.player.center.y - y;
        const len = Math.hypot(dx, dy) || 1;
        for (let i = -1; i <= 1; i++) {
          g.addBody(
            new Bolt(
              { x: this.center.x + i * 14, y },
              { x: (dx / len) * g.boltSpeed * 1.1, y: (dy / len) * g.boltSpeed * 1.1 },
              false
            )
          );
        }
      }
    }
  }

  /** Apply one bolt of damage; returns true when the drone is destroyed. */
  hit(): boolean {
    this.hp -= 1;
    return this.hp <= 0;
  }

  onCollision(): boolean {
    // Collision pass handles bolt damage explicitly; a body-on-body overlap
    // (e.g. a diver touching the player) destroys this drone outright.
    this.game.onDroneDestroyed(this);
    return true;
  }

  draw(ctx: CanvasRenderingContext2D, t: number) {
    if (this.kind === "boss") {
      this.drawBoss(ctx, t);
      return;
    }
    const w = this.size.x;
    const h = this.size.y;
    const color =
      this.kind === "tank"
        ? "#9aa6c4"
        : this.kind === "diver"
        ? RED
        : ROW_COLORS[this.row % ROW_COLORS.length];
    const spin = t * 26 + this.patrolX;

    ctx.save();
    ctx.translate(this.center.x, this.center.y);

    // Rotor stubs with flickering blade discs.
    const armY = -h / 2 + 1;
    ctx.strokeStyle = "rgba(170,180,200,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 2, armY);
    ctx.lineTo(-w / 2 - 5, armY - 3);
    ctx.moveTo(w / 2 - 2, armY);
    ctx.lineTo(w / 2 + 5, armY - 3);
    ctx.stroke();
    ctx.fillStyle = `rgba(200,210,230,${(0.25 + 0.2 * Math.sin(spin)).toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(-w / 2 - 5, armY - 4, 6, 1.7, 0, 0, Math.PI * 2);
    ctx.ellipse(w / 2 + 5, armY - 4, 6, 1.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body — distinct silhouette per kind.
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = this.kind === "tank" ? "#222a3a" : "#161a26";
    ctx.strokeStyle = color;
    ctx.lineWidth = this.kind === "tank" ? 2.2 : 1.5;
    if (this.kind === "tank") {
      // Hexagonal armored hull.
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.lineTo(-w / 3, -h / 2);
      ctx.lineTo(w / 3, -h / 2);
      ctx.lineTo(w / 2, 0);
      ctx.lineTo(w / 3, h / 2);
      ctx.lineTo(-w / 3, h / 2);
      ctx.closePath();
    } else if (this.kind === "diver") {
      // Aggressive forward-swept dart.
      ctx.beginPath();
      ctx.moveTo(0, h / 2 + 3);
      ctx.lineTo(w / 2, -h / 2);
      ctx.lineTo(w / 4, -h / 2 + 3);
      ctx.lineTo(0, -h / 2 - 2);
      ctx.lineTo(-w / 4, -h / 2 + 3);
      ctx.lineTo(-w / 2, -h / 2);
      ctx.closePath();
    } else {
      roundRect(ctx, -w / 2, -h / 2, w, h, 6);
    }
    ctx.fill();
    ctx.stroke();

    // Tank armor plating accents.
    if (this.kind === "tank") {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(160,170,200,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-w / 4, -h / 3);
      ctx.lineTo(-w / 4, h / 3);
      ctx.moveTo(w / 4, -h / 3);
      ctx.lineTo(w / 4, h / 3);
      ctx.stroke();
    }

    // Cargo clamp.
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(120,130,150,0.55)";
    ctx.fillRect(-3, h / 2 - 1, 6, 4);

    // Pulsing red eye light.
    ctx.shadowColor = RED;
    ctx.shadowBlur = 9;
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(0, 0, 2.6 + 0.7 * Math.sin(t * 6 + this.patrolX), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawBoss(ctx: CanvasRenderingContext2D, t: number) {
    const w = this.size.x;
    const h = this.size.y;
    ctx.save();
    ctx.translate(this.center.x, this.center.y);

    // Heavy carrier hull.
    ctx.shadowColor = MAGENTA;
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#1a1422";
    ctx.strokeStyle = MAGENTA;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 4);
    ctx.lineTo(-w / 2 + 14, -h / 2);
    ctx.lineTo(w / 2 - 14, -h / 2);
    ctx.lineTo(w / 2, -h / 4);
    ctx.lineTo(w / 2 - 10, h / 2);
    ctx.lineTo(-w / 2 + 10, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gun pods + glowing core.
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#2a2235";
    for (let i = -2; i <= 2; i++) {
      ctx.fillRect(i * (w / 6) - 5, h / 2 - 4, 10, 8);
    }
    ctx.shadowColor = RED;
    ctx.shadowBlur = 16;
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(0, 0, 7 + 2 * Math.sin(t * 4), 0, Math.PI * 2);
    ctx.fill();

    // Side rotor discs.
    ctx.shadowColor = MAGENTA;
    ctx.shadowBlur = 8;
    ctx.fillStyle = `rgba(255,45,123,${(0.25 + 0.2 * Math.sin(t * 30)).toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(-w / 2 - 4, -h / 4, 10, 2.4, 0, 0, Math.PI * 2);
    ctx.ellipse(w / 2 + 4, -h / 4, 10, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // HP bar above the carrier.
    ctx.shadowBlur = 0;
    const barW = w * 0.9;
    const frac = clamp(this.hp / this.maxHp, 0, 1);
    ctx.fillStyle = "rgba(20,20,30,0.8)";
    roundRect(ctx, -barW / 2, -h / 2 - 14, barW, 6, 3);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? GREEN : frac > 0.25 ? GOLD : RED;
    roundRect(ctx, -barW / 2, -h / 2 - 14, barW * frac, 6, 3);
    ctx.fill();
    ctx.restore();
  }
}

// ── Power-up capsules ────────────────────────────────────────────────────────

class PowerUp extends Body {
  size: Vec = { x: 30, y: 18 };
  spin = Math.random() * Math.PI * 2;

  constructor(private game: Game, public center: Vec, public kind: PowerKind) {
    super();
  }

  update(dt: number) {
    this.center.y += POWERUP_FALL_SPEED * dt;
    this.spin += dt * 3;
    // Expire if it crosses the defense line uncollected.
    if (this.center.y - this.size.y / 2 > this.game.defenseY) {
      this.game.removeBody(this);
    }
  }

  onCollision(): boolean {
    // Only the player picks these up; the collision pass passes the player in.
    this.game.collectPowerUp(this);
    return true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const color = POWER_COLOR[this.kind];
    const w = this.size.x;
    const h = this.size.y;
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    const sq = 0.85 + 0.15 * Math.sin(this.spin);
    ctx.scale(sq, 1 / sq);
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.fillStyle = "rgba(12,14,22,0.92)";
    roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Label drawn upright (outside the squash transform).
    const label =
      this.kind === "ULTRA"
        ? "ULTRA"
        : this.kind === "SHIELD"
        ? "SHLD"
        : this.kind === "SPREAD"
        ? "SPRD"
        : this.kind === "RAPID"
        ? "RAPID"
        : "BOMB";
    glowText(ctx, label, this.center.x, this.center.y, {
      color,
      size: 9,
      glow: 6,
      weight: 800,
      mono: true,
    });
  }
}

// ── Player ───────────────────────────────────────────────────────────────────

class Player extends Body {
  size: Vec = { x: 36, y: 20 };
  center: Vec;
  cooldown = 0.2; // short arming delay after spawn
  vx = 0; // for banking tilt
  invuln = 0; // brief invulnerability after a hit

  constructor(private game: Game) {
    super();
    this.center = { x: game.fieldX + game.fieldW / 2, y: game.defenseY - 34 };
  }

  update(dt: number) {
    const g = this.game;
    const controls = g.controls;
    if (controls.left) controls.targetX -= KEY_SPEED * dt;
    if (controls.right) controls.targetX += KEY_SPEED * dt;
    controls.targetX = clamp(
      controls.targetX,
      g.fieldX + this.size.x / 2 + 6,
      g.fieldX + g.fieldW - this.size.x / 2 - 6
    );
    const ease = 1 - Math.exp(-16 * dt);
    const prev = this.center.x;
    this.center.x += (controls.targetX - this.center.x) * ease;
    this.vx = (this.center.x - prev) / Math.max(dt, 0.001);

    if (this.invuln > 0) this.invuln -= dt;

    // Auto-fire. Cadence and pattern depend on active power-ups.
    this.cooldown -= dt;
    if (this.cooldown <= 0) {
      this.cooldown += g.fireCadence();
      g.firePlayerVolley(this.center.x, this.center.y - this.size.y / 2 - 10);
    }
  }

  onCollision(): boolean {
    return this.game.onPlayerHit();
  }

  draw(ctx: CanvasRenderingContext2D, t: number) {
    const x = this.center.x;
    const y = this.center.y + Math.sin(t * 2.6) * 2; // hover bob
    const flicker = 0.5 + 0.3 * Math.sin(t * 31);
    const tilt = clamp(this.vx / 900, -0.35, 0.35); // bank toward movement
    const blink = this.invuln > 0 && Math.floor(t * 18) % 2 === 0;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    if (blink) ctx.globalAlpha = 0.4;

    // OVERDRIVE aura.
    if (this.game.overdrive > 0) {
      ctx.shadowColor = MAGENTA;
      ctx.shadowBlur = 22;
      ctx.fillStyle = `rgba(255,45,123,${(0.18 + 0.12 * Math.sin(t * 12)).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // Thruster glow under the hull.
    ctx.shadowColor = CYAN;
    ctx.shadowBlur = 12;
    ctx.fillStyle = `rgba(0,229,255,${(0.2 + 0.35 * flicker).toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(0, 12, 7, 3.4 + flicker * 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sleek wedge hull with gold trim.
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#1b2230";
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(5, -3);
    ctx.lineTo(18, 8);
    ctx.lineTo(6, 6);
    ctx.lineTo(0, 9);
    ctx.lineTo(-6, 6);
    ctx.lineTo(-18, 8);
    ctx.lineTo(-5, -3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Cockpit light.
    ctx.shadowColor = CYAN;
    ctx.shadowBlur = 8;
    ctx.fillStyle = CYAN;
    ctx.beginPath();
    ctx.arc(0, -2, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Shield ring while invulnerable.
    if (this.invuln > 0) {
      ctx.shadowColor = GREEN;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = `rgba(0,230,118,${(0.5 * clamp(this.invuln / 1.2, 0, 1)).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ── Formation patterns ───────────────────────────────────────────────────────

type Pattern = "grid" | "vee" | "columns" | "sine" | "divers";
const PATTERNS: Pattern[] = ["grid", "vee", "columns", "sine", "divers"];

// ── Game world ───────────────────────────────────────────────────────────────

class Game {
  bodies: Body[];
  player: Player;
  score = 0;
  wave = 1;
  shields = START_SHIELDS;
  over = false;
  overCause: "shot" | "breach" = "shot";
  waveBanner = 1.6;
  waveBannerText = "";
  hitFlash = 0;
  bossWave = false;

  // Power-up timers / state.
  rapid = 0;
  spread = 0; // seconds of 3/5-way fire
  spreadLevel = 0; // 0 none, 1 → 3-way, 2 → 5-way
  overdrive = 0;
  boost = 0; // booster meter 0..BOOST_MAX

  // Formation parameters, retuned each wave.
  droneSpeed = DRONE_SPEED_BASE;
  fireRate = 0.16;
  boltSpeed = 170;
  droneSize: Vec;
  spacingX: number;
  cols: number;
  fieldW: number;
  fieldX: number;

  constructor(
    public W: number,
    public H: number,
    public defenseY: number,
    public particles: Particles,
    public controls: Controls
  ) {
    this.fieldW = Math.min(W, FIELD_MAX);
    this.fieldX = (W - this.fieldW) / 2;
    this.cols = 8;
    this.spacingX = Math.min(56, (this.fieldW - 52 - PATROL_RANGE) / (this.cols - 1));
    this.droneSize = { x: Math.min(30, this.spacingX - 7), y: 20 };
    this.player = new Player(this);
    this.bodies = this.spawnWave(1).concat(this.player);
  }

  // Difficulty scaling per wave — clearly ramps but stays humane (capped).
  private applyDifficulty(wave: number) {
    this.droneSpeed = DRONE_SPEED_BASE * Math.min(1 + 0.13 * (wave - 1), 2.0);
    this.fireRate = Math.min(0.15 + 0.045 * (wave - 1), 0.46);
    this.boltSpeed = Math.min(170 + 13 * (wave - 1), 290);
  }

  /** Build a fresh wave; rotates formation pattern and mixes enemy types. */
  spawnWave(wave: number): Body[] {
    this.applyDifficulty(wave);
    this.bossWave = wave % 5 === 0;
    const drones: Body[] = [];

    if (this.bossWave) {
      // Boss carrier: HP scales with wave. Worth big points. Clear = defeat it.
      const hp = 18 + wave * 4;
      const boss = new Drone(
        this,
        { x: this.fieldX + this.fieldW / 2, y: 96 },
        0,
        "boss",
        hp
      );
      drones.push(boss);
      // A small escort of grunts flanks the carrier.
      const escort = Math.min(2 + Math.floor(wave / 5), 6);
      for (let i = 0; i < escort; i++) {
        const x =
          this.fieldX + this.fieldW * ((i + 1) / (escort + 1));
        drones.push(new Drone(this, { x, y: 170 }, 1, "grunt", 1));
      }
      return drones;
    }

    const pattern = PATTERNS[(wave - 1) % PATTERNS.length];
    const rows = Math.min(2 + Math.floor(wave / 1.4), 6);
    const formW = (this.cols - 1) * this.spacingX;
    const startX = this.fieldX + (this.fieldW - formW) / 2;

    const pick = (row: number, col: number): DroneKind => {
      // Tanks from wave 3 (sprinkled on the front row); divers from wave 2.
      if (wave >= 3 && row === rows - 1 && col % 3 === 1) return "tank";
      if (pattern === "divers") return "diver";
      if (wave >= 2 && row === 0 && col % 4 === 0) return "diver";
      return "grunt";
    };
    const hpFor = (k: DroneKind) => (k === "tank" ? 3 : 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        let x = startX + c * this.spacingX;
        let y = 92 + r * 32;

        if (pattern === "vee") {
          // V-formation: rows fan outward and dip in the center.
          const mid = (this.cols - 1) / 2;
          y = 90 + r * 30 + Math.abs(c - mid) * 9;
        } else if (pattern === "columns") {
          // Twin columns: leave a gap down the middle.
          if (c === 3 || c === 4) continue;
          y = 88 + r * 34;
        } else if (pattern === "sine") {
          // Sine-wave sweeping rows.
          y = 96 + r * 30 + Math.sin(c * 0.9 + r) * 14;
        } else if (pattern === "divers") {
          // Loose wave of divers, fewer per row.
          if (c % 2 === 1) continue;
          y = 88 + r * 34;
        }

        x = clamp(x, this.fieldX + 20, this.fieldX + this.fieldW - 20);
        const kind = pick(r, c);
        drones.push(new Drone(this, { x, y }, r, kind, hpFor(kind)));
      }
    }
    return drones;
  }

  addBody(body: Body) {
    this.bodies.push(body);
  }

  removeBody(body: Body) {
    const i = this.bodies.indexOf(body);
    if (i >= 0) this.bodies.splice(i, 1);
  }

  /** Ported gate: true when another drone flies below this one. */
  dronesBelow(drone: Drone): boolean {
    return this.bodies.some(
      (body) =>
        body instanceof Drone &&
        body !== drone &&
        body.center.y > drone.center.y &&
        Math.abs(body.center.x - drone.center.x) < drone.size.x
    );
  }

  // ── Player weapon system ───────────────────────────────────────────────
  fireCadence(): number {
    if (this.overdrive > 0) return FIRE_PERIOD * 0.16; // dense ultra stream
    if (this.rapid > 0) return FIRE_PERIOD / 3;
    return FIRE_PERIOD;
  }

  firePlayerVolley(x: number, y: number) {
    const ultra = this.overdrive > 0;
    const pierce = ultra ? 3 : 0;
    const mkBolt = (vx: number) => {
      const b = new Bolt({ x, y }, { x: vx, y: -PLAYER_BOLT_SPEED }, true, ultra ? MAGENTA : CYAN);
      b.pierce = pierce;
      this.addBody(b);
    };
    if (ultra) {
      // Dense piercing 5-way spread.
      for (const vx of [-200, -100, 0, 100, 200]) mkBolt(vx);
      return;
    }
    const ways = this.spread > 0 ? (this.spreadLevel >= 2 ? 5 : 3) : 1;
    if (ways === 1) {
      mkBolt(0);
    } else if (ways === 3) {
      for (const vx of [-130, 0, 130]) mkBolt(vx);
    } else {
      for (const vx of [-220, -110, 0, 110, 220]) mkBolt(vx);
    }
  }

  private scoreMultiplier(): number {
    return this.overdrive > 0 ? 2 : 1;
  }

  // ── Events ─────────────────────────────────────────────────────────────
  onDroneDestroyed(drone: Drone) {
    const color =
      drone.kind === "boss"
        ? MAGENTA
        : drone.kind === "tank"
        ? "#9aa6c4"
        : drone.kind === "diver"
        ? RED
        : ROW_COLORS[drone.row % ROW_COLORS.length];
    this.score += KIND_SCORE[drone.kind] * this.scoreMultiplier();
    const n = drone.kind === "boss" ? 60 : drone.kind === "tank" ? 22 : 14;
    this.particles.burst(drone.center.x, drone.center.y, n, color, {
      speed: drone.kind === "boss" ? 360 : 230,
      size: drone.kind === "boss" ? 5 : 3,
      life: drone.kind === "boss" ? 1.0 : 0.55,
    });
    this.particles.burst(drone.center.x, drone.center.y, 6, RED, {
      speed: 150,
      size: 2.5,
      life: 0.4,
    });

    // Fill the booster meter; bigger enemies fill more.
    this.boost = Math.min(
      BOOST_MAX,
      this.boost + (drone.kind === "boss" ? 40 : drone.kind === "tank" ? 9 : 5)
    );
    // DESIGN CHOICE: the booster AUTO-triggers OVERDRIVE when full. On touch
    // there is no spare hand for a button (the primary control is drag-to-aim),
    // so auto-fire of the booster is the cleaner option and guarantees the
    // player periodically gets the ultra-shooting even with no power-up drops.
    if (this.boost >= BOOST_MAX && this.overdrive <= 0) {
      this.boost = 0;
      this.overdrive = BOOST_OVERDRIVE_TIME;
      this.particles.burst(this.player.center.x, this.player.center.y, 30, MAGENTA, {
        speed: 280,
        size: 4,
        life: 0.7,
      });
    }

    // Power-up drop (skip bosses — they reliably clear the wave instead).
    if (drone.kind !== "boss" && Math.random() < POWERUP_CHANCE) {
      this.addBody(new PowerUp(this, { x: drone.center.x, y: drone.center.y }, this.rollPowerUp()));
    }
  }

  private rollPowerUp(): PowerKind {
    const r = Math.random();
    if (r < 0.22) return "RAPID";
    if (r < 0.44) return "SPREAD";
    if (r < 0.62) return "ULTRA";
    if (r < 0.82) return "SHIELD";
    return "BOMB";
  }

  collectPowerUp(p: PowerUp) {
    this.score += 15;
    this.particles.burst(p.center.x, p.center.y, 16, POWER_COLOR[p.kind], {
      speed: 200,
      size: 3,
      life: 0.5,
    });
    switch (p.kind) {
      case "RAPID":
        this.rapid = RAPID_TIME;
        break;
      case "SPREAD":
        this.spread = SPREAD_TIME;
        // First pickup → 3-way (level 1); a second stacks toward 5-way (level 2).
        this.spreadLevel = Math.min(2, this.spreadLevel + 1);
        break;
      case "ULTRA":
        this.overdrive = OVERDRIVE_TIME;
        break;
      case "SHIELD":
        this.shields = Math.min(MAX_SHIELDS, this.shields + 1);
        break;
      case "BOMB":
        this.detonateBomb();
        break;
    }
  }

  /** BOMB: clear all enemy bullets and destroy/damage every on-screen enemy. */
  private detonateBomb() {
    this.hitFlash = Math.max(this.hitFlash, 0.7);
    this.particles.burst(this.player.center.x, this.defenseY - 40, 60, ORANGE, {
      speed: 420,
      size: 5,
      life: 0.9,
    });
    const survivors: Body[] = [];
    for (const body of this.bodies) {
      if (body instanceof Bolt && !body.friendly) continue; // wipe enemy fire
      if (body instanceof Drone) {
        if (body.kind === "boss") {
          // Bosses take heavy damage but aren't one-shot.
          body.hp -= 5;
          if (body.hp <= 0) {
            this.onDroneDestroyed(body);
            continue;
          }
        } else {
          this.onDroneDestroyed(body);
          continue;
        }
      }
      survivors.push(body);
    }
    this.bodies = survivors;
  }

  /** Shield absorbs the hit; returns true (remove player) only on defeat. */
  onPlayerHit(): boolean {
    if (this.player.invuln > 0) return false; // ignore hits while invulnerable
    this.shields -= 1;
    this.hitFlash = 1;
    this.player.invuln = 1.2;
    this.particles.burst(this.player.center.x, this.player.center.y, 12, CYAN, {
      speed: 200,
      size: 3,
      life: 0.5,
    });
    if (this.shields > 0) return false;
    this.endRun("shot");
    return true;
  }

  endRun(cause: "shot" | "breach") {
    if (this.over) return;
    this.over = true;
    this.overCause = cause;
    this.hitFlash = 1;
    if (cause === "shot") {
      this.particles.burst(this.player.center.x, this.player.center.y, 40, GOLD, {
        speed: 340,
        size: 4,
        life: 0.9,
      });
      this.particles.burst(this.player.center.x, this.player.center.y, 24, RED, {
        speed: 260,
        size: 3.5,
        life: 0.7,
      });
    }
  }

  // ── Per-frame update ─────────────────────────────────────────────────────
  update(dt: number) {
    if (this.over) return;

    // Decay timed power-ups.
    if (this.rapid > 0) this.rapid -= dt;
    if (this.overdrive > 0) this.overdrive -= dt;
    if (this.spread > 0) {
      this.spread -= dt;
      if (this.spread <= 0) this.spreadLevel = 0;
    }

    // ── Collision pass ──
    // 1) Friendly bolts vs drones: handle HP and piercing explicitly so we
    //    don't lose multi-HP tanks/bosses to the original one-shot filter.
    this.resolveBoltHits();
    if (this.over) return;

    // 2) Ported pairwise filter for the remaining body-vs-body overlaps
    //    (drone touching player, player touching power-up, enemy bolt vs
    //    player). Friendly bolts were already resolved above and won't match
    //    drones here because the bolt removed itself / the drone is gone.
    const bodies = this.bodies;
    const collidingWithAnything = (body1: Body) => {
      for (const body2 of bodies) {
        // Skip friendly-bolt/drone pairs — handled in resolveBoltHits.
        if (body1 instanceof Bolt && body1.friendly) continue;
        if (body2 instanceof Bolt && body2.friendly) continue;
        if (colliding(body1, body2)) return true;
      }
      return false;
    };
    this.bodies = this.bodies.filter(
      (body) => !collidingWithAnything(body) || !body.onCollision()
    );
    if (this.over) return;

    // ── Update every body ──
    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[i].update(dt);
    }

    // Cull spent bolts; enemy fire splashes against the defense line.
    this.bodies = this.bodies.filter((body) => {
      if (!(body instanceof Bolt)) return true;
      if (body.friendly) {
        return body.center.y > -24 && body.center.x > -24 && body.center.x < this.W + 24;
      }
      if (body.center.y + body.size.y / 2 >= this.defenseY) {
        this.particles.burst(body.center.x, this.defenseY, 5, GOLD, {
          speed: 90,
          size: 2,
          life: 0.35,
        });
        return false;
      }
      return body.center.y < this.H + 24;
    });

    // Any drone crossing the defense line breaches the city.
    for (const body of this.bodies) {
      if (body instanceof Drone && body.center.y + body.size.y / 2 >= this.defenseY) {
        this.particles.burst(body.center.x, this.defenseY, 30, RED, {
          speed: 300,
          size: 4,
          life: 0.8,
        });
        this.endRun("breach");
        return;
      }
    }

    // Wave cleared → bonus, then the next (denser/faster) formation.
    if (!this.bodies.some((body) => body instanceof Drone)) {
      const bonus = 50 * this.wave;
      this.score += bonus;
      this.wave += 1;
      this.waveBanner = 1.9;
      this.waveBannerText = this.wave % 5 === 0 ? "BOSS INCOMING" : `WAVE ${this.wave}`;
      this.bodies = this.spawnWave(this.wave).concat(this.bodies);
    }

    if (this.waveBanner > 0) this.waveBanner -= dt;
  }

  /** Resolve friendly bolts hitting drones with HP + piercing semantics. */
  private resolveBoltHits() {
    const drones = this.bodies.filter((b) => b instanceof Drone) as Drone[];
    if (drones.length === 0) return;
    const toRemove = new Set<Body>();
    for (const body of this.bodies) {
      if (!(body instanceof Bolt) || !body.friendly) continue;
      if (toRemove.has(body)) continue;
      for (const drone of drones) {
        if (toRemove.has(drone)) continue;
        if (!colliding(body, drone)) continue;
        const dead = drone.hit();
        if (dead) {
          this.onDroneDestroyed(drone);
          toRemove.add(drone);
        } else {
          // Survived a hit: small spark.
          this.particles.burst(body.center.x, body.center.y, 4, body.color, {
            speed: 120,
            size: 2,
            life: 0.25,
          });
        }
        if (body.pierce > 0) {
          body.pierce -= 1;
        } else {
          toRemove.add(body);
          break; // a non-piercing bolt is consumed by the first drone
        }
      }
    }
    if (toRemove.size > 0) {
      this.bodies = this.bodies.filter((b) => !toRemove.has(b));
    }
  }

  resize(W: number, H: number, defenseY: number) {
    const oldFX = this.fieldX;
    const oldFW = this.fieldW;
    this.W = W;
    this.H = H;
    this.defenseY = defenseY;
    this.fieldW = Math.min(W, FIELD_MAX);
    this.fieldX = (W - this.fieldW) / 2;
    for (const body of this.bodies) {
      body.center.x = this.fieldX + ((body.center.x - oldFX) / oldFW) * this.fieldW;
    }
    this.player.center.y = defenseY - 34;
  }

  draw(ctx: CanvasRenderingContext2D, t: number) {
    for (const body of this.bodies) body.draw(ctx, t);
  }
}

// ── City skyline ─────────────────────────────────────────────────────────────

interface Building {
  x: number;
  w: number;
  h: number;
  shade: string;
  spire: boolean;
  windows: { dx: number; dy: number }[];
}

function buildSkyline(W: number, H: number, defenseY: number): Building[] {
  const maxH = Math.max(40, H - defenseY - 8);
  const blocks: Building[] = [];
  let x = -8;
  while (x < W + 8) {
    const w = 20 + Math.random() * 36;
    const h = maxH * (0.35 + Math.random() * 0.62);
    const windows: { dx: number; dy: number }[] = [];
    for (let wx = 4; wx < w - 5; wx += 7) {
      for (let wy = 6; wy < h - 6; wy += 9) {
        if (Math.random() < 0.32) windows.push({ dx: wx, dy: wy });
      }
    }
    blocks.push({
      x,
      w,
      h,
      shade: Math.random() < 0.5 ? "#10111c" : "#141627",
      spire: Math.random() < 0.2,
      windows,
    });
    x += w + 3 + Math.random() * 9;
  }
  return blocks;
}

// ── Component ────────────────────────────────────────────────────────────────

type Phase = "start" | "playing" | "dead";

export default function DroneDefense({
  onGameOver,
}: {
  onGameOver: (score: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Track the latest callback so a parent re-render (new closure identity)
  // never tears down and restarts a run in progress.
  const onGameOverRef = useRef(onGameOver);
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
    const ctx: CanvasRenderingContext2D = ctx2d;

    let view = fitCanvas(canvas, ctx);
    let W = view.width;
    let H = view.height;
    let defenseY = H - 104;

    const starfield = new Starfield(W, H, 80);
    const particles = new Particles();
    const controls: Controls = { targetX: W / 2, left: false, right: false };

    let best = 0;
    try {
      const stored = localStorage.getItem(BEST_KEY);
      if (stored) best = parseInt(stored, 10) || 0;
    } catch {
      // localStorage unavailable — keep the in-memory best only.
    }

    let phase: Phase = "start";
    let reported = false;
    let newBest = false;
    let time = 0;
    let deadAt = 0;
    let lastReported = 0; // highest score sent to the leaderboard this run
    let reportTimer = 0; // live-scoring cadence accumulator

    let skyline = buildSkyline(W, H, defenseY);
    let game = new Game(W, H, defenseY, particles, controls);

    function startRun() {
      particles.clear();
      controls.left = false;
      controls.right = false;
      game = new Game(W, H, defenseY, particles, controls);
      reported = false;
      newBest = false;
      lastReported = 0;
      reportTimer = 0;
      phase = "playing";
    }

    // ── Input: drag / mouse-move steers, tap starts or retries ──────────────
    const pointerX = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      return clientX - rect.left;
    };
    const press = (x: number) => {
      controls.targetX = x;
      if (phase === "start") startRun();
      else if (phase === "dead" && time - deadAt > 0.45) startRun();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.cancelable) e.preventDefault();
      press(pointerX(e.clientX));
    };
    const onPointerMove = (e: PointerEvent) => {
      controls.targetX = pointerX(e.clientX);
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      if (e.touches.length > 0) press(pointerX(e.touches[0].clientX));
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      if (e.touches.length > 0) controls.targetX = pointerX(e.touches[0].clientX);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") {
        controls.left = true;
        e.preventDefault();
      } else if (e.code === "ArrowRight") {
        controls.right = true;
        e.preventDefault();
      } else if (e.code === "Space" || e.code === "Enter") {
        if (phase === "start") startRun();
        else if (phase === "dead" && time - deadAt > 0.45) startRun();
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") controls.left = false;
      else if (e.code === "ArrowRight") controls.right = false;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // ── Drawing ──────────────────────────────────────────────────────────────
    function drawBackground() {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);
      const glow = ctx.createLinearGradient(0, H * 0.55, 0, H);
      glow.addColorStop(0, "rgba(255,193,7,0)");
      glow.addColorStop(1, "rgba(255,193,7,0.07)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, H * 0.55, W, H * 0.45);
      starfield.draw(ctx, "190,205,255");

      // OVERDRIVE screen tint.
      if (phase === "playing" && game.overdrive > 0) {
        ctx.fillStyle = `rgba(255,45,123,${(0.06 + 0.03 * Math.sin(time * 10)).toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
      }
    }

    function drawSkyline() {
      for (const b of skyline) {
        const top = H - b.h;
        if (b.spire) {
          ctx.fillStyle = b.shade;
          ctx.fillRect(b.x + b.w / 2 - 1, top - 10, 2, 10);
          ctx.fillStyle = `rgba(255,82,82,${(0.4 + 0.4 * Math.sin(time * 2 + b.x)).toFixed(3)})`;
          ctx.fillRect(b.x + b.w / 2 - 1.5, top - 13, 3, 3);
        }
        ctx.fillStyle = b.shade;
        ctx.fillRect(b.x, top, b.w, b.h);
        ctx.fillStyle = "rgba(255,200,90,0.5)";
        for (const wdw of b.windows) {
          ctx.fillRect(b.x + wdw.dx, top + wdw.dy, 2.5, 3.5);
        }
      }
    }

    function drawDefenseLine() {
      const pulse = 0.55 + 0.25 * Math.sin(time * 3);
      ctx.save();
      ctx.shadowColor = GOLD;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = `rgba(255,193,7,${pulse.toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, defenseY);
      ctx.lineTo(W, defenseY);
      ctx.stroke();
      ctx.restore();
    }

    function drawShieldIcon(x: number, y: number, filled: boolean) {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(6, -4);
      ctx.lineTo(6, 1);
      ctx.quadraticCurveTo(6, 6, 0, 9);
      ctx.quadraticCurveTo(-6, 6, -6, 1);
      ctx.lineTo(-6, -4);
      ctx.closePath();
      if (filled) {
        ctx.shadowColor = CYAN;
        ctx.shadowBlur = 8;
        ctx.fillStyle = CYAN;
        ctx.fill();
      } else {
        ctx.strokeStyle = "rgba(160,170,190,0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Small countdown pip showing remaining time on an active power-up.
    function drawPowerPip(x: number, y: number, label: string, color: string, frac: number) {
      const w = 52;
      const h = 16;
      ctx.save();
      ctx.fillStyle = "rgba(14,16,24,0.85)";
      roundRect(ctx, x, y, w, h, 4);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.35;
      roundRect(ctx, x, y, w * clamp(frac, 0, 1), h, 4);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      roundRect(ctx, x, y, w, h, 4);
      ctx.stroke();
      ctx.restore();
      glowText(ctx, label, x + w / 2, y + h / 2, {
        color,
        size: 9,
        glow: 5,
        weight: 800,
        mono: true,
      });
    }

    function drawBoostMeter() {
      const w = Math.min(160, game.fieldW - 40);
      const x = (W - w) / 2;
      const y = H - 22;
      const frac = game.boost / BOOST_MAX;
      const active = game.overdrive > 0;
      ctx.save();
      ctx.fillStyle = "rgba(14,16,24,0.8)";
      roundRect(ctx, x, y, w, 8, 4);
      ctx.fill();
      ctx.shadowColor = active ? MAGENTA : GOLD;
      ctx.shadowBlur = active ? 12 : 6;
      ctx.fillStyle = active ? MAGENTA : GOLD;
      roundRect(ctx, x, y, w * (active ? 1 : frac), 8, 4);
      ctx.fill();
      ctx.restore();
      glowText(ctx, active ? "OVERDRIVE" : "BOOSTER", W / 2, y - 8, {
        color: active ? MAGENTA : "#9aa3bd",
        size: 9,
        glow: active ? 8 : 3,
        weight: 800,
        mono: true,
      });
    }

    function drawHUD() {
      glowText(ctx, `SCORE ${game.score}`, 14, 28, {
        color: GOLD,
        size: 18,
        glow: 8,
        align: "left",
        weight: 800,
        mono: true,
      });
      glowText(ctx, `WAVE ${game.wave}`, W - 14, 28, {
        color: "#80d8ff",
        size: 16,
        glow: 6,
        align: "right",
        weight: 700,
        mono: true,
      });
      for (let i = 0; i < MAX_SHIELDS; i++) {
        drawShieldIcon(W / 2 + (i - (MAX_SHIELDS - 1) / 2) * 18, 27, i < game.shields);
      }

      // Active timed power-up pips, stacked on the left under the score.
      let py = 44;
      if (game.overdrive > 0) {
        drawPowerPip(14, py, "x2 ULTRA", MAGENTA, game.overdrive / OVERDRIVE_TIME);
        py += 20;
      }
      if (game.rapid > 0) {
        drawPowerPip(14, py, "RAPID", CYAN, game.rapid / RAPID_TIME);
        py += 20;
      }
      if (game.spread > 0) {
        drawPowerPip(14, py, game.spreadLevel >= 2 ? "SPRD5" : "SPRD3", GOLD, game.spread / SPREAD_TIME);
        py += 20;
      }

      drawBoostMeter();

      if (phase === "playing" && game.waveBanner > 0) {
        ctx.save();
        ctx.globalAlpha = clamp(game.waveBanner / 0.5, 0, 1);
        glowText(ctx, game.bossWave ? "BOSS CARRIER" : `WAVE ${game.wave}`, W / 2, H * 0.3, {
          color: game.bossWave ? MAGENTA : GOLD,
          size: 34,
          glow: 14,
          weight: 800,
          mono: true,
        });
        if (game.wave > 1 && !game.bossWave) {
          glowText(ctx, `+${50 * (game.wave - 1)} WAVE BONUS`, W / 2, H * 0.3 + 30, {
            color: CYAN,
            size: 15,
            glow: 8,
            weight: 700,
            mono: true,
          });
        }
        ctx.restore();
      }
    }

    function drawStartOverlay() {
      ctx.fillStyle = "rgba(8,8,16,0.62)";
      ctx.fillRect(0, 0, W, H);
      glowText(ctx, "DRONE DEFENSE", W / 2, H * 0.24, {
        color: GOLD,
        size: Math.min(44, W * 0.095),
        glow: 18,
        weight: 800,
      });
      glowText(ctx, "Rogue drones are attacking the city of 2200", W / 2, H * 0.24 + 34, {
        color: "#aebadd",
        size: 14,
        glow: 4,
        weight: 600,
      });
      glowText(ctx, "DRAG TO MOVE — AUTO-FIRE", W / 2, H * 0.44, {
        color: CYAN,
        size: 15,
        glow: 8,
        weight: 700,
        mono: true,
      });
      glowText(ctx, "GRAB POWER-UPS • FILL THE BOOSTER", W / 2, H * 0.44 + 24, {
        color: "#9aa3bd",
        size: 12,
        glow: 3,
        weight: 600,
        mono: true,
      });
      glowText(ctx, "BOOSTER AUTO-FIRES OVERDRIVE", W / 2, H * 0.44 + 44, {
        color: MAGENTA,
        size: 12,
        glow: 6,
        weight: 700,
        mono: true,
      });
      glowText(ctx, "TAP TO START", W / 2, H * 0.66, {
        color: "#ffffff",
        size: 20 + Math.sin(time * 4) * 1.5,
        glow: 10,
        weight: 800,
      });
    }

    function drawDeadOverlay() {
      ctx.fillStyle = "rgba(12,6,10,0.66)";
      ctx.fillRect(0, 0, W, H);
      glowText(ctx, "CITY BREACHED", W / 2, H * 0.26, {
        color: RED,
        size: Math.min(40, W * 0.092),
        glow: 18,
        weight: 800,
      });
      glowText(
        ctx,
        game.overCause === "breach" ? "A DRONE REACHED THE CITY" : "INTERCEPTOR DOWN",
        W / 2,
        H * 0.26 + 32,
        { color: "#aebadd", size: 13, glow: 4, weight: 600 }
      );
      glowText(ctx, `${game.score}`, W / 2, H * 0.42, {
        color: GOLD,
        size: 44,
        glow: 14,
        weight: 800,
        mono: true,
      });
      glowText(ctx, `WAVE ${game.wave}`, W / 2, H * 0.42 + 38, {
        color: "#80d8ff",
        size: 17,
        glow: 6,
        weight: 700,
        mono: true,
      });
      glowText(ctx, newBest ? "NEW BEST!" : `BEST ${best}`, W / 2, H * 0.42 + 64, {
        color: newBest ? CYAN : "#9aa3bd",
        size: 15,
        glow: newBest ? 10 : 4,
        weight: 700,
        mono: true,
      });
      if (time - deadAt > 0.45) {
        glowText(ctx, "TAP TO RETRY", W / 2, H * 0.68, {
          color: "#ffffff",
          size: 18 + Math.sin(time * 4) * 1.2,
          glow: 10,
          weight: 800,
        });
      }
    }

    function drawBezels() {
      const fx = game.fieldX;
      const fw = game.fieldW;
      if (fx <= 0.5) return; // playfield already fills the screen
      ctx.fillStyle = "#06060c";
      ctx.fillRect(0, 0, fx, H);
      ctx.fillRect(fx + fw, 0, W - fx - fw, H);
      ctx.save();
      ctx.strokeStyle = "rgba(255,193,7,0.35)";
      ctx.lineWidth = 2;
      ctx.shadowColor = GOLD;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(fx, 0);
      ctx.lineTo(fx, H);
      ctx.moveTo(fx + fw, 0);
      ctx.lineTo(fx + fw, H);
      ctx.stroke();
      ctx.restore();
    }

    function render() {
      drawBackground();
      drawSkyline();
      drawDefenseLine();
      game.draw(ctx, time);
      particles.draw(ctx);
      drawBezels();
      if (game.hitFlash > 0) {
        ctx.fillStyle = `rgba(255,60,60,${(0.22 * clamp(game.hitFlash, 0, 1)).toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
      }
      drawHUD();
      if (phase === "start") drawStartOverlay();
      else if (phase === "dead") drawDeadOverlay();
    }

    // Persist + report the best/final score exactly once on death.
    function reportFinal() {
      if (reported) return;
      reported = true;
      if (game.score > best) {
        best = game.score;
        newBest = true;
        try {
          localStorage.setItem(BEST_KEY, String(best));
        } catch {
          // ignore persistence failure
        }
      }
      onGameOverRef.current(game.score);
      lastReported = game.score;
    }

    // ── Main loop — started directly (the original waited on a sound load) ──
    const loop = new Loop((dt: number) => {
      time += dt;
      starfield.update(dt, 9);
      particles.update(dt);
      if (game.hitFlash > 0) game.hitFlash -= dt * 2.2;

      if (phase === "playing") {
        game.update(dt);

        // LIVE SCORING: every ~0.7s, push the current score to the leaderboard
        // if it climbed. Calling repeatedly is safe — the backend keeps the max.
        reportTimer += dt;
        if (reportTimer >= REPORT_INTERVAL) {
          reportTimer = 0;
          if (game.score > lastReported) {
            lastReported = game.score;
            onGameOverRef.current(game.score);
          }
        }

        if (game.over) {
          phase = "dead";
          deadAt = time;
          reportFinal();
        }
      }
      render();
    });
    loop.start();

    // ── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      view = fitCanvas(canvas, ctx);
      W = view.width;
      H = view.height;
      defenseY = H - 104;
      starfield.resize(W, H);
      skyline = buildSkyline(W, H, defenseY);
      controls.targetX = clamp(controls.targetX, 0, W);
      game.resize(W, H, defenseY);
    };
    window.addEventListener("resize", onResize);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      loop.stop();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
    };
    // Mount-once: input, loop and world live for the component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  );
}
