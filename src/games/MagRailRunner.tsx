// Mag-Rail Runner — Frontier 2200
// An endless auto-runner where an android courier sprints across orbital
// colony rooftops. The teaching point: GRAVITY STRENGTH CHANGES BY ZONE.
// Built on the shared Frontier 2200 canvas engine.

import { useEffect, useRef } from "react";
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

// ---- Zone / plate types -----------------------------------------------------

type PlateType =
  | "NORMAL"
  | "ANTI-GRAV"
  | "GRAV-WELL"
  | "GRAV-PAD"
  | "UNSTABLE";

interface Plate {
  x: number; // world-space left edge
  y: number; // top surface (CSS px from canvas top)
  w: number;
  type: PlateType;
  // UNSTABLE bookkeeping
  landedAt: number; // elapsed (s) the player landed, -1 if never
  fallen: boolean; // removed from collision once it drops away
  fallVY: number;
}

interface Drone {
  x: number; // world space
  y: number;
  phase: number;
}

interface Cell {
  x: number; // world space
  y: number;
  taken: boolean;
  bob: number;
}

interface Block {
  x: number;
  w: number;
  h: number;
  dome: boolean;
  lit: number;
}

interface SilhouetteLayer {
  speed: number; // parallax factor
  blocks: Block[];
  span: number; // total tiling width
}

type Phase = "countdown" | "running" | "dead";

const ZONE_COLOR: Record<PlateType, string> = {
  "NORMAL": "#ffc107",
  "ANTI-GRAV": "#b388ff",
  "GRAV-WELL": "#ff1744",
  "GRAV-PAD": "#00e676",
  "UNSTABLE": "#ff6b35",
};

