import { useRef, useEffect } from "react";

// ============================================================
// TYPES
// ============================================================

interface Vec2 {
  x: number;
  y: number;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "normal" | "crumbling" | "bouncy" | "low-gravity" | "high-gravity";
  crumbleTimer: number;
  touched: boolean;
  originalY: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Coin {
  x: number;
  y: number;
  collected: boolean;
  bobPhase: number;
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

interface FloatingText {
  x: number;
  y: number;
  text: string;
  timer: number;
  maxTimer: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  brightness: number;
  twinkleSpeed: number;
  size: number;
}

interface BuildingSilhouette {
  x: number;
  width: number;
  height: number;
  hasAntenna: boolean;
  windowRows: number;
  windowCols: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const COLORS = {
  bg: "#0a0a0f",
  accent: "#ffc107",
  accentDim: "#b8860b",
  accentGlow: "#ffc10740",
  platformBody: "#12121a",
  crumbling: "#ff6b35",
  bouncy: "#00e676",
  lowGravity: "#7c4dff",
  highGravity: "#ff1744",
  coin: "#ffd700",
  text: "#e0e0e0",
  textDim: "#666680",
  hudBg: "#0a0a0f80",
  deathOverlay: "#0a0a0fcc",
  barrierColor: "#ff5252",
};

const PHYSICS = {
  baseGravity: 1100,
  maxGravity: 2800,
  gravityRampDistance: 50000,
  jumpVelocity: -580,
  shortHopCutoff: 0.4,
  moveSpeed: 200,
  maxMoveSpeed: 550,
  speedRampDistance: 60000,
  terminalVelocity: 1200,
  coyoteTime: 0.12,
  jumpBufferTime: 0.14,
  bounceVelocity: -750,
  lowGravityMult: 0.35,
  highGravityMult: 1.8,
};

const PLAYER = {
  width: 22,
  height: 40,
};

const LEVEL = {
  platformMinWidth: 120,
  platformMaxWidth: 320,
  gapMinWidth: 40,
  gapMaxWidth: 130,
  platformHeight: 400,
  baseY: 0.72,
  yVariation: 50,
  generateAhead: 3,
  specialPlatformChance: 0.15,
  obstacleChance: 0.15,
  coinChance: 0.45,
  coinsPerCluster: 4,
  coinCollectRadius: 32,
};

const DIFFICULTY = {
  gapRampStart: 5000,
  gapRampEnd: 35000,
  maxGapMultiplier: 1.4,
  specialRampEnd: 25000,
  maxSpecialChance: 0.4,
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function colorWithAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ============================================================
// PHYSICS CALCULATIONS
// ============================================================

function getMaxJumpDistance(distance: number): number {
  const gravity = getCurrentGravity(distance);
  const speed = getCurrentSpeed(distance);
  const airTime = 2 * Math.abs(PHYSICS.jumpVelocity) / gravity;
  return speed * airTime;
}

function getCurrentGravity(distance: number): number {
  const t = clamp(distance / PHYSICS.gravityRampDistance, 0, 1);
  const eased = t * t;
  return lerp(PHYSICS.baseGravity, PHYSICS.maxGravity, eased);
}

function getCurrentSpeed(distance: number): number {
  const t = clamp(distance / PHYSICS.speedRampDistance, 0, 1);
  return lerp(PHYSICS.moveSpeed, PHYSICS.maxMoveSpeed, t);
}

function getGravityLabel(gravity: number): string {
  const gForce = gravity / PHYSICS.baseGravity;
  if (gForce < 0.5) return "Moon (0.16g)";
  if (gForce < 0.8) return "Mars (0.38g)";
  if (gForce < 1.15) return `Earth (${gForce.toFixed(1)}g)`;
  if (gForce < 1.5) return `Saturn (${gForce.toFixed(1)}g)`;
  if (gForce < 2.0) return `Neptune (${gForce.toFixed(1)}g)`;
  return `Jupiter (${gForce.toFixed(1)}g)`;
}

// ============================================================
// PARTICLE SYSTEM
// ============================================================

function createParticle(
  x: number, y: number, vx: number, vy: number,
  color: string, life: number, size: number
): Particle {
  return { x, y, vx, vy, life, maxLife: life, color, size };
}

function emitJumpParticles(particles: Particle[], x: number, y: number): void {
  for (let i = 0; i < 10; i++) {
    particles.push(
      createParticle(
        x + randomRange(-10, 10), y,
        randomRange(-80, 80), randomRange(-100, 10),
        COLORS.accent, randomRange(0.25, 0.5), randomRange(2, 4.5)
      )
    );
  }
}

function emitLandParticles(particles: Particle[], x: number, y: number, impactForce: number): void {
  const count = Math.min(14, Math.floor(5 + impactForce * 10));
  for (let i = 0; i < count; i++) {
    particles.push(
      createParticle(
        x + randomRange(-12, 12), y,
        randomRange(-120, 120) * (0.5 + impactForce),
        randomRange(-60, -140) * impactForce,
        COLORS.accent, randomRange(0.25, 0.55), randomRange(1.5, 4)
      )
    );
  }
}

function emitDeathParticles(particles: Particle[], x: number, y: number): void {
  for (let i = 0; i < 30; i++) {
    const angle = (Math.PI * 2 * i) / 30 + randomRange(-0.2, 0.2);
    const speed = randomRange(80, 280);
    particles.push(
      createParticle(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        randomChoice([COLORS.accent, "#ff8800", "#ff4400", "#ffffff"]),
        randomRange(0.5, 1.4), randomRange(2, 6)
      )
    );
  }
}

function emitCoinParticles(particles: Particle[], x: number, y: number): void {
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const speed = randomRange(60, 140);
    particles.push(
      createParticle(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed - 40,
        randomChoice([COLORS.coin, "#fff8e0", "#ffaa00"]),
        randomRange(0.3, 0.7), randomRange(2, 5)
      )
    );
  }
}

function emitTrailParticle(particles: Particle[], x: number, y: number, speed: number): void {
  particles.push(
    createParticle(
      x + randomRange(-3, 3), y + randomRange(-2, 2),
      randomRange(-20, -40), randomRange(-10, 10),
      COLORS.accent, randomRange(0.1, 0.25),
      randomRange(1, 2.5) * Math.min(1.5, speed / PHYSICS.moveSpeed)
    )
  );
}

function emitBounceParticles(particles: Particle[], x: number, y: number): void {
  for (let i = 0; i < 12; i++) {
    particles.push(
      createParticle(
        x + randomRange(-14, 14), y,
        randomRange(-80, 80), randomRange(-180, -50),
        COLORS.bouncy, randomRange(0.3, 0.55), randomRange(2, 4.5)
      )
    );
  }
}

function emitCrumbleParticles(particles: Particle[], x: number, y: number, width: number): void {
  for (let i = 0; i < 18; i++) {
    particles.push(
      createParticle(
        x + randomRange(0, width), y + randomRange(-5, 5),
        randomRange(-40, 40), randomRange(20, 140),
        randomChoice([COLORS.crumbling, "#aa4422", "#663311"]),
        randomRange(0.5, 1.2), randomRange(2, 6)
      )
    );
  }
}

function emitLongJumpParticles(particles: Particle[], x: number, y: number): void {
  for (let i = 0; i < 15; i++) {
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(40, 120);
    particles.push(
      createParticle(
        x + randomRange(-15, 15), y + randomRange(-15, 15),
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        randomChoice([COLORS.accent, "#ffffff", "#ffe082"]),
        randomRange(0.4, 0.8), randomRange(2, 5)
      )
    );
  }
}

function updateParticles(particles: Particle[], dt: number): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 300 * dt;
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// ============================================================
// FLOATING TEXT
// ============================================================

function addFloatingText(
  texts: FloatingText[], x: number, y: number,
  text: string, color: string, duration: number
): void {
  texts.push({ x, y, text, timer: duration, maxTimer: duration, color });
}

function updateFloatingTexts(texts: FloatingText[], dt: number): void {
  for (let i = texts.length - 1; i >= 0; i--) {
    texts[i].timer -= dt;
    texts[i].y -= 40 * dt;
    if (texts[i].timer <= 0) {
      texts.splice(i, 1);
    }
  }
}

// ============================================================
// BACKGROUND GENERATION
// ============================================================

function generateStars(count: number, canvasW: number, canvasH: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvasW,
      y: Math.random() * canvasH * 0.6,
      brightness: randomRange(0.3, 1),
      twinkleSpeed: randomRange(0.5, 3),
      size: randomRange(0.5, 2),
    });
  }
  return stars;
}

