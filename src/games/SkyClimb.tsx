// Based on "Basic Doodle Jump" by Steven Lambert (straker), CC0 1.0. Core mechanics ported; controls and theme adapted.
//
// SKY CLIMB — bounce a jetpack courier robot up the hover-pads of a vertical
// megacity. Physics, platform generation/spacing, screen-scroll-on-ascend and
// horizontal wrap-around are ported from the source (375×667 fixed-step) and
// rescaled to dt-based simulation on any canvas size.

import { useRef, useEffect } from "react";
import { Loop } from "./engine/Loop";
import { Particles } from "./engine/Particles";
import { Starfield } from "./engine/Starfield";
import { fitCanvas, glowText, clamp, roundRect } from "./engine/draw";

// ── Source design units (straker's canvas was 375×667, 60fps fixed step) ────
const SRC_W = 375;
const SRC_H = 667;
// 0.33 px/frame² @60fps → 0.33 * 60 * 60 px/s²
const FALL_ACCEL = 1188;
// -12.5 px/frame @60fps → px/s  (bounce impulse; same ratio vs FALL_ACCEL)
const BOUNCE_VEL = -750;
// 3 px/frame steer speed; 0.3 px/frame² release drag
const MOVE_SPEED = 180;
const DRAG_ACCEL = 1080;
const PAD_W = 65;
const PAD_H = 20;
const EDGE = 25; // min distance of pads from screen edges
// A single bounce rises ~237 design px (BOUNCE_VEL² / 2·FALL_ACCEL). Pad gaps
// must be a real fraction of that so the player has to AIM each bounce —
// otherwise pads stack so densely you rise on autopilot. Kept well under the
// reachable height (cap below) so every climb stays possible.
const MIN_SPACE_0 = 60; // initial min/max vertical gap between pads
const MAX_SPACE_0 = 110;
const SPACE_GROWTH = 0.5; // added to min/max gap per spawned pad
const MAX_SPACE_CAP = 150; // design px; +pad height stays under the ~237 reach
const PLAYER_W = 40;
const PLAYER_H = 60;
const PX_PER_M = 10; // design px per meter of altitude

const PINK = "#ff2d7b";
const CYAN = "#00e5ff";
const GOLD = "#ffc107";
const ORANGE = "#ff6b35";
const BEST_KEY = "skyClimb_best";

type PadKind = "normal" | "moving" | "breaking";

interface Pad {
  x: number;
  y: number;
  kind: PadKind;
  vx: number; // horizontal slide speed (moving pads)
  broken: boolean;
  fallV: number; // downward speed once broken
  alpha: number;
  flash: number; // glow pulse after a bounce
  pulse: number; // per-pad animation phase
}

type Phase = "start" | "playing" | "dead";

const rand = (lo: number, hi: number) => Math.random() * (hi - lo) + lo;

