// Based on "Basic Missile Command" by Steven Lambert (straker), CC0 1.0. Core logic ported; scoring, waves, touch and theme added.
// Shield Command — Frontier 2200. Orbital debris rains down on the colony;
// tap the sky to raise shield bursts from the nearest tower and save the domes.

import { useEffect, useRef } from "react";
import { Loop } from "./engine/Loop";
import { Particles } from "./engine/Particles";
import { Starfield } from "./engine/Starfield";
import { fitCanvas, glowText, clamp } from "./engine/draw";

// ---- Entities (mirroring the source's missiles / counterMissiles / explosions)

interface Structure {
  x: number;
  y: number; // aim point debris homes toward
  alive: boolean;
}

interface Tower extends Structure {
  ammo: number;
}

interface Debris {
  startX: number;
  startY: number;
  target: Structure; // live object ref, exactly like the source's missile.target
  x: number;
  y: number;
  dx: number; // px/s
  dy: number;
  spd: number;
  alive: boolean;
}

interface Bolt {
  startX: number;
  startY: number;
  tx: number;
  ty: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  spd: number;
  alive: boolean;
}

interface Burst {
  x: number;
  y: number;
  size: number;
  dir: 1 | -1; // ported grow/shrink direction flag
  enemy: boolean; // palette: debris blast vs shield burst
  harm: boolean; // ground impacts also wreck structures they touch
  alive: boolean;
}

type Phase = "start" | "playing" | "wavebreak" | "gameover";

const BEST_KEY = "shieldCommand_best";
const AMMO_MAX = 10; // source: 10 counter-missiles per silo
const BREAK_LEN = 3; // seconds the WAVE CLEARED banner stays up

// Layout fractions along the bottom (source: 6 cities + 3 silos across 800px).
const DOME_FRACS = [0.175, 0.275, 0.375, 0.625, 0.725, 0.825];
const TOWER_FRACS = [0.08, 0.5, 0.92];

