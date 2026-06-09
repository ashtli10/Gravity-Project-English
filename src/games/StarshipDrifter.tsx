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

// ── World definitions ────────────────────────────────────────────────────────

interface World {
  name: string;
  gravity: number; // px/s^2 tuning
  thrustImpulse: number; // px/s applied upward on tap (negative)
  realGravity: string;
  bodyColor: string;
  accent: string;
  scoreMultiplier: number;
  note: string;
  tint: string; // starfield "r,g,b"
}

const WORLDS: World[] = [
  {
    name: "Moon",
    gravity: 400,
    thrustImpulse: -280,
    realGravity: "1.6 m/s²",
    bodyColor: "#d0d0e0",
    accent: "#c0c0d0",
    scoreMultiplier: 1.0,
    note: "Low gravity — you drift!",
    tint: "200,205,230",
  },
  {
    name: "Mars",
    gravity: 620,
    thrustImpulse: -320,
    realGravity: "3.7 m/s²",
    bodyColor: "#cc4422",
    accent: "#ff6b35",
    scoreMultiplier: 1.3,
    note: "Thin air, dusty skies",
    tint: "230,160,120",
  },
  {
    name: "Earth orbit",
    gravity: 980,
    thrustImpulse: -380,
    realGravity: "9.8 m/s²",
    bodyColor: "#4488cc",
    accent: "#00e676",
    scoreMultiplier: 1.6,
    note: "Standard gravity",
    tint: "150,200,255",
  },
  {
    name: "Jupiter",
    gravity: 1800,
    thrustImpulse: -520,
    realGravity: "24.8 m/s²",
    bodyColor: "#cc8833",
    accent: "#ffc107",
    scoreMultiplier: 2.5,
    note: "Crushing pull!",
    tint: "235,200,150",
  },
  {
    name: "The Sun",
    gravity: 2600,
    thrustImpulse: -640,
    realGravity: "274 m/s²",
    bodyColor: "#ffcc00",
    accent: "#ffaa00",
    scoreMultiplier: 3.0,
    note: "Near-impossible!",
    tint: "255,220,150",
  },
];

// ── Game entity types ────────────────────────────────────────────────────────

type Phase = "select" | "ready" | "playing" | "dead";
type ObstacleStyle = "pillar" | "asteroid" | "truss";