export default function MagRailRunner({
  onGameOver,
}: {
  onGameOver: (score: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
    const ctx: CanvasRenderingContext2D = ctx2d;

    const input = new Input(canvas);
    const particles = new Particles();

    let view = fitCanvas(canvas, ctx);
    let W = view.width;
    let H = view.height;
    const starfield = new Starfield(W, H, 90);

    // --- Tunables (CSS px / seconds) ---
    const PLAYER_X_FRAC = 0.3; // player screen x = W * frac
    const PLAYER_W = 22;
    const PLAYER_H = 34;
    const BASE_SCROLL = 240; // px/s at distance 0
    const MAX_SCROLL = 560; // px/s asymptote
    const BASE_G = 1700; // px/s^2 baseline gravity
    const JUMP_V = 720; // initial jump velocity
    const COYOTE = 0.1;
    const BUFFER = 0.13;
    const JUMP_CUT = 0.45; // velocity retained when releasing early
    const FLOAT_HOLD_G = 0.55; // gravity scale while holding up (rising)

    // --- Mutable game state (reset on each run) ---
    let phase: Phase = "countdown";
    let calledGameOver = false;
    let countdown = 3.2; // counts down then RUN!
    let elapsed = 0;

    let scroll = 0; // world scroll in px (== player world x)
    let scrollSpeed = BASE_SCROLL;

    let py = 0; // player top-left y (CSS px)
    let pvy = 0;
    let grounded = true;
    let coyote = 0;
    let bufferT = 0;
    let runCycle = 0; // leg animation phase
    let spin = 0; // ragdoll spin on death
    let groundPlate: Plate | null = null;

    let cellsCollected = 0;
    let streak = 0;
    let streakTimer = 0;
    let streakFlash = 0;

    const plates: Plate[] = [];
    const drones: Drone[] = [];
    const cells: Cell[] = [];
    let spawnCursor = 0; // world x up to which we've generated

    const groundLevel = () => H * 0.72; // default plate surface line
    const playerScreenX = () => W * PLAYER_X_FRAC;

    // Gravity multiplier from distance ramp.
    const distanceGravMult = () => lerp(1, 1.45, easeOut(scroll / 9000));

    // ---- Parallax colony silhouettes -------------------------------------
    let silhouettes: SilhouetteLayer[] = [];
    function buildSilhouettes() {
      silhouettes = [];
      const layerDefs = [
        { speed: 0.15, hMin: 0.18, hMax: 0.34 },
        { speed: 0.3, hMin: 0.12, hMax: 0.24 },
        { speed: 0.5, hMin: 0.08, hMax: 0.16 },
      ];
      for (const def of layerDefs) {
        const blocks: Block[] = [];
        const span = W + 200;
        let x = 0;
        while (x < span) {
          const w = 40 + Math.random() * 90;
          const h = H * lerp(def.hMin, def.hMax, Math.random());
          blocks.push({
            x,
            w,
            h,
            dome: Math.random() < 0.3,
            lit: Math.floor(Math.random() * 5),
          });
          x += w + 10 + Math.random() * 40;
        }
        silhouettes.push({ speed: def.speed, blocks, span: x });
      }
    }
    buildSilhouettes();

    // ---- Solvable gap helpers --------------------------------------------
    // Max horizontal distance reachable in a full jump at current speed/grav.
    function maxJumpGap(): number {
      const g = BASE_G * distanceGravMult();
      const airtime = (2 * JUMP_V) / g; // up + down
      return scrollSpeed * airtime * 0.78; // safety factor
    }

    function pickPlateType(): PlateType {
      const r = Math.random();
      const warm = scroll > 800; // ramp special plates in after warm-up
      if (!warm) return "NORMAL";
      if (r < 0.55) return "NORMAL";
      if (r < 0.68) return "ANTI-GRAV";
      if (r < 0.8) return "GRAV-WELL";
      if (r < 0.9) return "GRAV-PAD";
      return "UNSTABLE";
    }

    function generateAhead() {
      const horizon = scroll + W + 300;
      while (spawnCursor < horizon) {
        const last: Plate | undefined = plates[plates.length - 1];
        let gap = 0;
        if (last) {
          const maxG = maxJumpGap();
          gap = clamp(
            40 + Math.random() * maxG * 0.7,
            34,
            Math.max(40, maxG * 0.9)
          );
        }
        const x = last ? last.x + last.w + gap : -W * 0.2;
        const w = 120 + Math.random() * 160;
        const type: PlateType = last ? pickPlateType() : "NORMAL";

        const baseY = groundLevel();
        const yJitter = last
          ? clamp(last.y + (Math.random() - 0.5) * 90, baseY - 130, baseY + 40)
          : baseY;

        const plate: Plate = {
          x,
          y: Math.round(yJitter),
          w,
          type,
          landedAt: -1,
          fallen: false,
          fallVY: 0,
        };
        plates.push(plate);

        // Maybe a drone hazard hovering over the gap at jump height.
        if (last && gap > 70 && Math.random() < 0.4) {
          drones.push({
            x: last.x + last.w + gap * 0.5,
            y: plate.y - 70 - Math.random() * 60,
            phase: Math.random() * Math.PI * 2,
          });
        }

        // Energy cells: a small arc over the plate.
        if (Math.random() < 0.6) {
          const count = 1 + Math.floor(Math.random() * 3);
          const cx = x + w * 0.3;
          for (let i = 0; i < count; i++) {
            cells.push({
              x: cx + i * 34,
              y: plate.y - 50 - Math.sin((i / count) * Math.PI) * 36,
              taken: false,
              bob: Math.random() * Math.PI * 2,
            });
          }
        }

        spawnCursor = x + w;
      }
    }

    function prune() {
      const behind = scroll - W * 0.4;
      while (plates.length && plates[0].x + plates[0].w < behind) {
        if (groundPlate === plates[0]) groundPlate = null;
        plates.shift();
      }
      for (let i = drones.length - 1; i >= 0; i--) {
        if (drones[i].x < behind) drones.splice(i, 1);
      }
      for (let i = cells.length - 1; i >= 0; i--) {
        if (cells[i].x < behind) cells.splice(i, 1);
      }
    }

    function plateUnderPlayer(): Plate | null {
      const sx = scroll + playerScreenX();
      let best: Plate | null = null;
      for (const p of plates) {
        if (p.fallen) continue;
        if (sx + PLAYER_W * 0.5 >= p.x && sx - PLAYER_W * 0.5 <= p.x + p.w) {
          if (!best || p.y < best.y) best = p;
        }
      }
      return best;
    }

    // Effective gravity multiplier at the player's position.
    function effectiveGravMult(): number {
      let m = distanceGravMult();
      const p = groundPlate ?? plateUnderPlayer();
      if (p) {
        if (p.type === "ANTI-GRAV") m *= 0.4;
        else if (p.type === "GRAV-WELL") m *= 1.8;
      }
      return m;
    }

    // ---- Reset / start a run ---------------------------------------------
    function reset() {
      phase = "countdown";
      calledGameOver = false;
      countdown = 3.2;
      elapsed = 0;
      scroll = 0;
      scrollSpeed = BASE_SCROLL;
      pvy = 0;
      grounded = true;
      coyote = COYOTE;
      bufferT = 0;
      runCycle = 0;
      spin = 0;
      groundPlate = null;
      cellsCollected = 0;
      streak = 0;
      streakTimer = 0;
      streakFlash = 0;
      plates.length = 0;
      drones.length = 0;
      cells.length = 0;
      particles.clear();
      spawnCursor = 0;
      generateAhead();
      py = groundLevel() - PLAYER_H;
      const sx = scroll + playerScreenX();
      for (const p of plates) {
        if (sx >= p.x && sx <= p.x + p.w) {
          groundPlate = p;
          py = p.y - PLAYER_H;
          break;
        }
      }
    }
    reset();

    // ---- Death ------------------------------------------------------------
    function die() {
      if (phase === "dead") return;
      phase = "dead";
      spin = 0;
      const sx = playerScreenX();
      particles.burst(sx + PLAYER_W / 2, py + PLAYER_H / 2, 36, "#ffc107", {
        speed: 360,
        size: 4,
        life: 0.8,
      });
      particles.burst(sx + PLAYER_W / 2, py + PLAYER_H / 2, 20, "#ff5252", {
        speed: 280,
        size: 3,
        life: 0.7,
      });
      pvy = -260; // little pop into the ragdoll
      if (!calledGameOver) {
        calledGameOver = true;
        onGameOver(Math.floor(scroll / 10));
      }
    }

    // ---- Update -----------------------------------------------------------
    function update(dt: number) {
      const tapped = input.consumeTap();

      if (phase === "countdown") {
        if (tapped && countdown > 0.2) countdown = 0.2;
        countdown -= dt;
        if (countdown <= 0) phase = "running";
        starfield.update(dt, scrollSpeed * 0.4);
        particles.update(dt);
        return;
      }

      if (phase === "dead") {
        spin += dt * 8;
        py += pvy * dt;
        pvy += BASE_G * dt;
        particles.update(dt);
        starfield.update(dt, scrollSpeed * 0.2);
        if (tapped) reset();
        return;
      }

      // ---- RUNNING ----
      elapsed += dt;
      if (tapped) bufferT = BUFFER;
      if (bufferT > 0) bufferT -= dt;

      scrollSpeed = lerp(BASE_SCROLL, MAX_SCROLL, easeOut(scroll / 7000));
      scroll += scrollSpeed * dt;

      generateAhead();
      prune();
      starfield.update(dt, scrollSpeed * 0.5);

      const gMult = effectiveGravMult();
      const holdingUp = input.isHolding();

      // Jump (coyote + buffer).
      if (bufferT > 0 && (grounded || coyote > 0)) {
        pvy = -JUMP_V;
        grounded = false;
        groundPlate = null;
        coyote = 0;
        bufferT = 0;
        particles.burst(playerScreenX() + PLAYER_W / 2, py + PLAYER_H, 8, "#80d8ff", {
          speed: 130,
          size: 2.5,
          life: 0.35,
        });
      }

      // Gravity integration with variable jump height.
      if (!grounded) {
        if (pvy < 0 && holdingUp) {
          pvy += BASE_G * gMult * FLOAT_HOLD_G * dt; // float higher
        } else if (pvy < 0 && !holdingUp) {
          pvy += BASE_G * gMult * dt;
          pvy *= 1 - (1 - JUMP_CUT) * clamp(dt * 12, 0, 1); // cut the jump short
        } else {
          pvy += BASE_G * gMult * dt; // falling
        }
        coyote -= dt;
      } else {
        coyote = COYOTE;
      }

      const prevFeet = py + PLAYER_H;
      py += pvy * dt;
      runCycle += dt * (grounded ? scrollSpeed * 0.045 : 4);

      // ---- Platform collision (land only when falling onto a top) ----
      const sxL = scroll + playerScreenX();
      const sxR = sxL + PLAYER_W;
      const feet = py + PLAYER_H;
      let landed = false;
      groundPlate = null;
      for (const p of plates) {
        if (p.fallen) continue;
        const overlapX = sxR > p.x && sxL < p.x + p.w;
        if (!overlapX) continue;
        if (pvy >= 0 && feet >= p.y && prevFeet <= p.y + 14) {
          py = p.y - PLAYER_H;
          pvy = 0;
          landed = true;
          groundPlate = p;
          if (p.type === "GRAV-PAD") {
            pvy = -JUMP_V * 1.35; // auto bounce
            landed = false;
            groundPlate = null;
            particles.burst(sxL + PLAYER_W / 2, p.y, 14, "#00e676", {
              speed: 220,
              size: 3,
              life: 0.5,
            });
          } else if (p.type === "UNSTABLE" && p.landedAt < 0) {
            p.landedAt = elapsed;
          }
          break;
        } else if (feet >= p.y && feet <= p.y + 6 && Math.abs(pvy) < 1) {
          groundPlate = p;
          landed = true;
          if (p.type === "UNSTABLE" && p.landedAt < 0) p.landedAt = elapsed;
          break;
        }
      }
      grounded = landed;

      // ---- Crumbling unstable plates ----
      for (const p of plates) {
        if (p.type === "UNSTABLE" && p.landedAt >= 0 && !p.fallen) {
          if (elapsed - p.landedAt > 0.6) {
            p.fallen = true;
            if (groundPlate === p) {
              groundPlate = null;
              grounded = false;
            }
          }
        }
        if (p.fallen) {
          p.fallVY += BASE_G * dt;
          p.y += p.fallVY * dt;
        }
      }

      // ---- Cells ----
      streakTimer -= dt;
      if (streakTimer <= 0) streak = 0;
      if (streakFlash > 0) streakFlash -= dt;
      for (const c of cells) {
        if (c.taken) continue;
        c.bob += dt * 3;
        const cScreenX = c.x - scroll;
        if (
          Math.abs(cScreenX - (playerScreenX() + PLAYER_W / 2)) < 22 &&
          Math.abs(c.y - (py + PLAYER_H / 2)) < 26
        ) {
          c.taken = true;
          cellsCollected += 1;
          streak += 1;
          streakTimer = 2.0;
          if (streak >= 3) streakFlash = 1.0;
          particles.burst(c.x - scroll, c.y, 10, "#ffd700", {
            speed: 180,
            size: 2.5,
            life: 0.5,
          });
        }
      }

      // ---- Drones (hazards) ----
      const cx = playerScreenX() + PLAYER_W / 2;
      const cy = py + PLAYER_H / 2;
      for (const d of drones) {
        d.phase += dt * 2;
        const dScreenX = d.x - scroll;
        const dy = d.y + Math.sin(d.phase) * 12;
        if (
          Math.abs(dScreenX - cx) < 18 + PLAYER_W / 2 &&
          Math.abs(dy - cy) < 16 + PLAYER_H / 2
        ) {
          die();
          return;
        }
      }

      // ---- Death by falling ----
      if (py > H + 60) {
        die();
        return;
      }

      particles.update(dt);
    }

    // ---- Drawing ----------------------------------------------------------
    function drawBackground() {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0a0a0f");
      g.addColorStop(0.7, "#0d0d1a");
      g.addColorStop(1, "#10101f");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Large translucent moon low on the horizon.
      ctx.save();
      const moonX = W * 0.78;
      const moonY = H * 0.66;
      const moonR = Math.min(W, H) * 0.26;
      const mg = ctx.createRadialGradient(
        moonX - moonR * 0.3,
        moonY - moonR * 0.3,
        moonR * 0.2,
        moonX,
        moonY,
        moonR
      );
      mg.addColorStop(0, "rgba(120,140,200,0.22)");
      mg.addColorStop(1, "rgba(60,70,120,0.05)");
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      starfield.draw(ctx, "190,200,255");

      // Parallax colony silhouettes.
      const palette = ["#12121f", "#181826", "#1f1f30"];
      silhouettes.forEach((layer, li) => {
        const off = (scroll * layer.speed) % layer.span;
        const baseY = H * 0.82;
        for (let pass = 0; pass < 2; pass++) {
          for (const b of layer.blocks) {
            const bx = b.x - off + pass * layer.span;
            if (bx > W + 50 || bx + b.w < -50) continue;
            const top = baseY - b.h;
            ctx.fillStyle = palette[li];
            ctx.fillRect(bx, top, b.w, b.h);
            if (b.dome) {
              ctx.beginPath();
              ctx.arc(bx + b.w / 2, top, b.w / 2, Math.PI, 0);
              ctx.fill();
            }
            ctx.fillStyle = "rgba(255,200,90,0.5)";
            for (let wi = 0; wi < b.lit; wi++) {
              const wx = bx + 6 + ((wi * 11) % Math.max(8, b.w - 12));
              const wy = top + 8 + ((wi * 13) % Math.max(8, b.h - 12));
              ctx.fillRect(wx, wy, 3, 4);
            }
          }
        }
      });
    }

    function drawPlate(p: Plate) {
      const x = p.x - scroll;
      if (x > W + 60 || x + p.w < -60) return;
      const accent = ZONE_COLOR[p.type];
      ctx.save();
      if (p.fallen) {
        ctx.globalAlpha = clamp(1 - (p.y - groundLevel()) / 300, 0, 1);
      }

      ctx.fillStyle = "#1a1a2e";
      roundRect(ctx, x, p.y, p.w, 22, 5);
      ctx.fill();

      ctx.shadowColor = accent;
      ctx.shadowBlur = 12;
      ctx.fillStyle = accent;
      ctx.fillRect(x + 3, p.y, p.w - 6, 3);
      ctx.shadowBlur = 0;

      if (p.type !== "NORMAL") {
        glowText(ctx, p.type, x + p.w / 2, p.y - 14, {
          color: accent,
          size: 11,
          glow: 8,
          weight: 800,
          mono: true,
        });
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        if (p.type === "ANTI-GRAV") {
          for (let cx = x + 16; cx < x + p.w - 8; cx += 26) {
            ctx.beginPath();
            ctx.moveTo(cx, p.y - 2);
            ctx.lineTo(cx + 6, p.y - 8);
            ctx.lineTo(cx + 12, p.y - 2);
            ctx.stroke();
          }
        } else if (p.type === "GRAV-WELL") {
          for (let cx = x + 16; cx < x + p.w - 8; cx += 26) {
            ctx.beginPath();
            ctx.moveTo(cx, p.y - 8);
            ctx.lineTo(cx + 6, p.y - 2);
            ctx.lineTo(cx + 12, p.y - 8);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    function drawCell(c: Cell) {
      if (c.taken) return;
      const x = c.x - scroll;
      if (x > W + 30 || x < -30) return;
      const y = c.y + Math.sin(c.bob) * 4;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(-6, -6, 12, 12);
      ctx.fillStyle = "#fff7cc";
      ctx.fillRect(-2.5, -2.5, 5, 5);
      ctx.restore();
    }

    function drawDrone(d: Drone) {
      const x = d.x - scroll;
      if (x > W + 40 || x < -40) return;
      const y = d.y + Math.sin(d.phase) * 12;
      ctx.save();
      ctx.translate(x, y);
      ctx.shadowColor = "#ff5252";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#2a1015";
      roundRect(ctx, -16, -10, 32, 20, 6);
      ctx.fill();
      ctx.fillStyle = "#ff5252";
      roundRect(ctx, -16, -10, 32, 4, 2);
      ctx.fill();
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#ff1744";
      ctx.beginPath();
      ctx.arc(0, 0, 4 + Math.sin(d.phase * 3) * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,120,120,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-20, -12);
      ctx.lineTo(-8, -12);
      ctx.moveTo(8, -12);
      ctx.lineTo(20, -12);
      ctx.stroke();
      ctx.restore();
    }

    function drawPlayer() {
      const x = playerScreenX();
      const cx = x + PLAYER_W / 2;
      const cyBody = py + PLAYER_H * 0.42;
      ctx.save();
      if (phase === "dead") {
        ctx.translate(cx, py + PLAYER_H / 2);
        ctx.rotate(spin);
        ctx.translate(-cx, -(py + PLAYER_H / 2));
      }

      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 14;

      // Legs.
      ctx.strokeStyle = "#e0fbff";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      const hipY = py + PLAYER_H * 0.62;
      if (grounded && phase === "running") {
        const swing = Math.sin(runCycle) * 9;
        ctx.beginPath();
        ctx.moveTo(cx, hipY);
        ctx.lineTo(cx + swing, py + PLAYER_H);
        ctx.moveTo(cx, hipY);
        ctx.lineTo(cx - swing, py + PLAYER_H);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(cx, hipY);
        ctx.lineTo(cx + 8, hipY + 8);
        ctx.moveTo(cx, hipY);
        ctx.lineTo(cx - 4, hipY + 12);
        ctx.stroke();
      }

      // Torso.
      ctx.fillStyle = "#00bcd4";
      roundRect(ctx, cx - 7, py + PLAYER_H * 0.3, 14, PLAYER_H * 0.34, 4);
      ctx.fill();
      ctx.fillStyle = "#ffc107"; // chest light (home gold accent)
      ctx.beginPath();
      ctx.arc(cx, cyBody, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Arm.
      ctx.strokeStyle = "#b2ebf2";
      ctx.lineWidth = 3.5;
      const armSwing = grounded ? Math.cos(runCycle) * 7 : 6;
      ctx.beginPath();
      ctx.moveTo(cx, py + PLAYER_H * 0.38);
      ctx.lineTo(cx + armSwing, py + PLAYER_H * 0.55);
      ctx.stroke();

      // Head.
      ctx.fillStyle = "#e0fbff";
      ctx.beginPath();
      ctx.arc(cx, py + PLAYER_H * 0.18, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#00e5ff"; // visor
      ctx.fillRect(cx - 4, py + PLAYER_H * 0.15, 8, 3.5);

      ctx.restore();

      if (phase === "running") {
        particles.trail(x, py + PLAYER_H * 0.6, "rgba(0,229,255,0.7)", 2.5, 0.3);
      }
    }

    function drawHUD() {
      const meters = Math.floor(scroll / 10);
      glowText(ctx, `${meters}m`, 16, 30, {
        color: "#ffc107",
        size: 26,
        glow: 10,
        align: "left",
        weight: 800,
        mono: true,
      });

      ctx.save();
      ctx.translate(W - 120, 26);
      ctx.rotate(Math.PI / 4);
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(-6, -6, 12, 12);
      ctx.restore();
      glowText(ctx, `${cellsCollected}`, W - 102, 30, {
        color: "#ffd700",
        size: 22,
        glow: 8,
        align: "left",
        weight: 800,
        mono: true,
      });

      const gm = effectiveGravMult();
      const gColor = gm > 1.5 ? "#ff1744" : gm < 0.7 ? "#b388ff" : "#80d8ff";
      glowText(ctx, `GRAV x${gm.toFixed(1)}`, W / 2, 26, {
        color: gColor,
        size: 18,
        glow: 8,
        weight: 800,
        mono: true,
      });

      if (streakFlash > 0 && streak >= 3) {
        ctx.save();
        ctx.globalAlpha = clamp(streakFlash, 0, 1);
        glowText(ctx, `x${streak} CELLS!`, W / 2, H * 0.3, {
          color: "#ffd700",
          size: 30,
          glow: 14,
          weight: 800,
        });
        ctx.restore();
      }
    }

    function drawCountdown() {
      ctx.save();
      ctx.fillStyle = "rgba(8,8,16,0.55)";
      ctx.fillRect(0, 0, W, H);
      glowText(ctx, "MAG-RAIL RUNNER", W / 2, H * 0.32, {
        color: "#ffc107",
        size: Math.min(46, W * 0.085),
        glow: 16,
        weight: 800,
      });
      glowText(ctx, "Tap to jump · Gravity shifts by zone", W / 2, H * 0.32 + 38, {
        color: "#80d8ff",
        size: 15,
        glow: 6,
        weight: 600,
      });
      const n = Math.ceil(countdown - 0.2);
      const label = n <= 0 ? "RUN!" : `${n}`;
      const pulse = 1 - (countdown - Math.floor(countdown));
      glowText(ctx, label, W / 2, H * 0.56, {
        color: n <= 0 ? "#00e676" : "#ffffff",
        size: 72 + pulse * 16,
        glow: 24,
        weight: 800,
        mono: true,
      });
      ctx.restore();
    }

    function drawDeath() {
      const meters = Math.floor(scroll / 10);
      ctx.save();
      ctx.fillStyle = "rgba(6,6,12,0.66)";
      ctx.fillRect(0, 0, W, H);
      glowText(ctx, "SIGNAL LOST", W / 2, H * 0.34, {
        color: "#ffc107",
        size: Math.min(48, W * 0.1),
        glow: 18,
        weight: 800,
      });
      glowText(ctx, `${meters}m`, W / 2, H * 0.49, {
        color: "#ffffff",
        size: 40,
        glow: 12,
        weight: 800,
        mono: true,
      });
      glowText(ctx, `${cellsCollected} cells`, W / 2, H * 0.49 + 38, {
        color: "#ffd700",
        size: 20,
        glow: 8,
        weight: 700,
        mono: true,
      });
      glowText(ctx, "TAP TO RESTART", W / 2, H * 0.66, {
        color: "#80d8ff",
        size: 18,
        glow: 8,
        weight: 700,
      });
      ctx.restore();
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      drawBackground();
      for (const p of plates) drawPlate(p);
      for (const c of cells) drawCell(c);
      for (const d of drones) drawDrone(d);
      drawPlayer();
      particles.draw(ctx);
      drawHUD();
      if (phase === "countdown") drawCountdown();
      else if (phase === "dead") drawDeath();
    }

    // ---- Loop -------------------------------------------------------------
    const loop = new Loop((dt: number) => {
      update(dt);
      render();
    });
    loop.start();

    // ---- Resize -----------------------------------------------------------
    const onResize = () => {
      view = fitCanvas(canvas, ctx);
      W = view.width;
      H = view.height;
      starfield.resize(W, H);
      buildSilhouettes();
    };
    window.addEventListener("resize", onResize);

    // ---- Cleanup ----------------------------------------------------------
    return () => {
      loop.stop();
      input.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [onGameOver]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  );
}
