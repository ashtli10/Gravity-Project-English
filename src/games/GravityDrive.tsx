// Gravity Drive — a VVVVVV-style gravity-flip dodger for "Frontier 2200".
// The player is a maintenance pod inside a failing artificial-gravity reactor
// corridor. Tap to FLIP gravity (down<->up) — but only while grounded on the
// floor or ceiling. Teaching point: gravity is a directional force.

import { useRef, useEffect } from "react";
import { Loop } from "./engine/Loop";
import { Input } from "./engine/Input";
import { Particles } from "./engine/Particles";
import { Starfield } from "./engine/Starfield";
import {
  fitCanvas,
  roundRect,
  glowText,
  clamp,
  lerp,
  easeOut,
} from "./engine/draw";

// ── Constants ────────────────────────────────────────────────────────────────

const ACCENT = "#b388ff"; // purple
const DANGER = "#ff4466"; // red
const BG = "#0a0a0f";
const STAR_TINT = "180,150,255";

const POD = 26; // pod size (square, px)
const WALL_PAD = 64; // corridor inset from top/bottom of viewport
const BEAT = 120; // px per pattern "beat" unit

const GRAV_MIN = 3500;
const GRAV_MAX = 5500;
const SCROLL_MIN = 360;
const SCROLL_MAX = 620;
const RAMP_DIST = 9000; // px of travel to reach full difficulty

const FREEZE_TIME = 0.25;

const HIGH_SCORE_KEY = "gravityDrive_highScore";

type Phase = "waiting" | "countdown" | "playing" | "dead";
type Surface = "floor" | "ceiling";
type ObType = "spike" | "wall";

interface Obstacle {
  x: number;
  w: number;
  h: number; // height jutting from its surface (into corridor)
  surface: Surface;
  type: ObType;
}

// A pattern is authored in beats; obstacles reference surfaces & sizes.
interface PatternOb {
  beat: number; // horizontal offset in beats from pattern start
  surface: Surface;
  type: ObType;
  w: number; // px
  h: number; // px
}
interface Pattern {
  beats: number; // total width of pattern in beats
  obs: PatternOb[];
}

// Hand-authored pattern library. Survivability is verified at spawn time.
const PATTERNS: Pattern[] = [
  // Single floor spike — flip up to dodge.
  { beats: 3, obs: [{ beat: 1, surface: "floor", type: "spike", w: 34, h: 38 }] },
  // Single ceiling spike.
  {
    beats: 3,
    obs: [{ beat: 1, surface: "ceiling", type: "spike", w: 34, h: 38 }],
  },
  // Alternating floor/ceiling spikes — rhythmic flips.
  {
    beats: 5,
    obs: [
      { beat: 1, surface: "floor", type: "spike", w: 34, h: 38 },
      { beat: 3, surface: "ceiling", type: "spike", w: 34, h: 38 },
    ],
  },
  // Floor wall — must be on the ceiling to pass over it.
  {
    beats: 4,
    obs: [{ beat: 1, surface: "floor", type: "wall", w: 60, h: 90 }],
  },
  // Ceiling wall — must be on the floor.
  {
    beats: 4,
    obs: [{ beat: 1, surface: "ceiling", type: "wall", w: 60, h: 90 }],
  },
  // Double floor spikes close together.
  {
    beats: 4,
    obs: [
      { beat: 1, surface: "floor", type: "spike", w: 30, h: 36 },
      { beat: 2, surface: "floor", type: "spike", w: 30, h: 36 },
    ],
  },
  // Wall on floor then wall on ceiling — flip, then flip back.
  {
    beats: 7,
    obs: [
      { beat: 1, surface: "floor", type: "wall", w: 56, h: 80 },
      { beat: 4, surface: "ceiling", type: "wall", w: 56, h: 80 },
    ],
  },
  // Spike pair, opposite surfaces, staggered (zig-zag).
  {
    beats: 6,
    obs: [
      { beat: 1, surface: "floor", type: "spike", w: 32, h: 36 },
      { beat: 2.5, surface: "ceiling", type: "spike", w: 32, h: 36 },
      { beat: 4, surface: "floor", type: "spike", w: 32, h: 36 },
    ],
  },
];