interface Corridor {
  x: number;
  gapY: number; // center of gap (logical px)
  gap: number; // gap height
  passed: boolean;
  oscillate: boolean;
  oscPhase: number;
  oscAmp: number;
  baseY: number;
  style: ObstacleStyle;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const ZONES = ["Deep space…", "Nebula sector…", "Asteroid belt…", "Derelict fleet…"];

export default function StarshipDrifter({
  onGameOver,
}: {
  onGameOver: (score: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) return;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (!ctx) return;
    const cnv: HTMLCanvasElement = canvas;
    const g2d: CanvasRenderingContext2D = ctx;

    // ── Mutable runtime state (closure-scoped, not React) ──────────────────────
    let view = fitCanvas(cnv, g2d);
    let W = view.width;
    let H = view.height;

    const input = new Input(cnv);
    const particles = new Particles();
    let starfield = new Starfield(W, H, 110);

    let phase: Phase = "select";
    let selected = 2; // default Earth orbit
    let world: World = WORLDS[selected];

    // Player physics
    let py = 0;
    let pvy = 0;
    let prot = 0;
    const PW = 46;
    const PH = 28;
    const px = () => W * 0.28;

    // Obstacles
    let corridors: Corridor[] = [];
    let scrollSpeed = 200;
    let passed = 0;
    let comboFlash = 0;
    let comboText = "";

    // Visuals
    let zoneIndex = 0;
    let zoneLabelTimer = 0;
    let flash = 0;
    let bodyAngle = 0;
    let terrainScroll = 0;
    const shooters: ShootingStar[] = [];
    let shooterTimer = 2 + Math.random() * 3;
    let deathScore = 0;

    // Layout-derived spacing (recomputed each frame from W)
    const corridorWidth = () => clamp(W * 0.13, 56, 110);
    const corridorSpacing = () => clamp(W * 0.62, 230, 460);

    // ── Reachability: clamp gap center so it's flyable on this world ───────────
    // Time to cross one corridor spacing horizontally:
    //   t = spacing / scrollSpeed
    // Max climb if the player thrusts continuously is bounded by the tap impulse
    // budget; we model a conservative reachable vertical delta per spacing and
    // keep consecutive gap centers within it (and away from edges).
    function reachableDelta(): number {
      const t = corridorSpacing() / scrollSpeed; // seconds between corridors
      // Conservative: with steady tapping the craft can climb roughly
      // |thrustImpulse| worth of velocity, net of gravity over the interval.
      const climb = Math.abs(world.thrustImpulse) * t * 0.5;
      const fall = 0.5 * world.gravity * t * t;
      // The smaller of the two bounds how far we can safely move the gap.
      return Math.max(80, Math.min(climb, fall) * 0.9);
    }

    function gapForScore(): number {
      // Gap shrinks slowly as score rises.
      const base = clamp(H * 0.34, 150, 280);
      const shrink = easeOut(passed / 60) * (base * 0.42);
      return Math.max(H * 0.18, base - shrink);
    }

    function makeCorridor(x: number, prevY: number | null): Corridor {
      const gap = gapForScore();
      const margin = gap / 2 + 40;
      const lo = margin;
      const hi = H - margin - terrainHeight();
      let gapY: number;
      if (prevY === null) {
        gapY = H * 0.45;
      } else {
        const d = reachableDelta();
        gapY = prevY + (Math.random() * 2 - 1) * d;
      }
      gapY = clamp(gapY, lo, hi);
      const oscillate = Math.random() < 0.22;
      const styles: ObstacleStyle[] = ["pillar", "asteroid", "truss"];
      const style = styles[zoneIndex % styles.length];
      return {
        x,
        gapY,
        baseY: gapY,
        gap,
        passed: false,
        oscillate,
        oscPhase: Math.random() * Math.PI * 2,
        oscAmp: oscillate ? Math.min(reachableDelta() * 0.5, H * 0.12) : 0,
        style,
      };
    }

    function terrainHeight(): number {
      return H * 0.1;
    }

    // ── Lifecycle ──────────────────────────────────────────────────────────────
    function startRun() {
      world = WORLDS[selected];
      py = H * 0.45;
      pvy = 0;
      prot = 0;
      corridors = [];
      scrollSpeed = clamp(W * 0.32, 180, 280);
      passed = 0;
      comboFlash = 0;
      zoneIndex = 0;
      zoneLabelTimer = 2.2;
      flash = 0;
      particles.clear();
      starfield = new Starfield(W, H, 110);
      // Pre-seed a few corridors off to the right.
      let lastY: number | null = null;
      const spacing = corridorSpacing();
      for (let i = 0; i < 4; i++) {
        const c = makeCorridor(W + 200 + i * spacing, lastY);
        lastY = c.gapY;
        corridors.push(c);
      }
      phase = "ready";
    }

    function die() {
      if (phase !== "playing") return;
      const weighted = Math.round(passed * world.scoreMultiplier);
      deathScore = passed;
      flash = 1;
      particles.burst(px(), py, 40, world.accent, { speed: 360, size: 5 });
      particles.burst(px(), py, 24, "#ffffff", { speed: 220, size: 3 });
      phase = "dead";
      onGameOver(weighted);
    }

    function liveGapY(c: Corridor, time: number): number {
      if (!c.oscillate) return c.gapY;
      return c.baseY + Math.sin(time * 1.1 + c.oscPhase) * c.oscAmp;
    }

    let t = 0;

    // The select / change-world tabs are click-targets. We hit-test pointer
    // positions against tab rectangles via a dedicated listener so taps on a
    // tab pick a world rather than thrust.
    const tabRects: { x: number; y: number; w: number; h: number; i: number }[] = [];

    function onPointer(e: PointerEvent) {
      const rect = cnv.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      if (phase === "select" || phase === "dead") {
        for (const tr of tabRects) {
          if (mx >= tr.x && mx <= tr.x + tr.w && my >= tr.y && my <= tr.y + tr.h) {
            selected = tr.i;
            world = WORLDS[selected];
            if (phase === "dead") phase = "select";
            // consume the queued tap so it doesn't also start a run
            input.consumeTap();
            return;
          }
        }
      }
    }
    cnv.addEventListener("pointerdown", onPointer);

    // ── Update ───────────────────────────────────────────────────────────────
    function update(dt: number) {
      t += dt;
      // Re-fit each frame keeps layout correct after CSS/orientation changes.
      view = fitCanvas(cnv, g2d);
      if (view.width !== W || view.height !== H) {
        W = view.width;
        H = view.height;
        starfield.resize(W, H);
      }

      const bgScroll = phase === "playing" ? scrollSpeed : scrollSpeed * 0.25;
      starfield.update(dt, bgScroll);
      bodyAngle += dt * 0.05;
      terrainScroll = (terrainScroll + bgScroll * 0.4 * dt) % W;

      // Shooting stars
      shooterTimer -= dt;
      if (shooterTimer <= 0) {
        shooterTimer = 2 + Math.random() * 4;
        shooters.push({
          x: W * (0.4 + Math.random() * 0.6),
          y: H * Math.random() * 0.4,
          vx: -(300 + Math.random() * 200),
          vy: 120 + Math.random() * 120,
          life: 1.0,
        });
      }
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt * 1.4;
        if (s.life <= 0 || s.x < -50) shooters.splice(i, 1);
      }

      particles.update(dt);
      if (flash > 0) flash = Math.max(0, flash - dt * 3);
      if (comboFlash > 0) comboFlash = Math.max(0, comboFlash - dt);
      if (zoneLabelTimer > 0) zoneLabelTimer -= dt;

      const tap = input.consumeTap();

      if (phase === "select") {
        if (tap) startRun();
        return;
      }

      if (phase === "ready") {
        // Hover gently until first tap.
        py = H * 0.45 + Math.sin(t * 2) * 8;
        prot = lerp(prot, -0.1, 0.1);
        if (tap) {
          phase = "playing";
          pvy = world.thrustImpulse;
        }
        return;
      }

      if (phase === "dead") {
        if (tap) startRun();
        return;
      }

      // ── phase === "playing" ──
      if (tap) {
        pvy = world.thrustImpulse;
        particles.burst(px() - PW * 0.5, py + PH * 0.3, 6, world.accent, {
          speed: 120,
          size: 3,
          life: 0.4,
        });
      }
      pvy += world.gravity * dt;
      py += pvy * dt;

      // Tilt: up when rising (thrusting), nose down when falling.
      const targetRot = clamp(pvy / 500, -0.5, 1.1);
      prot = lerp(prot, targetRot, 0.15);

      // Thruster trail
      const flameX = px() - PW * 0.5 - 4;
      particles.trail(
        flameX,
        py + Math.sin(t * 30) * 2,
        world.accent,
        3 + Math.random() * 2,
        0.3
      );

      // Difficulty ramp
      scrollSpeed = clamp(W * 0.32, 180, 280) + easeOut(passed / 50) * 90;

      // Move corridors
      const spacing = corridorSpacing();
      for (const c of corridors) {
        c.x -= scrollSpeed * dt;
        if (!c.passed && c.x + corridorWidth() < px()) {
          c.passed = true;
          passed += 1;
          // Zone change every 15 corridors
          if (passed % 15 === 0) {
            zoneIndex = (zoneIndex + 1) % ZONES.length;
            zoneLabelTimer = 2.4;
          }
          // Combo every 5
          if (passed % 5 === 0) {
            comboText = `x${passed} STREAK!`;
            comboFlash = 1.2;
          }
        }
      }
      // Recycle / spawn
      corridors = corridors.filter((c) => c.x + corridorWidth() > -20);
      let rightmost = -Infinity;
      let rightmostY: number | null = null;
      for (const c of corridors) {
        if (c.x > rightmost) {
          rightmost = c.x;
          rightmostY = c.baseY;
        }
      }
      if (rightmost < W - spacing) {
        corridors.push(makeCorridor(rightmost + spacing, rightmostY));
      }

      // Collisions
      const cx = px();
      const cw = corridorWidth();
      const top = terrainHeight();
      if (py - PH / 2 < 0 || py + PH / 2 > H - top) {
        die();
        return;
      }
      for (const c of corridors) {
        if (cx + PW / 2 < c.x || cx - PW / 2 > c.x + cw) continue;
        const gy = liveGapY(c, t);
        const gapTop = gy - c.gap / 2;
        const gapBot = gy + c.gap / 2;
        if (py - PH / 2 < gapTop || py + PH / 2 > gapBot) {
          die();
          return;
        }
      }
    }

    // ── Drawing ────────────────────────────────────────────────────────────────
    function drawBackground() {
      const g = g2d.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0a0a0f");
      g.addColorStop(0.55, shadeMix("#0a0a0f", world.bodyColor, 0.12));
      g.addColorStop(1, shadeMix("#0a0a0f", world.accent, 0.18));
      g2d.fillStyle = g;
      g2d.fillRect(0, 0, W, H);

      starfield.draw(g2d, world.tint);

      // Shooting stars
      g2d.save();
      for (const s of shooters) {
        g2d.globalAlpha = clamp(s.life, 0, 1) * 0.9;
        g2d.strokeStyle = "#ffffff";
        g2d.lineWidth = 2;
        g2d.beginPath();
        g2d.moveTo(s.x, s.y);
        g2d.lineTo(s.x - s.vx * 0.04, s.y - s.vy * 0.04);
        g2d.stroke();
      }
      g2d.restore();

      // Translucent celestial body (the chosen world)
      const br = Math.min(W, H) * 0.42;
      const bx = W * 0.78;
      const by = H * 0.32;
      g2d.save();
      g2d.globalAlpha = 0.35;
      const rg = g2d.createRadialGradient(
        bx - br * 0.3,
        by - br * 0.3,
        br * 0.1,
        bx,
        by,
        br
      );
      rg.addColorStop(0, world.bodyColor);
      rg.addColorStop(1, shadeMix(world.bodyColor, "#000000", 0.6));
      g2d.fillStyle = rg;
      g2d.beginPath();
      g2d.arc(bx, by, br, 0, Math.PI * 2);
      g2d.fill();
      // subtle band detail
      g2d.globalAlpha = 0.08;
      g2d.strokeStyle = "#ffffff";
      g2d.lineWidth = 3;
      for (let i = -2; i <= 2; i++) {
        g2d.beginPath();
        g2d.arc(bx, by, br * (0.5 + i * 0.12), bodyAngle, bodyAngle + Math.PI);
        g2d.stroke();
      }
      g2d.restore();
    }

    function drawTerrain() {
      const top = terrainHeight();
      const baseY = H - top;
      g2d.save();
      g2d.fillStyle = shadeMix("#0a0a0f", world.bodyColor, 0.3);
      g2d.beginPath();
      g2d.moveTo(0, H);
      g2d.lineTo(0, baseY);
      const step = 40;
      for (let x = -step; x <= W + step; x += step) {
        const sx = x - (terrainScroll % step);
        const hh = (Math.sin((x + Math.floor(terrainScroll / step) * step) * 0.05) +
          1) *
          top *
          0.4;
        g2d.lineTo(sx, baseY - hh);
      }
      g2d.lineTo(W, H);
      g2d.closePath();
      g2d.fill();
      g2d.restore();
    }

    function drawCorridor(c: Corridor) {
      const cw = corridorWidth();
      const gy = liveGapY(c, t);
      const gapTop = gy - c.gap / 2;
      const gapBot = gy + c.gap / 2;
      const col = shadeMix(world.bodyColor, "#222230", 0.35);
      const edge = world.accent;

      const drawPart = (y0: number, y1: number) => {
        const h = y1 - y0;
        if (h <= 0) return;
        g2d.save();
        if (c.style === "asteroid") {
          // Segmented asteroid chunks
          const seg = 26;
          for (let yy = y0; yy < y1; yy += seg) {
            const sh = Math.min(seg - 4, y1 - yy);
            const wobble = Math.sin(yy * 0.3 + c.oscPhase) * 6;
            g2d.fillStyle = col;
            roundRect(g2d, c.x + wobble, yy, cw - Math.abs(wobble), sh, 10);
            g2d.fill();
          }
        } else if (c.style === "truss") {
          // Angular station truss
          g2d.fillStyle = shadeMix(col, "#000", 0.2);
          g2d.fillRect(c.x + cw * 0.2, y0, cw * 0.6, h);
          g2d.strokeStyle = edge;
          g2d.lineWidth = 2;
          g2d.globalAlpha = 0.6;
          for (let yy = y0; yy < y1; yy += 22) {
            g2d.beginPath();
            g2d.moveTo(c.x + cw * 0.2, yy);
            g2d.lineTo(c.x + cw * 0.8, yy + 14);
            g2d.moveTo(c.x + cw * 0.8, yy);
            g2d.lineTo(c.x + cw * 0.2, yy + 14);
            g2d.stroke();
          }
        } else {
          // Solid pillar
          g2d.fillStyle = col;
          roundRect(g2d, c.x, y0, cw, h, 8);
          g2d.fill();
        }
        g2d.restore();
      };

      const top = terrainHeight();
      drawPart(0, gapTop);
      drawPart(gapBot, H - top);

      // Glowing gap edges
      g2d.save();
      g2d.strokeStyle = edge;
      g2d.shadowColor = edge;
      g2d.shadowBlur = 14;
      g2d.lineWidth = 3;
      g2d.beginPath();
      g2d.moveTo(c.x, gapTop);
      g2d.lineTo(c.x + cw, gapTop);
      g2d.moveTo(c.x, gapBot);
      g2d.lineTo(c.x + cw, gapBot);
      g2d.stroke();
      g2d.restore();
    }

    function drawShip(x: number, y: number, rot: number) {
      g2d.save();
      g2d.translate(x, y);
      g2d.rotate(rot * 0.4);

      // Hull
      g2d.fillStyle = "#e8ecf5";
      g2d.strokeStyle = world.accent;
      g2d.lineWidth = 2;
      g2d.beginPath();
      g2d.moveTo(PW / 2, 0);
      g2d.lineTo(PW * 0.05, -PH / 2);
      g2d.lineTo(-PW / 2, -PH * 0.3);
      g2d.lineTo(-PW / 2, PH * 0.3);
      g2d.lineTo(PW * 0.05, PH / 2);
      g2d.closePath();
      g2d.fill();
      g2d.stroke();

      // Fins
      g2d.fillStyle = shadeMix(world.accent, "#000", 0.2);
      g2d.beginPath();
      g2d.moveTo(-PW * 0.2, -PH * 0.28);
      g2d.lineTo(-PW * 0.55, -PH * 0.7);
      g2d.lineTo(-PW * 0.1, -PH * 0.28);
      g2d.closePath();
      g2d.fill();
      g2d.beginPath();
      g2d.moveTo(-PW * 0.2, PH * 0.28);
      g2d.lineTo(-PW * 0.55, PH * 0.7);
      g2d.lineTo(-PW * 0.1, PH * 0.28);
      g2d.closePath();
      g2d.fill();

      // Glowing window
      g2d.save();
      g2d.fillStyle = world.accent;
      g2d.shadowColor = world.accent;
      g2d.shadowBlur = 12;
      g2d.beginPath();
      g2d.arc(PW * 0.12, 0, PH * 0.22, 0, Math.PI * 2);
      g2d.fill();
      g2d.restore();

      g2d.restore();
    }

    function drawHUD() {
      glowText(g2d, String(passed), W / 2, H * 0.12, {
        color: "#ffffff",
        size: clamp(W * 0.12, 40, 72),
        glow: 16,
        mono: true,
        weight: 800,
      });
      glowText(
        g2d,
        `${world.name}  ·  ${world.realGravity}`,
        W / 2,
        H * 0.12 + clamp(W * 0.08, 30, 48),
        { color: world.accent, size: clamp(W * 0.035, 13, 18), glow: 8 }
      );

      if (comboFlash > 0) {
        const a = easeOut(comboFlash / 1.2);
        g2d.save();
        g2d.globalAlpha = a;
        glowText(g2d, comboText, W / 2, H * 0.3, {
          color: world.accent,
          size: clamp(W * 0.07, 26, 42),
          glow: 20,
          weight: 800,
        });
        g2d.restore();
      }

      if (zoneLabelTimer > 0) {
        const a = clamp(zoneLabelTimer / 2.4, 0, 1);
        const fade = a > 0.7 ? (1 - a) / 0.3 : a / 0.7;
        g2d.save();
        g2d.globalAlpha = clamp(fade, 0, 1) * 0.85;
        glowText(g2d, ZONES[zoneIndex], W / 2, H * 0.5, {
          color: "#ffffff",
          size: clamp(W * 0.06, 22, 36),
          glow: 12,
          weight: 600,
        });
        g2d.restore();
      }
    }

    function drawTabs(active: number) {
      tabRects.length = 0;
      const n = WORLDS.length;
      const pad = clamp(W * 0.015, 6, 12);
      const totalW = W - pad * 2;
      const tw = (totalW - pad * (n - 1)) / n;
      const th = clamp(H * 0.09, 48, 76);
      const y = clamp(H * 0.03, 12, 28);
      for (let i = 0; i < n; i++) {
        const w = WORLDS[i];
        const x = pad + i * (tw + pad);
        const isActive = i === active;
        g2d.save();
        g2d.globalAlpha = isActive ? 1 : 0.55;
        g2d.fillStyle = isActive
          ? shadeMix(w.bodyColor, "#000", 0.55)
          : "rgba(20,20,30,0.6)";
        roundRect(g2d, x, y, tw, th, 10);
        g2d.fill();
        g2d.lineWidth = 2;
        g2d.strokeStyle = isActive ? w.accent : "rgba(255,255,255,0.15)";
        if (isActive) {
          g2d.shadowColor = w.accent;
          g2d.shadowBlur = 12;
        }
        g2d.stroke();
        g2d.restore();
        glowText(g2d, w.name, x + tw / 2, y + th * 0.34, {
          color: isActive ? "#ffffff" : "#cfd2dc",
          size: clamp(tw * 0.16, 10, 16),
          weight: 700,
        });
        glowText(g2d, w.realGravity, x + tw / 2, y + th * 0.7, {
          color: isActive ? w.accent : "#9aa0ad",
          size: clamp(tw * 0.13, 9, 14),
          mono: true,
        });
        tabRects.push({ x, y, w: tw, h: th, i });
      }
    }

    function drawSelectScreen() {
      drawTabs(selected);
      const cy = H * 0.5;
      glowText(g2d, "FRONTIER 2200", W / 2, cy - clamp(H * 0.14, 70, 130), {
        color: "#ffffff",
        size: clamp(W * 0.075, 28, 50),
        glow: 14,
        weight: 800,
      });
      glowText(g2d, "STARSHIP DRIFTER", W / 2, cy - clamp(H * 0.09, 44, 84), {
        color: world.accent,
        size: clamp(W * 0.045, 18, 28),
        glow: 10,
        weight: 600,
      });
      glowText(
        g2d,
        `Destination: ${world.name}`,
        W / 2,
        cy + clamp(H * 0.01, 4, 12),
        { color: "#ffffff", size: clamp(W * 0.05, 20, 30), weight: 700 }
      );
      glowText(g2d, world.note, W / 2, cy + clamp(H * 0.055, 30, 56), {
        color: "#aab0bd",
        size: clamp(W * 0.035, 14, 20),
      });
      glowText(
        g2d,
        `Gravity ${world.realGravity}  ·  score ×${world.scoreMultiplier}`,
        W / 2,
        cy + clamp(H * 0.1, 56, 96),
        { color: world.accent, size: clamp(W * 0.032, 12, 17), mono: true }
      );
      const pulse = 0.6 + 0.4 * Math.sin(t * 3);
      g2d.save();
      g2d.globalAlpha = pulse;
      glowText(g2d, "TAP TO LAUNCH", W / 2, cy + clamp(H * 0.18, 100, 170), {
        color: "#ffffff",
        size: clamp(W * 0.05, 20, 30),
        glow: 14,
        weight: 800,
      });
      g2d.restore();
      glowText(
        g2d,
        "pick a world above — gravity changes everything",
        W / 2,
        H - clamp(H * 0.04, 22, 40),
        { color: "#7a808d", size: clamp(W * 0.028, 11, 15) }
      );
    }

    function drawReady() {
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      g2d.save();
      g2d.globalAlpha = pulse;
      glowText(g2d, "TAP TO THRUST", W / 2, H * 0.62, {
        color: world.accent,
        size: clamp(W * 0.06, 24, 40),
        glow: 16,
        weight: 800,
      });
      g2d.restore();
      glowText(g2d, world.note, W / 2, H * 0.7, {
        color: "#aab0bd",
        size: clamp(W * 0.035, 14, 20),
      });
    }

    function drawDeath() {
      g2d.save();
      g2d.fillStyle = "rgba(5,5,10,0.62)";
      g2d.fillRect(0, 0, W, H);
      g2d.restore();

      drawTabs(selected);

      const cy = H * 0.46;
      glowText(g2d, "WRECKED", W / 2, cy - clamp(H * 0.08, 40, 76), {
        color: world.accent,
        size: clamp(W * 0.1, 40, 64),
        glow: 22,
        weight: 800,
      });
      glowText(
        g2d,
        `${deathScore} corridors · ${world.name}`,
        W / 2,
        cy + clamp(H * 0.005, 2, 8),
        { color: "#ffffff", size: clamp(W * 0.045, 18, 26), weight: 700 }
      );
      glowText(
        g2d,
        `Gravity: ${world.realGravity}`,
        W / 2,
        cy + clamp(H * 0.05, 28, 52),
        { color: world.accent, size: clamp(W * 0.035, 14, 20), mono: true }
      );
      const pulse = 0.55 + 0.45 * Math.sin(t * 3);
      g2d.save();
      g2d.globalAlpha = pulse;
      glowText(g2d, "TAP TO RETRY", W / 2, cy + clamp(H * 0.13, 74, 128), {
        color: "#ffffff",
        size: clamp(W * 0.055, 22, 34),
        glow: 16,
        weight: 800,
      });
      g2d.restore();
      glowText(
        g2d,
        "← change world (tap a tab above)",
        W / 2,
        H - clamp(H * 0.04, 22, 40),
        { color: "#8a909d", size: clamp(W * 0.03, 12, 16) }
      );
    }

    function render() {
      drawBackground();

      if (phase === "select") {
        drawTerrain();
        drawSelectScreen();
      } else {
        for (const c of corridors) drawCorridor(c);
        drawTerrain();
        drawShip(px(), py, prot);
        particles.draw(g2d);
        drawHUD();
        if (phase === "ready") drawReady();
        if (phase === "dead") drawDeath();
      }

      // particles for select/dead bursts
      if (phase === "select") particles.draw(g2d);

      // White flash on death
      if (flash > 0) {
        g2d.save();
        g2d.globalAlpha = flash * 0.8;
        g2d.fillStyle = "#ffffff";
        g2d.fillRect(0, 0, W, H);
        g2d.restore();
      }
    }

    const loop = new Loop((dt) => {
      update(dt);
      render();
    });
    loop.start();

    const onResize = () => {
      view = fitCanvas(cnv, g2d);
      W = view.width;
      H = view.height;
      starfield.resize(W, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      loop.stop();
      input.destroy();
      window.removeEventListener("resize", onResize);
      cnv.removeEventListener("pointerdown", onPointer);
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} className="game-canvas" />;
}

// ── Color helper: mix two hex colors by t (0 = a, 1 = b) ──────────────────────
function shadeMix(a: string, b: string, tmix: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(lerp(pa[0], pb[0], tmix));
  const g = Math.round(lerp(pa[1], pb[1], tmix));
  const bl = Math.round(lerp(pa[2], pb[2], tmix));
  return `rgb(${r},${g},${bl})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
