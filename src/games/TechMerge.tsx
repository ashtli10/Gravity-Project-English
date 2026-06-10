// Based on 2048 by Gabriele Cirulli (github.com/gabrielecirulli/2048), MIT License. Game logic ported faithfully; view re-themed.
//
// TECH MERGE 2200 — merge future technologies to reach the year 2200.
// The GameManager / Grid / Tile classes below are a direct TypeScript port of
// the original game logic (move/merge algorithm preserved exactly). The view
// layer is reimplemented in React; swipe input uses the same 10px threshold
// logic as the original keyboard_input_manager.js.

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Ported game logic (game_manager.js + grid.js + tile.js)
// ---------------------------------------------------------------------------

type Direction = 0 | 1 | 2 | 3; // 0: up, 1: right, 2: down, 3: left

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 4;
const START_TILES = 2;

let nextTileId = 1;

class Tile {
  readonly id: number; // stable identity for React keys / CSS transitions
  x: number;
  y: number;
  value: number;
  previousPosition: Position | null;
  mergedFrom: [Tile, Tile] | null; // Tracks tiles that merged together

  constructor(position: Position, value: number) {
    this.id = nextTileId++;
    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;

    this.previousPosition = null;
    this.mergedFrom = null;
  }

  savePosition(): void {
    this.previousPosition = { x: this.x, y: this.y };
  }

  updatePosition(position: Position): void {
    this.x = position.x;
    this.y = position.y;
  }
}

class Grid {
  readonly size: number;
  cells: (Tile | null)[][];

  constructor(size: number) {
    this.size = size;
    this.cells = this.empty();
  }

  // Build a grid of the specified size
  empty(): (Tile | null)[][] {
    const cells: (Tile | null)[][] = [];

    for (let x = 0; x < this.size; x++) {
      const row: (Tile | null)[] = (cells[x] = []);

      for (let y = 0; y < this.size; y++) {
        row.push(null);
      }
    }

    return cells;
  }

  // Find the first available random position
  randomAvailableCell(): Position | undefined {
    const cells = this.availableCells();

    if (cells.length) {
      return cells[Math.floor(Math.random() * cells.length)];
    }
    return undefined;
  }

  availableCells(): Position[] {
    const cells: Position[] = [];

    this.eachCell((x, y, tile) => {
      if (!tile) {
        cells.push({ x, y });
      }
    });

    return cells;
  }

  // Call callback for every cell
  eachCell(callback: (x: number, y: number, tile: Tile | null) => void): void {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        callback(x, y, this.cells[x][y]);
      }
    }
  }

  // Check if there are any cells available
  cellsAvailable(): boolean {
    return !!this.availableCells().length;
  }

  // Check if the specified cell is taken
  cellAvailable(cell: Position): boolean {
    return !this.cellOccupied(cell);
  }

  cellOccupied(cell: Position): boolean {
    return !!this.cellContent(cell);
  }

  cellContent(cell: Position): Tile | null {
    if (this.withinBounds(cell)) {
      return this.cells[cell.x][cell.y];
    }
    return null;
  }

  // Inserts a tile at its position
  insertTile(tile: Tile): void {
    this.cells[tile.x][tile.y] = tile;
  }

  removeTile(tile: Tile): void {
    this.cells[tile.x][tile.y] = null;
  }

  withinBounds(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < this.size &&
      position.y >= 0 &&
      position.y < this.size
    );
  }
}

class GameManager {
  readonly size: number;
  readonly startTiles: number = START_TILES;

  // Initialized by setup(), called from the constructor.
  grid!: Grid;
  score!: number;
  over!: boolean;
  won!: boolean;
  keepPlaying!: boolean;

  constructor(size: number) {
    this.size = size; // Size of the grid
    this.setup();
  }

  // Restart the game
  restart(): void {
    this.setup();
  }

  // Keep playing after winning (allows going over the 2048-equivalent tile)
  continueGame(): void {
    this.keepPlaying = true;
  }