// Ported helper: random integer between min and max (inclusive).
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Ported helper: atan2 is x-axis based but canvas rotation treats 0 as "up",
// so add a quarter turn; movement then uses sin / -cos.
function angleBetween(sx: number, sy: number, tx: number, ty: number): number {
  return Math.atan2(ty - sy, tx - sx) + Math.PI / 2;
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

function loadBest(): number {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(v: number): void {
  try {
    window.localStorage.setItem(BEST_KEY, String(v));
  } catch {
    // storage unavailable — best score simply isn't persisted
  }
}

export default function ShieldCommand({
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

    let view = fitCanvas(canvas, ctx);
    let W = view.width;
    let H = view.height;
    const starfield = new Starfield(W, H, 110);
    const particles = new Particles();

    // ---- Metrics scaled from the 800x550 source onto a portrait canvas -----
    let groundY = 0;
    let domeR = 0;
    let towerW = 0;
    let towerH = 0;
    let debrisR = 0; // source missileSize = 4
    let explMax = 0; // source explosion peak radius = 30
    let explRate = 0; // source 0.35 px/frame -> peak in ~1.3 s
    let enemyBase = 0; // source missileSpeed = 1 px/frame
    let boltSpd = 0; // source counterMissileSpeed = 15 px/frame

    const domes: Structure[] = DOME_FRACS.map(() => ({ x: 0, y: 0, alive: true }));
    const towers: Tower[] = TOWER_FRACS.map(() => ({
      x: 0,
      y: 0,
      alive: true,
      ammo: AMMO_MAX,
    }));
    let spawnXs: number[] = [];

    function layout() {
      groundY = H * 0.93;
      domeR = Math.max(12, W * 0.042);
      towerW = Math.max(14, W * 0.05);
      towerH = Math.max(20, Math.min(W * 0.07, H * 0.05));
      debrisR = Math.max(3, W * 0.011);
      explMax = Math.max(24, W * 0.058);
      explRate = explMax * 0.7;
      enemyBase = 60 * (H / 550); // keep the source's fall time
      boltSpd = 900 * (H / 550);
      DOME_FRACS.forEach((f, i) => {
        domes[i].x = f * W;
        domes[i].y = groundY - domeR * 0.5;
      });
      TOWER_FRACS.forEach((f, i) => {
        towers[i].x = f * W;
        towers[i].y = groundY - towerH;
      });
      // Ported: debris can spawn above every structure plus the two top corners.
      spawnXs = [...domes.map((d) => d.x), ...towers.map((t) => t.x), 0, W];
    }
    layout();

    // ---- Mutable game state -------------------------------------------------
    let phase: Phase = "start";
    let score = 0;
    let wave = 1;
    let best = loadBest();
    let calledGameOver = false;
    let elapsed = 0;

    let volleys: number[] = []; // ported levels[curr] table: debris per volley
    let volleyIdx = 0;
    let spawnTimer = 0;
    let breakT = 0;
    let ammoBonus = 0;
    let domeBonus = 0;
    let overT = 0; // small delay before TAP TO RETRY arms

    let debris: Debris[] = [];
    let bolts: Bolt[] = [];
    let blasts: Burst[] = [];

    const blink = (hz: number) => Math.floor(elapsed * hz) % 2 === 0;
    const aliveDomes = () => domes.filter((d) => d.alive).length;

    // ---- Waves --------------------------------------------------------------
    // The source shipped a single level table of [4, 4]; waves extend it:
    // more volleys, more debris per volley, faster falls, shorter gaps.
    function waveVolleys(n: number): number[] {
      const count = Math.min(2 + Math.floor((n - 1) / 2), 5);
      const per = Math.min(4 + Math.floor((n - 1) / 2), 8);
      return new Array<number>(count).fill(per);
    }
    const waveSpeed = (n: number) => enemyBase * Math.min(1 + (n - 1) * 0.15, 2.8);
    const waveGap = (n: number) => Math.max(1.6, 3 - (n - 1) * 0.12); // source: 3 s

    function startWave(n: number) {
      wave = n;
      volleys = waveVolleys(n);
      volleyIdx = 0;
      spawnTimer = waveGap(n) - 1; // ported: ~1 s of calm before the first volley
      for (const t of towers) if (t.alive) t.ammo = AMMO_MAX; // resupply
    }

    function reset() {
      score = 0;
      calledGameOver = false;
      for (const d of domes) d.alive = true;
      for (const t of towers) {
        t.alive = true;
        t.ammo = AMMO_MAX;
      }
      debris = [];
      bolts = [];
      blasts = [];
      particles.clear();
      startWave(1);
    }

    // ---- Spawning / firing (ported spawnMissile + click handler) ------------
    function spawnDebris() {
      const targets: Structure[] = [...domes, ...towers].filter((s) => s.alive);
      if (targets.length === 0) return;
      const sx = spawnXs[randInt(0, spawnXs.length - 1)];
      const target = targets[randInt(0, targets.length - 1)];
      const spd = waveSpeed(wave);
      const a = angleBetween(sx, 0, target.x, target.y);
      debris.push({
        startX: sx,
        startY: 0,
        target,
        x: sx,
        y: 0,
        dx: spd * Math.sin(a),
        dy: spd * -Math.cos(a),
        spd,
        alive: true,
      });
    }

    function fire(x: number, y: number) {
      const ty = Math.min(y, groundY - domeR * 2.2); // keep intercepts in the sky
      // Ported: the nearest tower that still has ammo takes the shot.
      let launch: Tower | null = null;
      let bestD = Infinity;
      for (const t of towers) {
        if (!t.alive || t.ammo <= 0) continue;
        const d = dist(x, ty, t.x, t.y);
        if (d < bestD) {
          bestD = d;
          launch = t;
        }
      }
      if (!launch) return;
      launch.ammo--;
      const a = angleBetween(launch.x, launch.y, x, ty);
      bolts.push({
        startX: launch.x,
        startY: launch.y,
        tx: x,
        ty,
        x: launch.x,
        y: launch.y,
        dx: boltSpd * Math.sin(a),
        dy: boltSpd * -Math.cos(a),
        spd: boltSpd,
        alive: true,
      });
    }

    function spawnBlast(x: number, y: number, enemy: boolean, harm: boolean) {
      blasts.push({ x, y, size: 2, dir: 1, enemy, harm, alive: true }); // source starts at 2
    }

    function wreck(s: Structure) {
      if (!s.alive) return;
      s.alive = false;
      for (const t of towers) if (t === s) t.ammo = 0; // lost stockpile
      particles.burst(s.x, groundY - domeR * 0.4, 26, "#ff6b35", {
        speed: 260,
        size: 3.5,
        life: 0.8,
      });
      particles.burst(s.x, groundY - domeR * 0.4, 12, "#ffd9c2", {
        speed: 170,
        size: 2.5,
        life: 0.6,
      });
      if (domes.every((d) => !d.alive)) gameOver();
    }

    function gameOver() {
      if (phase === "gameover") return;
      phase = "gameover";
      overT = 0;
      if (!calledGameOver) {
        calledGameOver = true;
        if (score > best) {
          best = score;
          saveBest(best);
        }
        onGameOver(score);
      }
    }

    // ---- Update -------------------------------------------------------------
    function update(dt: number) {
      elapsed += dt;
      starfield.update(dt, 6);
      particles.update(dt);

      if (phase === "start") return;
      if (phase === "gameover") overT += dt;

      if (phase === "wavebreak") {
        breakT -= dt;
        if (breakT <= 0) {
          startWave(wave + 1);
          phase = "playing";
        }
      }

      // Volley spawner (ported: a volley every interval while the table allows).
      if (phase === "playing" && volleyIdx < volleys.length) {
        spawnTimer += dt;
        if (spawnTimer >= waveGap(wave)) {
          for (let i = 0; i < volleys[volleyIdx]; i++) spawnDebris();
          volleyIdx++;
          spawnTimer = 0;
        }
      }

      // Debris (ported missile update: move, blast check, then target check).
      for (const m of debris) {
        m.x += m.dx * dt;
        m.y += m.dy * dt;

        // Ported circle-circle check against every live blast.
        for (const b of blasts) {
          if (dist(b.x, b.y, m.x, m.y) < debrisR + b.size) {
            m.alive = false;
            break;
          }
        }
        if (!m.alive) {
          if (phase !== "gameover") score += 25; // intercepted (chains count too)
          spawnBlast(m.x, m.y, true, false);
          particles.burst(m.x, m.y, 8, "#ff6b35", { speed: 160, size: 2.5, life: 0.45 });
          continue;
        }

        // Ported: detonate within one step of the target (or on the ground).
        if (dist(m.x, m.y, m.target.x, m.target.y) < m.spd * dt || m.y >= groundY) {
          m.alive = false;
          wreck(m.target);
          spawnBlast(m.x, m.y, true, true);
          particles.burst(m.x, m.y, 10, "#ff6b35", { speed: 200, size: 3, life: 0.55 });
        }
      }

      // Shield bolts (ported counter-missiles: detonate on reaching the mark).
      for (const b of bolts) {
        b.x += b.dx * dt;
        b.y += b.dy * dt;
        if (dist(b.x, b.y, b.tx, b.ty) < b.spd * dt) {
          b.alive = false;
          spawnBlast(b.x, b.y, false, false);
          particles.burst(b.x, b.y, 12, "#00e676", { speed: 200, size: 2.5, life: 0.5 });
          particles.burst(b.x, b.y, 6, "#eafff3", { speed: 120, size: 2, life: 0.4 });
        }
      }

      // Bursts (ported explosion: grow to peak, wane, vanish).
      for (const b of blasts) {
        b.size += explRate * b.dir * dt;
        if (b.size > explMax) b.dir = -1;
        if (b.size <= 0) {
          b.alive = false;
          continue;
        }
        // Debris impact blasts also wreck structures they reach.
        if (b.harm) {
          for (const s of domes)
            if (s.alive && dist(b.x, b.y, s.x, s.y) < b.size + domeR * 0.3) wreck(s);
          for (const s of towers)
            if (s.alive && dist(b.x, b.y, s.x, s.y) < b.size + domeR * 0.3) wreck(s);
        }
      }

      // Ported: sweep the dead out of every list.
      debris = debris.filter((m) => m.alive);
      bolts = bolts.filter((b) => b.alive);
      blasts = blasts.filter((b) => b.alive);

      // Wave cleared -> tally bonuses, banner, then a bigger wave.
      if (phase === "playing" && volleyIdx >= volleys.length && debris.length === 0) {
        ammoBonus = towers.reduce((sum, t) => sum + (t.alive ? t.ammo : 0), 0) * 5;
        domeBonus = aliveDomes() * 100;
        score += ammoBonus + domeBonus;
        breakT = BREAK_LEN;
        phase = "wavebreak";
      }
    }

    // ---- Drawing ------------------------------------------------------------
    function drawBackground() {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0a0a0f");
      g.addColorStop(0.72, "#0b0f15");
      g.addColorStop(1, "#0c1310");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      starfield.draw(ctx, "185,225,205");

      // Distant planet with a sunlit rim.
      ctx.save();
      const px = W * 0.76;
      const py = H * 0.17;
      const pr = Math.min(W, H) * 0.14;
      const pg = ctx.createRadialGradient(
        px - pr * 0.4,
        py + pr * 0.3,
        pr * 0.2,
        px,
        py,
        pr
      );
      pg.addColorStop(0, "rgba(42,72,62,0.5)");
      pg.addColorStop(1, "rgba(14,20,24,0.92)");
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,230,118,0.4)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#00e676";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(px, py, pr, Math.PI * 0.55, Math.PI * 1.25);
      ctx.stroke();
      ctx.restore();

      // Horizon glow rising off the colony floor.
      const hh = H * 0.12;
      const hg = ctx.createLinearGradient(0, groundY - hh, 0, groundY);
      hg.addColorStop(0, "rgba(0,230,118,0)");
      hg.addColorStop(1, "rgba(0,230,118,0.12)");
      ctx.fillStyle = hg;
      ctx.fillRect(0, groundY - hh, W, hh);
    }

    function drawGround() {
      const g = ctx.createLinearGradient(0, groundY, 0, H);
      g.addColorStop(0, "#101a14");
      g.addColorStop(1, "#0a0a0f");
      ctx.fillStyle = g;
      ctx.fillRect(0, groundY, W, H - groundY);
      ctx.save();
      ctx.strokeStyle = "rgba(0,230,118,0.45)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#00e676";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(W, groundY);
      ctx.stroke();
      ctx.restore();
    }

    function drawDome(d: Structure, i: number) {
      const r = domeR;
      ctx.save();
      if (d.alive) {
        const grad = ctx.createRadialGradient(
          d.x,
          groundY - r * 0.35,
          r * 0.15,
          d.x,
          groundY,
          r
        );
        grad.addColorStop(0, "rgba(176,255,216,0.38)");
        grad.addColorStop(1, "rgba(0,230,118,0.08)");
        ctx.beginPath();
        ctx.arc(d.x, groundY, r, Math.PI, 0);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.shadowColor = "#00e676";
        ctx.shadowBlur = 10;
        ctx.strokeStyle = "rgba(0,230,118,0.85)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Habitat lights twinkling inside the shell.
        const tw = 0.55 + 0.3 * Math.sin(elapsed * 2.2 + i * 1.7);
        ctx.fillStyle = `rgba(255,238,170,${tw.toFixed(3)})`;
        ctx.fillRect(d.x - r * 0.52, groundY - r * 0.3, r * 0.2, r * 0.3);
        ctx.fillRect(d.x - r * 0.1, groundY - r * 0.52, r * 0.2, r * 0.52);
        ctx.fillRect(d.x + r * 0.32, groundY - r * 0.34, r * 0.18, r * 0.34);
      } else {
        // Cracked dark husk.
        ctx.beginPath();
        ctx.arc(d.x, groundY, r * 0.88, Math.PI, 0);
        ctx.closePath();
        ctx.fillStyle = "#15151d";
        ctx.fill();
        ctx.strokeStyle = "#2c2c36";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.strokeStyle = "#08080c";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(d.x - r * 0.1, groundY - r * 0.82);
        ctx.lineTo(d.x + r * 0.08, groundY - r * 0.5);
        ctx.lineTo(d.x - r * 0.12, groundY - r * 0.28);
        ctx.lineTo(d.x + r * 0.05, groundY);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawTower(t: Tower) {
      const topY = t.y;
      ctx.save();
      if (t.alive) {
        ctx.fillStyle = "#13222c";
        ctx.beginPath();
        ctx.moveTo(t.x - towerW, groundY);
        ctx.lineTo(t.x - towerW * 0.32, topY);
        ctx.lineTo(t.x + towerW * 0.32, topY);
        ctx.lineTo(t.x + towerW, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,229,255,0.55)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // Emitter tip.
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#00e5ff";
        ctx.beginPath();
        ctx.arc(t.x, topY - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Ammo pips above the pylon (rows of 5).
        ctx.fillStyle = "rgba(0,229,255,0.95)";
        for (let j = 0; j < t.ammo; j++) {
          const col = j % 5;
          const row = Math.floor(j / 5);
          ctx.fillRect(t.x - 14 + col * 6, topY - 16 - row * 7, 4, 4);
        }
      } else {
        // Broken stub.
        ctx.fillStyle = "#15151d";
        ctx.beginPath();
        ctx.moveTo(t.x - towerW, groundY);
        ctx.lineTo(t.x - towerW * 0.45, topY + towerH * 0.5);
        ctx.lineTo(t.x - towerW * 0.05, topY + towerH * 0.72);
        ctx.lineTo(t.x + towerW * 0.3, topY + towerH * 0.45);
        ctx.lineTo(t.x + towerW, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#2c2c36";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawDebris(m: Debris) {
      ctx.save();
      // Ported trail: a line from the spawn point to the head.
      if (dist(m.startX, m.startY, m.x, m.y) > 1) {
        const grad = ctx.createLinearGradient(m.startX, m.startY, m.x, m.y);
        grad.addColorStop(0, "rgba(255,107,53,0)");
        grad.addColorStop(0.7, "rgba(255,107,53,0.4)");
        grad.addColorStop(1, "rgba(255,107,53,0.95)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.startX, m.startY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
      }
      ctx.shadowColor = "#ff6b35";
      ctx.shadowBlur = 12;
      ctx.fillStyle = blink(30) ? "#ffd9c2" : "#ff6b35"; // source-style flicker
      ctx.beginPath();
      ctx.arc(m.x, m.y, debrisR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawBolt(b: Bolt) {
      ctx.save();
      if (dist(b.startX, b.startY, b.x, b.y) > 1) {
        const grad = ctx.createLinearGradient(b.startX, b.startY, b.x, b.y);
        grad.addColorStop(0, "rgba(0,229,255,0)");
        grad.addColorStop(1, "rgba(0,229,255,0.9)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#eafdff";
      ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
      // Aim marker at the tapped point.
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(0,229,255,0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(b.tx - 5, b.ty - 5);
      ctx.lineTo(b.tx + 5, b.ty + 5);
      ctx.moveTo(b.tx + 5, b.ty - 5);
      ctx.lineTo(b.tx - 5, b.ty + 5);
      ctx.stroke();
      ctx.restore();
    }

    function drawBlast(b: Burst) {
      const core = b.enemy ? "#fff1e3" : "#ffffff";
      const edge = b.enemy
        ? blink(20)
          ? "#ff6b35"
          : "#ffc59e"
        : blink(20)
          ? "#00e676"
          : "#b9ffd9";
      ctx.save();
      ctx.globalAlpha = 0.9;
      const r = Math.max(0.5, b.size);
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      grad.addColorStop(0, core);
      grad.addColorStop(1, edge);
      ctx.fillStyle = grad;
      ctx.shadowColor = edge;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawHUD() {
      glowText(ctx, `SCORE ${score}`, 12, 24, {
        color: "#00e676",
        size: 16,
        glow: 8,
        align: "left",
        weight: 800,
        mono: true,
      });
      glowText(ctx, `WAVE ${wave}`, W / 2, 24, {
        color: "#b9ffd9",
        size: 14,
        glow: 6,
        weight: 700,
        mono: true,
      });
      // Domes left, as little dome icons.
      for (let i = 0; i < domes.length; i++) {
        const ix = W - 12 - (domes.length - 1 - i) * 15;
        ctx.save();
        if (domes[i].alive) {
          ctx.shadowColor = "#00e676";
          ctx.shadowBlur = 6;
          ctx.fillStyle = "#00e676";
        } else {
          ctx.fillStyle = "#23232c";
        }
        ctx.beginPath();
        ctx.arc(ix, 27, 5, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    function drawStart() {
      ctx.fillStyle = "rgba(5,8,7,0.6)";
      ctx.fillRect(0, 0, W, H);
      glowText(ctx, "SHIELD COMMAND", W / 2, H * 0.28, {
        color: "#00e676",
        size: Math.min(44, W * 0.1),
        glow: 18,
        weight: 800,
      });
      glowText(
        ctx,
        "Falling orbital debris threatens the colony domes",
        W / 2,
        H * 0.28 + 36,
        { color: "#b9ffd9", size: clamp(W * 0.036, 10, 15), weight: 600 }
      );
      glowText(ctx, "TAP THE SKY TO INTERCEPT", W / 2, H * 0.28 + 64, {
        color: "#00e5ff",
        size: clamp(W * 0.042, 12, 17),
        glow: 8,
        weight: 700,
        mono: true,
      });
      ctx.save();
      ctx.globalAlpha = 0.55 + 0.45 * Math.sin(elapsed * 4);
      glowText(ctx, "TAP TO START", W / 2, H * 0.6, {
        color: "#ffffff",
        size: 20,
        glow: 10,
        weight: 800,
      });
      ctx.restore();
    }

    function drawWaveBreak() {
      const t = BREAK_LEN - breakT;
      ctx.save();
      ctx.fillStyle = "rgba(5,8,7,0.35)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = clamp(t * 3, 0, 1);
      glowText(ctx, `WAVE ${wave} CLEARED`, W / 2, H * 0.34, {
        color: "#00e676",
        size: Math.min(34, W * 0.085),
        glow: 16,
        weight: 800,
      });
      if (t > 0.5) {
        glowText(ctx, `AMMO BONUS  +${ammoBonus}`, W / 2, H * 0.34 + 42, {
          color: "#00e5ff",
          size: 16,
          glow: 8,
          weight: 700,
          mono: true,
        });
      }
      if (t > 0.9) {
        glowText(ctx, `DOME BONUS  +${domeBonus}`, W / 2, H * 0.34 + 68, {
          color: "#00e676",
          size: 16,
          glow: 8,
          weight: 700,
          mono: true,
        });
      }
      ctx.restore();
    }

    function drawGameOver() {
      ctx.fillStyle = "rgba(6,6,10,0.68)";
      ctx.fillRect(0, 0, W, H);
      glowText(ctx, "DOMES LOST", W / 2, H * 0.28, {
        color: "#ff6b35",
        size: Math.min(46, W * 0.11),
        glow: 18,
        weight: 800,
      });
      glowText(ctx, `SCORE ${score}`, W / 2, H * 0.42, {
        color: "#ffffff",
        size: 30,
        glow: 12,
        weight: 800,
        mono: true,
      });
      glowText(ctx, `WAVE ${wave}`, W / 2, H * 0.42 + 38, {
        color: "#b9ffd9",
        size: 16,
        glow: 6,
        weight: 700,
        mono: true,
      });
      glowText(ctx, `BEST ${best}`, W / 2, H * 0.42 + 66, {
        color: "#00e676",
        size: 18,
        glow: 8,
        weight: 800,
        mono: true,
      });
      if (overT > 0.6) {
        ctx.save();
        ctx.globalAlpha = 0.55 + 0.45 * Math.sin(elapsed * 4);
        glowText(ctx, "TAP TO RETRY", W / 2, H * 0.64, {
          color: "#00e5ff",
          size: 18,
          glow: 10,
          weight: 800,
        });
        ctx.restore();
      }
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      drawBackground();
      drawGround();
      for (let i = 0; i < domes.length; i++) drawDome(domes[i], i);
      for (const t of towers) drawTower(t);
      for (const m of debris) drawDebris(m);
      for (const b of bolts) drawBolt(b);
      for (const b of blasts) drawBlast(b);
      particles.draw(ctx);
      drawHUD();
      if (phase === "start") drawStart();
      else if (phase === "wavebreak") drawWaveBreak();
      else if (phase === "gameover") drawGameOver();
    }

    // ---- Input (touch + mouse, with canvas-relative coordinates) ------------
    const press = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (phase === "start") {
        reset();
        phase = "playing";
        return;
      }
      if (phase === "gameover") {
        if (overT > 0.6) {
          reset();
          phase = "playing";
        }
        return;
      }
      if (phase === "playing") fire(x, y);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.cancelable) e.preventDefault();
      press(e.clientX, e.clientY);
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      const t0 = e.changedTouches[0];
      if (t0) press(t0.clientX, t0.clientY);
    };
    const onMouseDown = (e: MouseEvent) => press(e.clientX, e.clientY);

    if ("PointerEvent" in window) {
      canvas.addEventListener("pointerdown", onPointerDown);
    } else {
      canvas.addEventListener("touchstart", onTouchStart, { passive: false });
      canvas.addEventListener("mousedown", onMouseDown);
    }

    // ---- Loop / resize / cleanup --------------------------------------------
    const loop = new Loop((dt: number) => {
      update(dt);
      render();
    });
    loop.start();

    const onResize = () => {
      view = fitCanvas(canvas, ctx);
      W = view.width;
      H = view.height;
      starfield.resize(W, H);
      layout();
      // Re-aim in-flight debris at its (relocated) target so arrivals stay true.
      for (const m of debris) {
        const a = angleBetween(m.x, m.y, m.target.x, m.target.y);
        m.dx = m.spd * Math.sin(a);
        m.dy = m.spd * -Math.cos(a);
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      loop.stop();
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("mousedown", onMouseDown);
    };
  }, [onGameOver]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  );
}
