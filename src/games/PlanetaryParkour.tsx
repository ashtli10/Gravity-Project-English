import { useRef, useEffect, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type GameState = "IDLE" | "COUNTDOWN" | "PLAYING" | "DEAD";

interface Pipe {
  x: number;
  gapY: number;        // center of gap (current, after oscillation)
  baseGapY: number;    // original center
  gapH: number;
  scored: boolean;
  oscillateAmp: number;  // 0 = static
  oscillateSpeed: number;
  style: number;       // 0-2 visual variant
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
  color: string;
}

interface TerrainPoint {
  x: number;
  y: number;
}

interface PlanetDef {
  name: string;
  emoji: string;
  gravity: number;
  flapVelocity: number;
  baseGap: number;      // starting gap as fraction of canvas height
  minGap: number;       // floor gap fraction
  realGravity: string;  // the real m/s^2 for educational display
  bgTop: string;
  bgBottom: string;
  obstacleColor: string;
  obstacleGlow: string;
  accentColor: string;
  bodyColor: string;
  bodySize: number;
  groundColor: string;
  description: string;
}

// ─── Planet Definitions ──────────────────────────────────────────────────────

const PLANETS: PlanetDef[] = [
  {
    name: "Moon",
    emoji: "\uD83C\uDF19",
    gravity: 400,
    flapVelocity: -280,
    baseGap: 0.44,
    minGap: 0.32,
    realGravity: "1.6 m/s\u00B2",
    bgTop: "#0a0a1a",
    bgBottom: "#1a1a2e",
    obstacleColor: "#555570",
    obstacleGlow: "#8888a0",
    accentColor: "#c0c0d0",
    bodyColor: "#d0d0e0",
    bodySize: 70,
    groundColor: "#333348",
    description: "Low gravity \u2014 you float!",
  },
  {
    name: "Earth",
    emoji: "\uD83C\uDF0D",
    gravity: 980,
    flapVelocity: -380,
    baseGap: 0.35,
    minGap: 0.24,
    realGravity: "9.8 m/s\u00B2",
    bgTop: "#0a1628",
    bgBottom: "#162840",
    obstacleColor: "#1a6030",
    obstacleGlow: "#00e676",
    accentColor: "#00e676",
    bodyColor: "#4488cc",
    bodySize: 55,
    groundColor: "#1a3020",
    description: "Standard gravity",
  },
  {
    name: "Mars",
    emoji: "\uD83D\uDD34",
    gravity: 620,
    flapVelocity: -320,
    baseGap: 0.39,
    minGap: 0.28,
    realGravity: "3.7 m/s\u00B2",
    bgTop: "#1a0a0a",
    bgBottom: "#2e1510",
    obstacleColor: "#8b3a1a",
    obstacleGlow: "#ff6b35",
    accentColor: "#ff6b35",
    bodyColor: "#cc4422",
    bodySize: 50,
    groundColor: "#3a1a0a",
    description: "Medium gravity \u2014 dusty!",
  },
  {
    name: "Jupiter",
    emoji: "\uD83E\uDE90",
    gravity: 1800,
    flapVelocity: -520,
    baseGap: 0.30,
    minGap: 0.21,
    realGravity: "24.8 m/s\u00B2",
    bgTop: "#1a1000",
    bgBottom: "#2e1a00",
    obstacleColor: "#8b6914",
    obstacleGlow: "#ffc107",
    accentColor: "#ffc107",
    bodyColor: "#cc8833",
    bodySize: 85,
    groundColor: "#2e1a00",
    description: "Extreme gravity!",
  },
  {
    name: "Sun",
    emoji: "\u2600\uFE0F",
    gravity: 2600,
    flapVelocity: -640,
    baseGap: 0.27,
    minGap: 0.19,
    realGravity: "274 m/s\u00B2",
    bgTop: "#1a0800",
    bgBottom: "#331100",
    obstacleColor: "#cc4400",
    obstacleGlow: "#ff6600",
    accentColor: "#ffaa00",
    bodyColor: "#ffcc00",
    bodySize: 100,
    groundColor: "#331100",
    description: "Near-impossible!",
  },
];

// ─── Cosmetic zones (background changes as you progress) ─────────────────────

interface CosmeticZone {
  bgTop: string;
  bgBottom: string;
  groundColor: string;
  label: string;
}

const COSMETIC_ZONES: CosmeticZone[] = [
  { bgTop: "#0a0a1a", bgBottom: "#1a1a2e", groundColor: "#333348", label: "" },
  { bgTop: "#0a1028", bgBottom: "#141e38", groundColor: "#1a2838", label: "Deep space..." },
  { bgTop: "#0e0818", bgBottom: "#1e1030", groundColor: "#28183a", label: "Nebula sector..." },
  { bgTop: "#100a0a", bgBottom: "#221418", groundColor: "#2e1a1a", label: "Asteroid belt..." },
  { bgTop: "#080810", bgBottom: "#101020", groundColor: "#181828", label: "Dark void..." },
];
const PIPES_PER_COSMETIC_ZONE = 20;

// ─── Constants ───────────────────────────────────────────────────────────────

const PLAYER_X = 80;
const PLAYER_W = 28;
const PLAYER_H = 32;
const PIPE_WIDTH = 56;
const PIPE_SPACING = 210;
const BASE_SCROLL_SPEED = 220;
const SCROLL_SPEED_RAMP = 1.2;   // extra px/s per pipe passed
const MAX_SCROLL_SPEED = 380;
const COUNTDOWN_STEP_MS = 700;
const MAX_ROTATION = Math.PI / 2;
const MIN_ROTATION = -0.5;
const DEATH_FLASH_MS = 150;
const MOVING_PIPE_CHANCE = 0.22;  // ~1 in 5 pipes oscillates
const SHOOTING_STAR_INTERVAL = 2.5; // seconds between shooting stars
const COMBO_MILESTONE = 5;
const PLANET_BAR_HEIGHT = 56;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

function lerpColor(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function lsKey(planetName: string): string {
  return `planetaryParkour_${planetName}_highScore`;
}

function loadHighScore(planetName: string): number {
  try {
    return parseInt(localStorage.getItem(lsKey(planetName)) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

function saveHighScore(planetName: string, score: number): void {
  try {
    localStorage.setItem(lsKey(planetName), String(score));
  } catch {
    // ignore
  }
}

function getCosmeticZone(pipesPassed: number): {
  bgTop: string;
  bgBottom: string;
  groundColor: string;
} {
  const zi = clamp(Math.floor(pipesPassed / PIPES_PER_COSMETIC_ZONE), 0, COSMETIC_ZONES.length - 1);
  const progress = (pipesPassed % PIPES_PER_COSMETIC_ZONE) / PIPES_PER_COSMETIC_ZONE;
  const cur = COSMETIC_ZONES[zi];

  // Blend toward next zone in last 15%
  if (zi < COSMETIC_ZONES.length - 1 && progress > 0.85) {
    const next = COSMETIC_ZONES[zi + 1];
    const t = (progress - 0.85) / 0.15;
    return {
      bgTop: lerpColor(cur.bgTop, next.bgTop, t),
      bgBottom: lerpColor(cur.bgBottom, next.bgBottom, t),
      groundColor: lerpColor(cur.groundColor, next.groundColor, t),
    };
  }
  if (zi > 0 && progress < 0.15) {
    const prev = COSMETIC_ZONES[zi - 1];
    const t = 1 - progress / 0.15;
    return {
      bgTop: lerpColor(cur.bgTop, prev.bgTop, t),
      bgBottom: lerpColor(cur.bgBottom, prev.bgBottom, t),
      groundColor: lerpColor(cur.groundColor, prev.groundColor, t),
    };
  }
  return { bgTop: cur.bgTop, bgBottom: cur.bgBottom, groundColor: cur.groundColor };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PlanetaryParkour() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);

  // Mutable game state
  const gs = useRef({
    state: "IDLE" as GameState,
    planet: PLANETS[1], // default Earth, overwritten on selection
    playerY: 0,
    velocityY: 0,
    rotation: 0,
    pipes: [] as Pipe[],
    particles: [] as Particle[],
    stars: [] as Star[],
    shootingStars: [] as ShootingStar[],
    terrain: [] as TerrainPoint[],
    score: 0,
    totalPipesPassed: 0,
    combo: 0,
    comboFlashTimer: 0,
    comboFlashText: "",
    scrollX: 0,
    nextPipeX: 0,
    flashTimer: 0,
    countdownStep: 3,
    countdownTimer: 0,
    cosmeticLabelTimer: 0,
    cosmeticLabelText: "",
    lastCosmeticZone: -1,
    shootingStarTimer: 0,
    canvasW: 0,
    canvasH: 0,
    lastTime: 0,
    animId: 0,
    highScore: 0,
    pipeCounter: 0, // for deciding which pipes oscillate
    lastPipeGapY: -1, // previous pipe's gap center for reachability clamping
  });

  const flap = useCallback(() => {
    const g = gs.current;
    if (g.state === "IDLE") {
      startCountdown();
      return;
    }
    if (g.state === "DEAD") {
      startCountdown();
      return;
    }
    if (g.state === "PLAYING") {
      g.velocityY = g.planet.flapVelocity;
    }
  }, []);

  function startCountdown() {
    const g = gs.current;
    g.playerY = g.canvasH * 0.45;
    g.velocityY = 0;
    g.rotation = 0;
    g.pipes = [];
    g.particles = [];
    g.shootingStars = [];
    g.score = 0;
    g.totalPipesPassed = 0;
    g.combo = 0;
    g.comboFlashTimer = 0;
    g.comboFlashText = "";
    g.scrollX = 0;
    g.nextPipeX = g.canvasW * 0.75;
    g.flashTimer = 0;
    g.cosmeticLabelTimer = 0;
    g.cosmeticLabelText = "";
    g.lastCosmeticZone = 0;
    g.shootingStarTimer = 0;
    g.pipeCounter = 0;
    g.lastPipeGapY = -1;
    g.state = "COUNTDOWN";
    g.countdownStep = 3;
    g.countdownTimer = 0;

    // Generate terrain
    g.terrain = [];
    for (let x = 0; x < g.canvasW * 4; x += 20) {
      g.terrain.push({
        x,
        y: Math.sin(x * 0.015) * 8 + Math.sin(x * 0.037) * 4,
      });
    }
  }

  // ─── Main effect: canvas + game loop ────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || selectedPlanet === null) return;

    const planet = PLANETS[selectedPlanet];
    const g = gs.current;
    g.planet = planet;
    g.highScore = loadHighScore(planet.name);

    const ctxMaybe = canvas.getContext("2d");
    if (!ctxMaybe) return;
    const ctx: CanvasRenderingContext2D = ctxMaybe;

    // ── Sizing ──
    const dpr = window.devicePixelRatio || 1;
    function resize() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      gs.current.canvasW = w;
      gs.current.canvasH = h;
    }
    resize();
    window.addEventListener("resize", resize);

    // ── Stars ──
    g.playerY = g.canvasH * 0.45;
    g.stars = [];
    for (let i = 0; i < 100; i++) {
      g.stars.push({
        x: Math.random() * g.canvasW * 3,
        y: Math.random() * g.canvasH,
        size: Math.random() * 2.2 + 0.4,
        brightness: Math.random() * 0.6 + 0.4,
        twinkleSpeed: Math.random() * 2 + 1,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    // ── Input ──
    function handleTap(e: TouchEvent | MouseEvent) {
      e.preventDefault();
      flap();
    }
    canvas.addEventListener("touchstart", handleTap, { passive: false });
    canvas.addEventListener("mousedown", handleTap);

    // ── Pipe spawning ──
    function spawnPipe() {
      const g2 = gs.current;
      const h = g2.canvasH;
      const margin = h * 0.1;
      // Gap shrinks slightly with score, but respects planet's range
      const gapFrac = Math.max(
        g2.planet.minGap,
        g2.planet.baseGap - g2.totalPipesPassed * 0.004
      );
      const gapH = h * gapFrac;

      // Compute oscillation params first (needed for reachability budget)
      g2.pipeCounter++;
      const shouldOscillate = Math.random() < MOVING_PIPE_CHANCE && g2.pipeCounter > 5;
      // Scale oscillation down at high difficulty
      const oscDifficultyScale = Math.max(0.4, 1.0 - g2.totalPipesPassed * 0.012);
      const oscillateAmp = shouldOscillate ? (25 + Math.random() * 35) * oscDifficultyScale : 0;
      const oscillateSpeed = shouldOscillate ? 1.5 + Math.random() * 1.5 : 0;

      // Generate unconstrained random gapY
      let gapY = margin + gapH / 2 + Math.random() * (h - 2 * margin - gapH);

      // Clamp to reachable range from previous pipe
      if (g2.lastPipeGapY >= 0) {
        const scrollSpeed = Math.min(
          MAX_SCROLL_SPEED,
          BASE_SCROLL_SPEED + g2.totalPipesPassed * SCROLL_SPEED_RAMP
        );
        const T = PIPE_SPACING / scrollSpeed;

        // Max FALL (going down = increasing Y): gravity helps
        const maxFall = 0.5 * g2.planet.gravity * T * T;
        // Max RISE (going up = decreasing Y): must flap repeatedly against gravity
        const maxRise = Math.abs(g2.planet.flapVelocity) * T * 0.55;

        // Safety margin + subtract oscillation budget (pipe may be at worst position)
        const safeMaxFall = maxFall * 0.85 - oscillateAmp;
        const safeMaxRise = maxRise * 0.85 - oscillateAmp;

        const minGapY = g2.lastPipeGapY - Math.max(0, safeMaxRise);
        const maxGapY = g2.lastPipeGapY + Math.max(0, safeMaxFall);
        gapY = clamp(gapY, minGapY, maxGapY);
      }

      // Respect screen margins
      gapY = clamp(gapY, margin + gapH / 2, h - margin - gapH / 2);
      g2.lastPipeGapY = gapY;

      g2.pipes.push({
        x: g2.nextPipeX,
        gapY,
        baseGapY: gapY,
        gapH,
        scored: false,
        oscillateAmp,
        oscillateSpeed,
        style: Math.floor(Math.random() * 3),
      });
      g2.nextPipeX += PIPE_SPACING;
    }

    // ── Death ──
    function die() {
      const g2 = gs.current;
      if (g2.state !== "PLAYING") return;
      g2.state = "DEAD";
      g2.flashTimer = DEATH_FLASH_MS;
      g2.combo = 0;
      // Death particles
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 250 + 60;
        const colors = [planet.accentColor, "#ff4444", "#ffffff", planet.obstacleGlow];
        g2.particles.push({
          x: PLAYER_X + PLAYER_W / 2,
          y: g2.playerY + PLAYER_H / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.2,
          maxLife: 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 5 + 2,
        });
      }
      // High score
      if (g2.score > g2.highScore) {
        g2.highScore = g2.score;
        saveHighScore(planet.name, g2.score);
      }
    }

    // ── Collision ──
    function checkCollision(): boolean {
      const g2 = gs.current;
      const px = PLAYER_X;
      const py = g2.playerY;
      const pw = PLAYER_W;
      const ph = PLAYER_H;
      if (py < 0 || py + ph > g2.canvasH) return true;
      for (const pipe of g2.pipes) {
        const pipeScreenX = pipe.x - g2.scrollX + PLAYER_X;
        if (px + pw > pipeScreenX && px < pipeScreenX + PIPE_WIDTH) {
          if (py < pipe.gapY - pipe.gapH / 2) return true;
          if (py + ph > pipe.gapY + pipe.gapH / 2) return true;
        }
      }
      return false;
    }

    // ── Drawing helpers ──
    function roundRect(
      c: CanvasRenderingContext2D,
      x: number, y: number, w: number, h: number,
      tl: number, tr: number, br: number, bl: number
    ) {
      c.beginPath();
      c.moveTo(x + tl, y);
      c.lineTo(x + w - tr, y);
      c.quadraticCurveTo(x + w, y, x + w, y + tr);
      c.lineTo(x + w, y + h - br);
      c.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
      c.lineTo(x + bl, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - bl);
      c.lineTo(x, y + tl);
      c.quadraticCurveTo(x, y, x + tl, y);
      c.closePath();
    }

    function drawBackground(c: CanvasRenderingContext2D, time: number) {
      const w = g.canvasW;
      const h = g.canvasH;
      const cosm = getCosmeticZone(g.totalPipesPassed);

      // Blend planet's base colors with cosmetic zone
      const blendT = Math.min(g.totalPipesPassed / 8, 1); // ease into cosmetic
      const topColor = blendT < 0.01 ? planet.bgTop : lerpColor(planet.bgTop, cosm.bgTop, blendT * 0.4);
      const botColor = blendT < 0.01 ? planet.bgBottom : lerpColor(planet.bgBottom, cosm.bgBottom, blendT * 0.4);

      const grad = c.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, topColor);
      grad.addColorStop(1, botColor);
      c.fillStyle = grad;
      c.fillRect(0, 0, w, h);

      // Stars
      for (const star of g.stars) {
        const sx = ((star.x - g.scrollX * 0.08) % (w * 3) + w * 3) % (w * 3);
        if (sx > w) continue;
        const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset));
        c.fillStyle = `rgba(255,255,255,${alpha * star.brightness})`;
        c.beginPath();
        c.arc(sx, star.y, star.size, 0, Math.PI * 2);
        c.fill();
      }

      // Celestial body (planet)
      if (planet.bodySize > 0) {
        const bx = w * 0.8 - (g.scrollX * 0.015) % (w * 0.4);
        const by = h * 0.16;
        const sz = planet.bodySize;
        // Outer glow
        const glowGrad = c.createRadialGradient(bx, by, sz * 0.3, bx, by, sz * 2.5);
        glowGrad.addColorStop(0, planet.bodyColor + "25");
        glowGrad.addColorStop(1, planet.bodyColor + "00");
        c.fillStyle = glowGrad;
        c.beginPath();
        c.arc(bx, by, sz * 2.5, 0, Math.PI * 2);
        c.fill();
        // Body
        c.fillStyle = planet.bodyColor + "50";
        c.beginPath();
        c.arc(bx, by, sz, 0, Math.PI * 2);
        c.fill();
        // Highlight crescent
        c.fillStyle = planet.bodyColor + "20";
        c.beginPath();
        c.arc(bx - sz * 0.2, by - sz * 0.2, sz * 0.85, 0, Math.PI * 2);
        c.fill();
      }

      // Shooting stars
      for (const ss of g.shootingStars) {
        const alpha = ss.life / ss.maxLife;
        c.save();
        c.globalAlpha = alpha;
        c.strokeStyle = ss.color;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(ss.x, ss.y);
        c.lineTo(ss.x - ss.vx * 0.05 * ss.length, ss.y - ss.vy * 0.05 * ss.length);
        c.stroke();
        // Bright head
        c.fillStyle = "#ffffff";
        c.beginPath();
        c.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }

      // Terrain at bottom
      if (g.terrain.length > 1) {
        const groundY = h - 18;
        const gndColor = planet.groundColor;
        c.fillStyle = gndColor + "60";
        c.beginPath();
        c.moveTo(0, h);
        for (const tp of g.terrain) {
          const sx = ((tp.x - g.scrollX * 0.3) % (g.canvasW * 4) + g.canvasW * 4) % (g.canvasW * 4);
          if (sx > w + 40) continue;
          c.lineTo(sx, groundY + tp.y);
        }
        c.lineTo(w, h);
        c.closePath();
        c.fill();
        // Glowing top edge
        c.strokeStyle = gndColor + "40";
        c.lineWidth = 1;
        c.beginPath();
        let started = false;
        for (const tp of g.terrain) {
          const sx = ((tp.x - g.scrollX * 0.3) % (g.canvasW * 4) + g.canvasW * 4) % (g.canvasW * 4);
          if (sx > w + 40) continue;
          if (!started) { c.moveTo(sx, groundY + tp.y); started = true; }
          else c.lineTo(sx, groundY + tp.y);
        }
        c.stroke();
      }
    }

    function drawPipe(c: CanvasRenderingContext2D, pipe: Pipe) {
      const h = g.canvasH;
      const topH = pipe.gapY - pipe.gapH / 2;
      const botY = pipe.gapY + pipe.gapH / 2;
      const botH = h - botY;
      const px = pipe.x - g.scrollX + PLAYER_X;
      if (px + PIPE_WIDTH < -20 || px > g.canvasW + 20) return;

      const isMoving = pipe.oscillateAmp > 0;

      // Different visual styles
      c.shadowColor = planet.obstacleGlow;
      c.shadowBlur = isMoving ? 18 : 10;

      if (pipe.style === 0) {
        // Standard pillars
        c.fillStyle = planet.obstacleColor;
        roundRect(c, px, 0, PIPE_WIDTH, topH, 0, 0, 8, 8);
        c.fill();
        roundRect(c, px, botY, PIPE_WIDTH, botH, 8, 8, 0, 0);
        c.fill();
        // Caps
        c.fillStyle = planet.obstacleGlow + "70";
        roundRect(c, px - 4, topH - 14, PIPE_WIDTH + 8, 14, 5, 5, 5, 5);
        c.fill();
        roundRect(c, px - 4, botY, PIPE_WIDTH + 8, 14, 5, 5, 5, 5);
        c.fill();
      } else if (pipe.style === 1) {
        // Segmented / asteroid column
        c.fillStyle = planet.obstacleColor;
        // Top: draw segments
        const segH = 20;
        for (let sy = 0; sy < topH; sy += segH + 3) {
          const sh = Math.min(segH, topH - sy);
          const inset = ((sy / segH) % 2) * 3;
          roundRect(c, px + inset, sy, PIPE_WIDTH - inset * 2, sh, 3, 3, 3, 3);
          c.fill();
        }
        // Bottom: segments
        for (let sy = botY; sy < h; sy += segH + 3) {
          const sh = Math.min(segH, h - sy);
          const idx = Math.floor((sy - botY) / (segH + 3));
          const inset = (idx % 2) * 3;
          roundRect(c, px + inset, sy, PIPE_WIDTH - inset * 2, sh, 3, 3, 3, 3);
          c.fill();
        }
        // Glowing tips
        c.fillStyle = planet.obstacleGlow + "90";
        c.beginPath();
        c.arc(px + PIPE_WIDTH / 2, topH, PIPE_WIDTH / 2 + 2, 0, Math.PI);
        c.fill();
        c.beginPath();
        c.arc(px + PIPE_WIDTH / 2, botY, PIPE_WIDTH / 2 + 2, Math.PI, Math.PI * 2);
        c.fill();
      } else {
        // Jagged crystal style
        c.fillStyle = planet.obstacleColor;
        // Top column with jagged edge
        c.beginPath();
        c.moveTo(px, 0);
        c.lineTo(px + PIPE_WIDTH, 0);
        c.lineTo(px + PIPE_WIDTH, topH - 10);
        c.lineTo(px + PIPE_WIDTH - 8, topH);
        c.lineTo(px + PIPE_WIDTH - 18, topH - 7);
        c.lineTo(px + PIPE_WIDTH / 2, topH + 4);
        c.lineTo(px + 18, topH - 7);
        c.lineTo(px + 8, topH);
        c.lineTo(px, topH - 10);
        c.closePath();
        c.fill();
        // Bottom column with jagged edge
        c.beginPath();
        c.moveTo(px, h);
        c.lineTo(px + PIPE_WIDTH, h);
        c.lineTo(px + PIPE_WIDTH, botY + 10);
        c.lineTo(px + PIPE_WIDTH - 8, botY);
        c.lineTo(px + PIPE_WIDTH - 18, botY + 7);
        c.lineTo(px + PIPE_WIDTH / 2, botY - 4);
        c.lineTo(px + 18, botY + 7);
        c.lineTo(px + 8, botY);
        c.lineTo(px, botY + 10);
        c.closePath();
        c.fill();
        // Edge glow
        c.fillStyle = planet.obstacleGlow + "50";
        c.fillRect(px, topH - 12, PIPE_WIDTH, 3);
        c.fillRect(px, botY + 10, PIPE_WIDTH, 3);
      }

      // Moving pipe indicator: pulsing side lights
      if (isMoving) {
        c.shadowBlur = 0;
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 1000 * 4);
        c.fillStyle = planet.accentColor + (Math.round(pulse * 200 + 55)).toString(16).padStart(2, "0");
        c.beginPath();
        c.arc(px - 4, topH - 4, 3, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.arc(px + PIPE_WIDTH + 4, botY + 4, 3, 0, Math.PI * 2);
        c.fill();
      }

      // Edge highlight
      c.shadowBlur = 0;
      c.fillStyle = planet.obstacleGlow + "15";
      c.fillRect(px + 2, 0, 2, topH);
      c.fillRect(px + 2, botY, 2, botH);
    }

    function drawPlayer(c: CanvasRenderingContext2D) {
      const g2 = gs.current;
      const cx = PLAYER_X + PLAYER_W / 2;
      const cy = g2.playerY + PLAYER_H / 2;

      c.save();
      c.translate(cx, cy);
      c.rotate(g2.rotation);

      // Exhaust trail particles (small ambient ones while playing)
      if (g2.state === "PLAYING" && g2.velocityY < 80) {
        const flameLen = 10 + Math.random() * 12;
        // Outer flame
        c.fillStyle = "#ff440088";
        c.beginPath();
        c.moveTo(-5, PLAYER_H / 2);
        c.lineTo(5, PLAYER_H / 2);
        c.lineTo(Math.random() * 4 - 2, PLAYER_H / 2 + flameLen);
        c.closePath();
        c.fill();
        // Inner flame
        c.fillStyle = "#ffcc00cc";
        c.beginPath();
        c.moveTo(-3, PLAYER_H / 2);
        c.lineTo(3, PLAYER_H / 2);
        c.lineTo(Math.random() * 2 - 1, PLAYER_H / 2 + flameLen * 0.55);
        c.closePath();
        c.fill();
        // Core
        c.fillStyle = "#ffffffaa";
        c.beginPath();
        c.moveTo(-1.5, PLAYER_H / 2);
        c.lineTo(1.5, PLAYER_H / 2);
        c.lineTo(0, PLAYER_H / 2 + flameLen * 0.3);
        c.closePath();
        c.fill();
      }

      // Rocket body
      c.fillStyle = "#e0e0e8";
      roundRect(c, -PLAYER_W / 2, -PLAYER_H / 2 + 6, PLAYER_W, PLAYER_H - 6, 4, 4, 3, 3);
      c.fill();

      // Body stripe
      c.fillStyle = planet.accentColor + "30";
      c.fillRect(-PLAYER_W / 2 + 3, -2, PLAYER_W - 6, 3);

      // Nose cone
      c.fillStyle = planet.accentColor;
      c.beginPath();
      c.moveTo(0, -PLAYER_H / 2);
      c.lineTo(-PLAYER_W / 2, -PLAYER_H / 2 + 10);
      c.lineTo(PLAYER_W / 2, -PLAYER_H / 2 + 10);
      c.closePath();
      c.fill();

      // Window
      c.fillStyle = "#88ccff";
      c.beginPath();
      c.arc(0, -2, 5.5, 0, Math.PI * 2);
      c.fill();
      // Window glint
      c.fillStyle = "#cceeFF60";
      c.beginPath();
      c.arc(-1.5, -3.5, 2, 0, Math.PI * 2);
      c.fill();

      // Fins
      c.fillStyle = planet.accentColor;
      c.beginPath();
      c.moveTo(-PLAYER_W / 2, PLAYER_H / 2 - 4);
      c.lineTo(-PLAYER_W / 2 - 6, PLAYER_H / 2 + 2);
      c.lineTo(-PLAYER_W / 2, PLAYER_H / 2 - 14);
      c.closePath();
      c.fill();
      c.beginPath();
      c.moveTo(PLAYER_W / 2, PLAYER_H / 2 - 4);
      c.lineTo(PLAYER_W / 2 + 6, PLAYER_H / 2 + 2);
      c.lineTo(PLAYER_W / 2, PLAYER_H / 2 - 14);
      c.closePath();
      c.fill();

      // Glow outline
      c.shadowColor = planet.accentColor;
      c.shadowBlur = 12;
      c.strokeStyle = planet.accentColor + "50";
      c.lineWidth = 1.5;
      roundRect(c, -PLAYER_W / 2 - 1, -PLAYER_H / 2 + 5, PLAYER_W + 2, PLAYER_H - 4, 5, 5, 3, 3);
      c.stroke();
      c.shadowBlur = 0;

      c.restore();
    }

    function drawParticles(c: CanvasRenderingContext2D) {
      for (const p of g.particles) {
        const alpha = p.life / p.maxLife;
        c.globalAlpha = alpha;
        c.fillStyle = p.color;
        c.beginPath();
        c.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
    }

    function drawHUD(c: CanvasRenderingContext2D, time: number) {
      const g2 = gs.current;
      const w = g2.canvasW;

      // Score
      c.save();
      c.font = "bold 52px -apple-system, BlinkMacSystemFont, sans-serif";
      c.textAlign = "center";
      c.textBaseline = "top";
      c.shadowColor = planet.accentColor;
      c.shadowBlur = 20;
      c.fillStyle = "#ffffff";
      c.fillText(String(g2.score), w / 2, 32 + PLANET_BAR_HEIGHT);
      c.shadowBlur = 0;
      c.restore();

      // Combo counter
      if (g2.combo >= COMBO_MILESTONE) {
        c.save();
        const pulse = 1 + 0.08 * Math.sin(time * 8);
        c.font = `bold ${Math.round(18 * pulse)}px -apple-system, BlinkMacSystemFont, sans-serif`;
        c.textAlign = "center";
        c.fillStyle = planet.accentColor;
        c.shadowColor = planet.accentColor;
        c.shadowBlur = 12;
        c.fillText(`x${g2.combo} STREAK`, w / 2, 90 + PLANET_BAR_HEIGHT);
        c.shadowBlur = 0;
        c.restore();
      }

      // Combo flash (milestone achieved)
      if (g2.comboFlashTimer > 0) {
        const alpha = g2.comboFlashTimer / 1.0;
        c.save();
        c.globalAlpha = clamp(alpha, 0, 1);
        c.font = "bold 28px -apple-system, BlinkMacSystemFont, sans-serif";
        c.textAlign = "center";
        c.fillStyle = "#ffcc00";
        c.shadowColor = "#ffcc00";
        c.shadowBlur = 20;
        c.fillText(g2.comboFlashText, w / 2, g.canvasH * 0.25);
        c.shadowBlur = 0;
        c.restore();
      }

      // Cosmetic zone label
      if (g2.cosmeticLabelTimer > 0 && g2.cosmeticLabelText) {
        const alpha = g2.cosmeticLabelTimer > 1.5 ? (2 - g2.cosmeticLabelTimer) * 2 : g2.cosmeticLabelTimer / 1.5;
        c.save();
        c.globalAlpha = clamp(alpha, 0, 1);
        c.font = "bold 18px -apple-system, BlinkMacSystemFont, sans-serif";
        c.textAlign = "center";
        c.fillStyle = planet.accentColor + "cc";
        c.fillText(g2.cosmeticLabelText, w / 2, Math.max(g.canvasH * 0.14, PLANET_BAR_HEIGHT + 20));
        c.globalAlpha = 1;
        c.restore();
      }
    }

    function drawIdleScreen(c: CanvasRenderingContext2D, time: number) {
      const w = g.canvasW;
      const h = g.canvasH;
      drawBackground(c, time);

      // Title
      c.save();
      c.font = "bold 28px -apple-system, BlinkMacSystemFont, sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = planet.accentColor;
      c.shadowColor = planet.accentColor;
      c.shadowBlur = 24;
      c.fillText(planet.name.toUpperCase(), w / 2, h * 0.25);
      c.shadowBlur = 0;

      c.font = "16px -apple-system, BlinkMacSystemFont, sans-serif";
      c.fillStyle = "#8888a0";
      c.fillText(`Gravity: ${planet.realGravity}`, w / 2, h * 0.30);
      c.fillText(planet.description, w / 2, h * 0.35);

      // Bouncing rocket
      const ry = h * 0.48 + Math.sin(time * 2.5) * 10;
      c.translate(w / 2, ry);
      c.fillStyle = "#e0e0e8";
      roundRect(c, -20, -22, 40, 44, 6, 6, 4, 4);
      c.fill();
      c.fillStyle = planet.accentColor;
      c.beginPath();
      c.moveTo(0, -34);
      c.lineTo(-20, -18);
      c.lineTo(20, -18);
      c.closePath();
      c.fill();
      c.fillStyle = "#88ccff";
      c.beginPath();
      c.arc(0, -4, 8, 0, Math.PI * 2);
      c.fill();
      const fl = 12 + Math.random() * 10;
      c.fillStyle = "#ff6600";
      c.beginPath();
      c.moveTo(-6, 22);
      c.lineTo(6, 22);
      c.lineTo(0, 22 + fl);
      c.closePath();
      c.fill();
      c.restore();

      // Tap prompt
      c.save();
      c.globalAlpha = 0.5 + 0.5 * Math.sin(time * 3);
      c.font = "bold 22px -apple-system, BlinkMacSystemFont, sans-serif";
      c.textAlign = "center";
      c.fillStyle = "#ffffff";
      c.fillText("TAP TO START", w / 2, h * 0.72);
      c.globalAlpha = 1;
      c.restore();

      // High score
      if (g.highScore > 0) {
        c.font = "bold 16px -apple-system, BlinkMacSystemFont, sans-serif";
        c.textAlign = "center";
        c.fillStyle = "#ffc107";
        c.fillText(`Best on ${planet.name}: ${g.highScore}`, w / 2, h * 0.80);
      }
    }

    function drawCountdown(c: CanvasRenderingContext2D, time: number) {
      const w = g.canvasW;
      const h = g.canvasH;
      drawBackground(c, time);
      drawPlayer(c);

      c.save();
      c.font = "bold 76px -apple-system, BlinkMacSystemFont, sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = planet.accentColor;
      c.shadowColor = planet.accentColor;
      c.shadowBlur = 30;
      const label = g.countdownStep > 0 ? String(g.countdownStep) : "GO!";
      c.fillText(label, w / 2, h * 0.35);
      c.shadowBlur = 0;
      c.restore();
    }

    function drawDeathScreen(c: CanvasRenderingContext2D) {
      const g2 = gs.current;
      const w = g2.canvasW;
      const h = g2.canvasH;

      c.fillStyle = "rgba(0,0,0,0.6)";
      c.fillRect(0, 0, w, h);

      c.save();
      c.font = "bold 38px -apple-system, BlinkMacSystemFont, sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = "#ff4444";
      c.shadowColor = "#ff4444";
      c.shadowBlur = 20;
      c.fillText("GAME OVER", w / 2, h * 0.30);
      c.shadowBlur = 0;

      // Score
      c.font = "bold 56px -apple-system, BlinkMacSystemFont, sans-serif";
      c.fillStyle = "#ffffff";
      c.fillText(String(g2.score), w / 2, h * 0.40);

      // Planet info
      c.font = "18px -apple-system, BlinkMacSystemFont, sans-serif";
      c.fillStyle = planet.accentColor;
      c.fillText(`${planet.name} \u2014 gravity: ${planet.realGravity}`, w / 2, h * 0.47);

      // Pipes survived
      c.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
      c.fillStyle = "#8888a0";
      c.fillText(`Survived ${g2.totalPipesPassed} obstacles`, w / 2, h * 0.53);

      // High score
      const isNew = g2.score >= g2.highScore && g2.score > 0;
      c.font = "bold 18px -apple-system, BlinkMacSystemFont, sans-serif";
      c.fillStyle = "#ffc107";
      c.fillText(isNew ? `NEW BEST: ${g2.highScore}!` : `Best: ${g2.highScore}`, w / 2, h * 0.61);

      // Tap to retry
      const alpha2 = 0.5 + 0.5 * Math.sin(performance.now() / 1000 * 3);
      c.globalAlpha = alpha2;
      c.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
      c.fillStyle = "#ffffff";
      c.fillText("TAP TO RETRY", w / 2, h * 0.73);
      c.globalAlpha = 1;

      c.restore();
    }

    // ── Game loop ──
    g.lastTime = performance.now();

    function loop(now: number) {
      g.animId = requestAnimationFrame(loop);
      const dtRaw = (now - g.lastTime) / 1000;
      g.lastTime = now;
      const dt = Math.min(dtRaw, 0.05);
      const time = now / 1000;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // ── IDLE ──
      if (g.state === "IDLE") {
        drawIdleScreen(ctx, time);
        ctx.restore();
        return;
      }

      // ── COUNTDOWN ──
      if (g.state === "COUNTDOWN") {
        g.countdownTimer += dt;
        if (g.countdownTimer >= COUNTDOWN_STEP_MS / 1000) {
          g.countdownTimer = 0;
          g.countdownStep--;
          if (g.countdownStep < 0) {
            g.state = "PLAYING";
          }
        }
        drawCountdown(ctx, time);
        ctx.restore();
        return;
      }

      // ── PLAYING ──
      if (g.state === "PLAYING") {
        // Physics — fixed gravity from selected planet
        g.velocityY += planet.gravity * dt;
        g.playerY += g.velocityY * dt;
        g.rotation = clamp(g.velocityY * 0.003, MIN_ROTATION, MAX_ROTATION);

        // Scroll speed ramps with progress
        const scrollSpeed = Math.min(
          MAX_SCROLL_SPEED,
          BASE_SCROLL_SPEED + g.totalPipesPassed * SCROLL_SPEED_RAMP
        );
        g.scrollX += scrollSpeed * dt;

        // Spawn pipes
        while (g.nextPipeX - g.scrollX < g.canvasW + 100) {
          spawnPipe();
        }

        // Update oscillating pipes
        for (const pipe of g.pipes) {
          if (pipe.oscillateAmp > 0) {
            pipe.gapY = pipe.baseGapY + Math.sin(time * pipe.oscillateSpeed) * pipe.oscillateAmp;
            // Clamp so gap doesn't go offscreen
            const halfGap = pipe.gapH / 2;
            const margin = g.canvasH * 0.1;
            pipe.gapY = clamp(pipe.gapY, margin + halfGap, g.canvasH - margin - halfGap);
          }
        }

        // Remove offscreen pipes
        g.pipes = g.pipes.filter((p) => p.x - g.scrollX + PIPE_WIDTH + PLAYER_X > -60);

        // Scoring
        for (const pipe of g.pipes) {
          if (!pipe.scored && pipe.x + PIPE_WIDTH < g.scrollX) {
            pipe.scored = true;
            g.score++;
            g.totalPipesPassed++;
            g.combo++;

            // Combo milestone flash
            if (g.combo > 0 && g.combo % COMBO_MILESTONE === 0) {
              g.comboFlashText = `x${g.combo} STREAK!`;
              g.comboFlashTimer = 1.0;
              // Bonus particle burst
              for (let i = 0; i < 8; i++) {
                const angle = Math.random() * Math.PI * 2;
                g.particles.push({
                  x: g.canvasW / 2,
                  y: g.canvasH * 0.22,
                  vx: Math.cos(angle) * 80,
                  vy: Math.sin(angle) * 80 - 30,
                  life: 0.8,
                  maxLife: 0.8,
                  color: "#ffcc00",
                  size: 3,
                });
              }
            }

            // Cosmetic zone transitions
            const czi = clamp(
              Math.floor(g.totalPipesPassed / PIPES_PER_COSMETIC_ZONE),
              0,
              COSMETIC_ZONES.length - 1
            );
            if (czi !== g.lastCosmeticZone && g.lastCosmeticZone >= 0 && COSMETIC_ZONES[czi].label) {
              g.cosmeticLabelText = COSMETIC_ZONES[czi].label;
              g.cosmeticLabelTimer = 2.0;
            }
            g.lastCosmeticZone = czi;
          }
        }

        // Timers
        if (g.cosmeticLabelTimer > 0) g.cosmeticLabelTimer -= dt;
        if (g.comboFlashTimer > 0) g.comboFlashTimer -= dt;

        // Shooting stars
        g.shootingStarTimer += dt;
        if (g.shootingStarTimer >= SHOOTING_STAR_INTERVAL) {
          g.shootingStarTimer = 0;
          const angle = -0.3 - Math.random() * 0.8;
          g.shootingStars.push({
            x: Math.random() * g.canvasW,
            y: Math.random() * g.canvasH * 0.5,
            vx: Math.cos(angle) * 400,
            vy: Math.sin(angle) * 400,
            life: 0.8 + Math.random() * 0.4,
            maxLife: 1.0,
            length: 3 + Math.random() * 3,
            color: planet.accentColor,
          });
        }

        // Collision
        if (checkCollision()) {
          die();
        }
      }

      // ── Update particles ──
      for (const p of g.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 180 * dt;
        p.life -= dt;
      }
      g.particles = g.particles.filter((p) => p.life > 0);

      // Update shooting stars
      for (const ss of g.shootingStars) {
        ss.x += ss.vx * dt;
        ss.y += ss.vy * dt;
        ss.life -= dt;
      }
      g.shootingStars = g.shootingStars.filter((ss) => ss.life > 0);

      // Flash timer
      if (g.flashTimer > 0) g.flashTimer -= dt * 1000;

      // ── RENDER ──
      drawBackground(ctx, time);

      // Pipes
      ctx.shadowBlur = 0;
      for (const pipe of g.pipes) {
        drawPipe(ctx, pipe);
      }
      ctx.shadowBlur = 0;

      // Player
      if (g.state !== "DEAD" || g.flashTimer > 0) {
        drawPlayer(ctx);
      }

      // Particles
      drawParticles(ctx);

      // HUD
      if (g.state === "PLAYING") {
        drawHUD(ctx, time);
      }

      // Death flash
      if (g.flashTimer > 0) {
        ctx.fillStyle = `rgba(255,255,255,${g.flashTimer / DEATH_FLASH_MS * 0.4})`;
        ctx.fillRect(0, 0, g.canvasW, g.canvasH);
      }

      // Death overlay
      if (g.state === "DEAD") {
        drawDeathScreen(ctx);
      }

      ctx.restore();
    }

    g.animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(g.animId);
      canvas.removeEventListener("touchstart", handleTap);
      canvas.removeEventListener("mousedown", handleTap);
      window.removeEventListener("resize", resize);
    };
  }, [flap, selectedPlanet]);

  // ─── Planet selection screen (DOM-based for iPad touch targets) ──────────

  if (selectedPlanet === null) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#0a0a0f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          boxSizing: "border-box",
          overflow: "auto",
          touchAction: "pan-y",
        }}
      >
        <div
          style={{
            fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
            color: "#00e676",
            fontWeight: 700,
            textShadow: "0 0 20px #00e676",
            marginBottom: "0.4rem",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          PLANETARY PARKOUR
        </div>
        <div
          style={{
            fontSize: "clamp(0.8rem, 2vw, 1rem)",
            color: "#8888a0",
            marginBottom: "1.5rem",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          Choose your planet &mdash; each has different gravity!
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.7rem",
            width: "100%",
            maxWidth: "420px",
          }}
        >
          {PLANETS.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setSelectedPlanet(i)}
              style={{
                padding: "1rem 1.2rem",
                background: "rgba(255,255,255,0.04)",
                border: `2px solid ${p.accentColor}40`,
                borderRadius: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                transition: "all 0.15s ease",
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              }}
              onPointerDown={(e) => {
                const el = e.currentTarget;
                el.style.transform = "scale(0.97)";
                el.style.borderColor = p.accentColor + "a0";
                el.style.background = "rgba(255,255,255,0.08)";
              }}
              onPointerUp={(e) => {
                const el = e.currentTarget;
                el.style.transform = "";
                el.style.borderColor = p.accentColor + "40";
                el.style.background = "rgba(255,255,255,0.04)";
              }}
              onPointerLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "";
                el.style.borderColor = p.accentColor + "40";
                el.style.background = "rgba(255,255,255,0.04)";
              }}
            >
              {/* Planet circle */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 35%, ${p.bodyColor}cc, ${p.bodyColor}44)`,
                  boxShadow: `0 0 16px ${p.bodyColor}40`,
                  flexShrink: 0,
                }}
              />
              {/* Info */}
              <div style={{ flex: 1, textAlign: "left" }}>
                <div
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: p.accentColor,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "#8888a0",
                    marginTop: "2px",
                  }}
                >
                  {p.description}
                </div>
              </div>
              {/* Gravity value */}
              <div
                style={{
                  fontSize: "0.85rem",
                  color: p.accentColor + "cc",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {p.realGravity}
              </div>
              {/* High score badge */}
              {loadHighScore(p.name) > 0 && (
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "#ffc107",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  Best: {loadHighScore(p.name)}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Game canvas ────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0a0a0f",
        position: "relative",
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          touchAction: "none",
        }}
      />
      {/* Planet selector bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${PLANET_BAR_HEIGHT}px`,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          background: "rgba(10, 10, 15, 0.85)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          zIndex: 10,
          touchAction: "manipulation",
        }}
      >
        {PLANETS.map((p, i) => (
          <button
            key={p.name}
            onClick={(e) => {
              e.stopPropagation();
              if (i === selectedPlanet) return;
              const g = gs.current;
              cancelAnimationFrame(g.animId);
              g.state = "IDLE";
              g.pipes = [];
              g.score = 0;
              g.totalPipesPassed = 0;
              g.combo = 0;
              g.scrollX = 0;
              g.nextPipeX = 0;
              g.particles = [];
              g.shootingStars = [];
              g.flashTimer = 0;
              g.pipeCounter = 0;
              g.lastPipeGapY = -1;
              setSelectedPlanet(i);
            }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px 2px",
              background: i === selectedPlanet
                ? `${p.accentColor}18`
                : "transparent",
              border: "none",
              borderBottom: i === selectedPlanet
                ? `3px solid ${p.accentColor}`
                : "3px solid transparent",
              cursor: "pointer",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ fontSize: "22px", lineHeight: 1 }}>
              {p.emoji}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: i === selectedPlanet ? p.accentColor : "#8888a0",
                marginTop: "3px",
                whiteSpace: "nowrap",
              }}
            >
              {p.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