function generateBuildingLayer(
  count: number, minHeight: number, maxHeight: number,
  startX: number, spacing: number
): BuildingSilhouette[] {
  const buildings: BuildingSilhouette[] = [];
  let x = startX;
  for (let i = 0; i < count; i++) {
    const w = randomRange(40, 80);
    const h = randomRange(minHeight, maxHeight);
    buildings.push({
      x, width: w, height: h,
      hasAntenna: Math.random() > 0.6,
      windowRows: Math.floor(h / 20),
      windowCols: Math.floor(w / 15),
    });
    x += w + randomRange(5, spacing);
  }
  return buildings;
}

// ============================================================
// LEVEL GENERATION
// ============================================================

function getDifficultyFactor(distance: number): number {
  return clamp(
    (distance - DIFFICULTY.gapRampStart) / (DIFFICULTY.gapRampEnd - DIFFICULTY.gapRampStart),
    0, 1
  );
}

function pickPlatformType(distance: number): Platform["type"] {
  const diff = getDifficultyFactor(distance);
  const specialChance = lerp(LEVEL.specialPlatformChance, DIFFICULTY.maxSpecialChance, diff);
  if (Math.random() > specialChance) return "normal";
  return randomChoice<Platform["type"]>(["crumbling", "bouncy", "low-gravity", "high-gravity"]);
}

function generatePlatform(
  lastX: number, lastWidth: number, lastY: number,
  canvasHeight: number, distance: number
): Platform {
  const diff = getDifficultyFactor(distance);
  const gapMult = lerp(1, DIFFICULTY.maxGapMultiplier, diff);

  let gap = randomRange(LEVEL.gapMinWidth, LEVEL.gapMaxWidth) * gapMult;
  let width = Math.max(80, randomRange(LEVEL.platformMinWidth, LEVEL.platformMaxWidth) * lerp(1, 0.8, diff));
  const type = pickPlatformType(distance);

  // Crumbling platforms must be narrow enough to cross before they disappear.
  // At speed S, the player crosses W pixels in W/S seconds. The crumble timer
  // is 0.7s, so cap width to 75% of what the player can cross in time.
  if (type === "crumbling") {
    const speed = getCurrentSpeed(distance);
    width = Math.min(width, Math.max(80, speed * 0.7 * 0.75));
  }

  const baseY = canvasHeight * LEVEL.baseY;
  let yVar = randomRange(-LEVEL.yVariation, LEVEL.yVariation) * lerp(1, 1.2, diff);

  // Calculate target y position
  let y = clamp(baseY + yVar, canvasHeight * 0.5, canvasHeight * 0.85);

  // Physics-based gap validation: ensure the gap is always jumpable
  const maxJump = getMaxJumpDistance(distance);
  let safeGap = maxJump * 0.55; // 45% safety margin — better too easy than impossible

  // If the next platform is higher (lower y), reduce allowed gap
  const heightDiff = lastY - y; // positive means next is higher
  if (heightDiff > 0) {
    // Higher platforms are harder to reach; reduce gap proportionally
    safeGap *= clamp(1 - heightDiff / 150, 0.5, 1);
  }

  // Clamp the gap so it is always physically possible
  gap = Math.min(gap, safeGap);

  // Hard cap: no gap should ever exceed 250px regardless of calculations
  gap = Math.min(gap, 250);

  // Also ensure platform height differences are reachable
  // Hard limit: no platform more than 35px higher than the previous one
  if (heightDiff > 35) {
    y = lastY - 35;
  }

  // Early game: make first 3000px trivially easy
  if (distance < 3000) {
    gap = Math.min(gap, safeGap * 0.6);
    if (type !== "crumbling") {
      width = Math.max(width, 200);
    }
  }

  const x = lastX + lastWidth + gap;

  return {
    x, y, width,
    height: LEVEL.platformHeight,
    type,
    crumbleTimer: type === "crumbling" ? 0.7 : 0,
    touched: false,
    originalY: y,
  };
}

function generateObstacleForPlatform(plat: Platform, distance: number): Obstacle | null {
  const diff = getDifficultyFactor(distance);
  const chance = lerp(LEVEL.obstacleChance, 0.3, diff);
  if (Math.random() > chance || plat.width < 140 || plat.type !== "normal") return null;

  const x = plat.x + randomRange(plat.width * 0.35, plat.width * 0.65);
  return {
    x, y: plat.y - 25,
    width: 18, height: 25,
  };
}