  // Return true if the game is lost, or has won and the user hasn't kept playing
  isGameTerminated(): boolean {
    return this.over || (this.won && !this.keepPlaying);
  }

  // Set up the game
  setup(): void {
    this.grid = new Grid(this.size);
    this.score = 0;
    this.over = false;
    this.won = false;
    this.keepPlaying = false;

    // Add the initial tiles
    this.addStartTiles();
  }

  // Set up the initial tiles to start the game with
  addStartTiles(): void {
    for (let i = 0; i < this.startTiles; i++) {
      this.addRandomTile();
    }
  }

  // Adds a tile in a random position
  addRandomTile(): void {
    if (this.grid.cellsAvailable()) {
      const value = Math.random() < 0.9 ? 2 : 4;
      const cell = this.grid.randomAvailableCell();
      if (cell) {
        this.grid.insertTile(new Tile(cell, value));
      }
    }
  }

  // Save all tile positions and remove merger info
  prepareTiles(): void {
    this.grid.eachCell((_x, _y, tile) => {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });
  }

  // Move a tile and its representation
  moveTile(tile: Tile, cell: Position): void {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  }

  // Move tiles on the grid in the specified direction.
  // Returns true when at least one tile moved (the original signalled this
  // via the actuator instead).
  move(direction: Direction): boolean {
    // 0: up, 1: right, 2: down, 3: left
    if (this.isGameTerminated()) return false; // Don't do anything if the game's over

    const vector = this.getVector(direction);
    const traversals = this.buildTraversals(vector);
    let moved = false;

    // Save the current tile positions and remove merger information
    this.prepareTiles();

    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach((x) => {
      traversals.y.forEach((y) => {
        const cell = { x, y };
        const tile = this.grid.cellContent(cell);

        if (tile) {
          const positions = this.findFarthestPosition(cell, vector);
          const next = this.grid.cellContent(positions.next);

          // Only one merger per row traversal?
          if (next && next.value === tile.value && !next.mergedFrom) {
            const merged = new Tile(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next];

            this.grid.insertTile(merged);
            this.grid.removeTile(tile);

            // Converge the two tiles' positions
            tile.updatePosition(positions.next);

            // Update the score
            this.score += merged.value;

            // The mighty 2048 tile
            if (merged.value === 2048) this.won = true;
          } else {
            this.moveTile(tile, positions.farthest);
          }

          if (!this.positionsEqual(cell, tile)) {
            moved = true; // The tile moved from its original cell!
          }
        }
      });
    });

    if (moved) {
      this.addRandomTile();

      if (!this.movesAvailable()) {
        this.over = true; // Game over!
      }
    }

    return moved;
  }

  // Get the vector representing the chosen direction
  getVector(direction: Direction): Position {
    // Vectors representing tile movement
    const map: Record<Direction, Position> = {
      0: { x: 0, y: -1 }, // Up
      1: { x: 1, y: 0 }, // Right
      2: { x: 0, y: 1 }, // Down
      3: { x: -1, y: 0 }, // Left
    };

    return map[direction];
  }

  // Build a list of positions to traverse in the right order
  buildTraversals(vector: Position): { x: number[]; y: number[] } {
    const traversals: { x: number[]; y: number[] } = { x: [], y: [] };

    for (let pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
  }

  findFarthestPosition(
    cell: Position,
    vector: Position,
  ): { farthest: Position; next: Position } {
    let previous: Position;
    let current = cell;

    // Progress towards the vector direction until an obstacle is found
    do {
      previous = current;
      current = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(current) && this.grid.cellAvailable(current));

    return {
      farthest: previous,
      next: current, // Used to check if a merge is required
    };
  }

  movesAvailable(): boolean {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
  }

  // Check for available matches between tiles (more expensive check)
  tileMatchesAvailable(): boolean {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.grid.cellContent({ x, y });

        if (tile) {
          for (let direction = 0; direction < 4; direction++) {
            const vector = this.getVector(direction as Direction);
            const cell = { x: x + vector.x, y: y + vector.y };

            const other = this.grid.cellContent(cell);

            if (other && other.value === tile.value) {
              return true; // These two tiles can be merged
            }
          }
        }
      }
    }

