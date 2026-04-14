import { GameConfig, Particle, Platform, PlayerState, CameraState } from "./types";
import { applyGravity, movePlayer, checkPlatformCollision, resolveCollision, checkFellOff } from "./Physics";
import { createCamera, updateCamera, triggerShake } from "./Camera";
import { emitImpact, emitTrail, emitDeath, updateParticles } from "./Particles";
import { InputManager } from "./Input";
import { generateInitialPlatforms, generateAhead, pruneBehind } from "./LevelGenerator";
import { createPlayer, jump, roll, die } from "./Player";
import {
  clearCanvas, applyCamera, restoreCamera,
  drawBackground, drawPlatforms, drawPlayer, drawParticles, drawHUD,
} from "./Renderer";

export class GameEngine {
  private config: GameConfig;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: PlayerState;
  private platforms: Platform[];
  private camera: CameraState;
  private particles: Particle[];
  private input: InputManager;
  private score: number;
  private lives: number;
  private running: boolean;
  private lastTime: number;
  private animFrameId: number;
  private trailTimer: number;
  private bgColor: string;
  private extraHudInfo: string;
  private wasGrounded: boolean;
  private gameOver: boolean;
  private currentGravity: number;

  constructor(canvas: HTMLCanvasElement, config: GameConfig) {
    this.config = config;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.player = createPlayer(config);
    this.platforms = generateInitialPlatforms(config);
    this.camera = createCamera(0, 0);
    this.particles = [];
    this.input = new InputManager(canvas);
    this.score = 0;
    this.lives = config.lives;
    this.running = false;
    this.lastTime = 0;
    this.animFrameId = 0;
    this.trailTimer = 0;
    this.bgColor = "#0a0a0f";
    this.extraHudInfo = "";
    this.wasGrounded = true;
    this.gameOver = false;
    this.currentGravity = config.gravity;
  }

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  private loop = (now: number): void => {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.033);
    this.lastTime = now;
    this.update(dt);
    this.render();
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    if (this.gameOver) return;

    const player = this.player;

    if (player.isDead) {
      player.deathTimer -= dt;
      movePlayer(player, 0, dt);
      updateParticles(this.particles, dt);

      if (player.deathTimer <= 0) {
        this.lives--;
        if (this.lives <= 0) {
          this.gameOver = true;
          this.config.onGameOver?.();
          return;
        }
        // Respawn
        this.player = createPlayer(this.config);
        this.player.pos.x = this.camera.x + this.config.canvasWidth * 0.3;
        // Find nearest platform
        for (const p of this.platforms) {
          if (p.x <= this.player.pos.x && p.x + p.width >= this.player.pos.x) {
            this.player.pos.y = p.y - this.player.height;
            break;
          }
        }
      }
      return;
    }

    // Input
    if (this.input.consumeJump()) {
      jump(player, this.config.jumpVelocity);
    }
    // Extended jump (hold for higher)
    if (this.input.isHolding() && player.vel.y < 0) {
      player.vel.y -= this.currentGravity * 0.3 * dt;
    }
    if (this.input.consumeSwipeDown()) {
      roll(player);
    }

    // Physics
    applyGravity(player, this.currentGravity, dt);
    movePlayer(player, this.config.moveSpeed, dt);

    // Collision
    player.isGrounded = false;
    for (const platform of this.platforms) {
      if (checkPlatformCollision(player, platform)) {
        resolveCollision(player, platform);

        // Landing effects
        if (!this.wasGrounded) {
          emitImpact(this.particles, { x: player.pos.x + player.width / 2, y: player.pos.y + player.height }, this.config.accentColor, 8);
          if (Math.abs(player.vel.y) > 200) {
            triggerShake(this.camera, 4);
          }
        }
        break;
      }
    }
    this.wasGrounded = player.isGrounded;

    // Fell off
    if (checkFellOff(player, this.config.canvasHeight, this.camera.y)) {
      die(player);
      emitDeath(this.particles, { x: player.pos.x, y: player.pos.y }, this.config.accentColor);
      triggerShake(this.camera, 12);
    }

    // Camera
    updateCamera(this.camera, player.pos.x, player.pos.y, this.config.canvasWidth, this.config.canvasHeight, dt);

    // Level generation
    generateAhead(this.platforms, this.camera.x, this.config.canvasWidth, this.config);
    pruneBehind(this.platforms, this.camera.x);

    // Trail particles
    this.trailTimer -= dt;
    if (this.trailTimer <= 0 && !player.isDead) {
      emitTrail(this.particles, { x: player.pos.x, y: player.pos.y + player.height }, this.config.accentColor);
      this.trailTimer = 0.05;
    }

    // Particles
    updateParticles(this.particles, dt);

    // Score
    this.score = Math.max(this.score, (player.pos.x - 100) / 50);
    this.config.onScore?.(Math.floor(this.score));
  }

  private render(): void {
    const { ctx, canvas, camera, config } = this;

    clearCanvas(ctx, canvas.width, canvas.height, this.bgColor);
    drawBackground(ctx, camera, canvas.width, canvas.height, config.accentColor);
    applyCamera(ctx, camera);
    drawPlatforms(ctx, this.platforms, camera, canvas.width, config.accentColor);
    drawPlayer(ctx, this.player, config.accentColor);
    drawParticles(ctx, this.particles);
    restoreCamera(ctx);
    drawHUD(ctx, this.score, this.lives, config.accentColor, canvas.width, this.extraHudInfo);

    if (this.gameOver) {
      ctx.save();
      ctx.fillStyle = "rgba(10, 10, 15, 0.7)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.shadowColor = config.accentColor;
      ctx.shadowBlur = 20;
      ctx.fillStyle = config.accentColor;
      ctx.font = "bold 48px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = "bold 24px 'JetBrains Mono', monospace";
      ctx.fillText(`Score: ${Math.floor(this.score)}m`, canvas.width / 2, canvas.height / 2 + 30);
      ctx.font = "18px 'Inter', sans-serif";
      ctx.fillStyle = "#8888a0";
      ctx.shadowBlur = 0;
      ctx.fillText("Tap to restart", canvas.width / 2, canvas.height / 2 + 70);
      ctx.restore();
    }
  }

  setGravity(g: number): void {
    this.currentGravity = g;
  }

  setBgColor(color: string): void {
    this.bgColor = color;
  }

  setExtraHudInfo(info: string): void {
    this.extraHudInfo = info;
  }

  getScore(): number {
    return Math.floor(this.score);
  }

  isGameOver(): boolean {
    return this.gameOver;
  }

  restart(): void {
    this.player = createPlayer(this.config);
    this.platforms = generateInitialPlatforms(this.config);
    this.camera = createCamera(0, 0);
    this.particles = [];
    this.score = 0;
    this.lives = this.config.lives;
    this.gameOver = false;
    this.wasGrounded = true;
    this.currentGravity = this.config.gravity;
  }

  destroy(): void {
    this.running = false;
    cancelAnimationFrame(this.animFrameId);
    this.input.destroy();
  }
}
