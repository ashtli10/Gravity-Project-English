import { useRef, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  gravityDir: 1 | -1;
  grounded: boolean;
  rotation: number;
  trail: { x: number; y: number; alpha: number }[];
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  surface: "floor" | "ceiling";
  type: "spike" | "wall";
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
  speed: number;
  brightness: number;
}

interface GameState {
  phase: "countdown" | "playing" | "dead" | "waiting";
  countdownValue: number;
  countdownTimer: number;
  score: number;
  speed: number;
  gravityStrength: number;
  distanceTraveled: number;
  deathFreezeTimer: number;
  flashAlpha: number;
  patternIndex: number;
  rhythmPulse: number;        // 0-1 pulse for visual rhythm
}

// ── Constants ──────────────────────────────────────────────────────────────────

const ACCENT = "#b388ff";
const ACCENT_DIM = "rgba(179, 136, 255, 0.3)";
const BG_COLOR = "#0a0a0f";
const FLOOR_RATIO = 0.85;
const CEILING_RATIO = 0.15;
const PLAYER_W = 22;
const PLAYER_H = 28;
const BASE_SPEED = 320;
const MAX_SPEED = 580;
const SPEED_RAMP = 5;
const BASE_GRAVITY = 3500;        // Very high -- snappy, fast crossings
const GRAVITY_RAMP = 30;
const MAX_GRAVITY = 5500;
const TRAIL_LENGTH = 14;
const DEATH_FREEZE_DURATION = 0.25;
const COUNTDOWN_STEP_DURATION = 0.6;
const HIGH_SCORE_KEY = "gravitySurge_highScore";

// Beat length in world-pixels. Every pattern segment is some multiple of this.
// At BASE_SPEED (320 px/s) one beat ≈ 0.375s — snappy rhythm.
const BEAT = 120;

// ── Hand-crafted pattern library ──────────────────────────────────────────────
// Each pattern is a segment of obstacles expressed in BEAT units.
// offsetB = offset in beats from the segment start.
// All patterns are guaranteed solvable: the player starts on the floor at the
// segment entrance and the required action is noted in comments.
//
// Heights are expressed as fractions of corridor height (filled in at runtime).

interface PatternDef {
  /** Total length of this segment in beats */
  beats: number;
  /** Difficulty tier: 0 = easy, 1 = medium, 2 = hard */
  tier: number;
  obs: {
    surface: "floor" | "ceiling";
    type: "spike" | "wall";
    offsetB: number;     // start position in beats
    widthB: number;      // width in beats (fractional ok)
    hFrac: number;       // height as fraction of corridor height
  }[];
}

// ── Crossing physics reference ───────────────────────────────────────────
// At max difficulty (speed=580, gravity=5500, corridorH~490):
//   crossTime ≈ 0.41s, crossDist ≈ 238px ≈ 1.98 beats
// With 0.3s reaction time at max speed: reactionDist ≈ 174px ≈ 1.45 beats
// MINIMUM gap between opposite-surface obstacles: ~3.5 beats
// Same-surface obstacles only need ~2 beats (player is already on correct side)

