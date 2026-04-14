import { PlayerState, GameConfig } from "./types";

export function createPlayer(config: GameConfig): PlayerState {
  return {
    pos: { x: 100, y: config.canvasHeight * 0.75 - config.playerHeight - 10 },
    vel: { x: 0, y: 0 },
    isGrounded: true,
    isRolling: false,
    isDead: false,
    width: config.playerWidth,
    height: config.playerHeight,
    rollTimer: 0,
    deathTimer: 0,
    deathRotation: 0,
  };
}

export function jump(player: PlayerState, jumpVelocity: number): void {
  if (player.isGrounded && !player.isDead) {
    player.vel.y = jumpVelocity;
    player.isGrounded = false;
  }
}

export function roll(player: PlayerState): void {
  if (player.isGrounded && !player.isDead && !player.isRolling) {
    player.isRolling = true;
    player.rollTimer = 0.5;
    player.height = player.width; // squat down
  }
}

export function die(player: PlayerState): void {
  if (!player.isDead) {
    player.isDead = true;
    player.deathTimer = 2;
    player.vel.y = -300;
    player.vel.x = -50 + Math.random() * 100;
  }
}