    return false;
  }

  positionsEqual(first: Position, second: Position): boolean {
    return first.x === second.x && first.y === second.y;
  }
}

// ---------------------------------------------------------------------------
// Theme — "TECH MERGE 2200"
// ---------------------------------------------------------------------------

interface TileTheme {
  label: string;
  bg: string;
  fg: string;
  glow: string | null;
}

const TILE_THEMES: Record<number, TileTheme> = {
  2: { label: "SOLAR", bg: "#2a2a44", fg: "#9aa6cc", glow: null },
  4: { label: "DRONE", bg: "#34345e", fg: "#b9c3e8", glow: null },
  8: { label: "ROBOT", bg: "#16465f", fg: "#9fe9ff", glow: null },
  16: { label: "AI CORE", bg: "#0c5a73", fg: "#ccf6ff", glow: "rgba(0, 229, 255, 0.35)" },
  32: { label: "ANDROID", bg: "#007a90", fg: "#eafdff", glow: "rgba(0, 229, 255, 0.55)" },
  64: { label: "HOVERCAR", bg: "#006a4e", fg: "#d2ffe9", glow: "rgba(0, 230, 118, 0.5)" },
  128: { label: "MAG-RAIL", bg: "#00905f", fg: "#ecfff5", glow: "rgba(0, 230, 118, 0.7)" },
  256: { label: "FUSION", bg: "#8a6a00", fg: "#fff3cd", glow: "rgba(255, 193, 7, 0.55)" },
  512: { label: "STARSHIP", bg: "#b08800", fg: "#fff8e1", glow: "rgba(255, 193, 7, 0.75)" },
  1024: { label: "COLONY", bg: "#a01250", fg: "#ffe3ee", glow: "rgba(255, 45, 123, 0.7)" },
  2048: { label: "★ 2200 ★", bg: "#6a35c2", fg: "#f3eaff", glow: "rgba(179, 136, 255, 0.85)" },
  4096: { label: "DYSON", bg: "#4a1f96", fg: "#efe5ff", glow: "rgba(179, 136, 255, 0.95)" },
};

const SUPER_THEME: TileTheme = {
  label: "GALAXY",
  bg: "#341370",
  fg: "#f0e7ff",
  glow: "rgba(179, 136, 255, 1)",
};

function themeFor(value: number): TileTheme {
  return TILE_THEMES[value] ?? SUPER_THEME;
}

// ---------------------------------------------------------------------------
// Persistence + reporting constants
// ---------------------------------------------------------------------------

const BEST_KEY = "techMerge_best";
const REPORT_INTERVAL_MS = 15000; // live leaderboard heartbeat
const SWIPE_THRESHOLD_PX = 10; // same threshold as the original input manager

function readBest(): number {
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    const parsed = raw === null ? 0 : parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function writeBest(value: number): void {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage unavailable — best score just won't persist.
  }
}

// Keyboard map (arrows + vim + WASD, like the original)
const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 0,
  ArrowRight: 1,
  ArrowDown: 2,
  ArrowLeft: 3,
  k: 0, // Vim up
  l: 1, // Vim right
  j: 2, // Vim down
  h: 3, // Vim left
  w: 0,
  d: 1,
  s: 2,
  a: 3,
};

// ---------------------------------------------------------------------------
// Styles — dark sci-fi, mobile-first
// ---------------------------------------------------------------------------