const PATTERN_LIB: PatternDef[] = [
  // ── Tier 0 (easy) ─────────────────────────────────────────────────────
  // 0: Single floor spike — just flip up and back
  { beats: 5, tier: 0, obs: [
    { surface: "floor", type: "spike", offsetB: 2, widthB: 0.5, hFrac: 0.22 },
  ]},
  // 1: Single ceiling spike — stay on floor
  { beats: 5, tier: 0, obs: [
    { surface: "ceiling", type: "spike", offsetB: 2, widthB: 0.5, hFrac: 0.22 },
  ]},
  // 2: Floor wall — flip over it
  { beats: 5, tier: 0, obs: [
    { surface: "floor", type: "wall", offsetB: 2, widthB: 0.25, hFrac: 0.3 },
  ]},
  // 3: Ceiling wall — stay on floor
  { beats: 5, tier: 0, obs: [
    { surface: "ceiling", type: "wall", offsetB: 2, widthB: 0.25, hFrac: 0.3 },
  ]},
  // 4: Two floor spikes spaced apart — flip, land, flip (same surface, 2.5 beat gap is fine)
  { beats: 7, tier: 0, obs: [
    { surface: "floor", type: "spike", offsetB: 1.5, widthB: 0.4, hFrac: 0.2 },
    { surface: "floor", type: "spike", offsetB: 4.5, widthB: 0.4, hFrac: 0.2 },
  ]},

  // ── Tier 1 (medium) ───────────────────────────────────────────────────
  // 5: Floor then ceiling — flip up, stay, flip back (3.5 beat gap between opposite surfaces)
  { beats: 8, tier: 1, obs: [
    { surface: "floor", type: "spike", offsetB: 1, widthB: 0.5, hFrac: 0.22 },
    { surface: "ceiling", type: "spike", offsetB: 5, widthB: 0.5, hFrac: 0.22 },
  ]},
  // 6: Ceiling then floor — stay, then flip up before the floor spike (3.5 beat gap)
  { beats: 8, tier: 1, obs: [
    { surface: "ceiling", type: "spike", offsetB: 1, widthB: 0.5, hFrac: 0.22 },
    { surface: "floor", type: "spike", offsetB: 5, widthB: 0.5, hFrac: 0.22 },
  ]},
  // 7: Tall floor wall — must flip to ceiling
  { beats: 6, tier: 1, obs: [
    { surface: "floor", type: "wall", offsetB: 2, widthB: 0.3, hFrac: 0.5 },
  ]},
  // 8: Tall ceiling wall — stay on floor, safe
  { beats: 6, tier: 1, obs: [
    { surface: "ceiling", type: "wall", offsetB: 2, widthB: 0.3, hFrac: 0.5 },
  ]},
  // 9: Double floor spikes close together — flip once, pass both (same surface ok)
  { beats: 6, tier: 1, obs: [
    { surface: "floor", type: "spike", offsetB: 1, widthB: 0.4, hFrac: 0.2 },
    { surface: "floor", type: "spike", offsetB: 2.8, widthB: 0.4, hFrac: 0.2 },
  ]},
  // 10: Squeeze — walls from both sides, fly through the gap in the middle
  // hFrac 0.25 each leaves 50% gap (~245px) — very comfortable passage
  { beats: 6, tier: 1, obs: [
    { surface: "floor", type: "wall", offsetB: 2, widthB: 0.25, hFrac: 0.25 },
    { surface: "ceiling", type: "wall", offsetB: 2, widthB: 0.25, hFrac: 0.25 },
  ]},

  // ── Tier 2 (hard) ─────────────────────────────────────────────────────
  // 11: Zigzag — floor, ceiling, floor (3.5 beat gaps between opposite surfaces)
  { beats: 12, tier: 2, obs: [
    { surface: "floor", type: "spike", offsetB: 1, widthB: 0.4, hFrac: 0.2 },
    { surface: "ceiling", type: "spike", offsetB: 4.5, widthB: 0.4, hFrac: 0.2 },
    { surface: "floor", type: "spike", offsetB: 8.5, widthB: 0.4, hFrac: 0.2 },
  ]},
  // 12: Tall wall + ceiling spike after — flip over wall, dodge spike on ceiling (4 beat gap)
  { beats: 9, tier: 2, obs: [
    { surface: "floor", type: "wall", offsetB: 1, widthB: 0.25, hFrac: 0.45 },
    { surface: "ceiling", type: "spike", offsetB: 5.5, widthB: 0.5, hFrac: 0.22 },
  ]},
  // 13: Ceiling wall + floor spike — stay on ceiling past wall, come back for spike (4 beat gap)
  { beats: 9, tier: 2, obs: [
    { surface: "ceiling", type: "wall", offsetB: 1, widthB: 0.25, hFrac: 0.45 },
    { surface: "floor", type: "spike", offsetB: 5.5, widthB: 0.5, hFrac: 0.22 },
  ]},
  // 14: Alternating — four obstacles with safe gaps (3.5 beats between opposite surfaces)
  { beats: 15, tier: 2, obs: [
    { surface: "floor", type: "spike", offsetB: 1, widthB: 0.35, hFrac: 0.18 },
    { surface: "ceiling", type: "spike", offsetB: 4.5, widthB: 0.35, hFrac: 0.18 },
    { surface: "floor", type: "spike", offsetB: 8, widthB: 0.35, hFrac: 0.18 },
    { surface: "ceiling", type: "spike", offsetB: 11.5, widthB: 0.35, hFrac: 0.18 },
  ]},
  // 15: Gauntlet — wall + spike same side (same surface, 2.5 beat gap is fine)
  { beats: 7, tier: 2, obs: [
    { surface: "floor", type: "wall", offsetB: 1, widthB: 0.2, hFrac: 0.35 },
    { surface: "floor", type: "spike", offsetB: 4, widthB: 0.5, hFrac: 0.25 },
  ]},
  // 16: Ceiling gauntlet (same surface)
  { beats: 7, tier: 2, obs: [
    { surface: "ceiling", type: "wall", offsetB: 1, widthB: 0.2, hFrac: 0.35 },
    { surface: "ceiling", type: "spike", offsetB: 4, widthB: 0.5, hFrac: 0.25 },
  ]},
  // 17: Double squeeze — two squeeze gates (hFrac 0.25 each = 50% gap, generous)
  { beats: 10, tier: 2, obs: [
    { surface: "floor", type: "wall", offsetB: 1.5, widthB: 0.25, hFrac: 0.25 },
    { surface: "ceiling", type: "wall", offsetB: 1.5, widthB: 0.25, hFrac: 0.25 },
    { surface: "floor", type: "wall", offsetB: 6.5, widthB: 0.25, hFrac: 0.25 },
    { surface: "ceiling", type: "wall", offsetB: 6.5, widthB: 0.25, hFrac: 0.25 },
  ]},
  // 18: Staircase — ascending walls from floor (same surface, 2.5 beat gaps)
  { beats: 9, tier: 2, obs: [
    { surface: "floor", type: "wall", offsetB: 1, widthB: 0.2, hFrac: 0.25 },
    { surface: "floor", type: "wall", offsetB: 3.5, widthB: 0.2, hFrac: 0.38 },
    { surface: "floor", type: "wall", offsetB: 6, widthB: 0.2, hFrac: 0.5 },
  ]},
  // 19: Reverse staircase from ceiling (same surface)
  { beats: 9, tier: 2, obs: [
    { surface: "ceiling", type: "wall", offsetB: 1, widthB: 0.2, hFrac: 0.25 },
    { surface: "ceiling", type: "wall", offsetB: 3.5, widthB: 0.2, hFrac: 0.38 },
    { surface: "ceiling", type: "wall", offsetB: 6, widthB: 0.2, hFrac: 0.5 },
  ]},
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function GravitySurge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const dpr = window.devicePixelRatio || 1;
    let W = canvasEl.clientWidth;
    let H = canvasEl.clientHeight;

    function resizeCanvas() {
      if (!canvasEl) return;
      W = canvasEl.clientWidth;
      H = canvasEl.clientHeight;
      canvasEl.width = W * dpr;
      canvasEl.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const ctx = canvasEl.getContext("2d")!;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // ── Layout helpers ────────────────────────────────────────────────────
    function floorY() { return H * FLOOR_RATIO; }
    function ceilingY() { return H * CEILING_RATIO; }
    function corridorH() { return floorY() - ceilingY(); }

    // ── Game state ────────────────────────────────────────────────────────
    let player: Player = createPlayer();
    let obstacles: Obstacle[] = [];
    let particles: Particle[] = [];
    let stars: Star[] = [];
    let speedLines: { x: number; y: number; len: number; alpha: number }[] = [];
    let state: GameState = createState();
    let lastTime = 0;
    let rafId = 0;

    // Pattern sequencing: we pre-shuffle a playlist of patterns
    let patternPlaylist: number[] = [];
    let nextPatternX = 0; // world-X where the next pattern starts

    function createPlayer(): Player {
      return {
        x: W * 0.18,
        y: floorY() - PLAYER_H,
        width: PLAYER_W,
        height: PLAYER_H,
        vy: 0,
        gravityDir: 1,
        grounded: true,
        rotation: 0,
        trail: [],
      };
    }

    function createState(): GameState {
      return {
        phase: "waiting",
        countdownValue: 3,
        countdownTimer: 0,
        score: 0,
        speed: BASE_SPEED,
        gravityStrength: BASE_GRAVITY,
        distanceTraveled: 0,
        deathFreezeTimer: 0,
        flashAlpha: 0,
        patternIndex: 0,
        rhythmPulse: 0,
      };
    }

    // ── Stars ─────────────────────────────────────────────────────────────
    function initStars() {
      stars = [];
      for (let i = 0; i < 80; i++) {
        stars.push({
          x: Math.random() * W,
          y: ceilingY() * Math.random(),
          size: Math.random() * 1.8 + 0.3,
          speed: Math.random() * 0.3 + 0.1,
          brightness: Math.random() * 0.6 + 0.2,
        });
      }
      for (let i = 0; i < 40; i++) {
        stars.push({
          x: Math.random() * W,
          y: floorY() + Math.random() * (H - floorY()),
          size: Math.random() * 1.5 + 0.3,
          speed: Math.random() * 0.2 + 0.05,
          brightness: Math.random() * 0.4 + 0.1,
        });
      }
    }
    initStars();

    // ── Pattern sequencing ────────────────────────────────────────────────
    // Build a shuffled playlist from the pattern library.
    // Early game uses tier 0, then mixes in tier 1, then tier 2.
    function buildPlaylist() {
      patternPlaylist = [];
      // Phase 1: 15 easy-only patterns (3 rounds of tier 0) — gentle warm-up
      const t0 = PATTERN_LIB.map((_, i) => i).filter(i => PATTERN_LIB[i].tier === 0);
      for (let r = 0; r < 3; r++) {
        const shuffled = [...t0].sort(() => Math.random() - 0.5);
        patternPlaylist.push(...shuffled);
      }
      // Phase 2: 12 easy+medium mixed — ramp up
      const t01 = PATTERN_LIB.map((_, i) => i).filter(i => PATTERN_LIB[i].tier <= 1);
      for (let r = 0; r < 2; r++) {
        const shuffled = [...t01].sort(() => Math.random() - 0.5);
        patternPlaylist.push(...shuffled);
      }
      // Phase 3: everything, looping
      const all = PATTERN_LIB.map((_, i) => i);
      for (let r = 0; r < 8; r++) {
        const shuffled = [...all].sort(() => Math.random() - 0.5);
        patternPlaylist.push(...shuffled);
      }
    }

    // Compute the horizontal distance the player covers while crossing
    // from floor to ceiling (or vice versa) at the given speed & gravity.
    function computeCrossDist(speed: number, gravity: number): number {
      const crossH = corridorH() - PLAYER_H;
      const crossTime = Math.sqrt(2 * crossH / gravity);
      return speed * crossTime;
    }

    // Check if a pattern is safe at the current speed/gravity.
    // Returns false if any pair of opposite-surface obstacles are
    // closer together than crossDist + safety margin.
    function isPatternSafe(pat: PatternDef, speed: number, gravity: number): boolean {
      const crossDist = computeCrossDist(speed, gravity);
      // Safety margin: 0.3s reaction time at current speed
      const safetyMargin = speed * 0.3;
      const minGap = crossDist + safetyMargin;
      const minGapBeats = minGap / BEAT;

      for (let i = 0; i < pat.obs.length; i++) {
        for (let j = i + 1; j < pat.obs.length; j++) {
          const a = pat.obs[i];
          const b = pat.obs[j];
          if (a.surface === b.surface) continue; // same surface is fine
          // Gap = start of later obstacle minus end of earlier obstacle
          const aEnd = a.offsetB + a.widthB;
          const bEnd = b.offsetB + b.widthB;
          const gap = Math.max(b.offsetB - aEnd, a.offsetB - bEnd);
          if (gap < minGapBeats) return false;
        }
      }
      return true;
    }

    function spawnNextPattern() {
      if (state.patternIndex >= patternPlaylist.length) {
        // Ran out of playlist — append more patterns
        const all = PATTERN_LIB.map((_, i) => i);
        for (let r = 0; r < 4; r++) {
          patternPlaylist.push(...[...all].sort(() => Math.random() - 0.5));
        }
      }

      // Try the next pattern in the playlist, but skip it if it's
      // impossible at the current speed/gravity. Try up to 5 times
      // before falling back to a tier-0 pattern.
      let pat: PatternDef | null = null;
      let attempts = 0;
      while (attempts < 5 && state.patternIndex + attempts < patternPlaylist.length) {
        const candidate = PATTERN_LIB[patternPlaylist[state.patternIndex + attempts]];
        if (isPatternSafe(candidate, state.speed, state.gravityStrength)) {
          pat = candidate;
          state.patternIndex += attempts; // skip past any unsafe ones
          break;
        }
        attempts++;
      }
      if (!pat) {
        // All candidates were unsafe — fall back to single-obstacle tier-0 pattern
        pat = PATTERN_LIB[0];
      }

      const cH = corridorH();
      const fY = floorY();
      const cY = ceilingY();

      for (const o of pat.obs) {
        const obsX = nextPatternX + o.offsetB * BEAT;
        const obsW = o.widthB * BEAT;
        const obsH = o.hFrac * cH;
        obstacles.push({
          x: obsX,
          y: o.surface === "floor" ? fY - obsH : cY,
          width: obsW,
          height: obsH,
          surface: o.surface,
          type: o.type,
        });
      }

      // Advance cursor: pattern length + gap beats between patterns.
      // The gap ensures transitions between patterns never create impossible combos.
      // Early game gets extra breathing room (4 beat gap for first 15 patterns).
      const gapBeats = state.patternIndex < 15 ? 4 : 3;
      nextPatternX += (pat.beats + gapBeats) * BEAT;
      state.patternIndex++;
    }

    function ensureObstacles() {
      const lookAhead = player.x + W * 2.5;
      while (nextPatternX < lookAhead) {
        spawnNextPattern();
      }
      // Prune obstacles well behind the player
      obstacles = obstacles.filter(o => o.x + o.width > player.x - W);
    }

    // ── Particles ─────────────────────────────────────────────────────────
    function spawnFlipParticles() {
      const cx = player.x + player.width / 2;
      const cy = player.y + player.height / 2;
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 80 + Math.random() * 120;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: 0.3 + Math.random() * 0.2,
          maxLife: 0.5,
          color: ACCENT,
          size: 2 + Math.random() * 2.5,
        });
      }
    }

    function spawnLandingParticles() {
      const cx = player.x + player.width / 2;
      const cy = player.gravityDir === 1
        ? player.y + player.height
        : player.y;
      for (let i = 0; i < 6; i++) {
        const dir = player.gravityDir === 1 ? -1 : 1;
        particles.push({
          x: cx + (Math.random() - 0.5) * 24, y: cy,
          vx: (Math.random() - 0.5) * 80,
          vy: dir * (40 + Math.random() * 60),
          life: 0.2 + Math.random() * 0.15,
          maxLife: 0.35,
          color: ACCENT,
          size: 1.5 + Math.random() * 2,
        });
      }
      // Trigger a rhythm pulse on landing
      state.rhythmPulse = 1;
    }

    function spawnDeathParticles() {
      const cx = player.x + player.width / 2;
      const cy = player.y + player.height / 2;
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 100 + Math.random() * 250;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: 0.5 + Math.random() * 0.5,
          maxLife: 1.0,
          color: i % 3 === 0 ? "#ff4466" : ACCENT,
          size: 2 + Math.random() * 4,
        });
      }
    }

    function updateParticles(dt: number) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }

    // ── Speed lines ───────────────────────────────────────────────────────
    function updateSpeedLines(dt: number) {
      if (state.speed > BASE_SPEED * 1.2) {
        if (Math.random() < state.speed / MAX_SPEED) {
          speedLines.push({
            x: player.x + W * 0.6 + Math.random() * W * 0.5,
            y: ceilingY() + Math.random() * corridorH(),
            len: 40 + Math.random() * 80,
            alpha: 0.12 + Math.random() * 0.18,
          });
        }
      }
      for (let i = speedLines.length - 1; i >= 0; i--) {
        speedLines[i].alpha -= dt * 1.0;
        if (speedLines[i].alpha <= 0) speedLines.splice(i, 1);
      }
    }

    // ── Collision ─────────────────────────────────────────────────────────
    function checkCollision(): boolean {
      // Generous collision margin — spikes are triangles drawn inside AABB boxes,
      // so we shrink the player hitbox to avoid unfair deaths at the visual edges.
      const m = 6;
      const px = player.x + m;
      const py = player.y + m;
      const pw = player.width - m * 2;
      const ph = player.height - m * 2;
      for (const obs of obstacles) {
        // For spikes, add extra horizontal margin since the triangle tip
        // is much narrower than the AABB.
        const obsMarginX = obs.type === "spike" ? obs.width * 0.15 : 0;
        const obsMarginY = obs.type === "spike" ? obs.height * 0.2 : 0;
        if (px < obs.x + obs.width - obsMarginX &&
            px + pw > obs.x + obsMarginX &&
            py < obs.y + obs.height - obsMarginY &&
            py + ph > obs.y + obsMarginY) {
          return true;
        }
      }
      return false;
    }

    // ── Flip gravity ──────────────────────────────────────────────────────
    function flipGravity() {
      if (state.phase !== "playing") return;
      // VVVVVV rule: must be on a surface to flip
      if (!player.grounded) return;
      player.gravityDir = player.gravityDir === 1 ? -1 : 1;
      player.grounded = false;
      player.vy = 0; // Start from zero — gravity does the work immediately
      spawnFlipParticles();
    }

    // ── Input ─────────────────────────────────────────────────────────────
    let usesTouch = false;

    function handleTouch(e: Event) {
      e.preventDefault();
      usesTouch = true;
      onTap();
    }

    function handlePointer(e: Event) {
      if (usesTouch) return;
      e.preventDefault();
      onTap();
    }

    function onTap() {
      if (state.phase === "playing") {
        flipGravity();
      } else if (state.phase === "dead" && state.deathFreezeTimer <= 0) {
        resetGame();
      } else if (state.phase === "waiting") {
        resetGame();
      }
    }

    canvasEl.addEventListener("touchstart", handleTouch, { passive: false });
    canvasEl.addEventListener("pointerdown", handlePointer);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "ArrowDown") {
        e.preventDefault();
        onTap();
      }
    }
    window.addEventListener("keydown", handleKeyDown);

    // ── Reset ─────────────────────────────────────────────────────────────
    function resetGame() {
      player = createPlayer();
      obstacles = [];
      particles = [];
      speedLines = [];
      state = createState();
      state.phase = "countdown";
      state.countdownValue = 3;
      state.countdownTimer = 0;
      state.patternIndex = 0;
      nextPatternX = player.x + W * 0.7;
      buildPlaylist();
      initStars();
    }

    // ── Update ────────────────────────────────────────────────────────────
    function update(dt: number) {
      // Decay rhythm pulse
      if (state.rhythmPulse > 0) {
        state.rhythmPulse = Math.max(0, state.rhythmPulse - dt * 5);
      }

      if (state.phase === "countdown") {
        state.countdownTimer += dt;
        if (state.countdownTimer >= COUNTDOWN_STEP_DURATION) {
          state.countdownTimer = 0;
          state.countdownValue--;
          if (state.countdownValue < 0) {
            state.phase = "playing";
            ensureObstacles();
          }
        }
        return;
      }

      if (state.phase === "dead") {
        state.deathFreezeTimer -= dt;
        state.flashAlpha = Math.max(0, state.flashAlpha - dt * 4);
        updateParticles(dt);
        return;
      }

      if (state.phase !== "playing") return;

      // ── Speed & gravity ramp ────────────────────────────────────────────
      state.speed = Math.min(MAX_SPEED, state.speed + SPEED_RAMP * dt);
      state.gravityStrength = Math.min(MAX_GRAVITY, state.gravityStrength + GRAVITY_RAMP * dt);

      // ── Player physics ──────────────────────────────────────────────────
      const fY = floorY();
      const cY = ceilingY();

      if (!player.grounded) {
        player.vy += player.gravityDir * state.gravityStrength * dt;
      }
      player.y += player.vy * dt;

      // Landing / clamping
      const wasGrounded = player.grounded;
      player.grounded = false;

      if (player.gravityDir === 1) {
        if (player.y + player.height >= fY) {
          player.y = fY - player.height;
          player.vy = 0;
          player.grounded = true;
          if (!wasGrounded) spawnLandingParticles();
        }
        if (player.y <= cY) {
          player.y = cY;
          player.vy = 0;
        }
      } else {
        if (player.y <= cY) {
          player.y = cY;
          player.vy = 0;
          player.grounded = true;
          if (!wasGrounded) spawnLandingParticles();
        }
        if (player.y + player.height >= fY) {
          player.y = fY - player.height;
          player.vy = 0;
        }
      }

      // Visual rotation
      const targetRot = player.gravityDir === 1 ? 0 : Math.PI;
      const rotDiff = Math.atan2(Math.sin(targetRot - player.rotation), Math.cos(targetRot - player.rotation));
      player.rotation += rotDiff * Math.min(1, 14 * dt);

      // ── Scroll ──────────────────────────────────────────────────────────
      state.distanceTraveled += state.speed * dt;
      player.x += state.speed * dt;

      // ── Trail ───────────────────────────────────────────────────────────
      player.trail.unshift({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        alpha: 1,
      });
      if (player.trail.length > TRAIL_LENGTH) player.trail.pop();
      for (const t of player.trail) t.alpha -= dt * 5;

      // ── Obstacles ───────────────────────────────────────────────────────
      ensureObstacles();

      // ── Score ───────────────────────────────────────────────────────────
      state.score = Math.floor(state.distanceTraveled / 10);

      // ── Collision ───────────────────────────────────────────────────────
      if (checkCollision()) { die(); return; }

      // ── Effects ─────────────────────────────────────────────────────────
      updateParticles(dt);
      updateSpeedLines(dt);

      for (const star of stars) {
        star.x -= state.speed * star.speed * dt;
        if (star.x < -5) {
          star.x = W + 5;
          star.y = star.y < ceilingY()
            ? Math.random() * ceilingY()
            : floorY() + Math.random() * (H - floorY());
        }
      }
    }

    function die() {
      state.phase = "dead";
      state.deathFreezeTimer = DEATH_FREEZE_DURATION;
      state.flashAlpha = 0.5;
      spawnDeathParticles();
      try {
        const prev = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10) || 0;
        if (state.score > prev) {
          localStorage.setItem(HIGH_SCORE_KEY, String(state.score));
        }
      } catch { /* ignore */ }
    }

    // ── Render ────────────────────────────────────────────────────────────
    function render() {
      ctx.clearRect(0, 0, W, H);
      const camX = player.x - W * 0.18;

      // Background
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (const star of stars) {
        ctx.fillStyle = `rgba(200, 200, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Space windows (subtle detail)
      const winSp = 300;
      const winW = 80;
      const winH = 20;
      for (let wx = -camX % winSp; wx < W; wx += winSp) {
        // Ceiling window
        const cyTop = ceilingY() - winH - 5;
        ctx.strokeStyle = "rgba(179, 136, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.strokeRect(wx - winW / 2, cyTop, winW, winH);
        // Floor window
        ctx.strokeStyle = "rgba(179, 136, 255, 0.06)";
        ctx.strokeRect(wx - winW / 2, floorY() + 5, winW, winH);
      }

      // Corridor panels
      ctx.fillStyle = "rgba(179, 136, 255, 0.04)";
      ctx.fillRect(0, floorY(), W, H - floorY());
      ctx.fillRect(0, 0, W, ceilingY());

      // ── Rhythm glow on corridor edges ───────────────────────────────────
      // The edges pulse brighter when the player lands — gives rhythmic feedback
      const pulseGlow = 8 + state.rhythmPulse * 18;
      const pulseAlpha = 0.7 + state.rhythmPulse * 0.3;

      ctx.save();
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur = pulseGlow;
      ctx.strokeStyle = `rgba(179, 136, 255, ${pulseAlpha})`;
      ctx.lineWidth = 1.5 + state.rhythmPulse * 1;
      ctx.beginPath();
      ctx.moveTo(0, floorY());
      ctx.lineTo(W, floorY());
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, ceilingY());
      ctx.lineTo(W, ceilingY());
      ctx.stroke();
      ctx.restore();

      // Speed lines
      for (const sl of speedLines) {
        const sx = sl.x - camX;
        if (sx < -sl.len || sx > W + 10) continue;
        ctx.strokeStyle = `rgba(179, 136, 255, ${sl.alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, sl.y);
        ctx.lineTo(sx - sl.len, sl.y);
        ctx.stroke();
      }

      // ── Obstacles ───────────────────────────────────────────────────────
      for (const obs of obstacles) {
        const ox = obs.x - camX;
        if (ox < -obs.width - 20 || ox > W + 20) continue;
        if (obs.type === "spike") {
          drawSpike(ctx, ox, obs.y, obs.width, obs.height, obs.surface);
        } else {
          drawWall(ctx, ox, obs.y, obs.width, obs.height);
        }
      }

      // ── Player trail ────────────────────────────────────────────────────
      for (let i = 1; i < player.trail.length; i++) {
        const t = player.trail[i];
        const a = Math.max(0, t.alpha * 0.35);
        if (a <= 0) continue;
        const tx = t.x - camX;
        const sz = PLAYER_W * (1 - i / TRAIL_LENGTH) * 0.45;
        ctx.fillStyle = `rgba(179, 136, 255, ${a})`;
        ctx.beginPath();
        ctx.arc(tx, t.y, sz, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Player ──────────────────────────────────────────────────────────
      if (state.phase !== "dead" || state.deathFreezeTimer > 0) {
        const px = player.x - camX;
        const py = player.y;
        const cx = px + player.width / 2;
        const cy = py + player.height / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(player.rotation);
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur = 16;

        // Body
        ctx.fillStyle = ACCENT;
        ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);

        // Highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(-player.width / 2 + 3, -player.height / 2 + 3, player.width - 6, player.height / 3);

        // Visor
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(player.width / 2 - 9, -player.height / 2 + player.height * 0.3, 7, 4);

        ctx.restore();
      }

      // ── Particles ───────────────────────────────────────────────────────
      ctx.save();
      for (const p of particles) {
        const px = p.x - camX;
        const a = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(px, p.y, p.size * a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // Death flash
      if (state.flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 68, 102, ${state.flashAlpha})`;
        ctx.fillRect(0, 0, W, H);
      }

      // HUD
      drawHUD();

      // Phase overlays
      if (state.phase === "countdown") drawCountdown();
      if (state.phase === "waiting") drawWaitingScreen();
      if (state.phase === "dead" && state.deathFreezeTimer <= 0) drawDeathScreen();
    }

    // ── Drawing helpers ───────────────────────────────────────────────────

    function drawSpike(
      c: CanvasRenderingContext2D,
      x: number, y: number, w: number, h: number,
      surface: "floor" | "ceiling"
    ) {
      c.save();
      c.shadowColor = "#ff4466";
      c.shadowBlur = 8;
      c.fillStyle = "#ff4466";
      c.beginPath();
      if (surface === "floor") {
        c.moveTo(x, y + h);
        c.lineTo(x + w / 2, y);
        c.lineTo(x + w, y + h);
      } else {
        c.moveTo(x, y);
        c.lineTo(x + w / 2, y + h);
        c.lineTo(x + w, y);
      }
      c.closePath();
      c.fill();
      // Inner glow
      c.shadowBlur = 0;
      c.fillStyle = "rgba(255, 100, 130, 0.4)";
      c.beginPath();
      if (surface === "floor") {
        c.moveTo(x + w * 0.15, y + h);
        c.lineTo(x + w / 2, y + h * 0.35);
        c.lineTo(x + w * 0.85, y + h);
      } else {
        c.moveTo(x + w * 0.15, y);
        c.lineTo(x + w / 2, y + h * 0.65);
        c.lineTo(x + w * 0.85, y);
      }
      c.closePath();
      c.fill();
      c.restore();
    }

    function drawWall(
      c: CanvasRenderingContext2D,
      x: number, y: number, w: number, h: number
    ) {
      c.save();
      c.shadowColor = ACCENT;
      c.shadowBlur = 10;
      c.fillStyle = "rgba(179, 136, 255, 0.7)";
      c.fillRect(x, y, w, h);
      c.shadowBlur = 0;
      c.fillStyle = "rgba(255, 255, 255, 0.12)";
      const sH = 8;
      for (let sy = y + 3; sy < y + h - 3; sy += sH * 2) {
        c.fillRect(x + 2, sy, w - 4, sH);
      }
      c.restore();
    }

    function drawHUD() {
      if (state.phase === "waiting") return;
      ctx.save();
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur = 6;

      // Score
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${state.score}`, 24, 44);

      // Gravity label
      ctx.font = "14px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = ACCENT;
      const gF = (state.gravityStrength / BASE_GRAVITY).toFixed(1);
      ctx.fillText(`GRAVITY: ${gF}x`, 24, 66);

      // Speed bar
      const sPct = (state.speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);
      const bW = 80;
      const bH = 4;
      const bX = W - bW - 24;
      const bY = 40;
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(bX, bY, bW, bH);
      ctx.fillStyle = ACCENT;
      ctx.fillRect(bX, bY, bW * Math.max(0, sPct), bH);
      ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText("SPEED", W - 24, bY - 6);

      ctx.restore();
    }

    function drawCountdown() {
      ctx.save();
      const text = state.countdownValue > 0 ? String(state.countdownValue) : "GO";
      const prog = state.countdownTimer / COUNTDOWN_STEP_DURATION;
      const scale = 1 + prog * 0.5;
      const alpha = 1 - prog * 0.6;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = ACCENT;
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur = 30;
      ctx.font = `bold ${Math.floor(72 * scale)}px 'Segoe UI', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, W / 2, H / 2);
      ctx.restore();
    }

    function drawWaitingScreen() {
      ctx.save();
      ctx.fillStyle = ACCENT;
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur = 25;
      ctx.font = "bold 48px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GRAVITY SURGE", W / 2, H * 0.35);

      ctx.shadowBlur = 8;
      ctx.font = "18px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("Tap to flip gravity. Avoid obstacles.", W / 2, H * 0.45);

      let hs = 0;
      try { hs = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10) || 0; } catch { /* */ }
      if (hs > 0) {
        ctx.font = "15px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = ACCENT_DIM;
        ctx.fillText(`HIGH SCORE: ${hs}`, W / 2, H * 0.52);
      }

      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 400);
      ctx.globalAlpha = 0.5 + pulse * 0.5;
      ctx.font = "bold 20px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("TAP TO START", W / 2, H * 0.65);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function drawDeathScreen() {
      ctx.save();
      ctx.fillStyle = "rgba(10, 10, 15, 0.7)";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#ff4466";
      ctx.shadowColor = "#ff4466";
      ctx.shadowBlur = 20;
      ctx.font = "bold 56px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(state.score), W / 2, H * 0.35);

      ctx.shadowBlur = 6;
      ctx.font = "16px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText("DISTANCE", W / 2, H * 0.43);

      let hs = 0;
      try { hs = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10) || 0; } catch { /* */ }
      ctx.fillStyle = ACCENT;
      ctx.font = "15px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText(`BEST: ${hs}`, W / 2, H * 0.50);

      if (state.score >= hs && state.score > 0) {
        ctx.fillStyle = "#ffcc00";
        ctx.font = "bold 14px 'Segoe UI', system-ui, sans-serif";
        ctx.fillText("NEW BEST!", W / 2, H * 0.56);
      }

      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 400);
      ctx.globalAlpha = 0.5 + pulse * 0.5;
      ctx.font = "bold 20px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("TAP TO RETRY", W / 2, H * 0.68);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // ── Game loop ─────────────────────────────────────────────────────────
    function loop(timestamp: number) {
      if (!lastTime) lastTime = timestamp;
      let dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      if (dt > 0.1) dt = 0.016;

      update(dt);
      render();
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeCanvas);
      canvasEl.removeEventListener("touchstart", handleTouch);
      canvasEl.removeEventListener("pointerdown", handlePointer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: BG_COLOR,
        position: "relative",
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          touchAction: "none",
        }}
      />
    </div>
  );
}
