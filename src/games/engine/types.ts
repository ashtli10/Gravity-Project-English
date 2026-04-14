export interface GameConfig {
  gravity: number;
  jumpVelocity: number;
  moveSpeed: number;
  platformMinWidth: number;
  platformMaxWidth: number;
  gapMinWidth: number;
  gapMaxWidth: number;
  playerWidth: number;
  playerHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  accentColor: string;
  lives: number;
  onScore?: (score: number) => void;
  onGameOver?: () => void;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlayerState {
  pos: Vec2;
  vel: Vec2;
  isGrounded: boolean;
  isRolling: boolean;
  isDead: boolean;
  width: number;
  height: number;
  rollTimer: number;
  deathTimer: number;
  deathRotation: number;
}

export interface Particle {
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface CameraState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  shakeAmount: number;
  shakeDecay: number;
}
