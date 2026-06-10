// Based on space-invaders by Piotr Nalepa (github.com/sunpietro/space-invaders), MIT License. Entity logic ported; touch controls, waves and theme added.
//
// DRONE DEFENSE — Frontier 2200
// Rogue delivery drones patrol the sky above the megacity and sink a little
// lower on every direction flip. Drag to steer the hover interceptor; it
// auto-fires. Three shield points, then the city falls.
//
// Ported from the original: the Game bodies array, the pairwise colliding()
// filter, patrol movement with patrolX direction flipping, and the
// "fire only when no drone is below" gate. The original's mp3 loadSound
// gate around the loop was removed — the loop starts directly.

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
const ROW_COLORS = ["#b388ff", "#ff6b35", "#26c6a2", "#7986cb", "#f48fb1", "#ffd54f"];

const BEST_KEY = "droneDefense_best";

// ── Tunables (CSS px / seconds) ──────────────────────────────────────────────
const COLS = 8; // formation columns, as in the original grid
const PATROL_RANGE = 30; // patrol amplitude (~30 px)
const FLIP_DESCENT = 12; // added: gentle sink on every patrol direction flip
const FIRE_PERIOD = 0.35; // interceptor auto-fire cadence
const PLAYER_BOLT_SPEED = 520;
const DRONE_SPEED_BASE = 26; // ported 0.3 px/frame feel, scaled for a phone canvas
const KEY_SPEED = 380; // optional desktop arrow keys
const MAX_SHIELDS = 3;

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

class Bolt extends Body {
  size: Vec;

  constructor(public center: Vec, public velocity: Vec, public friendly: boolean) {
    super();
    this.size = friendly ? { x: 4, y: 14 } : { x: 5, y: 11 };
  }