function generateCoinsForPlatform(plat: Platform, distance: number): Coin[] {
  const diff = getDifficultyFactor(distance);
  const chance = lerp(LEVEL.coinChance, 0.6, diff);
  if (Math.random() > chance) return [];

  const coins: Coin[] = [];
  const count = Math.min(LEVEL.coinsPerCluster, Math.floor(plat.width / 35));
  const startX = plat.x + plat.width * 0.2;
  const spacing = Math.min(35, (plat.width * 0.6) / Math.max(1, count));

  for (let i = 0; i < count; i++) {
    coins.push({
      x: startX + i * spacing,
      y: plat.y - 35 - Math.sin(i * 0.7) * 12,
      collected: false,
      bobPhase: Math.random() * Math.PI * 2,
    });
  }

  // Sometimes add arc coins above a gap (before this platform)
  if (Math.random() < 0.25 && distance > 1000) {
    const arcCount = 3;
    for (let i = 0; i < arcCount; i++) {
      const t = (i + 1) / (arcCount + 1);
      coins.push({
        x: plat.x - 60 * (1 - t),
        y: plat.y - 60 - Math.sin(t * Math.PI) * 50,
        collected: false,
        bobPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  return coins;
}

// ============================================================
// COLLISION DETECTION
// ============================================================

function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ============================================================
// DRAWING HELPERS
// ============================================================

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
): void {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ============================================================
// GAME STATE
// ============================================================

interface GameState {
  phase: "countdown" | "playing" | "dead" | "gameover";
  countdownValue: number;
  countdownTimer: number;
  deathPauseTimer: number;
  gameTime: number;

  playerX: number;
  playerY: number;
  playerVY: number;
  playerWidth: number;
  playerHeight: number;
  isGrounded: boolean;
  coyoteTimer: number;
  jumpBuffered: boolean;
  jumpBufferTimer: number;
  jumpReleased: boolean;
  wasGrounded: boolean;
  deathRotation: number;
  runAnimPhase: number;
  airTime: number; // track how long airborne for long jump bonus

  camX: number;
  camY: number;
  camTargetY: number;
  shakeAmount: number;
  shakeTimer: number;

  platforms: Platform[];
  obstacles: Obstacle[];
  coins: Coin[];
  particles: Particle[];
  floatingTexts: FloatingText[];

  distance: number;
  coinCount: number;
  coinStreak: number;
  bestDistance: number;
  bestCoins: number;

  currentGravity: number;
  currentSpeed: number;
  localGravityMult: number;

  stars: Star[];
  bgLayersFar: BuildingSilhouette[];
  bgLayersMid: BuildingSilhouette[];
  bgLayersNear: BuildingSilhouette[];
  trailTimer: number;

  canvasW: number;
  canvasH: number;
}

function createInitialState(canvasW: number, canvasH: number): GameState {
  const baseY = canvasH * LEVEL.baseY;

  const platforms: Platform[] = [];
  // Starting platform - extra wide and safe
  platforms.push({
    x: -100, y: baseY, width: 500,
    height: LEVEL.platformHeight, type: "normal",
    crumbleTimer: 0, touched: false, originalY: baseY,
  });

  let lastX = 400;
  let lastW = 0;
  let lastY = baseY;
  for (let i = 0; i < 12; i++) {
    const plat = generatePlatform(lastX, lastW, lastY, canvasH, 0);
    platforms.push(plat);
    lastX = plat.x;
    lastW = plat.width;
    lastY = plat.y;
  }

  const coins: Coin[] = [];
  for (let i = 1; i < platforms.length; i++) {
    coins.push(...generateCoinsForPlatform(platforms[i], 0));
  }

  return {
    phase: "countdown",
    countdownValue: 3,
    countdownTimer: 0,
    deathPauseTimer: 0,
    gameTime: 0,

    playerX: 50,
    playerY: baseY - PLAYER.height,
    playerVY: 0,
    playerWidth: PLAYER.width,
    playerHeight: PLAYER.height,
    isGrounded: true,
    coyoteTimer: 0,
    jumpBuffered: false,
    jumpBufferTimer: 0,
    jumpReleased: true,
    wasGrounded: true,
    deathRotation: 0,
    runAnimPhase: 0,
    airTime: 0,

    camX: 0,
    camY: 0,
    camTargetY: 0,
    shakeAmount: 0,
    shakeTimer: 0,

    platforms,
    obstacles: [],
    coins,
    particles: [],
    floatingTexts: [],

    distance: 0,
    coinCount: 0,
    coinStreak: 0,
    bestDistance: 0,
    bestCoins: 0,

    currentGravity: PHYSICS.baseGravity,
    currentSpeed: PHYSICS.moveSpeed,
    localGravityMult: 1,

    stars: generateStars(80, canvasW, canvasH),
    bgLayersFar: generateBuildingLayer(60, 60, 150, -200, 30),
    bgLayersMid: generateBuildingLayer(50, 80, 200, -200, 20),
    bgLayersNear: generateBuildingLayer(40, 100, 260, -200, 15),
    trailTimer: 0,

    canvasW,
    canvasH,
  };
}

// ============================================================
// INPUT MANAGER
// ============================================================

interface InputState {
  jumpPressed: boolean;
  jumpDown: boolean;
  jumpReleasedThisFrame: boolean;
}

function createInputManager(canvas: HTMLCanvasElement): {
  state: InputState;
  destroy: () => void;
} {
  const state: InputState = {
    jumpPressed: false,
    jumpDown: false,
    jumpReleasedThisFrame: false,
  };

  const onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    state.jumpPressed = true;
    state.jumpDown = true;
    state.jumpReleasedThisFrame = false;
  };

  const onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    state.jumpDown = false;
    state.jumpReleasedThisFrame = true;
  };

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    state.jumpPressed = true;
    state.jumpDown = true;
    state.jumpReleasedThisFrame = false;
  };

  const onMouseUp = () => {
    state.jumpDown = false;
    state.jumpReleasedThisFrame = true;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
      if (!e.repeat) {
        state.jumpPressed = true;
        state.jumpDown = true;
        state.jumpReleasedThisFrame = false;
      }
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
      state.jumpDown = false;
      state.jumpReleasedThisFrame = true;
    }
  };

  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd, { passive: false });
  canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  const destroy = () => {
    canvas.removeEventListener("touchstart", onTouchStart);
    canvas.removeEventListener("touchend", onTouchEnd);
    canvas.removeEventListener("touchcancel", onTouchEnd);
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };

  return { state, destroy };
}

// ============================================================
// UPDATE LOGIC
// ============================================================

function updateCountdown(gs: GameState, dt: number): void {
  gs.countdownTimer += dt;
  if (gs.countdownTimer >= 1) {
    gs.countdownTimer -= 1;
    gs.countdownValue--;
    if (gs.countdownValue < 0) {
      gs.phase = "playing";
    }
  }
}