// ── Mutable session state (persists across local retries) ────────────────────

let sessionBest = 0;

// ── Component ─────────────────────────────────────────────────────────────────

export default function GravityDrive({
  onGameOver,
}: {
  onGameOver: (score: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load persisted high score into the session variable.
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) sessionBest = Math.max(sessionBest, parseInt(stored, 10) || 0);
    } catch {
      // localStorage unavailable — fall back to in-memory best only.
    }

    let { width, height } = fitCanvas(canvas, ctx);
    const starfield = new Starfield(width, height, 90);
    const particles = new Particles();
    const input = new Input(canvas);

    // ── World / game state ──────────────────────────────────────────────────
    let phase: Phase = "waiting";
    let distance = 0; // world px scrolled
    let countdown = 3; // seconds remaining in countdown
    let freeze = 0; // death-freeze timer
    let flash = 0; // red flash alpha
    let deathReported = false;
    let newBest = false;

    // Corridor edges (recomputed on resize).
    let floorY = height - WALL_PAD;
    let ceilY = WALL_PAD;
    let floorPulse = 0;
    let ceilPulse = 0;

    // Player pod.
    let podX = 0;
    let podY = 0;
    let vy = 0;
    let gravDir: 1 | -1 = 1; // 1 = pulled down, -1 = pulled up
    let grounded = true;
    let rotation = 0; // visual roll for the flip animation
    let targetRot = 0;

    // Spawning.
    let obstacles: Obstacle[] = [];
    let spawnX = 0; // world-x where the next pattern will begin
    let trailTimer = 0;

    function recomputeCorridor() {
      floorY = height - WALL_PAD;
      ceilY = WALL_PAD;
    }

    function currentGravity(): number {
      return lerp(GRAV_MIN, GRAV_MAX, easeOut(distance / RAMP_DIST));
    }
    function currentScroll(): number {
      return lerp(SCROLL_MIN, SCROLL_MAX, easeOut(distance / RAMP_DIST));
    }

    function resetGame() {
      phase = "waiting";
      distance = 0;
      countdown = 3;
      freeze = 0;
      flash = 0;
      deathReported = false;
      newBest = false;
      recomputeCorridor();
      podX = Math.min(120, width * 0.22);
      gravDir = 1;
      grounded = true;
      vy = 0;
      rotation = 0;
      targetRot = 0;
      podY = floorY - POD; // resting on floor
      obstacles = [];
      particles.clear();
      spawnX = width + 200;
      trailTimer = 0;
    }

    // The vertical gap the pod must clear, i.e. interior corridor height.
    function corridorInner(): number {
      return floorY - ceilY;
    }

    // How far the world scrolls (px) during one full floor<->ceiling traversal
    // at the current gravity. Used to verify a pattern is survivable.
    function traversalScrollPx(): number {
      const dist = corridorInner() - POD; // vertical distance to travel
      // dist = 0.5 * g * t^2  =>  t = sqrt(2*dist/g)
      const t = Math.sqrt((2 * dist) / currentGravity());
      return currentScroll() * t;
    }

    // Decide whether a candidate pattern can be flown through. We require that
    // between any two obstacles forcing opposite surfaces, there is enough
    // horizontal room to complete a flip traversal. Also reject patterns whose
    // first hazard arrives immediately (must allow reaction time).
    function isSurvivable(p: Pattern): boolean {
      const trav = traversalScrollPx();
      // Need at least one traversal of slack between forced surface changes.
      // A floor wall forces ceiling; a ceiling wall forces floor.
      // Spikes force "not on that surface" at their x.
      const forced: { x: number; needCeiling: boolean }[] = [];
      for (const o of p.obs) {
        // wall on floor => must be on ceiling; spike on floor => must be on ceiling
        forced.push({ x: o.beat * BEAT, needCeiling: o.surface === "floor" });
      }
      forced.sort((a, b) => a.x - b.x);
      for (let i = 1; i < forced.length; i++) {
        if (forced[i].needCeiling !== forced[i - 1].needCeiling) {
          const gap = forced[i].x - forced[i - 1].x;
          // Need room for a full traversal plus a small reaction margin.
          if (gap < trav * 1.05 + 24) return false;
        }
      }
      return true;
    }

    function spawnPattern() {
      // Density grows with distance: shrink the trailing gap after a pattern.
      const t = easeOut(distance / RAMP_DIST);
      const gapBeats = lerp(3, 1.2, t);

      // Pick a survivable pattern; try a few, else fall back to a single spike.
      let chosen: Pattern | null = null;
      for (let tries = 0; tries < 6; tries++) {
        const cand = PATTERNS[(Math.random() * PATTERNS.length) | 0];
        if (isSurvivable(cand)) {
          chosen = cand;
          break;
        }
      }
      if (!chosen) {
        chosen = {
          beats: 3,
          obs: [{ beat: 1, surface: "floor", type: "spike", w: 34, h: 38 }],
        };
      }

      for (const o of chosen.obs) {
        const ox = spawnX + o.beat * BEAT;
        obstacles.push({
          x: ox,
          w: o.w,
          h: o.h,
          surface: o.surface,
          type: o.type,
        });
      }
      spawnX += (chosen.beats + gapBeats) * BEAT;
    }

    function flip() {
      if (!grounded) return;
      gravDir = (gravDir === 1 ? -1 : 1) as 1 | -1;
      grounded = false;
      vy = 0;
      targetRot += Math.PI; // half-roll per flip
    }

    function podRect() {
      return { x: podX, y: podY, w: POD, h: POD };
    }

    function rectsOverlap(
      ax: number,
      ay: number,
      aw: number,
      ah: number,
      bx: number,
      by: number,
      bw: number,
      bh: number
    ): boolean {
      return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    // Obstacle bounding box in world/screen coords (camera fixed; we move obs).
    function obstacleBox(o: Obstacle): { x: number; y: number; w: number; h: number } {
      if (o.surface === "floor") {
        return { x: o.x, y: floorY - o.h, w: o.w, h: o.h };
      }
      return { x: o.x, y: ceilY, w: o.w, h: o.h };
    }

    function die() {
      if (phase === "dead") return;
      phase = "dead";
      freeze = FREEZE_TIME;
      flash = 1;
      const r = podRect();
      particles.burst(r.x + POD / 2, r.y + POD / 2, 35, DANGER, {
        speed: 380,
        size: 5,
      });
      const score = Math.floor(distance / 10);
      if (score > sessionBest) {
        sessionBest = score;
        newBest = true;
        try {
          localStorage.setItem(HIGH_SCORE_KEY, String(sessionBest));
        } catch {
          // ignore persistence failure
        }
      }
    }

    // ── Update ────────────────────────────────────────────────────────────────
    function update(dt: number) {
      const tap = input.consumeTap();
      const scroll = currentScroll();

      // Background always drifts a little for life.
      const bgScroll = phase === "playing" ? scroll : SCROLL_MIN * 0.3;
      starfield.update(dt, bgScroll);
      floorPulse = Math.max(0, floorPulse - dt * 3);
      ceilPulse = Math.max(0, ceilPulse - dt * 3);
      rotation = lerp(rotation, targetRot, clamp(dt * 14, 0, 1));

      if (phase === "waiting") {
        if (tap) {
          phase = "countdown";
          countdown = 3;
        }
        particles.update(dt);
        return;
      }

      if (phase === "countdown") {
        countdown -= dt;
        if (countdown <= 0) {
          phase = "playing";
          // Prime a couple of patterns ahead.
          spawnX = width + 120;
          spawnPattern();
        }
        particles.update(dt);
        return;
      }

      if (phase === "dead") {
        if (freeze > 0) {
          freeze -= dt;
          flash = clamp(flash - dt * 2, 0, 1);
          particles.update(dt);
        } else {
          flash = clamp(flash - dt * 2, 0, 1);
          particles.update(dt);
          if (!deathReported) {
            deathReported = true;
            onGameOver(Math.floor(distance / 10));
          }
        }
        if (tap && deathReported) {
          resetGame();
        }
        return;
      }

      // ── phase === "playing" ──────────────────────────────────────────────
      if (tap) flip();

      const g = currentGravity();
      vy += g * gravDir * dt;
      podY += vy * dt;

      // Land on floor / ceiling.
      grounded = false;
      if (gravDir === 1) {
        const rest = floorY - POD;
        if (podY >= rest) {
          if (!grounded && podY - vy * dt < rest) floorPulse = 1;
          podY = rest;
          vy = 0;
          grounded = true;
          // Snap visual rotation to nearest flat orientation.
          targetRot = Math.round(targetRot / Math.PI) * Math.PI;
        }
      } else {
        const rest = ceilY;
        if (podY <= rest) {
          ceilPulse = 1;
          podY = rest;
          vy = 0;
          grounded = true;
          targetRot = Math.round(targetRot / Math.PI) * Math.PI;
        }
      }

      // Scroll world: move obstacles left, advance distance.
      const dx = scroll * dt;
      distance += dx;
      for (const o of obstacles) o.x -= dx;
      spawnX -= dx;
      obstacles = obstacles.filter((o) => o.x + o.w > -40);

      // Keep the pipeline full.
      while (spawnX < width + 200) spawnPattern();

      // Trail.
      trailTimer -= dt;
      if (trailTimer <= 0) {
        trailTimer = 0.016;
        particles.trail(
          podX + POD / 2,
          podY + POD / 2,
          ACCENT,
          3,
          0.4
        );
      }

      // Collisions.
      const pr = podRect();
      for (const o of obstacles) {
        const b = obstacleBox(o);
        if (o.type === "spike") {
          // Tighter hitbox for fairness on triangles.
          const inset = 6;
          if (
            rectsOverlap(
              pr.x + inset,
              pr.y + inset,
              pr.w - inset * 2,
              pr.h - inset * 2,
              b.x + 4,
              b.y + 4,
              b.w - 8,
              b.h - 8
            )
          ) {
            die();
            break;
          }
        } else if (
          rectsOverlap(pr.x, pr.y, pr.w, pr.h, b.x, b.y, b.w, b.h)
        ) {
          die();
          break;
        }
      }

      particles.update(dt);
    }

    // ── Draw ──────────────────────────────────────────────────────────────────
    function drawCorridorEdge(y: number, surface: Surface, pulse: number) {
      const glow = 8 + pulse * 22;
      ctx!.save();
      ctx!.strokeStyle = ACCENT;
      ctx!.lineWidth = 2 + pulse * 2;
      ctx!.shadowColor = ACCENT;
      ctx!.shadowBlur = glow;
      ctx!.globalAlpha = 0.5 + pulse * 0.5;
      ctx!.beginPath();
      ctx!.moveTo(0, y);
      ctx!.lineTo(width, y);
      ctx!.stroke();
      ctx!.restore();

      // Solid wall beyond the corridor (the structural hull).
      ctx!.save();
      ctx!.fillStyle = "rgba(25,18,45,0.85)";
      if (surface === "floor") ctx!.fillRect(0, y, width, height - y);
      else ctx!.fillRect(0, 0, width, y);
      ctx!.restore();
    }

    function drawReactorWindows(y: number, surface: Surface) {
      // Subtle parallax window frames inside the hull.
      ctx!.save();
      ctx!.globalAlpha = 0.18;
      ctx!.strokeStyle = ACCENT;
      ctx!.lineWidth = 1.5;
      const period = 160;
      const offset = (distance * 0.4) % period;
      const wsz = 70;
      const margin = (period - wsz) / 2;
      for (let x = -offset; x < width; x += period) {
        const wx = x + margin;
        let wy: number;
        if (surface === "floor") wy = y + 16;
        else wy = y - 16 - wsz * 0.5;
        roundRect(ctx!, wx, wy, wsz, wsz * 0.5, 6);
        ctx!.stroke();
      }
      ctx!.restore();
    }

    function drawSpike(b: { x: number; y: number; w: number; h: number }, surface: Surface) {
      ctx!.save();
      ctx!.fillStyle = DANGER;
      ctx!.shadowColor = DANGER;
      ctx!.shadowBlur = 12;
      ctx!.beginPath();
      if (surface === "floor") {
        ctx!.moveTo(b.x, b.y + b.h);
        ctx!.lineTo(b.x + b.w / 2, b.y);
        ctx!.lineTo(b.x + b.w, b.y + b.h);
      } else {
        ctx!.moveTo(b.x, b.y);
        ctx!.lineTo(b.x + b.w / 2, b.y + b.h);
        ctx!.lineTo(b.x + b.w, b.y);
      }
      ctx!.closePath();
      ctx!.fill();
      ctx!.restore();
    }

    function drawWall(b: { x: number; y: number; w: number; h: number }) {
      ctx!.save();
      // Body.
      ctx!.fillStyle = "rgba(40,28,70,0.95)";
      ctx!.strokeStyle = ACCENT;
      ctx!.lineWidth = 2;
      ctx!.shadowColor = ACCENT;
      ctx!.shadowBlur = 10;
      roundRect(ctx!, b.x, b.y, b.w, b.h, 4);
      ctx!.fill();
      ctx!.stroke();
      // Hazard stripes.
      ctx!.clip();
      ctx!.shadowBlur = 0;
      ctx!.strokeStyle = ACCENT;
      ctx!.globalAlpha = 0.6;
      ctx!.lineWidth = 6;
      for (let s = -b.h; s < b.w + b.h; s += 18) {
        ctx!.beginPath();
        ctx!.moveTo(b.x + s, b.y);
        ctx!.lineTo(b.x + s - b.h, b.y + b.h);
        ctx!.stroke();
      }
      ctx!.restore();
    }

    function drawPod() {
      const cx = podX + POD / 2;
      const cy = podY + POD / 2;
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(rotation);
      // Flip the visor with gravity so it reads "upside-down-ish" when flipped.
      const visorDir = gravDir === 1 ? 1 : -1;

      // Body.
      ctx!.shadowColor = ACCENT;
      ctx!.shadowBlur = 16;
      ctx!.fillStyle = ACCENT;
      roundRect(ctx!, -POD / 2, -POD / 2, POD, POD, 6);
      ctx!.fill();

      // White highlight corner.
      ctx!.shadowBlur = 0;
      ctx!.fillStyle = "rgba(255,255,255,0.85)";
      roundRect(ctx!, -POD / 2 + 4, -POD / 2 + 4, POD * 0.32, POD * 0.32, 3);
      ctx!.fill();

      // Forward visor (toward travel direction = right).
      ctx!.fillStyle = "rgba(255,255,255,0.9)";
      const vw = POD * 0.5;
      const vh = POD * 0.22;
      ctx!.fillRect(POD / 2 - vw - 3, (visorDir * POD) / 6 - vh / 2, vw, vh);
      ctx!.restore();
    }

    function drawHUD() {
      const score = Math.floor(distance / 10);
      const gravMult = (currentGravity() / GRAV_MIN).toFixed(1);

      glowText(ctx!, String(score), 18, 30, {
        color: "#ffffff",
        size: 30,
        glow: 10,
        align: "left",
        mono: true,
      });
      glowText(ctx!, `GRAV x${gravMult}`, 18, 58, {
        color: ACCENT,
        size: 15,
        glow: 8,
        align: "left",
        mono: true,
      });

      // Speed bar (top-right).
      const t = easeOut(distance / RAMP_DIST);
      const barW = 120;
      const barH = 8;
      const bx = width - barW - 18;
      const by = 24;
      ctx!.save();
      glowText(ctx!, "SPEED", bx - 6, by + barH / 2, {
        color: ACCENT,
        size: 12,
        align: "right",
        mono: true,
      });
      ctx!.strokeStyle = "rgba(179,136,255,0.5)";
      ctx!.lineWidth = 1.5;
      roundRect(ctx!, bx, by, barW, barH, 4);
      ctx!.stroke();
      ctx!.fillStyle = ACCENT;
      ctx!.shadowColor = ACCENT;
      ctx!.shadowBlur = 8;
      roundRect(ctx!, bx + 1.5, by + 1.5, (barW - 3) * t, barH - 3, 3);
      ctx!.fill();
      ctx!.restore();
    }

    function drawOverlayBackdrop() {
      ctx!.save();
      ctx!.fillStyle = "rgba(10,10,15,0.72)";
      ctx!.fillRect(0, 0, width, height);
      ctx!.restore();
    }

    function draw() {
      // Background.
      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, width, height);
      starfield.draw(ctx!, STAR_TINT);

      // Hull + reactor windows.
      drawReactorWindows(ceilY, "ceiling");
      drawReactorWindows(floorY, "floor");
      drawCorridorEdge(ceilY, "ceiling", ceilPulse);
      drawCorridorEdge(floorY, "floor", floorPulse);

      // Obstacles.
      for (const o of obstacles) {
        const b = obstacleBox(o);
        if (o.type === "spike") drawSpike(b, o.surface);
        else drawWall(b);
      }

      // Pod (hide on the waiting screen for a cleaner title).
      if (phase !== "waiting") drawPod();

      particles.draw(ctx!);

      // Red death flash.
      if (flash > 0) {
        ctx!.save();
        ctx!.fillStyle = `rgba(255,68,102,${(flash * 0.55).toFixed(3)})`;
        ctx!.fillRect(0, 0, width, height);
        ctx!.restore();
      }

      // HUD.
      if (phase === "playing" || phase === "countdown") drawHUD();

      const cx = width / 2;
      const cy = height / 2;

      if (phase === "waiting") {
        drawOverlayBackdrop();
        glowText(ctx!, "GRAVITY DRIVE", cx, cy - 64, {
          color: ACCENT,
          size: 44,
          glow: 24,
          weight: 800,
        });
        glowText(
          ctx!,
          "Tap to flip gravity. Avoid the hazards.",
          cx,
          cy - 16,
          { color: "#cfc4ff", size: 16 }
        );
        glowText(ctx!, `HIGH SCORE: ${sessionBest}`, cx, cy + 24, {
          color: "#ffffff",
          size: 18,
          glow: 8,
          mono: true,
        });
        glowText(ctx!, "TAP TO START", cx, cy + 72, {
          color: ACCENT,
          size: 20,
          glow: 14,
          weight: 700,
        });
      } else if (phase === "countdown") {
        const n = Math.ceil(countdown);
        const label = n <= 0 ? "GO" : String(n);
        const frac = countdown - Math.floor(countdown); // 0..1 within the tick
        const scale = 1 + (1 - frac) * 0.4;
        ctx!.save();
        ctx!.translate(cx, cy);
        ctx!.scale(scale, scale);
        glowText(ctx!, label, 0, 0, {
          color: ACCENT,
          size: 90,
          glow: 30,
          weight: 800,
          mono: true,
        });
        ctx!.restore();
      } else if (phase === "dead" && deathReported) {
        drawOverlayBackdrop();
        const score = Math.floor(distance / 10);
        glowText(ctx!, "DRIVE FAILURE", cx, cy - 78, {
          color: ACCENT,
          size: 40,
          glow: 24,
          weight: 800,
        });
        glowText(ctx!, `DISTANCE ${score}`, cx, cy - 24, {
          color: "#ffffff",
          size: 22,
          glow: 8,
          mono: true,
        });
        glowText(ctx!, `BEST ${sessionBest}`, cx, cy + 8, {
          color: "#cfc4ff",
          size: 18,
          mono: true,
        });
        if (newBest) {
          glowText(ctx!, "NEW BEST!", cx, cy + 42, {
            color: DANGER,
            size: 20,
            glow: 16,
            weight: 800,
          });
        }
        glowText(ctx!, "TAP TO RETRY", cx, cy + 86, {
          color: ACCENT,
          size: 20,
          glow: 14,
          weight: 700,
        });
      }
    }

    // ── Boot ────────────────────────────────────────────────────────────────
    resetGame();

    const loop = new Loop((dt: number) => {
      update(dt);
      draw();
    });
    loop.start();

    const onResize = () => {
      const fit = fitCanvas(canvas, ctx);
      width = fit.width;
      height = fit.height;
      starfield.resize(width, height);
      recomputeCorridor();
      // Keep the pod inside the (possibly resized) corridor.
      if (gravDir === 1 && grounded) podY = floorY - POD;
      else if (gravDir === -1 && grounded) podY = ceilY;
      podY = clamp(podY, ceilY, floorY - POD);
    };
    window.addEventListener("resize", onResize);

    return () => {
      loop.stop();
      input.destroy();
      window.removeEventListener("resize", onResize);
      particles.clear();
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} className="game-canvas" />;
}
