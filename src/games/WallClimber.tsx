import { useRef, useEffect, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GamePhase = "countdown" | "playing" | "dead";
type BackgroundZone = "street" | "building" | "clouds" | "sky" | "space";

interface Platform {
  x: number;
  y: number;
  width: number;
  side: "left" | "right";
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
  type: "jump" | "land" | "trail" | "death" | "spark";
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  side: "left" | "right";
  onPlatform: boolean;
  wallSliding: boolean;
  wallSlideTimer: number;
  facingRight: boolean;
  jumpSquash: number;
  landStretch: number;
}

// A segment defines a set of platforms using relative coordinates.
// yOffset is from the segment top (0 = top of segment, positive = down).
// xOffset is distance from the wall edge inward.
interface SegmentPlatformDef {
  side: "left" | "right";
  xOffset: number;
  yOffset: number;
  width: number;
}

interface SegmentDef {
  height: number; // total vertical height of this segment
  platforms: SegmentPlatformDef[];
  difficulty: number; // 0 = easy, 1 = medium, 2 = hard
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CYAN = "#00e5ff";
const CYAN_DIM = "rgba(0,229,255,0.3)";
const BG_COLOR = "#0a0a0f";
const WALL_COLOR = "#0d0d16";
const WALL_WIDTH = 28;
const PLAYER_W = 14;
const PLAYER_H = 22;
const BASE_GRAVITY = 620;
const MAX_GRAVITY = 900; // capped lower so game stays playable
const JUMP_VY = -520;
const JUMP_VX = 380;
const WALL_SLIDE_SPEED = 40;
const WALL_SLIDE_DURATION = 0.6;
const PLATFORM_HEIGHT = 8;
const COUNTDOWN_DURATION = 3;
const DEATH_FREEZE_TIME = 0.6;
const LS_KEY = "wallclimber_highscore";

// Physics validation:
// Max jump height = v^2 / (2*g) = 520^2 / (2*620) = 218px at base gravity.
// Jump velocity scales with sqrt(gravity/BASE_GRAVITY), so effective max
// height stays ~218px regardless of gravity. Higher gravity still makes
// falls faster and requires quicker reactions.
// With 20% safety margin: keep platform gaps under ~174px.
// All segments are designed within this limit.

// Background zone thresholds (in "meters climbed")
const ZONE_BUILDING = 0;
const ZONE_CLOUDS = 60;
const ZONE_SKY = 150;
const ZONE_SPACE = 300;

// ---------------------------------------------------------------------------
// Pre-designed level segments
// ---------------------------------------------------------------------------
// Each segment is a hand-crafted pattern of platforms.
// Platforms alternate left-right to create a zigzag climbing pattern.
// All vertical gaps are <= 140px (well within the 174px base-gravity max).
// At max gravity (120px safe max), the hardest segments use 110px gaps.

const SEGMENTS: SegmentDef[] = [
  // === EASY segments (difficulty 0) ===
  // Segment 0: Simple zigzag, close together
  {
    height: 400,
    difficulty: 0,
    platforms: [
      { side: "left",  xOffset: 10, yOffset: 350, width: 80 },
      { side: "right", xOffset: 10, yOffset: 260, width: 80 },
      { side: "left",  xOffset: 10, yOffset: 170, width: 80 },
      { side: "right", xOffset: 10, yOffset: 80,  width: 80 },
    ],
  },
  // Segment 1: Slightly wider spacing, still easy
  {
    height: 400,
    difficulty: 0,
    platforms: [
      { side: "right", xOffset: 5,  yOffset: 340, width: 85 },
      { side: "left",  xOffset: 5,  yOffset: 240, width: 85 },
      { side: "right", xOffset: 5,  yOffset: 140, width: 85 },
      { side: "left",  xOffset: 5,  yOffset: 40,  width: 85 },
    ],
  },
  // Segment 2: Three-step easy climb
  {
    height: 350,
    difficulty: 0,
    platforms: [
      { side: "left",  xOffset: 8,  yOffset: 300, width: 80 },
      { side: "right", xOffset: 8,  yOffset: 200, width: 80 },
      { side: "left",  xOffset: 8,  yOffset: 100, width: 80 },
    ],
  },
  // Segment 3: Gentle staircase
  {
    height: 450,
    difficulty: 0,
    platforms: [
      { side: "right", xOffset: 10, yOffset: 380, width: 90 },
      { side: "left",  xOffset: 10, yOffset: 290, width: 90 },
      { side: "right", xOffset: 10, yOffset: 200, width: 90 },
      { side: "left",  xOffset: 10, yOffset: 110, width: 90 },
      { side: "right", xOffset: 10, yOffset: 20,  width: 90 },
    ],
  },

  // === MEDIUM segments (difficulty 1) ===
  // Segment 4: Tighter zigzag
  {
    height: 400,
    difficulty: 1,
    platforms: [
      { side: "left",  xOffset: 15, yOffset: 350, width: 70 },
      { side: "right", xOffset: 15, yOffset: 240, width: 65 },
      { side: "left",  xOffset: 20, yOffset: 130, width: 65 },
      { side: "right", xOffset: 10, yOffset: 30,  width: 70 },
    ],
  },
  // Segment 5: Offset platforms
  {
    height: 420,
    difficulty: 1,
    platforms: [
      { side: "right", xOffset: 20, yOffset: 370, width: 65 },
      { side: "left",  xOffset: 5,  yOffset: 270, width: 70 },
      { side: "right", xOffset: 25, yOffset: 160, width: 60 },
      { side: "left",  xOffset: 10, yOffset: 60,  width: 70 },
    ],
  },
  // Segment 6: Alternating offset climb
  {
    height: 380,
    difficulty: 1,
    platforms: [
      { side: "left",  xOffset: 5,  yOffset: 330, width: 75 },
      { side: "right", xOffset: 30, yOffset: 240, width: 60 },
      { side: "left",  xOffset: 10, yOffset: 140, width: 70 },
      { side: "right", xOffset: 25, yOffset: 50,  width: 65 },
    ],
  },
  // Segment 7: Quick zigzag with smaller platforms
  {
    height: 350,
    difficulty: 1,
    platforms: [
      { side: "left",  xOffset: 10, yOffset: 300, width: 60 },
      { side: "right", xOffset: 10, yOffset: 210, width: 60 },
      { side: "left",  xOffset: 10, yOffset: 120, width: 60 },
      { side: "right", xOffset: 10, yOffset: 30,  width: 60 },
    ],
  },
  // Segment 8: Wide platforms, bigger gaps
  {
    height: 380,
    difficulty: 1,
    platforms: [
      { side: "right", xOffset: 5,  yOffset: 330, width: 80 },
      { side: "left",  xOffset: 5,  yOffset: 200, width: 80 },
      { side: "right", xOffset: 5,  yOffset: 70,  width: 80 },
    ],
  },

  // === HARD segments (difficulty 2) ===
  // Segment 9: Narrower platforms, tighter timing
  {
    height: 400,
    difficulty: 2,
    platforms: [
      { side: "left",  xOffset: 20, yOffset: 350, width: 55 },
      { side: "right", xOffset: 25, yOffset: 250, width: 50 },
      { side: "left",  xOffset: 15, yOffset: 150, width: 55 },
      { side: "right", xOffset: 20, yOffset: 50,  width: 50 },
    ],
  },
  // Segment 10: Staggered climb
  {
    height: 440,
    difficulty: 2,
    platforms: [
      { side: "right", xOffset: 30, yOffset: 390, width: 50 },
      { side: "left",  xOffset: 10, yOffset: 300, width: 55 },
      { side: "right", xOffset: 15, yOffset: 210, width: 50 },
      { side: "left",  xOffset: 25, yOffset: 120, width: 50 },
      { side: "right", xOffset: 10, yOffset: 30,  width: 55 },
    ],
  },
  // Segment 11: Compact but demanding
  {
    height: 350,
    difficulty: 2,
    platforms: [
      { side: "left",  xOffset: 25, yOffset: 310, width: 50 },
      { side: "right", xOffset: 20, yOffset: 220, width: 50 },
      { side: "left",  xOffset: 20, yOffset: 130, width: 50 },
      { side: "right", xOffset: 25, yOffset: 40,  width: 50 },
    ],
  },
  // Segment 12: Long reach climb
  {
    height: 420,
    difficulty: 2,
    platforms: [
      { side: "right", xOffset: 10, yOffset: 370, width: 55 },
      { side: "left",  xOffset: 30, yOffset: 270, width: 50 },
      { side: "right", xOffset: 20, yOffset: 170, width: 50 },
      { side: "left",  xOffset: 10, yOffset: 70,  width: 55 },
    ],
  },
  // Segment 13: Tight switchbacks
  {
    height: 360,
    difficulty: 2,
    platforms: [
      { side: "left",  xOffset: 15, yOffset: 320, width: 55 },
      { side: "right", xOffset: 30, yOffset: 230, width: 50 },
      { side: "left",  xOffset: 25, yOffset: 140, width: 50 },
      { side: "right", xOffset: 15, yOffset: 50,  width: 55 },
    ],
  },
  // Segment 14: Endurance climb
  {
    height: 500,
    difficulty: 2,
    platforms: [
      { side: "right", xOffset: 10, yOffset: 440, width: 55 },
      { side: "left",  xOffset: 20, yOffset: 350, width: 50 },
      { side: "right", xOffset: 15, yOffset: 260, width: 50 },
      { side: "left",  xOffset: 10, yOffset: 170, width: 55 },
      { side: "right", xOffset: 20, yOffset: 80,  width: 50 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function randRange(lo: number, hi: number) {
  return lo + Math.random() * (hi - lo);
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function getZone(meters: number): BackgroundZone {
  if (meters >= ZONE_SPACE) return "space";
  if (meters >= ZONE_SKY) return "sky";
  if (meters >= ZONE_CLOUDS) return "clouds";
  if (meters >= ZONE_BUILDING) return "building";
  return "street";
}

function getGravity(meters: number): number {
  // Gravity ramps from BASE to MAX over 600m (slower ramp than before)
  const t = clamp(meters / 600, 0, 1);
  return BASE_GRAVITY + (MAX_GRAVITY - BASE_GRAVITY) * t * t;
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function lerpColor(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WallClimber() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem(LS_KEY) || "0", 10) || 0; } catch { return 0; }
  });
  const [phase, setPhase] = useState<GamePhase>("countdown");
  const [countdownNum, setCountdownNum] = useState(3);

  // Persist high score
  const saveHighScore = useCallback((s: number) => {
    try { localStorage.setItem(LS_KEY, String(s)); } catch { /* noop */ }
    setHighScore(s);
  }, []);

  // Suppress unused-variable warnings for React state used only indirectly
  void score;
  void phase;
  void countdownNum;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const container = containerRef.current!;
    const ctx = canvas.getContext("2d")!;

    // Sizing: always measure from the container div, never window
    // Canvas buffer is scaled by DPR for crisp rendering, but game logic
    // uses CSS-pixel dimensions.
    let csW = 0;
    let csH = 0;
    const W = () => csW;
    const H = () => csH;
    let initialized = false;

    // ------ Game State ------
    let gamePhase: GamePhase = "countdown";
    let countdownTimer = COUNTDOWN_DURATION;
    let deathTimer = 0;
    let running = true;
    let lastTime = performance.now();
    let cameraY = 0;
    let cameraTargetY = 0;
    let highestY = 0;
    let currentHighScore = highScore;
    let gameTime = 0;

    const particles: Particle[] = [];
    const platforms: Platform[] = [];

    // Segment generation tracking
    let highestGeneratedY = 0;
    let segmentsPlaced = 0;
    let lastPlacedSide: "left" | "right" = "left"; // side of the topmost platform placed so far
    let lastTopYOffset = 0; // yOffset of the topmost platform in the last segment
    // Pre-shuffled segment queues by difficulty
    let easyQueue: SegmentDef[] = [];
    let mediumQueue: SegmentDef[] = [];
    let hardQueue: SegmentDef[] = [];

    function refillQueues() {
      const easy = SEGMENTS.filter(s => s.difficulty === 0);
      const medium = SEGMENTS.filter(s => s.difficulty === 1);
      const hard = SEGMENTS.filter(s => s.difficulty === 2);
      easyQueue = shuffleArray(easy);
      mediumQueue = shuffleArray(medium);
      hardQueue = shuffleArray(hard);
    }

    function pickSegment(): SegmentDef {
      // First 4 segments: easy only
      // Next 6: mix easy + medium
      // After 10: mix medium + hard
      // After 20: mostly hard
      let seg: SegmentDef | undefined;

      if (segmentsPlaced < 4) {
        if (easyQueue.length === 0) refillQueues();
        seg = easyQueue.pop();
      } else if (segmentsPlaced < 10) {
        // 60% easy, 40% medium
        if (Math.random() < 0.6) {
          if (easyQueue.length === 0) refillQueues();
          seg = easyQueue.pop();
        } else {
          if (mediumQueue.length === 0) refillQueues();
          seg = mediumQueue.pop();
        }
      } else if (segmentsPlaced < 20) {
        // 30% easy, 40% medium, 30% hard
        const roll = Math.random();
        if (roll < 0.3) {
          if (easyQueue.length === 0) refillQueues();
          seg = easyQueue.pop();
        } else if (roll < 0.7) {
          if (mediumQueue.length === 0) refillQueues();
          seg = mediumQueue.pop();
        } else {
          if (hardQueue.length === 0) refillQueues();
          seg = hardQueue.pop();
        }
      } else {
        // 10% easy, 30% medium, 60% hard
        const roll = Math.random();
        if (roll < 0.1) {
          if (easyQueue.length === 0) refillQueues();
          seg = easyQueue.pop();
        } else if (roll < 0.4) {
          if (mediumQueue.length === 0) refillQueues();
          seg = mediumQueue.pop();
        } else {
          if (hardQueue.length === 0) refillQueues();
          seg = hardQueue.pop();
        }
      }

      if (!seg) {
        refillQueues();
        seg = easyQueue.pop()!;
      }
      return seg;
    }

    // Wall decorations
    interface WallDecor {
      y: number;
      side: "left" | "right";
      kind: "window" | "pipe" | "brick" | "vent" | "ledgeline";
      x: number;
      w: number;
      h: number;
    }
    const wallDecors: WallDecor[] = [];
    let highestDecorY = 0;

    // Stars for space background
    interface BgStar { x: number; y: number; size: number; brightness: number; }
    const bgStars: BgStar[] = [];
    for (let i = 0; i < 120; i++) {
      bgStars.push({
        x: Math.random(),
        y: Math.random() * 20000 - 10000,
        size: 0.5 + Math.random() * 2,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }

    const player: Player = {
      x: 0, y: 0, width: PLAYER_W, height: PLAYER_H,
      vx: 0, vy: 0, side: "left",
      onPlatform: false, wallSliding: false, wallSlideTimer: 0,
      facingRight: true, jumpSquash: 0, landStretch: 0,
    };

    // ------ Initialization ------
    function initGame() {
      gamePhase = "countdown";
      countdownTimer = COUNTDOWN_DURATION;
      deathTimer = 0;
      gameTime = 0;
      setScore(0);
      setPhase("countdown");
      setCountdownNum(3);

      particles.length = 0;
      platforms.length = 0;
      wallDecors.length = 0;

      const h = H();
      const startY = h * 0.7;
      highestY = startY;
      highestGeneratedY = startY;
      highestDecorY = startY + 200;
      segmentsPlaced = 0;
      lastPlacedSide = "left"; // starting platform is on the left
      lastTopYOffset = 0; // starting platform is at baseWorldY + 0
      refillQueues();

      // Starting platform (wide, safe, centered-left)
      platforms.push({
        x: WALL_WIDTH + 4,
        y: startY,
        width: 90,
        side: "left",
      });

      // Player on starting platform
      player.x = WALL_WIDTH + 30;
      player.y = startY - PLAYER_H;
      player.vx = 0;
      player.vy = 0;
      player.side = "left";
      player.onPlatform = true;
      player.wallSliding = false;
      player.wallSlideTimer = 0;
      player.facingRight = true;
      player.jumpSquash = 0;
      player.landStretch = 0;

      cameraY = startY - h * 0.6;
      cameraTargetY = cameraY;

      // Generate initial platforms above
      generateSegmentsUpTo(startY - h * 2);
      generateDecorsUpTo(startY - h * 2);
    }

    // ------ Segment-based Generation ------
    function metersFromY(worldY: number): number {
      const h = H();
      return Math.max(0, Math.floor((h * 0.7 - worldY) / 8));
    }

    function placeSegment(segment: SegmentDef, baseWorldY: number, mirror: boolean) {
      const w = W();
      const playableWidth = w - WALL_WIDTH * 2;

      for (const pdef of segment.platforms) {
        const side = mirror
          ? (pdef.side === "left" ? "right" : "left")
          : pdef.side;
        const platWidth = Math.min(pdef.width, playableWidth - 10);
        let x: number;
        if (side === "left") {
          x = WALL_WIDTH + 4 + pdef.xOffset;
        } else {
          x = w - WALL_WIDTH - platWidth - 4 - pdef.xOffset;
        }
        // Clamp to playable area
        x = Math.max(WALL_WIDTH + 2, Math.min(x, w - WALL_WIDTH - platWidth - 2));

        platforms.push({
          x,
          y: baseWorldY + pdef.yOffset,
          width: platWidth,
          side,
        });
      }
    }

    function generateSegmentsUpTo(targetY: number) {
      while (highestGeneratedY > targetY) {
        // Pick a segment, then try up to 4 more if the cross-boundary gap
        // is unreasonable. The real gap between the previous top platform
        // and the new bottom platform = lastTopYOffset + seg.height - bottomYOffset.
        let seg: SegmentDef = pickSegment();
        for (let attempt = 0; attempt < 4; attempt++) {
          const bottomYOffset = Math.max(...seg.platforms.map(p => p.yOffset));
          const gap = lastTopYOffset + seg.height - bottomYOffset;
          if (gap >= 50 && gap <= 160) break;
          seg = pickSegment();
        }

        // Mirror the segment if its bottom platform is on the same side as
        // the previous segment's top platform — ensures zigzag continuity.
        const bottomPlatform = seg.platforms.reduce((a, b) =>
          b.yOffset > a.yOffset ? b : a
        );
        const needsMirror = bottomPlatform.side === lastPlacedSide;

        highestGeneratedY -= seg.height;
        placeSegment(seg, highestGeneratedY, needsMirror);
        segmentsPlaced++;

        // Track the topmost platform for the next boundary check
        const topPlatform = seg.platforms.reduce((a, b) =>
          b.yOffset < a.yOffset ? b : a
        );
        lastPlacedSide = needsMirror
          ? (topPlatform.side === "left" ? "right" : "left")
          : topPlatform.side;
        lastTopYOffset = topPlatform.yOffset;
      }
    }

    function generateDecorsUpTo(targetY: number) {
      const w = W();
      while (highestDecorY > targetY) {
        highestDecorY -= randRange(30, 70);
        const side: "left" | "right" = Math.random() < 0.5 ? "left" : "right";
        const roll = Math.random();
        let kind: WallDecor["kind"];
        let dw: number, dh: number, dx: number;

        if (roll < 0.35) {
          kind = "window";
          dw = 10 + Math.random() * 6;
          dh = 12 + Math.random() * 6;
          dx = side === "left" ? 4 + Math.random() * 6 : w - WALL_WIDTH + 4 + Math.random() * 6;
        } else if (roll < 0.55) {
          kind = "pipe";
          dw = 3;
          dh = 30 + Math.random() * 40;
          dx = side === "left" ? WALL_WIDTH - 6 : w - WALL_WIDTH + 2;
        } else if (roll < 0.75) {
          kind = "vent";
          dw = 8;
          dh = 6;
          dx = side === "left" ? 6 : w - WALL_WIDTH + 6;
        } else if (roll < 0.88) {
          kind = "ledgeline";
          dw = WALL_WIDTH - 2;
          dh = 2;
          dx = side === "left" ? 1 : w - WALL_WIDTH + 1;
        } else {
          kind = "brick";
          dw = WALL_WIDTH - 4;
          dh = 8 + Math.random() * 4;
          dx = side === "left" ? 2 : w - WALL_WIDTH + 2;
        }

        wallDecors.push({ y: highestDecorY, side, kind, x: dx, w: dw, h: dh });
      }
    }

    // ------ Particles ------
    function spawnParticles(
      x: number, y: number, count: number,
      type: Particle["type"],
      color: string,
      opts?: { vxRange?: number; vyRange?: number; vyBias?: number; sizeRange?: [number, number]; lifeRange?: [number, number] }
    ) {
      const vxR = opts?.vxRange ?? 120;
      const vyR = opts?.vyRange ?? 80;
      const vyB = opts?.vyBias ?? 0;
      const [sLo, sHi] = opts?.sizeRange ?? [1.5, 4];
      const [lLo, lHi] = opts?.lifeRange ?? [0.2, 0.5];
      for (let i = 0; i < count; i++) {
        const life = randRange(lLo, lHi);
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * vxR,
          vy: vyB + (Math.random() - 0.5) * vyR,
          life, maxLife: life,
          color,
          size: randRange(sLo, sHi),
          type,
        });
      }
    }

    // ------ Input ------
    let tapSide: "left" | "right" | null = null;

    function handleInput(clientX: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      tapSide = x < rect.width / 2 ? "left" : "right";
    }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      if (e.touches.length > 0) {
        handleInput(e.touches[0].clientX);
      }
    }

    function onClick(e: MouseEvent) {
      handleInput(e.clientX);
    }

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("click", onClick);

    // ------ Jump ------
    function doJump(targetSide: "left" | "right") {
      const meters = metersFromY(player.y);
      const gravity = getGravity(meters);

      // Scale jump power with gravity so platforms remain reachable.
      // sqrt scaling keeps jump height proportional.
      const gravityScale = Math.sqrt(gravity / BASE_GRAVITY);
      const jumpVy = JUMP_VY * gravityScale;
      const jumpVx = JUMP_VX * Math.min(gravityScale, 1.3);

      player.vx = targetSide === "right" ? jumpVx : -jumpVx;
      player.vy = jumpVy;
      player.onPlatform = false;
      player.wallSliding = false;
      player.wallSlideTimer = 0;
      player.facingRight = targetSide === "right";
      player.jumpSquash = 1;

      // Jump particles
      spawnParticles(player.x + PLAYER_W / 2, player.y + PLAYER_H, 8, "jump", CYAN, {
        vxRange: 150, vyRange: 40, vyBias: 30, sizeRange: [2, 4], lifeRange: [0.3, 0.6],
      });
    }

    // ------ Update ------
    function update(dt: number) {
      gameTime += dt;
      const w = W();
      const h = H();

      // --- Countdown ---
      if (gamePhase === "countdown") {
        countdownTimer -= dt;
        const num = Math.ceil(countdownTimer);
        setCountdownNum(Math.max(0, num));
        if (countdownTimer <= 0) {
          gamePhase = "playing";
          setPhase("playing");
        }
        tapSide = null;
        cameraTargetY = player.y - h * 0.6;
        cameraY = cameraTargetY;
        return;
      }

      // --- Death ---
      if (gamePhase === "dead") {
        deathTimer -= dt;
        updateParticles(dt);
        if (tapSide !== null && deathTimer <= 0) {
          initGame();
        }
        tapSide = null;
        return;
      }

      // --- Process input ---
      if (tapSide !== null) {
        if (player.onPlatform || player.wallSliding) {
          doJump(tapSide);
        }
        tapSide = null;
      }

      // --- Physics ---
      const meters = metersFromY(player.y);
      const gravity = getGravity(meters);

      if (!player.onPlatform) {
        // Wall sliding check
        const atLeftWall = player.x <= WALL_WIDTH + 1;
        const atRightWall = player.x + PLAYER_W >= w - WALL_WIDTH - 1;

        if ((atLeftWall || atRightWall) && player.vy > 0) {
          if (!player.wallSliding) {
            player.wallSliding = true;
            player.wallSlideTimer = WALL_SLIDE_DURATION;
            player.side = atLeftWall ? "left" : "right";
            player.vy = WALL_SLIDE_SPEED;
            // Wall contact particles
            spawnParticles(
              atLeftWall ? WALL_WIDTH + 2 : w - WALL_WIDTH - 2,
              player.y + PLAYER_H / 2, 4, "spark", CYAN,
              { vxRange: 40, vyRange: 20, sizeRange: [1, 2], lifeRange: [0.15, 0.3] }
            );
          }
          if (player.wallSliding) {
            player.wallSlideTimer -= dt;
            player.vy = WALL_SLIDE_SPEED;
            if (player.wallSlideTimer <= 0) {
              player.wallSliding = false;
            }
            // Slide trail particles
            if (Math.random() < 0.3) {
              spawnParticles(
                atLeftWall ? WALL_WIDTH + 3 : w - WALL_WIDTH - 3,
                player.y + PLAYER_H, 1, "trail", CYAN_DIM,
                { vxRange: 10, vyRange: 10, vyBias: -20, sizeRange: [1, 2], lifeRange: [0.2, 0.4] }
              );
            }
          }
        } else {
          player.wallSliding = false;
        }

        if (!player.wallSliding) {
          player.vy += gravity * dt;
        }

        player.x += player.vx * dt;
        player.y += player.vy * dt;

        // Air trail particles
        if (Math.abs(player.vy) > 100 && Math.random() < 0.4) {
          spawnParticles(
            player.x + PLAYER_W / 2, player.y + PLAYER_H,
            1, "trail", hexToRgba(CYAN, 0.2),
            { vxRange: 20, vyRange: 10, sizeRange: [1, 2.5], lifeRange: [0.15, 0.3] }
          );
        }

        // Wall collision
        if (player.x < WALL_WIDTH) {
          player.x = WALL_WIDTH;
          player.vx = 0;
          player.side = "left";
        }
        if (player.x + PLAYER_W > w - WALL_WIDTH) {
          player.x = w - WALL_WIDTH - PLAYER_W;
          player.vx = 0;
          player.side = "right";
        }

        // Platform collision (when falling)
        if (player.vy > 0) {
          for (const p of platforms) {
            const py = player.y + PLAYER_H;
            const prevPy = py - player.vy * dt;
            if (
              player.x + PLAYER_W > p.x &&
              player.x < p.x + p.width &&
              py >= p.y &&
              prevPy < p.y + 12
            ) {
              // Land!
              player.y = p.y - PLAYER_H;
              player.vy = 0;
              player.vx = 0;
              player.onPlatform = true;
              player.wallSliding = false;
              player.side = p.side;
              player.landStretch = 1;

              // Landing particles
              spawnParticles(player.x + PLAYER_W / 2, p.y, 8, "land", CYAN, {
                vxRange: 100, vyRange: 30, vyBias: -20, sizeRange: [1.5, 3], lifeRange: [0.2, 0.4],
              });
              break;
            }
          }
        }
      }

      // Track height / score
      if (player.y < highestY) {
        highestY = player.y;
      }
      const heightScore = metersFromY(highestY);
      setScore(heightScore);
      if (heightScore > currentHighScore) {
        currentHighScore = heightScore;
        saveHighScore(heightScore);
      }

      // Player animation timers
      if (player.jumpSquash > 0) player.jumpSquash = Math.max(0, player.jumpSquash - dt * 6);
      if (player.landStretch > 0) player.landStretch = Math.max(0, player.landStretch - dt * 5);

      // Camera
      const lookAhead = player.vy < -100 ? player.vy * 0.15 : 0;
      cameraTargetY = player.y - h * 0.55 + lookAhead;
      if (cameraTargetY < cameraY) {
        cameraY += (cameraTargetY - cameraY) * 5 * dt;
      } else {
        cameraY += (cameraTargetY - cameraY) * 2.5 * dt;
      }

      // Generate more content above
      generateSegmentsUpTo(cameraY - 400);
      generateDecorsUpTo(cameraY - 400);

      // Cleanup off-screen entities below
      const bottomCull = cameraY + h + 300;
      for (let i = platforms.length - 1; i >= 0; i--) {
        if (platforms[i].y > bottomCull) platforms.splice(i, 1);
      }
      for (let i = wallDecors.length - 1; i >= 0; i--) {
        if (wallDecors[i].y > bottomCull) wallDecors.splice(i, 1);
      }

      // Death check: fell below screen
      if (player.y > cameraY + h + 60) {
        die();
        return;
      }

      // Particles
      updateParticles(dt);
    }

    function die() {
      gamePhase = "dead";
      setPhase("dead");
      deathTimer = DEATH_FREEZE_TIME;

      // Death explosion
      spawnParticles(player.x + PLAYER_W / 2, player.y + PLAYER_H / 2, 30, "death", CYAN, {
        vxRange: 300, vyRange: 300, sizeRange: [2, 6], lifeRange: [0.5, 1.5],
      });
      spawnParticles(player.x + PLAYER_W / 2, player.y + PLAYER_H / 2, 15, "death", "#ff4444", {
        vxRange: 200, vyRange: 200, sizeRange: [3, 7], lifeRange: [0.6, 1.2],
      });
    }

    function updateParticles(dt: number) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.type !== "spark") {
          p.vy += 180 * dt;
        }
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }

    // ------ Rendering ------
    function render() {
      const w = W();
      const h = H();
      const meters = metersFromY(player.y);
      const zone = getZone(meters);

      // Reset DPR transform at the start of each frame
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // --- Background ---
      renderBackground(w, h, zone, meters);

      ctx.save();
      ctx.translate(0, -cameraY);

      // --- Walls ---
      renderWalls(w, h, zone);

      // --- Platforms ---
      renderPlatforms(h);

      // --- Particles (world space) ---
      renderParticles();

      // --- Player ---
      if (gamePhase !== "dead") {
        renderPlayer();
      }

      ctx.restore();

      // --- HUD ---
      renderHUD(w, h, meters);

      // --- Countdown ---
      if (gamePhase === "countdown") {
        renderCountdown(w, h);
      }

      // --- Death screen ---
      if (gamePhase === "dead") {
        renderDeathScreen(w, h);
      }
    }

    function renderBackground(w: number, h: number, zone: BackgroundZone, meters: number) {
      let grad: CanvasGradient;
      switch (zone) {
        case "street":
        case "building": {
          grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, "#08080e");
          grad.addColorStop(1, "#0a0a14");
          ctx.fillStyle = grad;
          break;
        }
        case "clouds": {
          const t = clamp((meters - ZONE_CLOUDS) / (ZONE_SKY - ZONE_CLOUDS), 0, 1);
          grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, lerpColor("#08080e", "#0a0a20", t));
          grad.addColorStop(1, lerpColor("#0a0a14", "#080818", t));
          ctx.fillStyle = grad;
          break;
        }
        case "sky": {
          const t = clamp((meters - ZONE_SKY) / (ZONE_SPACE - ZONE_SKY), 0, 1);
          grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, lerpColor("#0a0a20", "#020010", t));
          grad.addColorStop(1, lerpColor("#080818", "#050515", t));
          ctx.fillStyle = grad;
          break;
        }
        case "space": {
          grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, "#010008");
          grad.addColorStop(1, "#030012");
          ctx.fillStyle = grad;
          break;
        }
      }
      ctx.fillRect(0, 0, w, h);

      // Stars (space zone)
      if (zone === "sky" || zone === "space") {
        const starAlpha = zone === "space" ? 1 : clamp((meters - ZONE_SKY) / 50, 0, 0.5);
        for (const star of bgStars) {
          const sx = star.x * w;
          const sy = ((star.y - cameraY * 0.05) % h + h) % h;
          ctx.globalAlpha = star.brightness * starAlpha;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Cloud wisps
      if (zone === "clouds" || zone === "sky") {
        const cloudAlpha = zone === "clouds" ? 0.06 : 0.03;
        ctx.globalAlpha = cloudAlpha;
        ctx.fillStyle = "#aaddff";
        for (let i = 0; i < 5; i++) {
          const cx = (Math.sin(gameTime * 0.1 + i * 2.3) * 0.3 + 0.5) * w;
          const cy = ((i * 170 - cameraY * 0.08) % h + h) % h;
          ctx.beginPath();
          ctx.ellipse(cx, cy, 100 + i * 20, 15 + i * 5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    function renderWalls(w: number, h: number, _zone: BackgroundZone) {
      const top = cameraY - 100;
      const visH = h + 200;

      // Wall base
      ctx.fillStyle = WALL_COLOR;
      ctx.fillRect(0, top, WALL_WIDTH, visH);
      ctx.fillRect(w - WALL_WIDTH, top, WALL_WIDTH, visH);

      // Wall decorations
      for (const d of wallDecors) {
        if (d.y < cameraY - 50 || d.y > cameraY + h + 50) continue;
        switch (d.kind) {
          case "window": {
            ctx.fillStyle = "rgba(0,180,255,0.04)";
            ctx.fillRect(d.x, d.y, d.w, d.h);
            ctx.strokeStyle = "rgba(0,229,255,0.08)";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(d.x, d.y, d.w, d.h);
            ctx.beginPath();
            ctx.moveTo(d.x + d.w / 2, d.y);
            ctx.lineTo(d.x + d.w / 2, d.y + d.h);
            ctx.moveTo(d.x, d.y + d.h / 2);
            ctx.lineTo(d.x + d.w, d.y + d.h / 2);
            ctx.stroke();
            break;
          }
          case "pipe": {
            ctx.fillStyle = "rgba(100,120,140,0.15)";
            ctx.fillRect(d.x, d.y, d.w, d.h);
            ctx.fillStyle = "rgba(150,170,190,0.1)";
            ctx.fillRect(d.x + 0.5, d.y, 1, d.h);
            break;
          }
          case "vent": {
            ctx.fillStyle = "rgba(80,90,100,0.12)";
            ctx.fillRect(d.x, d.y, d.w, d.h);
            for (let s = 0; s < d.w; s += 3) {
              ctx.fillStyle = "rgba(40,45,50,0.15)";
              ctx.fillRect(d.x + s, d.y, 1, d.h);
            }
            break;
          }
          case "ledgeline": {
            ctx.fillStyle = "rgba(100,110,120,0.1)";
            ctx.fillRect(d.x, d.y, d.w, d.h);
            break;
          }
          case "brick": {
            ctx.fillStyle = "rgba(60,50,45,0.06)";
            ctx.fillRect(d.x, d.y, d.w, d.h);
            ctx.strokeStyle = "rgba(80,70,60,0.06)";
            ctx.lineWidth = 0.5;
            const rows = Math.floor(d.h / 4);
            for (let r = 0; r < rows; r++) {
              const ry = d.y + r * 4;
              ctx.beginPath();
              ctx.moveTo(d.x, ry);
              ctx.lineTo(d.x + d.w, ry);
              ctx.stroke();
              const offset = r % 2 === 0 ? 0 : d.w * 0.4;
              ctx.beginPath();
              ctx.moveTo(d.x + offset + d.w * 0.5, ry);
              ctx.lineTo(d.x + offset + d.w * 0.5, ry + 4);
              ctx.stroke();
            }
            break;
          }
        }
      }

      // Glowing wall edges
      ctx.shadowColor = CYAN;
      ctx.shadowBlur = 10;
      ctx.fillStyle = CYAN;
      ctx.fillRect(WALL_WIDTH - 1, top, 1.5, visH);
      ctx.fillRect(w - WALL_WIDTH - 0.5, top, 1.5, visH);
      ctx.shadowBlur = 0;

      // Subtle glow aura
      const glowGrad = ctx.createLinearGradient(WALL_WIDTH, 0, WALL_WIDTH + 20, 0);
      glowGrad.addColorStop(0, hexToRgba(CYAN, 0.04));
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(WALL_WIDTH, top, 20, visH);

      const glowGrad2 = ctx.createLinearGradient(w - WALL_WIDTH, 0, w - WALL_WIDTH - 20, 0);
      glowGrad2.addColorStop(0, hexToRgba(CYAN, 0.04));
      glowGrad2.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad2;
      ctx.fillRect(w - WALL_WIDTH - 20, top, 20, visH);
    }

    function renderPlatforms(h: number) {
      for (const p of platforms) {
        if (p.y < cameraY - 50 || p.y > cameraY + h + 50) continue;

        // Solid platform with glow
        ctx.fillStyle = "#141422";
        ctx.fillRect(p.x, p.y, p.width, PLATFORM_HEIGHT);
        ctx.shadowColor = CYAN;
        ctx.shadowBlur = 8;
        ctx.fillStyle = CYAN;
        ctx.fillRect(p.x, p.y, p.width, 2);
        ctx.shadowBlur = 0;
        // Side tick marks
        ctx.fillStyle = hexToRgba(CYAN, 0.3);
        ctx.fillRect(p.x, p.y, 2, PLATFORM_HEIGHT);
        ctx.fillRect(p.x + p.width - 2, p.y, 2, PLATFORM_HEIGHT);
      }
    }

    function renderParticles() {
      for (const p of particles) {
        const alpha = clamp(p.life / p.maxLife, 0, 1);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (p.type === "spark") {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.5 + alpha * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    function renderPlayer() {
      const px = player.x;
      const py = player.y;

      // Squash/stretch
      const squash = player.jumpSquash;
      const stretch = player.landStretch;
      let scaleX = 1;
      let scaleY = 1;
      if (squash > 0) {
        scaleX = 1 + squash * 0.3;
        scaleY = 1 - squash * 0.2;
      } else if (stretch > 0) {
        scaleX = 1 - stretch * 0.15;
        scaleY = 1 + stretch * 0.2;
      }

      ctx.save();
      ctx.translate(px + PLAYER_W / 2, py + PLAYER_H);
      ctx.scale(scaleX, scaleY);
      ctx.translate(-(px + PLAYER_W / 2), -(py + PLAYER_H));

      // Character glow
      ctx.shadowColor = CYAN;
      ctx.shadowBlur = 14;

      // Head
      ctx.fillStyle = CYAN;
      ctx.beginPath();
      ctx.arc(px + PLAYER_W / 2, py + 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // Eye (direction indicator)
      const eyeX = player.facingRight ? px + PLAYER_W / 2 + 2 : px + PLAYER_W / 2 - 2;
      ctx.fillStyle = "#0a0a0f";
      ctx.beginPath();
      ctx.arc(eyeX, py + 4, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px + PLAYER_W / 2, py + 10);
      ctx.lineTo(px + PLAYER_W / 2, py + 16);
      ctx.stroke();

      // Arms
      const armAngle = player.onPlatform ? 0.3 : Math.sin(gameTime * 8) * 0.5;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + PLAYER_W / 2, py + 11);
      ctx.lineTo(px + PLAYER_W / 2 - 5, py + 13 + Math.sin(armAngle + Math.PI) * 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + PLAYER_W / 2, py + 11);
      ctx.lineTo(px + PLAYER_W / 2 + 5, py + 13 + Math.sin(armAngle) * 3);
      ctx.stroke();

      // Legs
      const legSpread = player.onPlatform ? 0 : Math.sin(gameTime * 10) * 2;
      ctx.beginPath();
      ctx.moveTo(px + PLAYER_W / 2, py + 16);
      ctx.lineTo(px + PLAYER_W / 2 - 4 + legSpread, py + PLAYER_H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + PLAYER_W / 2, py + 16);
      ctx.lineTo(px + PLAYER_W / 2 + 4 - legSpread, py + PLAYER_H);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function renderHUD(w: number, h: number, meters: number) {
      ctx.save();

      // Score (height in meters)
      ctx.shadowColor = CYAN;
      ctx.shadowBlur = 10;
      ctx.fillStyle = CYAN;
      ctx.font = "bold 22px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`${metersFromY(highestY)}m`, 15, 32);

      // High score
      ctx.shadowBlur = 0;
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(136,136,160,0.6)";
      ctx.textAlign = "right";
      ctx.fillText(`BEST: ${currentHighScore}m`, w - 15, 32);

      // Gravity indicator
      const gravity = getGravity(meters);
      const gravPercent = Math.round(((gravity - BASE_GRAVITY) / (MAX_GRAVITY - BASE_GRAVITY)) * 100);
      ctx.textAlign = "right";
      ctx.font = "11px 'JetBrains Mono', monospace";
      const gravColor = gravPercent < 30 ? CYAN : gravPercent < 70 ? "#ffaa00" : "#ff4444";
      ctx.fillStyle = hexToRgba(gravColor, 0.5);
      ctx.fillText(`G: ${(gravity / BASE_GRAVITY).toFixed(1)}x`, w - 15, 48);

      // Zone indicator
      const zone = getZone(meters);
      const zoneName = zone === "street" ? "STREET" : zone === "building" ? "BUILDING" : zone === "clouds" ? "CLOUDS" : zone === "sky" ? "SKY" : "SPACE";
      ctx.fillStyle = "rgba(136,136,160,0.3)";
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(zoneName, w / 2, 20);

      // Touch zone indicators (subtle) when player can jump
      if (gamePhase === "playing" && (player.onPlatform || player.wallSliding)) {
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = CYAN;
        // Left half hint
        ctx.beginPath();
        ctx.moveTo(20, h / 2 - 20);
        ctx.lineTo(10, h / 2);
        ctx.lineTo(20, h / 2 + 20);
        ctx.fill();
        // Right half hint
        ctx.beginPath();
        ctx.moveTo(w - 20, h / 2 - 20);
        ctx.lineTo(w - 10, h / 2);
        ctx.lineTo(w - 20, h / 2 + 20);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    }

    function renderCountdown(w: number, h: number) {
      const num = Math.ceil(countdownTimer);
      const frac = countdownTimer - Math.floor(countdownTimer);

      // Darkened overlay
      ctx.fillStyle = "rgba(10,10,15,0.5)";
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (num > 0) {
        const scale = 1 + (1 - frac) * 0.5;
        const alpha = frac;

        ctx.globalAlpha = alpha;
        ctx.shadowColor = CYAN;
        ctx.shadowBlur = 30;
        ctx.fillStyle = CYAN;
        ctx.font = `bold ${Math.round(72 * scale)}px 'Inter', sans-serif`;
        ctx.fillText(String(num), w / 2, h / 2);
        ctx.shadowBlur = 0;
      } else {
        const alpha = countdownTimer + 1;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.shadowColor = CYAN;
        ctx.shadowBlur = 40;
        ctx.fillStyle = CYAN;
        ctx.font = `bold 80px 'Inter', sans-serif`;
        ctx.fillText("GO!", w / 2, h / 2);
        ctx.shadowBlur = 0;
      }

      // Instructions
      ctx.globalAlpha = 0.6;
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#8888a0";
      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillText("Tap LEFT or RIGHT to wall-jump", w / 2, h / 2 + 70);
      ctx.font = "13px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(136,136,160,0.5)";
      ctx.fillText("Climb as high as you can!", w / 2, h / 2 + 95);

      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function renderDeathScreen(w: number, h: number) {
      // Overlay
      ctx.fillStyle = "rgba(10,10,15,0.75)";
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.textAlign = "center";

      // GAME OVER
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "#ff4444";
      ctx.font = "bold 40px 'Inter', sans-serif";
      ctx.fillText("GAME OVER", w / 2, h / 2 - 50);
      ctx.shadowBlur = 0;

      // Height
      ctx.shadowColor = CYAN;
      ctx.shadowBlur = 10;
      ctx.fillStyle = CYAN;
      ctx.font = "bold 24px 'JetBrains Mono', monospace";
      const totalScore = metersFromY(highestY);
      ctx.fillText(`${totalScore}m`, w / 2, h / 2);
      ctx.shadowBlur = 0;

      // New high score?
      if (totalScore >= currentHighScore && totalScore > 0) {
        ctx.shadowColor = "#ffdd00";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "#ffdd00";
        ctx.font = "bold 16px 'Inter', sans-serif";
        ctx.fillText("NEW BEST!", w / 2, h / 2 + 35);
        ctx.shadowBlur = 0;
      }

      // Restart prompt
      if (deathTimer <= 0) {
        ctx.fillStyle = "rgba(136,136,160,0.5)";
        ctx.font = "16px 'Inter', sans-serif";
        ctx.shadowBlur = 0;
        ctx.fillText("Tap to restart", w / 2, h / 2 + 75);
      }

      // Gravity info (educational)
      const finalGravity = getGravity(metersFromY(highestY));
      ctx.fillStyle = "rgba(136,136,160,0.35)";
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.fillText(
        `Peak gravity: ${(finalGravity / BASE_GRAVITY).toFixed(1)}x`,
        w / 2, h / 2 + 105
      );

      ctx.restore();
    }

    // ------ Game Loop ------
    function loop(now: number) {
      if (!running) return;
      if (!initialized) {
        lastTime = now;
        requestAnimationFrame(loop);
        return;
      }
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;
      update(dt);
      render();
      requestAnimationFrame(loop);
    }

    // ResizeObserver to track container size
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.contentRect;
        const newW = Math.round(rect.width);
        const newH = Math.round(rect.height);
        if (newW <= 0 || newH <= 0) continue;

        if (csW !== newW || csH !== newH) {
          csW = newW;
          csH = newH;
          const dpr = window.devicePixelRatio || 1;
          canvas.width = newW * dpr;
          canvas.height = newH * dpr;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          initGame();
          initialized = true;
        } else if (!initialized) {
          initGame();
          initialized = true;
        }
      }
    });
    resizeObserver.observe(container);

    lastTime = performance.now();
    requestAnimationFrame(loop);

    return () => {
      running = false;
      resizeObserver.disconnect();
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("click", onClick);
    };
  }, [highScore, saveHighScore]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", maxWidth: "450px", margin: "0 auto", position: "relative", background: BG_COLOR, overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      />
    </div>
  );
}