function doJump(gs: GameState): void {
  gs.playerVY = PHYSICS.jumpVelocity;
  gs.isGrounded = false;
  gs.coyoteTimer = 0;
  gs.jumpBuffered = false;
  gs.jumpReleased = false;
  gs.airTime = 0;
  emitJumpParticles(gs.particles, gs.playerX + gs.playerWidth / 2, gs.playerY + gs.playerHeight);
}

function updatePlaying(gs: GameState, input: InputState, dt: number): void {
  gs.gameTime += dt;

  // ---- Difficulty scaling ----
  gs.currentGravity = getCurrentGravity(gs.distance);
  gs.currentSpeed = getCurrentSpeed(gs.distance);

  const effectiveGravity = gs.currentGravity * gs.localGravityMult;

  // ---- Jump buffering ----
  if (input.jumpPressed) {
    gs.jumpBuffered = true;
    gs.jumpBufferTimer = PHYSICS.jumpBufferTime;
    input.jumpPressed = false;
  }
  if (gs.jumpBuffered) {
    gs.jumpBufferTimer -= dt;
    if (gs.jumpBufferTimer <= 0) {
      gs.jumpBuffered = false;
    }
  }

  // ---- Jump execution (with coyote time) ----
  const canJump = gs.isGrounded || gs.coyoteTimer > 0;
  if (gs.jumpBuffered && canJump) {
    doJump(gs);
  }

  // ---- Variable jump height (short hop on release) ----
  if (input.jumpReleasedThisFrame && gs.playerVY < 0 && !gs.jumpReleased) {
    gs.playerVY *= PHYSICS.shortHopCutoff;
    gs.jumpReleased = true;
    input.jumpReleasedThisFrame = false;
  }

  // ---- Extended jump (hold for floatier apex) ----
  if (input.jumpDown && gs.playerVY < 0 && gs.playerVY > PHYSICS.jumpVelocity * 0.3) {
    gs.playerVY += effectiveGravity * 0.25 * dt;
  }

  // ---- Gravity ----
  gs.playerVY += effectiveGravity * dt;
  gs.playerVY = Math.min(gs.playerVY, PHYSICS.terminalVelocity);

  // ---- Movement ----
  gs.playerX += gs.currentSpeed * dt;
  gs.playerY += gs.playerVY * dt;

  // ---- Track airtime ----
  if (!gs.isGrounded) {
    gs.airTime += dt;
    gs.coyoteTimer -= dt;
  }

  // ---- Animation ----
  if (gs.isGrounded) {
    gs.runAnimPhase += dt * (gs.currentSpeed / 40);
  }

  // ---- Platform collision ----
  gs.wasGrounded = gs.isGrounded;
  gs.isGrounded = false;
  gs.localGravityMult = 1;

  for (let i = 0; i < gs.platforms.length; i++) {
    const p = gs.platforms[i];

    if (p.type === "crumbling" && p.touched && p.crumbleTimer <= 0) continue;

    const px = gs.playerX;
    const py = gs.playerY;
    const pw = gs.playerWidth;
    const ph = gs.playerHeight;

    if (
      px + pw > p.x + 4 &&
      px < p.x + p.width - 4 &&
      py + ph >= p.y &&
      py + ph <= p.y + 18 &&
      gs.playerVY >= 0
    ) {
      gs.playerY = p.y - ph;
      gs.isGrounded = true;
      gs.coyoteTimer = PHYSICS.coyoteTime;

      // Landing effects
      if (!gs.wasGrounded && gs.playerVY > 50) {
        const impactForce = clamp(gs.playerVY / 600, 0.2, 1);
        emitLandParticles(gs.particles, px + pw / 2, p.y, impactForce);

        if (gs.playerVY > 400) {
          gs.shakeAmount = clamp(gs.playerVY / 400, 0.5, 3);
          gs.shakeTimer = 0.06;
        }
      }

      // Long jump bonus!
      if (!gs.wasGrounded && gs.airTime > 0.7) {
        const bonusText = gs.airTime > 1.2 ? "AMAZING JUMP!" : "GREAT JUMP!";
        const bonusColor = gs.airTime > 1.2 ? "#ffffff" : COLORS.accent;
        addFloatingText(
          gs.floatingTexts,
          px + pw / 2, py - 20,
          bonusText, bonusColor, 1.2
        );
        emitLongJumpParticles(gs.particles, px + pw / 2, py + ph / 2);
        gs.coinCount += gs.airTime > 1.2 ? 3 : 1;
      }

      // Reset airtime on landing
      gs.airTime = 0;

      // Handle special platform types
      if (p.type === "bouncy") {
        gs.playerVY = PHYSICS.bounceVelocity;
        gs.isGrounded = false;
        gs.coyoteTimer = 0;
        gs.airTime = 0;
        emitBounceParticles(gs.particles, px + pw / 2, p.y);
      } else {
        gs.playerVY = 0;
      }

      if (p.type === "crumbling" && !p.touched) {
        p.touched = true;
      }

      if (p.type === "low-gravity") {
        gs.localGravityMult = PHYSICS.lowGravityMult;
      } else if (p.type === "high-gravity") {
        gs.localGravityMult = PHYSICS.highGravityMult;
      }

      break;
    }
  }

  // ---- Crumbling platform update ----
  for (const p of gs.platforms) {
    if (p.type === "crumbling" && p.touched && p.crumbleTimer > 0) {
      p.crumbleTimer -= dt;
      p.y = p.originalY + (Math.random() - 0.5) * 4;
      if (p.crumbleTimer <= 0) {
        emitCrumbleParticles(gs.particles, p.x, p.y, p.width);
      }
    }
  }

  // ---- Obstacle collision ----
  for (const obs of gs.obstacles) {
    if (rectsOverlap(
      gs.playerX, gs.playerY, gs.playerWidth, gs.playerHeight,
      obs.x, obs.y, obs.width, obs.height
    )) {
      killPlayer(gs);
      return;
    }
  }

  // ---- Coin collection ----
  for (const coin of gs.coins) {
    if (coin.collected) continue;
    const dx = gs.playerX + gs.playerWidth / 2 - coin.x;
    const dy = gs.playerY + gs.playerHeight / 2 - coin.y;
    const r = LEVEL.coinCollectRadius;
    if (dx * dx + dy * dy < r * r) {
      coin.collected = true;
      gs.coinCount++;
      gs.coinStreak++;
      emitCoinParticles(gs.particles, coin.x, coin.y);

      // Streak bonus text
      if (gs.coinStreak >= 3) {
        const streakText = gs.coinStreak >= 6 ? `x${gs.coinStreak} STREAK!` : `x${gs.coinStreak}`;
        const streakColor = gs.coinStreak >= 6 ? "#ffffff" : COLORS.coin;
        addFloatingText(gs.floatingTexts, coin.x, coin.y - 15, streakText, streakColor, 0.8);
        // Bonus coins for streaks
        if (gs.coinStreak >= 6) {
          gs.coinCount += 2;
        }
      } else {
        addFloatingText(gs.floatingTexts, coin.x, coin.y - 10, "+1", COLORS.coin, 0.5);
      }
    }
  }

  // Reset coin streak when grounded and no coins nearby
  if (gs.isGrounded && !gs.wasGrounded) {
    gs.coinStreak = 0;
  }

  // ---- Fell off screen ----
  if (gs.playerY > gs.camY + gs.canvasH + 100) {
    killPlayer(gs);
    return;
  }

  // ---- Camera ----
  const targetCamX = gs.playerX - gs.canvasW * 0.3;
  gs.camX = lerp(gs.camX, targetCamX, 1 - Math.pow(0.001, dt));

  gs.camTargetY = gs.playerY - gs.canvasH * 0.5;
  gs.camTargetY = clamp(gs.camTargetY, -200, gs.canvasH * LEVEL.baseY - gs.canvasH * 0.4);
  gs.camY = lerp(gs.camY, gs.camTargetY, 1 - Math.pow(0.02, dt));

  // ---- Screen shake decay ----
  if (gs.shakeTimer > 0) {
    gs.shakeTimer -= dt;
    if (gs.shakeTimer <= 0) {
      gs.shakeAmount = 0;
    }
  }

  // ---- Generate new platforms ahead ----
  const generateUntil = gs.camX + gs.canvasW * LEVEL.generateAhead;
  let lastPlat = gs.platforms[gs.platforms.length - 1];
  while (lastPlat && lastPlat.x + lastPlat.width < generateUntil) {
    const dist = lastPlat.x + lastPlat.width;
    const newPlat = generatePlatform(lastPlat.x, lastPlat.width, lastPlat.y, gs.canvasH, dist);
    gs.platforms.push(newPlat);

    const obs = generateObstacleForPlatform(newPlat, dist);
    if (obs) gs.obstacles.push(obs);
    gs.coins.push(...generateCoinsForPlatform(newPlat, dist));

    lastPlat = newPlat;
  }

  // ---- Prune behind camera ----
  const pruneX = gs.camX - 300;
  while (gs.platforms.length > 0 && gs.platforms[0].x + gs.platforms[0].width < pruneX) {
    gs.platforms.shift();
  }
  while (gs.obstacles.length > 0 && gs.obstacles[0].x + gs.obstacles[0].width < pruneX) {
    gs.obstacles.shift();
  }
  while (gs.coins.length > 0 && gs.coins[0].x < pruneX) {
    gs.coins.shift();
  }

  // ---- Trail particles ----
  gs.trailTimer -= dt;
  if (gs.trailTimer <= 0 && !gs.isGrounded) {
    emitTrailParticle(gs.particles, gs.playerX, gs.playerY + gs.playerHeight / 2, gs.currentSpeed);
    gs.trailTimer = 0.04;
  } else if (gs.trailTimer <= 0 && gs.isGrounded) {
    if (gs.currentSpeed > PHYSICS.moveSpeed * 1.3) {
      emitTrailParticle(gs.particles, gs.playerX - 5, gs.playerY + gs.playerHeight, gs.currentSpeed * 0.5);
      gs.trailTimer = 0.06;
    } else {
      gs.trailTimer = 0.12;
    }
  }

  // ---- Update particles and floating texts ----
  updateParticles(gs.particles, dt);
  updateFloatingTexts(gs.floatingTexts, dt);

  // ---- Score ----
  gs.distance = Math.max(gs.distance, gs.playerX / 10);
}

