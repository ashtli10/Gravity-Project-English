import { CameraState } from "./types";

export function createCamera(startX: number, startY: number): CameraState {
  return {
    x: startX,
    y: startY,
    targetX: startX,
    targetY: startY,
    shakeAmount: 0,
    shakeDecay: 0.92,
  };
}

export function updateCamera(
  camera: CameraState,
  playerX: number,
  playerY: number,
  canvasWidth: number,
  canvasHeight: number,
  dt: number
): void {
  camera.targetX = playerX - canvasWidth * 0.3;
  camera.targetY = Math.min(playerY - canvasHeight * 0.6, camera.targetY);

  // Smooth lerp
  const lerpSpeed = 4;
  camera.x += (camera.targetX - camera.x) * lerpSpeed * dt;
  camera.y += (camera.targetY - camera.y) * lerpSpeed * dt * 0.5;

  // Decay shake
  camera.shakeAmount *= Math.pow(camera.shakeDecay, dt * 60);
  if (camera.shakeAmount < 0.5) camera.shakeAmount = 0;
}

export function triggerShake(camera: CameraState, amount: number): void {
  camera.shakeAmount = Math.max(camera.shakeAmount, amount);
}

export function getShakeOffset(camera: CameraState): { x: number; y: number } {
  if (camera.shakeAmount < 0.5) return { x: 0, y: 0 };
  return {
    x: (Math.random() - 0.5) * camera.shakeAmount * 2,
    y: (Math.random() - 0.5) * camera.shakeAmount * 2,
  };
}