/** Deterministic 0..1 hash — stable tower silhouettes while scrolling. */
function hash01(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export default function SkyClimb({
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
    const cnv: HTMLCanvasElement = canvas;
    const g2d: CanvasRenderingContext2D = ctx;

    // ── Mutable runtime state ──────────────────────────────────────────────
    let view = fitCanvas(cnv, g2d);
    let W = view.width;
    let H = view.height;
    // Scale factors from source design units to this canvas.
    let ux = W / SRC_W;
    let uy = H / SRC_H;

    const particles = new Particles();
    let starsLow = new Starfield(W, H, 70);
    let starsHigh = new Starfield(W, H, 160);

    let phase: Phase = "start";
    let t = 0;

    // Player (top-left box like the source doodle; rw×rh collision box).
    let rw = PLAYER_W * ux;
    let rh = PLAYER_H * uy;
    let pX = 0;
    let pY = 0;
    let pVX = 0;
    let pVY = 0;
    let prevPY = 0;
    let facing = 1;

    // World
    let pads: Pad[] = [];
    let topY = 0; // y of the most recently spawned (topmost) pad
    let minSpace = MIN_SPACE_0 * uy;
    let maxSpace = MAX_SPACE_0 * uy;
    let lastKind: PadKind = "normal";
    let totalScroll = 0; // cumulative px the world has shifted down
    let startPY = 0;
    let maxHeightPx = 0;

    // Scores
    let best = 0;
    try {
      best = parseInt(localStorage.getItem(BEST_KEY) ?? "0", 10) || 0;
    } catch {
      best = 0;
    }
    let deathScore = 0;
    let liveTimer = 0; // throttle for live score reporting
    let liveBest = 0; // highest score already reported this run
    let newBest = false;
    let deathTimer = 0;

    // Input
    let keyLeft = false;
    let keyRight = false;
    const pointerDirs = new Map<number, number>();

    const padW = () => PAD_W * ux;
    const padH = () => PAD_H * uy;
    const platformStart = () => H - 50 * uy; // where the first pad sits
    const metersNow = () => Math.floor(maxHeightPx / (PX_PER_M * uy));

    // ── Pad construction ───────────────────────────────────────────────────
    function chooseKind(altPx: number): PadKind {
      const altM = altPx / (PX_PER_M * uy);
      const movingP = altM < 15 ? 0 : Math.min(0.26, ((altM - 15) / 250) * 0.26);
      const breakingP = altM < 40 ? 0 : Math.min(0.18, ((altM - 40) / 300) * 0.18);
      const r = Math.random();
      let kind: PadKind = "normal";
      // Never two breaking pads in a row — a bounce must always be earnable.
      if (lastKind !== "breaking" && r < breakingP) kind = "breaking";
      else if (r < breakingP + movingP) kind = "moving";
      lastKind = kind;
      return kind;
    }

    function makePad(x: number, y: number, kind: PadKind): Pad {
      return {
        x,
        y,
        kind,
        vx:
          kind === "moving"
            ? (50 + Math.random() * 50) * ux * (Math.random() < 0.5 ? -1 : 1)
            : 0,
        broken: false,
        fallV: 0,
        alpha: 1,
        flash: 0,
        pulse: Math.random() * Math.PI * 2,
      };
    }

    /**
     * Initial fill, ported from the source: first pad bottom-center, then
     * stack pads upward with random(min,max) gaps. Pads in the lower half
     * avoid the center band so the player bounces in place until steering.
     */
    function resetWorld() {
      minSpace = MIN_SPACE_0 * uy;
      maxSpace = MAX_SPACE_0 * uy;
      lastKind = "normal";
      pads = [makePad(W / 2 - padW() / 2, platformStart(), "normal")];
      let y = platformStart();
      while (y > 0) {
        y -= padH() + rand(minSpace, maxSpace);
        let x: number;
        do {
          x = rand(EDGE * ux, W - EDGE * ux - padW());
        } while (
          y > H / 2 &&
          x > W / 2 - padW() * 1.5 &&
          x < W / 2 + padW() / 2
        );
        pads.push(makePad(x, y, chooseKind(platformStart() - y)));
      }
      topY = pads[pads.length - 1].y;

      pX = W / 2 - rw / 2;
      pY = platformStart() - rh;
      pVX = 0;
      pVY = 0;
      prevPY = pY;
      facing = 1;
      totalScroll = 0;
      startPY = pY;
      maxHeightPx = 0;
      particles.clear();
    }

    function startRun() {
      resetWorld();
      newBest = false;
      deathScore = 0;
      liveTimer = 0;
      liveBest = 0;
      pointerDirs.clear();
      phase = "playing";
    }

    function die() {
      if (phase !== "playing") return;
      deathScore = metersNow();
      if (deathScore > best) {
        best = deathScore;
        newBest = true;
        try {
          localStorage.setItem(BEST_KEY, String(best));
        } catch {
          // storage unavailable — best stays session-local
        }
      }
      deathTimer = 0.45;
      phase = "dead";
      onGameOver(deathScore);
    }

    // ── Input listeners ────────────────────────────────────────────────────
    function onPointerDown(e: PointerEvent) {
      if (e.cancelable) e.preventDefault();
      if (phase === "start") {
        startRun();
        return;
      }
      if (phase === "dead") {
        if (deathTimer <= 0) startRun();
        return;
      }
      const rect = cnv.getBoundingClientRect();
      const dir = e.clientX - rect.left < rect.width / 2 ? -1 : 1;
      pointerDirs.set(e.pointerId, dir);
    }
    function onPointerUp(e: PointerEvent) {
      pointerDirs.delete(e.pointerId);
    }
    function onTouchStart(e: TouchEvent) {
      // Pointer events do the steering; this just blocks scroll/zoom.
      if (e.cancelable) e.preventDefault();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "ArrowLeft") {
        keyLeft = true;
        e.preventDefault();
      } else if (e.code === "ArrowRight") {
        keyRight = true;
        e.preventDefault();
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "ArrowLeft") keyLeft = false;
      else if (e.code === "ArrowRight") keyRight = false;
    }
    cnv.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    cnv.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    function onResize() {
      const next = fitCanvas(cnv, g2d);
      if (next.width === W && next.height === H) return;
      const kx = next.width / W;
      const ky = next.height / H;
      view = next;
      W = view.width;
      H = view.height;
      ux = W / SRC_W;
      uy = H / SRC_H;
      rw = PLAYER_W * ux;
      rh = PLAYER_H * uy;
      starsLow.resize(W, H);
      starsHigh.resize(W, H);
      for (const p of pads) {
        p.x *= kx;
        p.y *= ky;
        p.vx *= kx;
      }
      pX *= kx;
      pY *= ky;
      prevPY *= ky;
      pVX *= kx;
      pVY *= ky;
      topY *= ky;
      totalScroll *= ky;
      startPY *= ky;
      maxHeightPx *= ky;
      minSpace *= ky;
      maxSpace = Math.min(maxSpace * ky, H / 2);
    }
    window.addEventListener("resize", onResize);

    // ── Update ─────────────────────────────────────────────────────────────
    function update(dt: number) {
      t += dt;

      // Ambient drift; stars stream a little faster while climbing.
      const climbRate = phase === "playing" && pVY < 0 ? -pVY : 0;
      starsLow.update(dt, 5 + climbRate * 0.05);
      starsHigh.update(dt, 9 + climbRate * 0.1);
      particles.update(dt);

      // Pads animate in every phase (slide, break-fall, glow decay).
      for (const p of pads) {
        if (p.flash > 0) p.flash = Math.max(0, p.flash - dt * 3);
        if (p.broken) {
          p.fallV += FALL_ACCEL * uy * 0.6 * dt;
          p.y += p.fallV * dt;
          p.alpha = Math.max(0, p.alpha - dt * 1.8);
        } else if (p.kind === "moving") {
          p.x += p.vx * dt;
          if (p.x < EDGE * ux) {
            p.x = EDGE * ux;
            p.vx = Math.abs(p.vx);
          } else if (p.x + padW() > W - EDGE * ux) {
            p.x = W - EDGE * ux - padW();
            p.vx = -Math.abs(p.vx);
          }
        }
      }

      if (phase === "start") return;
      if (phase === "dead") {
        deathTimer = Math.max(0, deathTimer - dt);
        return;
      }

      // ── phase === "playing": ported source step, dt-based ────────────────
      pVY += FALL_ACCEL * uy * dt;

      // Screen-scroll-on-ascend: above the midline while rising, the world
      // shifts down instead of the player moving up.
      if (pY < H / 2 && pVY < 0) {
        const shift = -pVY * dt;
        for (const p of pads) p.y += shift;
        topY += shift;
        totalScroll += shift;

        // Top up pads above the screen; gaps widen as the player climbs.
        while (topY > 0) {
          const ny = topY - (padH() + rand(minSpace, maxSpace));
          pads.push(
            makePad(
              rand(EDGE * ux, W - EDGE * ux - padW()),
              ny,
              chooseKind(totalScroll + (startPY - ny))
            )
          );
          topY = ny;
          minSpace += SPACE_GROWTH * uy;
          maxSpace = Math.min(maxSpace + SPACE_GROWTH * uy, MAX_SPACE_CAP * uy);
        }
      } else {
        pY += pVY * dt;
      }

      // Steering: held direction sets speed instantly; release drags to 0.
      const keyDir = (keyRight ? 1 : 0) - (keyLeft ? 1 : 0);
      let dir = keyDir;
      if (dir === 0) for (const v of pointerDirs.values()) dir = v;
      if (dir !== 0) {
        pVX = dir * MOVE_SPEED * ux;
        facing = dir;
      } else if (pVX !== 0) {
        const s = pVX > 0 ? 1 : -1;
        pVX -= s * DRAG_ACCEL * ux * dt;
        if (pVX * s < 0) pVX = 0;
      }
      pX += pVX * dt;

      // Horizontal wrap-around (exit right → enter left, and vice versa).
      if (pX + rw < 0) pX = W;
      else if (pX > W) pX = -rw;

      // Bounce when falling onto a pad from above (AABB, as in the source).
      for (const p of pads) {
        if (p.broken) continue;
        if (
          pVY > 0 &&
          prevPY + rh <= p.y &&
          pX < p.x + padW() &&
          pX + rw > p.x &&
          pY < p.y + padH() &&
          pY + rh > p.y
        ) {
          pY = p.y - rh;
          pVY = BOUNCE_VEL * uy;
          p.flash = 1;
          const fx = pX + rw / 2;
          const fy = pY + rh;
          particles.burst(fx, fy, 10, "#ff9b4a", {
            speed: 150 * uy,
            size: 3,
            life: 0.4,
          });
          particles.burst(fx, fy, 5, PINK, {
            speed: 100 * uy,
            size: 2.5,
            life: 0.3,
          });
          if (p.kind === "breaking") {
            p.broken = true;
            particles.burst(p.x + padW() / 2, p.y + padH() / 2, 12, ORANGE, {
              speed: 170 * uy,
              size: 3,
              life: 0.5,
            });
          }
        }
      }
      prevPY = pY;

      // Jetpack trail while rising.
      if (pVY < 0) {
        particles.trail(
          pX + rw / 2 + (Math.random() - 0.5) * 6 * ux,
          pY + rh - 2,
          PINK,
          2.5,
          0.25
        );
      }

      // Drop pads that scrolled off the bottom (or finished breaking apart).
      pads = pads.filter((p) => p.y < H && (!p.broken || p.alpha > 0.03));

      // Altitude = total world scroll + climb within the screen.
      const hPx = totalScroll + (startPY - pY);
      if (hPx > maxHeightPx) maxHeightPx = hPx;

      // Fell off the bottom.
      if (pY > H) die();
    }

    // ── Drawing ────────────────────────────────────────────────────────────
    function drawBackground() {
      g2d.fillStyle = "#0a0a0f";
      g2d.fillRect(0, 0, W, H);

      // City glow near the streets fades out — and stars thicken — with
      // altitude.
      const altT = clamp(metersNow() / 350, 0, 1);
      if (altT < 1) {
        const g = g2d.createLinearGradient(0, H * 0.5, 0, H);
        g.addColorStop(0, "rgba(255,45,123,0)");
        g.addColorStop(0.7, `rgba(120,40,90,${0.08 * (1 - altT)})`);
        g.addColorStop(1, `rgba(255,45,123,${0.16 * (1 - altT)})`);
        g2d.fillStyle = g;
        g2d.fillRect(0, H * 0.5, W, H * 0.5);
      }

      g2d.save();
      g2d.globalAlpha = 0.55 + 0.3 * altT;
      starsLow.draw(g2d);
      g2d.globalAlpha = 0.1 + 0.9 * altT;
      starsHigh.draw(g2d, "220,205,255");
      g2d.restore();

      drawTowers(altT);
    }

    /** Faint mega-tower silhouettes rising along both screen edges. */
    function drawTowers(altT: number) {
      const segH = 130 * uy;
      const par = totalScroll * 0.4; // parallax: towers scroll slower
      const a = 0.6 * (1 - altT * 0.7);
      if (a <= 0.01) return;
      const first = Math.floor(par / segH);
      const count = Math.ceil(H / segH) + 2;
      g2d.save();
      for (let s = first; s < first + count; s++) {
        const yBottom = H - (s * segH - par);
        const yTop = yBottom - segH;
        if (yBottom < 0 || yTop > H) continue;
        for (let side = 0; side < 2; side++) {
          if (hash01(s * 7 + side * 131) < 0.2) continue; // gaps between towers
          const tw = (0.05 + hash01(s * 2 + side * 977) * 0.1) * W;
          const x = side === 0 ? 0 : W - tw;
          g2d.fillStyle = `rgba(18,22,36,${a})`;
          g2d.fillRect(x, yTop, tw, segH + 1);
          // inner edge accent
          g2d.fillStyle = `rgba(255,45,123,${a * 0.22})`;
          g2d.fillRect(side === 0 ? x + tw - 1.5 : x, yTop, 1.5, segH + 1);
          // a few lit windows
          for (let wn = 0; wn < 4; wn++) {
            const h1 = hash01(s * 31 + side * 53 + wn * 17);
            const h2 = hash01(s * 43 + side * 71 + wn * 29);
            if (h2 < 0.45) continue;
            g2d.fillStyle =
              h2 > 0.8
                ? `rgba(255,45,123,${a * 0.5})`
                : `rgba(0,229,255,${a * 0.45})`;
            g2d.fillRect(
              x + 3 * ux + h1 * (tw - 8 * ux),
              yTop + 8 * uy + h2 * (segH - 20 * uy),
              2.5 * ux,
              3.5 * uy
            );
          }
        }
      }
      g2d.restore();
    }

    function padColor(kind: PadKind): string {
      return kind === "normal" ? CYAN : kind === "moving" ? GOLD : ORANGE;
    }

    function drawPad(p: Pad) {
      const pw = padW();
      const ph = padH();
      const col = padColor(p.kind);
      const bob = p.broken ? 0 : Math.sin(t * 2 + p.pulse) * 1.5 * uy;
      const y = p.y + bob;
      g2d.save();
      g2d.globalAlpha = p.alpha;

      // Hull
      g2d.shadowColor = col;
      g2d.shadowBlur = 10 + p.flash * 20;
      g2d.fillStyle = "rgba(16,20,34,0.95)";
      roundRect(g2d, p.x, y, pw, ph, ph * 0.45);
      g2d.fill();
      g2d.lineWidth = 2;
      g2d.strokeStyle = col;
      g2d.stroke();

      // Lit top deck
      g2d.shadowBlur = 0;
      g2d.globalAlpha = p.alpha * (0.55 + p.flash * 0.45);
      g2d.fillStyle = col;
      g2d.fillRect(p.x + 5 * ux, y + 2.5 * uy, pw - 10 * ux, 2.5 * uy);

      // Hover thruster dots underneath
      g2d.globalAlpha =
        p.alpha * (0.35 + 0.25 * Math.sin(t * 6 + p.pulse) + p.flash * 0.4);
      for (let i = 0; i < 3; i++) {
        const dx = p.x + pw * (0.25 + i * 0.25);
        g2d.beginPath();
        g2d.arc(dx, y + ph + 2.5 * uy, 1.8 * ux, 0, Math.PI * 2);
        g2d.fill();
      }

      // Cracks on breaking pads
      if (p.kind === "breaking") {
        g2d.globalAlpha = p.alpha * 0.8;
        g2d.strokeStyle = "rgba(10,10,15,0.9)";
        g2d.lineWidth = 1.5;
        g2d.beginPath();
        g2d.moveTo(p.x + pw * 0.32, y + 2);
        g2d.lineTo(p.x + pw * 0.46, y + ph - 3);
        g2d.lineTo(p.x + pw * 0.58, y + 4);
        g2d.lineTo(p.x + pw * 0.7, y + ph - 2);
        g2d.stroke();
      }
      g2d.restore();
    }

    /** Jetpack courier robot inside the rw×rh collision box. */
    function drawRobot() {
      if (pY > H + rh) return;
      const cx = pX + rw / 2;
      const bob = phase === "start" ? Math.sin(t * 2.2) * 3 * uy : 0;
      const cy = pY + rh / 2 + bob;
      const tilt = clamp(pVX / (MOVE_SPEED * ux), -1, 1) * 0.16;
      const w = rw;
      const h = rh;
      g2d.save();
      g2d.translate(cx, cy);
      g2d.rotate(tilt);

      // Jetpack pods
      g2d.fillStyle = "#343c52";
      roundRect(g2d, -w * 0.5, -h * 0.08, w * 0.18, h * 0.3, 3 * ux);
      g2d.fill();
      roundRect(g2d, w * 0.32, -h * 0.08, w * 0.18, h * 0.3, 3 * ux);
      g2d.fill();
      // Nozzle glow
      g2d.save();
      g2d.fillStyle = PINK;
      g2d.shadowColor = PINK;
      g2d.shadowBlur = 8;
      g2d.fillRect(-w * 0.47, h * 0.22, w * 0.12, 2.5 * uy);
      g2d.fillRect(w * 0.35, h * 0.22, w * 0.12, 2.5 * uy);
      g2d.restore();

      // Legs
      g2d.fillStyle = "#2a3142";
      g2d.fillRect(-w * 0.22, h * 0.32, w * 0.14, h * 0.15);
      g2d.fillRect(w * 0.08, h * 0.32, w * 0.14, h * 0.15);

      // Body
      g2d.fillStyle = "#39415a";
      g2d.strokeStyle = "#a8b6d0";
      g2d.lineWidth = 2;
      roundRect(g2d, -w * 0.34, -h * 0.36, w * 0.68, h * 0.7, 7 * ux);
      g2d.fill();
      g2d.stroke();

      // Visor
      g2d.fillStyle = "#0d1320";
      roundRect(g2d, -w * 0.25, -h * 0.28, w * 0.5, h * 0.18, 4 * ux);
      g2d.fill();
      g2d.save();
      g2d.fillStyle = CYAN;
      g2d.shadowColor = CYAN;
      g2d.shadowBlur = 9;
      roundRect(
        g2d,
        -w * 0.18 + facing * w * 0.06,
        -h * 0.26,
        w * 0.26,
        h * 0.13,
        3 * ux
      );
      g2d.fill();
      g2d.restore();

      // Chest courier light
      g2d.save();
      g2d.globalAlpha = 0.65 + 0.35 * Math.sin(t * 6);
      g2d.fillStyle = PINK;
      g2d.shadowColor = PINK;
      g2d.shadowBlur = 8;
      g2d.beginPath();
      g2d.arc(0, h * 0.05, 2.6 * ux, 0, Math.PI * 2);
      g2d.fill();
      g2d.restore();

      // Antenna
      g2d.strokeStyle = "#a8b6d0";
      g2d.lineWidth = 1.5;
      g2d.beginPath();
      g2d.moveTo(0, -h * 0.36);
      g2d.lineTo(0, -h * 0.48);
      g2d.stroke();
      g2d.save();
      g2d.fillStyle = PINK;
      g2d.shadowColor = PINK;
      g2d.shadowBlur = 7;
      g2d.beginPath();
      g2d.arc(0, -h * 0.5, 2 * ux, 0, Math.PI * 2);
      g2d.fill();
      g2d.restore();

      g2d.restore();
    }

    function drawHUD() {
      const size = clamp(W * 0.09, 30, 52);
      glowText(g2d, `${metersNow()}m`, W / 2, clamp(H * 0.055, 28, 56), {
        color: PINK,
        size,
        glow: 18,
        mono: true,
        weight: 800,
      });
      glowText(
        g2d,
        `BEST ${Math.max(best, metersNow())}m`,
        W / 2,
        clamp(H * 0.055, 28, 56) + size * 0.72,
        { color: "#8a93a8", size: clamp(W * 0.03, 11, 15), mono: true }
      );
    }

    function drawStartOverlay() {
      g2d.fillStyle = "rgba(5,5,10,0.5)";
      g2d.fillRect(0, 0, W, H);
      glowText(g2d, "SKY CLIMB", W / 2, H * 0.28, {
        color: PINK,
        size: clamp(W * 0.13, 40, 72),
        glow: 24,
        weight: 800,
      });
      glowText(
        g2d,
        "Bounce up the hover-pads of the vertical city",
        W / 2,
        H * 0.28 + clamp(W * 0.13, 40, 72) * 0.75,
        { color: "#aab0bd", size: clamp(W * 0.036, 13, 18) }
      );
      glowText(g2d, "TAP LEFT / RIGHT TO STEER", W / 2, H * 0.55, {
        color: CYAN,
        size: clamp(W * 0.04, 14, 20),
        glow: 10,
        mono: true,
      });
      g2d.save();
      g2d.globalAlpha = 0.6 + 0.4 * Math.sin(t * 3);
      glowText(g2d, "TAP TO START", W / 2, H * 0.64, {
        color: "#ffffff",
        size: clamp(W * 0.06, 22, 34),
        glow: 16,
        weight: 800,
      });
      g2d.restore();
      glowText(g2d, `BEST ${best}m`, W / 2, H * 0.72, {
        color: "#8a93a8",
        size: clamp(W * 0.032, 12, 16),
        mono: true,
      });
    }

    function drawDeadOverlay() {
      g2d.fillStyle = "rgba(5,5,10,0.66)";
      g2d.fillRect(0, 0, W, H);
      glowText(g2d, "SIGNAL LOST", W / 2, H * 0.34, {
        color: PINK,
        size: clamp(W * 0.105, 36, 60),
        glow: 24,
        weight: 800,
      });
      glowText(g2d, `${deathScore}m`, W / 2, H * 0.45, {
        color: "#ffffff",
        size: clamp(W * 0.14, 46, 84),
        glow: 14,
        mono: true,
        weight: 800,
      });
      glowText(
        g2d,
        newBest ? `NEW BEST — ${best}m` : `BEST ${best}m`,
        W / 2,
        H * 0.53,
        {
          color: newBest ? GOLD : "#8a93a8",
          size: clamp(W * 0.04, 14, 20),
          glow: newBest ? 12 : 0,
          mono: true,
        }
      );
      g2d.save();
      g2d.globalAlpha = 0.55 + 0.45 * Math.sin(t * 3);
      glowText(g2d, "TAP TO RETRY", W / 2, H * 0.65, {
        color: "#ffffff",
        size: clamp(W * 0.06, 22, 34),
        glow: 16,
        weight: 800,
      });
      g2d.restore();
    }

    function render() {
      drawBackground();
      for (const p of pads) drawPad(p);
      drawRobot();
      particles.draw(g2d);
      if (phase !== "start") drawHUD();
      if (phase === "start") drawStartOverlay();
      else if (phase === "dead") drawDeadOverlay();
    }

    resetWorld();
    const loop = new Loop((dt) => {
      update(dt);
      // Live scoring: report the climb height while playing (server keeps max).
      if (phase === "playing") {
        liveTimer += dt;
        if (liveTimer >= 0.7) {
          liveTimer = 0;
          const m = metersNow();
          if (m > liveBest) {
            liveBest = m;
            onGameOver(m);
          }
        }
      }
      render();
    });
    loop.start();

    return () => {
      loop.stop();
      window.removeEventListener("resize", onResize);
      cnv.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      cnv.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} className="game-canvas" />;
}