  update(dt: number) {
    this.center.x += this.velocity.x * dt;
    this.center.y += this.velocity.y * dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const color = this.friendly ? CYAN : RED;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
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

class Drone extends Body {
  patrolX = 0;
  speedX: number;
  size: Vec;

  constructor(private game: Game, public center: Vec, public row: number) {
    super();
    this.size = { x: game.droneSize.x, y: game.droneSize.y };
    this.speedX = game.droneSpeed;
  }

  update(dt: number) {
    // Ported patrol: flip direction at the ends of the run. Added on top:
    // each flip also drops the drone one step closer to the defense line.
    if (this.patrolX < 0 || this.patrolX > PATROL_RANGE) {
      this.speedX = -this.speedX;
      this.patrolX = clamp(this.patrolX, 0, PATROL_RANGE);
      this.center.y += FLIP_DESCENT;
    }
    this.center.x += this.speedX * dt;
    this.patrolX += this.speedX * dt;

    // Ported firing gate: only drones with clear airspace below may shoot.
    if (Math.random() < this.game.fireRate * dt && !this.game.dronesBelow(this)) {
      this.game.addBody(
        new Bolt(
          { x: this.center.x, y: this.center.y + this.size.y / 2 + 8 },
          { x: (Math.random() - 0.5) * 50, y: this.game.boltSpeed },
          false
        )
      );
    }
  }

  onCollision(): boolean {
    this.game.onDroneDestroyed(this);
    return true;
  }

  draw(ctx: CanvasRenderingContext2D, t: number) {
    const w = this.size.x;
    const h = this.size.y;
    const color = ROW_COLORS[this.row % ROW_COLORS.length];
    const variant = this.row % 3;
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

    // Body — rows get slightly different silhouettes and trim colors.
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#161a26";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    if (variant === 0) {
      roundRect(ctx, -w / 2, -h / 2, w, h, 6);
    } else if (variant === 1) {
      roundRect(ctx, -w / 2, -h / 2 + 2, w, h - 4, (h - 4) / 2);
    } else {
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.lineTo(-w / 4, -h / 2);
      ctx.lineTo(w / 4, -h / 2);
      ctx.lineTo(w / 2, 0);
      ctx.lineTo(w / 4, h / 2);
      ctx.lineTo(-w / 4, h / 2);
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();

    // Cargo clamp — these used to deliver parcels.
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
}

class Player extends Body {
  size: Vec = { x: 36, y: 20 };
  center: Vec;
  cooldown = 0.2; // short arming delay after spawn

  constructor(private game: Game) {
    super();
    this.center = { x: game.W / 2, y: game.defenseY - 34 };
  }

  update(dt: number) {
    const controls = this.game.controls;
    // Optional desktop arrows nudge the same target the pointer writes to.
    if (controls.left) controls.targetX -= KEY_SPEED * dt;
    if (controls.right) controls.targetX += KEY_SPEED * dt;
    controls.targetX = clamp(
      controls.targetX,
      this.size.x / 2 + 6,
      this.game.W - this.size.x / 2 - 6
    );
    // Follow the pointer's X quickly but smoothly.
    const ease = 1 - Math.exp(-16 * dt);
    this.center.x += (controls.targetX - this.center.x) * ease;

    // Auto-fire at a fixed cadence — no fire button.
    this.cooldown -= dt;
    if (this.cooldown <= 0) {
      this.cooldown += FIRE_PERIOD;
      this.game.addBody(
        new Bolt(
          { x: this.center.x, y: this.center.y - this.size.y / 2 - 10 },
          { x: 0, y: -PLAYER_BOLT_SPEED },
          true
        )
      );
    }
  }

  onCollision(): boolean {
    return this.game.onPlayerHit();
  }

  draw(ctx: CanvasRenderingContext2D, t: number) {
    const x = this.center.x;
    const y = this.center.y + Math.sin(t * 2.6) * 2; // hover bob
    const flicker = 0.5 + 0.3 * Math.sin(t * 31);

    ctx.save();
    ctx.translate(x, y);

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
    ctx.restore();
  }
}

class Game {
  bodies: Body[];
  player: Player;
  score = 0;
  wave = 1;
  shields = MAX_SHIELDS;
  over = false;
  overCause: "shot" | "breach" = "shot";
  waveBanner = 1.6; // seconds left on the WAVE banner
  hitFlash = 0; // red vignette on shield loss / defeat

  // Formation parameters, retuned by createDrones() each wave.
  droneSpeed = DRONE_SPEED_BASE;
  fireRate = 0.16; // per front drone, per second (ported ~0.005/frame feel)
  boltSpeed = 170;
  droneSize: Vec;
  spacingX: number;

  constructor(
    public W: number,
    public H: number,
    public defenseY: number,
    public particles: Particles,
    public controls: Controls
  ) {
    this.spacingX = Math.min(46, (W - 52 - PATROL_RANGE) / (COLS - 1));
    this.droneSize = { x: Math.min(30, this.spacingX - 7), y: 20 };
    this.player = new Player(this);
    // Ported: the world is one flat array of bodies — drones plus the player.
    this.bodies = this.createDrones(1).concat(this.player);
  }

  /** Ported grid spawner: i % COLS picks the column; rows stack downward. */
  createDrones(wave: number): Body[] {
    const rows = Math.min(2 + wave, 6); // one row more per wave, capped
    this.droneSpeed = DRONE_SPEED_BASE * Math.min(1 + 0.14 * (wave - 1), 1.9);
    this.fireRate = Math.min(0.16 + 0.05 * (wave - 1), 0.42);
    this.boltSpeed = Math.min(170 + 14 * (wave - 1), 270);
    const drones: Body[] = [];
    for (let i = 0; i < COLS * rows; i++) {
      const x = 26 + (i % COLS) * this.spacingX;
      const y = 92 + Math.floor(i / COLS) * 32;
      drones.push(new Drone(this, { x, y }, Math.floor(i / COLS)));
    }
    return drones;
  }

  addBody(body: Body) {
    this.bodies.push(body);
  }

  /** Ported gate: true when another drone flies below this one. */
  dronesBelow(drone: Drone): boolean {
    return (
      this.bodies.filter(
        (body) =>
          body instanceof Drone &&
          body.center.y > drone.center.y &&
          Math.abs(body.center.x - drone.center.x) < drone.size.x
      ).length > 0
    );
  }

  onDroneDestroyed(drone: Drone) {
    this.score += 10;
    this.particles.burst(
      drone.center.x,
      drone.center.y,
      14,
      ROW_COLORS[drone.row % ROW_COLORS.length],
      { speed: 230, size: 3, life: 0.55 }
    );
    this.particles.burst(drone.center.x, drone.center.y, 6, RED, {
      speed: 150,
      size: 2.5,
      life: 0.4,
    });
  }

  /** Shield absorbs the hit; returns true (remove player) only on defeat. */
  onPlayerHit(): boolean {
    this.shields -= 1;
    this.hitFlash = 1;
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

  update(dt: number) {
    if (this.over) return;

    // Ported collision pass: a body overlapping any other body is dropped.
    // onCollision() lets the shielded interceptor absorb hits instead.
    const bodies = this.bodies;
    const collidingWithAnything = (body1: Body) =>
      bodies.filter((body2) => colliding(body1, body2)).length > 0;
    this.bodies = this.bodies.filter(
      (body) => !collidingWithAnything(body) || !body.onCollision()
    );
    if (this.over) return; // the interceptor went down in that pass

    // Ported: update every body (bolts added mid-loop tick this frame too).
    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[i].update(dt);
    }

    // Cull spent bolts; enemy fire splashes against the defense line.
    this.bodies = this.bodies.filter((body) => {
      if (!(body instanceof Bolt)) return true;
      if (body.friendly) return body.center.y > -24;
      if (body.center.y + body.size.y / 2 >= this.defenseY) {
        this.particles.burst(body.center.x, this.defenseY, 5, GOLD, {
          speed: 90,
          size: 2,
          life: 0.35,
        });
        return false;
      }
      return true;
    });

    // Added: any drone crossing the defense line breaches the city.
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

    // Wave cleared → bonus, then a denser / faster / angrier formation.
    if (!this.bodies.some((body) => body instanceof Drone)) {
      this.score += 50;
      this.wave += 1;
      this.waveBanner = 1.8;
      this.bodies = this.createDrones(this.wave).concat(this.bodies);
    }

    if (this.waveBanner > 0) this.waveBanner -= dt;
  }

  resize(W: number, H: number, defenseY: number) {
    const scaleX = W / this.W;
    this.W = W;
    this.H = H;
    this.defenseY = defenseY;
    for (const body of this.bodies) body.center.x *= scaleX;
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

    let skyline = buildSkyline(W, H, defenseY);
    let game = new Game(W, H, defenseY, particles, controls);

    function startRun() {
      particles.clear();
      controls.left = false;
      controls.right = false;
      game = new Game(W, H, defenseY, particles, controls);
      reported = false;
      newBest = false;
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
        drawShieldIcon(W / 2 + (i - (MAX_SHIELDS - 1) / 2) * 22, 27, i < game.shields);
      }

      if (phase === "playing" && game.waveBanner > 0) {
        ctx.save();
        ctx.globalAlpha = clamp(game.waveBanner / 0.4, 0, 1);
        glowText(ctx, `WAVE ${game.wave}`, W / 2, H * 0.3, {
          color: GOLD,
          size: 34,
          glow: 14,
          weight: 800,
          mono: true,
        });
        if (game.wave > 1) {
          glowText(ctx, "+50 WAVE BONUS", W / 2, H * 0.3 + 30, {
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
      glowText(ctx, "DRONE DEFENSE", W / 2, H * 0.28, {
        color: GOLD,
        size: Math.min(44, W * 0.095),
        glow: 18,
        weight: 800,
      });
      glowText(ctx, "Rogue drones are attacking the city of 2200", W / 2, H * 0.28 + 36, {
        color: "#aebadd",
        size: 14,
        glow: 4,
        weight: 600,
      });
      glowText(ctx, "DRAG TO MOVE — AUTO-FIRE", W / 2, H * 0.5, {
        color: CYAN,
        size: 15,
        glow: 8,
        weight: 700,
        mono: true,
      });
      glowText(ctx, "TAP TO START", W / 2, H * 0.62, {
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

    function render() {
      drawBackground();
      drawSkyline();
      drawDefenseLine();
      game.draw(ctx, time);
      particles.draw(ctx);
      if (game.hitFlash > 0) {
        ctx.fillStyle = `rgba(255,60,60,${(0.22 * clamp(game.hitFlash, 0, 1)).toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
      }
      drawHUD();
      if (phase === "start") drawStartOverlay();
      else if (phase === "dead") drawDeadOverlay();
    }

    // ── Main loop — started directly (the original waited on a sound load) ──
    const loop = new Loop((dt: number) => {
      time += dt;
      starfield.update(dt, 9);
      particles.update(dt);
      if (game.hitFlash > 0) game.hitFlash -= dt * 2.2;

      if (phase === "playing") {
        game.update(dt);
        if (game.over) {
          phase = "dead";
          deadAt = time;
          if (!reported) {
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
          }
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