const STYLES = `
.tm-root {
  --tm-board: min(90vw, 420px);
  --tm-gap: clamp(6px, 2vw, 10px);
  --tm-cell: calc((var(--tm-board) - 5 * var(--tm-gap)) / 4);
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(10px, 2.2vh, 18px);
  background: #0a0a0f;
  background-image: radial-gradient(circle at 50% -10%, rgba(0, 229, 255, 0.10), transparent 55%);
  color: #e6f7ff;
  font-family: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.tm-header { text-align: center; line-height: 1.25; }
.tm-title {
  margin: 0;
  font-size: clamp(22px, 6.5vw, 32px);
  letter-spacing: 0.14em;
  color: #00e5ff;
  text-shadow: 0 0 14px rgba(0, 229, 255, 0.55);
}
.tm-subtitle {
  margin: 4px 0 0;
  font-size: clamp(10px, 3vw, 13px);
  letter-spacing: 0.06em;
  color: #8fa3c8;
}
.tm-hud {
  width: var(--tm-board);
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 8px;
}
.tm-scorebox {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 10px;
  background: #1a1a2e;
  border: 1px solid rgba(0, 229, 255, 0.28);
  border-radius: 8px;
  min-height: 48px;
}
.tm-scorebox span { font-size: 10px; letter-spacing: 0.18em; color: #00e5ff; }
.tm-scorebox strong { font-size: clamp(16px, 5vw, 22px); color: #ffffff; }
.tm-board {
  position: relative;
  width: var(--tm-board);
  height: var(--tm-board);
  background: #1a1a2e;
  border: 1px solid rgba(0, 229, 255, 0.25);
  border-radius: 12px;
  box-shadow: 0 0 28px rgba(0, 229, 255, 0.10), inset 0 0 22px rgba(0, 0, 0, 0.55);
}
.tm-cells {
  position: absolute;
  inset: var(--tm-gap);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: var(--tm-gap);
}
.tm-cell {
  background: rgba(10, 10, 15, 0.55);
  border: 1px solid rgba(0, 229, 255, 0.07);
  border-radius: 8px;
}
.tm-tile {
  position: absolute;
  width: var(--tm-cell);
  height: var(--tm-cell);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: 8px;
  transition: left 100ms ease-in-out, top 100ms ease-in-out;
  z-index: 1;
}
.tm-tile-label {
  font-size: clamp(9px, 2.9vw, 13px);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-align: center;
  padding: 0 2px;
}
.tm-tile-value { font-size: clamp(8px, 2.4vw, 11px); opacity: 0.75; }
@keyframes tm-spawn {
  from { opacity: 0; transform: scale(0); }
  to { opacity: 1; transform: scale(1); }
}
.tm-new { animation: tm-spawn 200ms ease 100ms backwards; }
@keyframes tm-pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
.tm-merged { animation: tm-pop 200ms ease 100ms backwards; z-index: 2; }
@keyframes tm-fade { from { opacity: 0; } to { opacity: 1; } }
.tm-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: rgba(10, 10, 15, 0.88);
  border-radius: 12px;
  animation: tm-fade 500ms ease 350ms both;
  text-align: center;
  padding: 16px;
}
.tm-overlay-title {
  font-size: clamp(20px, 6vw, 28px);
  letter-spacing: 0.12em;
  font-weight: 700;
}
.tm-overlay-title.tm-lost { color: #ff2d7b; text-shadow: 0 0 16px rgba(255, 45, 123, 0.6); }
.tm-overlay-title.tm-won { color: #ffc107; text-shadow: 0 0 16px rgba(255, 193, 7, 0.6); }
.tm-overlay-score { font-size: clamp(13px, 4vw, 16px); color: #8fa3c8; letter-spacing: 0.1em; }
.tm-btn {
  font: inherit;
  font-size: clamp(12px, 3.6vw, 14px);
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #0a0a0f;
  background: #00e5ff;
  border: none;
  border-radius: 8px;
  padding: 12px 22px;
  min-height: 44px;
  cursor: pointer;
  box-shadow: 0 0 18px rgba(0, 229, 255, 0.45);
}
.tm-btn:active { transform: scale(0.96); }
.tm-btn-ghost {
  background: #1a1a2e;
  color: #00e5ff;
  border: 1px solid rgba(0, 229, 255, 0.4);
  box-shadow: none;
  padding: 6px 14px;
  min-height: 48px;
}
.tm-hint {
  margin: 0;
  font-size: clamp(9px, 2.8vw, 11px);
  letter-spacing: 0.18em;
  color: #4d5d80;
  text-align: center;
}
`;