function killPlayer(gs: GameState): void {
  gs.phase = "dead";
  gs.deathPauseTimer = 1.2;
  gs.deathRotation = 0;
  emitDeathParticles(gs.particles, gs.playerX + gs.playerWidth / 2, gs.playerY + gs.playerHeight / 2);
  gs.shakeAmount = 3;
  gs.shakeTimer = 0.1;

  if (gs.distance > gs.bestDistance) gs.bestDistance = gs.distance;
  if (gs.coinCount > gs.bestCoins) gs.bestCoins = gs.coinCount;
}

function updateDead(gs: GameState, dt: number): void {
  gs.deathPauseTimer -= dt;
  gs.deathRotation += dt * 5;
  gs.playerVY += gs.currentGravity * 0.5 * dt;
  gs.playerY += gs.playerVY * dt;

  if (gs.shakeTimer > 0) {
    gs.shakeTimer -= dt;
    if (gs.shakeTimer <= 0) gs.shakeAmount = 0;
  }

  updateParticles(gs.particles, dt);
  updateFloatingTexts(gs.floatingTexts, dt);

  if (gs.deathPauseTimer <= 0) {
    gs.phase = "gameover";
  }
}

// ============================================================
// RENDERING
// ============================================================

function getShakeOffset(gs: GameState): Vec2 {
  if (gs.shakeAmount <= 0) return { x: 0, y: 0 };
  return {
    x: (Math.random() - 0.5) * gs.shakeAmount * 2,
    y: (Math.random() - 0.5) * gs.shakeAmount * 2,
  };
}

