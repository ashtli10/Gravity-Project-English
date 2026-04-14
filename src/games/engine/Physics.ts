import { PlayerState, Platform } from "./types";

export function applyGravity(player: PlayerState, gravity: number, dt: number): void {
  if (!player.isGrounded && !player.isDead) {
    player.vel.y += gravity * dt;
  }
}

export function movePlayer(player: PlayerState, moveSpeed: number, dt: number): void {
  if (player.isDead) {
    // Ragdoll physics during death
    player.vel.y += 800 * dt;
    player.pos.x += player.vel.x * dt;
    player.pos.y += player.vel.y * dt;
    player.deathRotation += 5 * dt;
    return;
  }
  player.vel.x = moveSpeed;
  player.pos.x += player.vel.x * dt;
  player.pos.y += player.vel.y * dt;

  if (player.isRolling) {
    player.rollTimer -= dt;
    if (player.rollTimer <= 0) {
      player.isRolling = false;
      player.height = player.width * 1.67; // restore height
    }
  }
}

export function checkPlatformCollision(player: PlayerState, platform: Platform): boolean {
  if (player.isDead) return false;
  // Only collide when falling (vel.y >= 0) and player was above platform
  const playerBottom = player.pos.y + player.height;
  const playerRight = player.pos.x + player.width;
  const prevBottom = playerBottom - player.vel.y * 0.016;

  return (
    player.vel.y >= 0 &&
    prevBottom <= platform.y + 5 &&
    playerBottom >= platform.y &&
    playerRight > platform.x &&
    player.pos.x < platform.x + platform.width
  );
}

export function resolveCollision(player: PlayerState, platform: Platform): void {
  player.pos.y = platform.y - player.height;
  player.vel.y = 0;
  player.isGrounded = true;
}

export function checkFellOff(player: PlayerState, canvasHeight: number, cameraY: number): boolean {
  return player.pos.y > cameraY + canvasHeight + 100;
}