const BOARD_CELL_KEYS = Array.from(
  { length: GRID_SIZE * GRID_SIZE },
  (_, i) => i,
);

// ---------------------------------------------------------------------------
// React component (replaces html_actuator.js + keyboard_input_manager.js)
// ---------------------------------------------------------------------------

export default function TechMerge({
  onGameOver,
}: {
  onGameOver: (score: number) => void;
}) {
  const [game] = useState(() => new GameManager(GRID_SIZE));
  const [, bump] = useReducer((n: number) => n + 1, 0);

  const rootRef = useRef<HTMLDivElement | null>(null);

  // Best score (localStorage), read lazily once per mount.
  const bestRef = useRef(-1);
  if (bestRef.current < 0) bestRef.current = readBest();

  // Keep the latest callback without re-subscribing listeners.
  const onGameOverRef = useRef(onGameOver);
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  // Leaderboard reporting bookkeeping (calling onGameOver repeatedly is safe;
  // these guards just keep the traffic sensible).
  const reported = useRef({ gameOver: false, win: false, score: 0 });

  const moveAndSync = useCallback(
    (direction: Direction) => {
      if (!game.move(direction)) return;

      if (game.score > bestRef.current) {
        bestRef.current = game.score;
        writeBest(game.score);
      }

      if (game.over && !reported.current.gameOver) {
        reported.current.gameOver = true;
        reported.current.score = game.score;
        onGameOverRef.current(game.score); // (a) game over
      }
      if (game.won && !reported.current.win) {
        reported.current.win = true;
        reported.current.score = game.score;
        onGameOverRef.current(game.score); // (b) reached the 2048-equivalent tile
      }

      bump();
    },
    [game],
  );

  const restart = useCallback(() => {
    game.restart();
    reported.current.gameOver = false;
    reported.current.win = false;
    reported.current.score = 0;
    bump();
  }, [game]);

  const keepGoing = useCallback(() => {
    game.continueGame();
    bump();
  }, [game]);

  // (c) Heartbeat: at most once every 15s while playing, if the score grew.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!game.isGameTerminated() && game.score > reported.current.score) {
        reported.current.score = game.score;
        onGameOverRef.current(game.score);
      }
    }, REPORT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [game]);

  // Arrow keys / vim / WASD (+ R to restart), like the original listen().
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modifiers =
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
      if (modifiers) return;

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (key in KEY_TO_DIRECTION) {
        event.preventDefault();
        moveAndSync(KEY_TO_DIRECTION[key]);
      } else if (key === "r") {
        // R key restarts the game
        event.preventDefault();
        restart();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [moveAndSync, restart]);

  // Swipe input — same threshold logic as the original (native listeners so
  // preventDefault works; React's synthetic touch events are passive).
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    let touchStartClientX = 0;
    let touchStartClientY = 0;
    let tracking = false;

    const handleTouchStart = (event: TouchEvent) => {
      // Let buttons receive their taps normally.
      if (event.target instanceof Element && event.target.closest("button")) {
        tracking = false;
        return;
      }
      if (event.touches.length > 1 || event.targetTouches.length > 1) {
        tracking = false;
        return; // Ignore if touching with more than 1 finger
      }

      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
      tracking = true;

      event.preventDefault();
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (tracking) event.preventDefault(); // Prevent page scroll while swiping
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!tracking) return;
      if (event.touches.length > 0 || event.targetTouches.length > 0) {
        return; // Ignore if still touching with one or more fingers
      }
      tracking = false;

      const dx = event.changedTouches[0].clientX - touchStartClientX;
      const absDx = Math.abs(dx);

      const dy = event.changedTouches[0].clientY - touchStartClientY;
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > SWIPE_THRESHOLD_PX) {
        // (right : left) : (down : up)
        moveAndSync(absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
      }
    };

    node.addEventListener("touchstart", handleTouchStart, { passive: false });
    node.addEventListener("touchmove", handleTouchMove, { passive: false });
    node.addEventListener("touchend", handleTouchEnd);
    return () => {
      node.removeEventListener("touchstart", handleTouchStart);
      node.removeEventListener("touchmove", handleTouchMove);
      node.removeEventListener("touchend", handleTouchEnd);
    };
  }, [moveAndSync]);

  // Collect tiles for rendering (stable order by id keeps DOM nodes in place
  // so the left/top transition animates slides between renders).
  const tiles: Tile[] = [];
  game.grid.eachCell((_x, _y, tile) => {
    if (tile) tiles.push(tile);
  });
  tiles.sort((a, b) => a.id - b.id);

  const showLost = game.over;
  const showWon = game.won && !game.keepPlaying && !game.over;

  return (
    <div className="tm-root" ref={rootRef}>
      <style>{STYLES}</style>

      <header className="tm-header">
        <h1 className="tm-title">TECH MERGE 2200</h1>
        <p className="tm-subtitle">Merge technologies to reach the year 2200</p>
      </header>

      <div className="tm-hud">
        <div className="tm-scorebox">
          <span>SCORE</span>
          <strong>{game.score}</strong>
        </div>
        <div className="tm-scorebox">
          <span>BEST</span>
          <strong>{bestRef.current}</strong>
        </div>
        <button type="button" className="tm-btn tm-btn-ghost" onClick={restart}>
          NEW RUN
        </button>
      </div>

      <div className="tm-board">
        <div className="tm-cells">
          {BOARD_CELL_KEYS.map((i) => (
            <div key={i} className="tm-cell" />
          ))}
        </div>

        {tiles.map((tile) => {
          const theme = themeFor(tile.value);
          const className = tile.mergedFrom
            ? "tm-tile tm-merged"
            : tile.previousPosition
              ? "tm-tile"
              : "tm-tile tm-new";
          return (
            <div
              key={tile.id}
              className={className}
              style={{
                left: `calc(var(--tm-gap) + ${tile.x} * (var(--tm-cell) + var(--tm-gap)))`,
                top: `calc(var(--tm-gap) + ${tile.y} * (var(--tm-cell) + var(--tm-gap)))`,
                background: theme.bg,
                color: theme.fg,
                boxShadow: theme.glow
                  ? `0 0 16px ${theme.glow}, inset 0 0 0 1px ${theme.glow}`
                  : "inset 0 0 0 1px rgba(255, 255, 255, 0.07)",
                textShadow: theme.glow ? `0 0 10px ${theme.glow}` : "none",
              }}
            >
              <span className="tm-tile-label">{theme.label}</span>
              <span className="tm-tile-value">{tile.value}</span>
            </div>
          );
        })}

        {showWon && (
          <div className="tm-overlay">
            <div className="tm-overlay-title tm-won">YOU REACHED 2200!</div>
            <div className="tm-overlay-score">SCORE {game.score}</div>
            <button type="button" className="tm-btn" onClick={keepGoing}>
              KEEP GOING
            </button>
          </div>
        )}

        {showLost && (
          <div className="tm-overlay">
            <div className="tm-overlay-title tm-lost">GAME OVER</div>
            <div className="tm-overlay-score">SCORE {game.score}</div>
            <button type="button" className="tm-btn" onClick={restart}>
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="tm-hint">SWIPE OR USE ARROW KEYS</p>
    </div>
  );
}