function renderBackground(ctx: CanvasRenderingContext2D, gs: GameState, time: number): void {
  const { canvasW, canvasH } = gs;

  const distFactor = clamp(gs.distance / 5000, 0, 1);
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasH);
  gradient.addColorStop(0, lerpColor("#050510", "#0a0520", distFactor));
  gradient.addColorStop(0.6, lerpColor("#0a0a14", "#0f0818", distFactor));
  gradient.addColorStop(1, COLORS.bg);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasW, canvasH);

  for (const star of gs.stars) {
    const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.x);
    const alpha = star.brightness * twinkle;
    ctx.fillStyle = colorWithAlpha("#ffffff", alpha);
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Moon
  const moonY = lerp(canvasH * 0.4, canvasH * 0.08, clamp(gs.distance / 8000, 0, 1));
  const moonX = canvasW * 0.8;
  ctx.save();
  ctx.shadowColor = "#aaaadd";
  ctx.shadowBlur = 40;
  ctx.fillStyle = "#dddde8";
  ctx.beginPath();
  ctx.arc(moonX, moonY, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#bbbbc5";
  ctx.beginPath();
  ctx.arc(moonX - 5, moonY - 5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(moonX + 8, moonY + 3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(moonX - 3, moonY + 8, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  renderBuildingLayer(ctx, gs.bgLayersFar, gs.camX * 0.05, canvasH, "#0c0c14", 0.03, time);
  renderBuildingLayer(ctx, gs.bgLayersMid, gs.camX * 0.15, canvasH, "#0e0e18", 0.06, time);
  renderBuildingLayer(ctx, gs.bgLayersNear, gs.camX * 0.3, canvasH, "#111120", 0.1, time);

  const horizonGrad = ctx.createLinearGradient(0, canvasH * 0.65, 0, canvasH);
  horizonGrad.addColorStop(0, "transparent");
  horizonGrad.addColorStop(1, colorWithAlpha(COLORS.accent, 0.04));
  ctx.fillStyle = horizonGrad;
  ctx.fillRect(0, canvasH * 0.65, canvasW, canvasH * 0.35);
}

function lerpColor(c1: string, c2: string, t: number): string {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  const r = Math.round(lerp(a.r, b.r, t));
  const g = Math.round(lerp(a.g, b.g, t));
  const bl = Math.round(lerp(a.b, b.b, t));
  return `rgb(${r},${g},${bl})`;
}

function renderBuildingLayer(
  ctx: CanvasRenderingContext2D,
  buildings: BuildingSilhouette[],
  scrollX: number,
  canvasH: number,
  color: string,
  windowBrightness: number,
  time: number
): void {
  const totalWidth = buildings.reduce((sum, b) => sum + b.width + 20, 0);
  const offset = ((scrollX % totalWidth) + totalWidth) % totalWidth;

  ctx.fillStyle = color;
  for (const b of buildings) {
    const x = b.x - offset;
    const wrappedX = ((x % totalWidth) + totalWidth) % totalWidth - 200;
    const y = canvasH - b.height;

    ctx.fillRect(wrappedX, y, b.width, b.height);

    if (b.hasAntenna) {
      ctx.fillRect(wrappedX + b.width / 2 - 1, y - 15, 2, 15);
      if (Math.sin(time * 2 + b.x) > 0.5) {
        ctx.fillStyle = "#ff3333";
        ctx.beginPath();
        ctx.arc(wrappedX + b.width / 2, y - 15, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
      }
    }

    ctx.fillStyle = colorWithAlpha("#ffdd88", windowBrightness);
    const winW = 4;
    const winH = 5;
    const winSpaceX = (b.width - 8) / Math.max(1, b.windowCols);
    const winSpaceY = (b.height - 10) / Math.max(1, b.windowRows);
    for (let row = 0; row < b.windowRows; row++) {
      for (let col = 0; col < b.windowCols; col++) {
        if (Math.sin(b.x * 13 + row * 7 + col * 11) > 0.3) {
          ctx.fillRect(
            wrappedX + 4 + col * winSpaceX,
            y + 5 + row * winSpaceY,
            winW, winH
          );
        }
      }
    }
    ctx.fillStyle = color;
  }
}

function renderPlatforms(ctx: CanvasRenderingContext2D, gs: GameState): void {
  const viewLeft = gs.camX - 50;
  const viewRight = gs.camX + gs.canvasW + 50;

  for (const p of gs.platforms) {
    if (p.x + p.width < viewLeft || p.x > viewRight) continue;
    if (p.type === "crumbling" && p.touched && p.crumbleTimer <= 0) continue;

    let alpha = 1;
    if (p.type === "crumbling" && p.touched) {
      alpha = clamp(p.crumbleTimer / 0.3, 0.1, 1);
    }
    ctx.globalAlpha = alpha;

    ctx.fillStyle = "#12121a";
    ctx.fillRect(p.x, p.y, p.width, Math.min(p.height, 200));

    let edgeColor = COLORS.accent;
    let glowColor = COLORS.accent;
    switch (p.type) {
      case "crumbling": edgeColor = COLORS.crumbling; glowColor = COLORS.crumbling; break;
      case "bouncy": edgeColor = COLORS.bouncy; glowColor = COLORS.bouncy; break;
      case "low-gravity": edgeColor = COLORS.lowGravity; glowColor = COLORS.lowGravity; break;
      case "high-gravity": edgeColor = COLORS.highGravity; glowColor = COLORS.highGravity; break;
    }

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;
    ctx.fillStyle = edgeColor;
    ctx.fillRect(p.x, p.y, p.width, 2);
    ctx.restore();

    ctx.strokeStyle = colorWithAlpha(edgeColor, 0.15);
    ctx.lineWidth = 1;
    for (let lx = p.x + 12; lx < p.x + p.width - 12; lx += 22) {
      ctx.beginPath();
      ctx.moveTo(lx, p.y + 8);
      ctx.lineTo(lx + 10, p.y + 8);
      ctx.stroke();
    }

    if (p.type !== "normal") {
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = colorWithAlpha(edgeColor, 0.7);
      let label = "";
      switch (p.type) {
        case "crumbling": label = "FRAGILE"; break;
        case "bouncy": label = "BOUNCE"; break;
        case "low-gravity": label = "LOW-G"; break;
        case "high-gravity": label = "HI-G"; break;
      }
      ctx.fillText(label, p.x + p.width / 2, p.y + 20);
    }

    if (p.type === "low-gravity" || p.type === "high-gravity") {
      const fieldHeight = 60;
      const fieldColor = p.type === "low-gravity" ? COLORS.lowGravity : COLORS.highGravity;
      const fieldGrad = ctx.createLinearGradient(0, p.y - fieldHeight, 0, p.y);
      fieldGrad.addColorStop(0, "transparent");
      fieldGrad.addColorStop(1, colorWithAlpha(fieldColor, 0.08));
      ctx.fillStyle = fieldGrad;
      ctx.fillRect(p.x, p.y - fieldHeight, p.width, fieldHeight);

      const arrowDir = p.type === "low-gravity" ? -1 : 1;
      ctx.strokeStyle = colorWithAlpha(fieldColor, 0.3);
      ctx.lineWidth = 1.5;
      const arrowTime = gs.gameTime * 2;
      for (let ax = p.x + 20; ax < p.x + p.width - 20; ax += 30) {
        const ay = p.y - 15 - ((arrowTime * 20 + ax) % 40);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 4, ay - 6 * arrowDir);
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + 4, ay - 6 * arrowDir);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  }
}

function renderObstacles(ctx: CanvasRenderingContext2D, gs: GameState): void {
  const viewLeft = gs.camX - 50;
  const viewRight = gs.camX + gs.canvasW + 50;

  for (const obs of gs.obstacles) {
    if (obs.x + obs.width < viewLeft || obs.x > viewRight) continue;

    ctx.save();
    ctx.shadowColor = COLORS.barrierColor;
    ctx.shadowBlur = 8;

    ctx.fillStyle = COLORS.barrierColor;
    drawRoundedRect(ctx, obs.x, obs.y, obs.width, obs.height, 3);
    ctx.fill();

    // Danger stripe
    ctx.strokeStyle = colorWithAlpha("#ffffff", 0.3);
    ctx.lineWidth = 2;
    for (let sy = obs.y + 4; sy < obs.y + obs.height; sy += 8) {
      ctx.beginPath();
      ctx.moveTo(obs.x + 2, sy);
      ctx.lineTo(obs.x + obs.width - 2, sy + 4);
      ctx.stroke();
    }

    ctx.restore();
  }
}

function renderCoins(ctx: CanvasRenderingContext2D, gs: GameState, time: number): void {
  const viewLeft = gs.camX - 50;
  const viewRight = gs.camX + gs.canvasW + 50;

  for (const coin of gs.coins) {
    if (coin.collected) continue;
    if (coin.x < viewLeft || coin.x > viewRight) continue;

    const bobY = coin.y + Math.sin(time * 3 + coin.bobPhase) * 4;

    ctx.save();
    ctx.shadowColor = COLORS.coin;
    ctx.shadowBlur = 12;
    ctx.fillStyle = COLORS.coin;
    ctx.beginPath();
    ctx.arc(coin.x, bobY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Inner shine
    ctx.fillStyle = "#fff8e0";
    ctx.beginPath();
    ctx.arc(coin.x - 2, bobY - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function renderPlayer(ctx: CanvasRenderingContext2D, gs: GameState): void {
  ctx.save();

  const x = gs.playerX;
  const y = gs.playerY;
  const w = gs.playerWidth;
  const h = gs.playerHeight;

  if (gs.phase === "dead" || gs.phase === "gameover") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(gs.deathRotation);
    ctx.translate(-cx, -cy);
    ctx.globalAlpha = Math.max(0.2, 1 - (1.2 - gs.deathPauseTimer) / 1.2);
  }

  ctx.shadowColor = COLORS.accent;
  ctx.shadowBlur = 15;

  let playerColor = COLORS.accent;
  if (gs.localGravityMult < 0.5) {
    playerColor = COLORS.lowGravity;
  } else if (gs.localGravityMult > 1.5) {
    playerColor = COLORS.highGravity;
  }

  ctx.fillStyle = playerColor;
  ctx.strokeStyle = playerColor;
  ctx.lineWidth = 3;

  // Head
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 8, 7, 0, Math.PI * 2);
  ctx.fill();

  // Torso
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 15);
  ctx.lineTo(x + w / 2, y + h * 0.6);
  ctx.stroke();

  if (!gs.isGrounded) {
    // Air pose
    const spread = gs.playerVY < 0 ? 8 : 5;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + h * 0.6);
    ctx.lineTo(x + w / 2 - spread, y + h - 3);
    ctx.moveTo(x + w / 2, y + h * 0.6);
    ctx.lineTo(x + w / 2 + spread, y + h - 3);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    if (gs.playerVY < -100) {
      ctx.moveTo(x + w / 2, y + 18);
      ctx.lineTo(x + w / 2 - 8, y + 8);
      ctx.moveTo(x + w / 2, y + 18);
      ctx.lineTo(x + w / 2 + 8, y + 8);
    } else {
      ctx.moveTo(x + w / 2, y + 18);
      ctx.lineTo(x + w / 2 - 10, y + 28);
      ctx.moveTo(x + w / 2, y + 18);
      ctx.lineTo(x + w / 2 + 6, y + 30);
    }
    ctx.stroke();
  } else {
    // Running legs
    const phase = gs.runAnimPhase;
    const legSwing = Math.sin(phase) * 9;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + h * 0.6);
    ctx.lineTo(x + w / 2 + legSwing, y + h - 2);
    ctx.moveTo(x + w / 2, y + h * 0.6);
    ctx.lineTo(x + w / 2 - legSwing, y + h - 2);
    ctx.stroke();

    // Running arms
    const armSwing = Math.sin(phase + Math.PI) * 8;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 18);
    ctx.lineTo(x + w / 2 + armSwing, y + 28);
    ctx.moveTo(x + w / 2, y + 18);
    ctx.lineTo(x + w / 2 - armSwing, y + 28);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    const alpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (0.5 + alpha * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function renderFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]): void {
  for (const ft of texts) {
    const alpha = clamp(ft.timer / ft.maxTimer, 0, 1);
    const scale = 0.8 + alpha * 0.4;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = ft.color;
    ctx.font = `bold ${Math.floor(14 * scale)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}

function renderHUD(ctx: CanvasRenderingContext2D, gs: GameState): void {
  const { canvasW } = gs;
  const padding = 20;

  ctx.save();

  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(0, 0, canvasW, 55);

  // Distance
  ctx.shadowColor = COLORS.accent;
  ctx.shadowBlur = 8;
  ctx.fillStyle = COLORS.accent;
  ctx.font = "bold 22px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`${Math.floor(gs.distance)}m`, canvasW - padding, 35);

  // Coins
  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.coin;
  ctx.shadowColor = COLORS.coin;
  ctx.fillText(`${gs.coinCount}`, padding + 20, 35);
  ctx.beginPath();
  ctx.arc(padding + 8, 30, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff8e0";
  ctx.beginPath();
  ctx.arc(padding + 6.5, 28.5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Gravity indicator
  ctx.shadowBlur = 0;
  ctx.textAlign = "center";
  ctx.font = "bold 12px monospace";
  const gravLabel = getGravityLabel(gs.currentGravity * gs.localGravityMult);
  const gForce = (gs.currentGravity * gs.localGravityMult) / PHYSICS.baseGravity;

  let gravColor = COLORS.accent;
  if (gs.localGravityMult < 0.5) gravColor = COLORS.lowGravity;
  else if (gs.localGravityMult > 1.5) gravColor = COLORS.highGravity;
  else if (gForce > 1.5) gravColor = COLORS.highGravity;

  ctx.fillStyle = gravColor;
  ctx.shadowColor = gravColor;
  ctx.shadowBlur = 6;
  ctx.fillText(`GRAVITY: ${gForce.toFixed(2)}g`, canvasW / 2, 22);
  ctx.font = "10px monospace";
  ctx.fillStyle = COLORS.textDim;
  ctx.shadowBlur = 0;
  ctx.fillText(gravLabel, canvasW / 2, 38);

  ctx.restore();
}

function renderCountdown(ctx: CanvasRenderingContext2D, gs: GameState, time: number): void {
  const { canvasW, canvasH } = gs;

  ctx.save();

  ctx.fillStyle = colorWithAlpha(COLORS.bg, 0.6);
  ctx.fillRect(0, 0, canvasW, canvasH);

  const displayText = gs.countdownValue > 0 ? `${gs.countdownValue}` : "RUN!";
  const progress = gs.countdownTimer;
  const scale = 1 + (1 - progress) * 0.5;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.shadowColor = COLORS.accent;
  ctx.shadowBlur = 30 + Math.sin(time * 8) * 10;
  ctx.fillStyle = COLORS.accent;

  ctx.font = `bold ${Math.floor(80 * scale)}px monospace`;
  ctx.globalAlpha = 0.5 + progress * 0.5;
  ctx.fillText(displayText, canvasW / 2, canvasH / 2);

  ctx.globalAlpha = 0.7;
  ctx.shadowBlur = 0;
  ctx.font = "16px monospace";
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText("Tap to jump", canvasW / 2, canvasH / 2 + 60);

  ctx.fillStyle = COLORS.accent;
  ctx.shadowColor = COLORS.accent;
  ctx.shadowBlur = 15;
  ctx.font = "bold 28px monospace";
  ctx.fillText("ROOFTOP RUN", canvasW / 2, canvasH / 2 - 80);
  ctx.shadowBlur = 0;
  ctx.font = "12px monospace";
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText("Gravity increases as you run further!", canvasW / 2, canvasH / 2 - 55);

  ctx.restore();
}

function renderGameOver(ctx: CanvasRenderingContext2D, gs: GameState, time: number): void {
  const { canvasW, canvasH } = gs;

  ctx.save();

  ctx.fillStyle = COLORS.deathOverlay;
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.textAlign = "center";

  ctx.shadowColor = COLORS.accent;
  ctx.shadowBlur = 25;
  ctx.fillStyle = COLORS.accent;
  ctx.font = "bold 48px monospace";
  ctx.fillText("GAME OVER", canvasW / 2, canvasH / 2 - 60);

  ctx.shadowBlur = 0;

  ctx.font = "bold 24px monospace";
  ctx.fillStyle = COLORS.text;
  ctx.fillText(`${Math.floor(gs.distance)}m`, canvasW / 2, canvasH / 2);

  ctx.font = "16px monospace";
  ctx.fillStyle = COLORS.coin;
  ctx.fillText(`${gs.coinCount} coins`, canvasW / 2, canvasH / 2 + 32);

  ctx.fillStyle = COLORS.textDim;
  ctx.font = "13px monospace";
  const finalGravity = (gs.currentGravity / PHYSICS.baseGravity).toFixed(1);
  ctx.fillText(`Max gravity: ${finalGravity}g (${getGravityLabel(gs.currentGravity)})`, canvasW / 2, canvasH / 2 + 60);

  if (gs.bestDistance > gs.distance || gs.bestCoins > gs.coinCount) {
    ctx.fillStyle = colorWithAlpha(COLORS.accent, 0.7);
    ctx.font = "12px monospace";
    ctx.fillText(`Best: ${Math.floor(gs.bestDistance)}m / ${gs.bestCoins} coins`, canvasW / 2, canvasH / 2 + 85);
  }

  const pulse = 0.5 + 0.5 * Math.sin(time * 3);
  ctx.fillStyle = colorWithAlpha(COLORS.accent, 0.4 + pulse * 0.6);
  ctx.font = "bold 18px monospace";
  ctx.fillText("TAP TO RESTART", canvasW / 2, canvasH / 2 + 120);

  ctx.restore();
}

// ============================================================
// MAIN GAME LOOP
// ============================================================

function runGame(canvas: HTMLCanvasElement, onGameOver?: (score: number) => void): () => void {
  const ctx = canvas.getContext("2d")!;
  let destroyed = false;

  const dpr = window.devicePixelRatio || 1;

  function resizeCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  const { w, h } = resizeCanvas();
  let gs = createInitialState(w, h);
  const input = createInputManager(canvas);
  let scoreSubmitted = false;

  function restart() {
    const { w, h } = resizeCanvas();
    const bestDist = gs.bestDistance;
    const bestCoins = gs.bestCoins;
    gs = createInitialState(w, h);
    gs.bestDistance = bestDist;
    gs.bestCoins = bestCoins;
    scoreSubmitted = false;
  }

  const onResize = () => {
    const { w, h } = resizeCanvas();
    gs.canvasW = w;
    gs.canvasH = h;
    gs.stars = generateStars(80, w, h);
  };
  window.addEventListener("resize", onResize);

  let lastTime = performance.now();

  function loop(now: number) {
    if (destroyed) return;

    const rawDt = (now - lastTime) / 1000;
    const dt = Math.min(rawDt, 0.033);
    lastTime = now;

    switch (gs.phase) {
      case "countdown":
        updateCountdown(gs, dt);
        break;
      case "playing":
        updatePlaying(gs, input.state, dt);
        input.state.jumpPressed = false;
        input.state.jumpReleasedThisFrame = false;
        break;
      case "dead":
        updateDead(gs, dt);
        input.state.jumpPressed = false;
        input.state.jumpReleasedThisFrame = false;
        break;
      case "gameover":
        if (!scoreSubmitted) {
          scoreSubmitted = true;
          onGameOver?.(Math.floor(gs.distance));
        }
        if (input.state.jumpPressed) {
          input.state.jumpPressed = false;
          restart();
        }
        break;
    }

    ctx.clearRect(0, 0, gs.canvasW, gs.canvasH);

    renderBackground(ctx, gs, now / 1000);

    const shake = getShakeOffset(gs);
    ctx.save();
    ctx.translate(-gs.camX + shake.x, -gs.camY + shake.y);

    renderPlatforms(ctx, gs);
    renderObstacles(ctx, gs);
    renderCoins(ctx, gs, now / 1000);
    renderPlayer(ctx, gs);
    renderParticles(ctx, gs.particles);
    renderFloatingTexts(ctx, gs.floatingTexts);

    ctx.restore();

    if (gs.phase === "playing" || gs.phase === "dead") {
      renderHUD(ctx, gs);
    }

    if (gs.phase === "countdown") {
      renderCountdown(ctx, gs, now / 1000);
    } else if (gs.phase === "gameover") {
      renderGameOver(ctx, gs, now / 1000);
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  return () => {
    destroyed = true;
    input.destroy();
    window.removeEventListener("resize", onResize);
  };
}

// ============================================================
// REACT COMPONENT
// ============================================================

export default function RooftopRun({ onGameOver }: { onGameOver?: (score: number) => void } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cleanup = runGame(canvas, (score) => onGameOverRef.current?.(score));
    return cleanup;
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: COLORS.bg,
        position: "relative",
        overflow: "hidden",
        touchAction: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
