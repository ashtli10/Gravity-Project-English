import { PlayerState, Platform, Particle, CameraState } from "./types";
import { getShakeOffset } from "./Camera";

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bgColor: string
): void {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
}

export function applyCamera(
  ctx: CanvasRenderingContext2D,
  camera: CameraState
): void {
  const shake = getShakeOffset(camera);
  ctx.save();
  ctx.translate(-camera.x + shake.x, -camera.y + shake.y);
}

export function restoreCamera(ctx: CanvasRenderingContext2D): void {
  ctx.restore();
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  canvasWidth: number,
  canvasHeight: number,
  accentColor: string
): void {
  // Parallax city silhouettes
  const layers = [
    { speed: 0.1, height: 0.4, color: "#0d0d15" },
    { speed: 0.2, height: 0.3, color: "#111118" },
    { speed: 0.35, height: 0.2, color: "#151520" },
  ];

  ctx.save();
  for (const layer of layers) {
    const offsetX = -(camera.x * layer.speed) % 200;
    const baseY = canvasHeight * (1 - layer.height);
    ctx.fillStyle = layer.color;

    for (let x = offsetX - 200; x < canvasWidth + 200; x += 80) {
      const h = 30 + Math.abs(Math.sin(x * 0.02 + layer.speed * 5)) * canvasHeight * layer.height * 0.6;
      ctx.fillRect(x, baseY + canvasHeight * layer.height - h, 60, h + 20);
    }
  }

  // Subtle accent glow on horizon
  const gradient = ctx.createLinearGradient(0, canvasHeight * 0.7, 0, canvasHeight);
  gradient.addColorStop(0, "transparent");
  gradient.addColorStop(1, accentColor + "08");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();
}

export function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  platforms: Platform[],
  camera: CameraState,
  canvasWidth: number,
  accentColor: string
): void {
  for (const p of platforms) {
    // Skip if not visible
    if (p.x + p.width < camera.x - 50 || p.x > camera.x + canvasWidth + 50) continue;

    // Platform body
    ctx.fillStyle = "#12121a";
    ctx.fillRect(p.x, p.y, p.width, p.height);

    // Top edge glow
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = accentColor;
    ctx.fillRect(p.x, p.y, p.width, 2);
    ctx.shadowBlur = 0;

    // Surface detail lines
    ctx.strokeStyle = accentColor + "20";
    ctx.lineWidth = 1;
    for (let lx = p.x + 15; lx < p.x + p.width - 15; lx += 25) {
      ctx.beginPath();
      ctx.moveTo(lx, p.y + 8);
      ctx.lineTo(lx + 12, p.y + 8);
      ctx.stroke();
    }
  }
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  accentColor: string
): void {
  ctx.save();

  if (player.isDead) {
    // Ragdoll rotation
    const cx = player.pos.x + player.width / 2;
    const cy = player.pos.y + player.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate(player.deathRotation);
    ctx.translate(-cx, -cy);
  }

  // Glow
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 15;

  // Body
  const x = player.pos.x;
  const y = player.pos.y;
  const w = player.width;
  const h = player.height;

  // Head
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 8, 7, 0, Math.PI * 2);
  ctx.fill();

  // Torso
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 15);
  ctx.lineTo(x + w / 2, y + h * 0.6);
  ctx.stroke();

  // Legs
  if (player.isRolling) {
    // Tucked position
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + h * 0.6);
    ctx.lineTo(x + w * 0.3, y + h * 0.8);
    ctx.moveTo(x + w / 2, y + h * 0.6);
    ctx.lineTo(x + w * 0.7, y + h * 0.8);
    ctx.stroke();
  } else if (!player.isGrounded) {
    // Air pose
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + h * 0.6);
    ctx.lineTo(x + w * 0.2, y + h - 3);
    ctx.moveTo(x + w / 2, y + h * 0.6);
    ctx.lineTo(x + w * 0.8, y + h - 3);
    ctx.stroke();
  } else {
    // Running legs (animated)
    const phase = (Date.now() / 100) % (Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + h * 0.6);
    ctx.lineTo(x + w / 2 + Math.sin(phase) * 8, y + h - 2);
    ctx.moveTo(x + w / 2, y + h * 0.6);
    ctx.lineTo(x + w / 2 + Math.sin(phase + Math.PI) * 8, y + h - 2);
    ctx.stroke();
  }

  // Arms
  const armPhase = (Date.now() / 120) % (Math.PI * 2);
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 20);
  ctx.lineTo(x + w / 2 + Math.sin(armPhase + Math.PI) * 10, y + 30);
  ctx.moveTo(x + w / 2, y + 20);
  ctx.lineTo(x + w / 2 + Math.sin(armPhase) * 10, y + 30);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.restore();
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
): void {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  score: number,
  lives: number,
  accentColor: string,
  canvasWidth: number,
  extraInfo?: string
): void {
  ctx.save();
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 10;
  ctx.fillStyle = accentColor;
  ctx.font = "bold 24px 'JetBrains Mono', monospace";
  ctx.textAlign = "right";
  ctx.fillText(`${Math.floor(score)}m`, canvasWidth - 20, 35);

  if (lives > 0 && lives < 10) {
    ctx.textAlign = "left";
    ctx.fillText("\u2665".repeat(lives), 20, 35);
  }

  if (extraInfo) {
    ctx.textAlign = "center";
    ctx.font = "bold 18px 'JetBrains Mono', monospace";
    ctx.fillText(extraInfo, canvasWidth / 2, 35);
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}
