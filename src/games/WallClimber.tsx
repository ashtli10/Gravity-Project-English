import { useRef, useEffect, useState } from "react";

interface WCPlatform {
  x: number;
  y: number;
  width: number;
  side: "left" | "right";
  moving?: boolean;
  moveSpeed?: number;
  moveRange?: number;
  baseX?: number;
}

interface WCPlayer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  side: "left" | "right";
  onPlatform: boolean;
  dead: boolean;
}

interface WCParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export default function WallClimber() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    const W = canvas.width;
    const H = canvas.height;
    const WALL_WIDTH = 20;
    const GRAVITY = 600;
    const JUMP_VX = 300;
    const JUMP_VY = -400;
    const ACCENT = "#b388ff";

    let cameraY = 0;
    let highestY = H * 0.7;
    let running = true;
    let lastTime = performance.now();

    const particles: WCParticle[] = [];

    // Generate platforms
    const platforms: WCPlatform[] = [];
    // Starting platform
    platforms.push({ x: WALL_WIDTH, y: H * 0.7, width: 80, side: "left" });

    for (let i = 1; i < 100; i++) {
      const side: "left" | "right" = i % 2 === 0 ? "left" : "right";
      const y = H * 0.7 - i * 90;
      const width = Math.max(40, 80 - i * 0.5);
      const x = side === "left" ? WALL_WIDTH : W - WALL_WIDTH - width;
      const moving = i > 10 && Math.random() > 0.6;
      platforms.push({
        x, y, width, side, moving,
        moveSpeed: moving ? 30 + Math.random() * 30 : 0,
        moveRange: moving ? 30 + Math.random() * 20 : 0,
        baseX: x,
      });
    }

    const player: WCPlayer = {
      x: WALL_WIDTH + 30,
      y: H * 0.7 - 20,
      vx: 0,
      vy: 0,
      side: "left",
      onPlatform: true,
      dead: false,
    };

    // Trajectory preview
    let previewDots: { x: number; y: number }[] = [];

    function calcTrajectory(): { x: number; y: number }[] {
      if (!player.onPlatform || player.dead) return [];
      const dots: { x: number; y: number }[] = [];
      const targetSide = player.side === "left" ? "right" : "left";
      const vx = targetSide === "right" ? JUMP_VX : -JUMP_VX;
      let px = player.x;
      let py = player.y;
      let pvx = vx;
      let pvy = JUMP_VY;
      for (let t = 0; t < 40; t++) {
        px += pvx * 0.02;
        py += pvy * 0.02;
        pvy += GRAVITY * 0.02;
        dots.push({ x: px, y: py });
        // Stop at walls
        if (px <= WALL_WIDTH || px >= W - WALL_WIDTH - 15) break;
      }
      return dots;
    }

    function handleTap() {
      if (player.dead) {
        // Restart
        player.x = WALL_WIDTH + 30;
        player.y = H * 0.7 - 20;
        player.vx = 0;
        player.vy = 0;
        player.side = "left";
        player.onPlatform = true;
        player.dead = false;
        cameraY = 0;
        highestY = H * 0.7;
        setScore(0);
        return;
      }
      if (!player.onPlatform) return;

      const targetSide = player.side === "left" ? "right" : "left";
      player.vx = targetSide === "right" ? JUMP_VX : -JUMP_VX;
      player.vy = JUMP_VY;
      player.onPlatform = false;

      // Jump particles
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: player.x + 7, y: player.y + 15,
          vx: (Math.random() - 0.5) * 100,
          vy: Math.random() * 50 + 20,
          life: 0.4, color: ACCENT, size: 2 + Math.random() * 3,
        });
      }
    }

    canvas.addEventListener("touchstart", (e) => { e.preventDefault(); handleTap(); }, { passive: false });
    canvas.addEventListener("click", handleTap);

    function update(dt: number) {
      if (player.dead) return;

      // Move platforms
      for (const p of platforms) {
        if (p.moving && p.baseX !== undefined) {
          p.x = p.baseX + Math.sin(performance.now() * 0.001 * (p.moveSpeed! / 30)) * p.moveRange!;
        }
      }

      if (!player.onPlatform) {
        player.vy += GRAVITY * dt;
        player.x += player.vx * dt;
        player.y += player.vy * dt;

        // Wall collision
        if (player.x <= WALL_WIDTH) {
          player.x = WALL_WIDTH;
          player.vx = 0;
        }
        if (player.x >= W - WALL_WIDTH - 15) {
          player.x = W - WALL_WIDTH - 15;
          player.vx = 0;
        }

        // Platform collision (when falling)
        if (player.vy > 0) {
          for (const p of platforms) {
            if (
              player.x + 15 > p.x &&
              player.x < p.x + p.width &&
              player.y + 20 >= p.y &&
              player.y + 20 - player.vy * dt < p.y + 10
            ) {
              player.y = p.y - 20;
              player.vy = 0;
              player.vx = 0;
              player.onPlatform = true;
              player.side = p.side;

              // Landing particles
              for (let i = 0; i < 6; i++) {
                particles.push({
                  x: player.x + 7, y: player.y + 20,
                  vx: (Math.random() - 0.5) * 80,
                  vy: -Math.random() * 40 - 10,
                  life: 0.3, color: ACCENT, size: 2 + Math.random() * 2,
                });
              }
              break;
            }
          }
        }

        // Fell below camera
        if (player.y > cameraY + H + 50) {
          player.dead = true;
        }
      }

      // Track height
      if (player.y < highestY) {
        highestY = player.y;
        const newScore = Math.floor((H * 0.7 - highestY) / 10);
        setScore(newScore);
      }

      // Camera follows upward
      const targetCamY = player.y - H * 0.6;
      if (targetCamY < cameraY) {
        cameraY += (targetCamY - cameraY) * 4 * dt;
      }

      // Generate more platforms above
      const topVisible = cameraY - 200;
      const highestPlatform = platforms.reduce((min, p) => Math.min(min, p.y), Infinity);
      if (highestPlatform > topVisible) {
        const count = Math.ceil((highestPlatform - topVisible) / 90);
        for (let i = 0; i < count; i++) {
          const newY = highestPlatform - (i + 1) * 90;
          const side: "left" | "right" = (platforms.length + i) % 2 === 0 ? "left" : "right";
          const width = Math.max(35, 70 - platforms.length * 0.3);
          const x = side === "left" ? WALL_WIDTH : W - WALL_WIDTH - width;
          const moving = platforms.length > 15 && Math.random() > 0.5;
          platforms.push({
            x, y: newY, width, side, moving,
            moveSpeed: moving ? 30 + Math.random() * 40 : 0,
            moveRange: moving ? 25 + Math.random() * 25 : 0,
            baseX: x,
          });
        }
      }

      // Trajectory preview
      previewDots = calcTrajectory();

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 200 * dt;
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }

    function render() {
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(0, -cameraY);

      // Walls
      ctx.fillStyle = "#12121a";
      ctx.fillRect(0, cameraY - 100, WALL_WIDTH, H + 200);
      ctx.fillRect(W - WALL_WIDTH, cameraY - 100, WALL_WIDTH, H + 200);
      // Wall glow edges
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur = 8;
      ctx.fillStyle = ACCENT;
      ctx.fillRect(WALL_WIDTH - 1, cameraY - 100, 2, H + 200);
      ctx.fillRect(W - WALL_WIDTH - 1, cameraY - 100, 2, H + 200);
      ctx.shadowBlur = 0;

      // Platforms
      for (const p of platforms) {
        if (p.y < cameraY - 50 || p.y > cameraY + H + 50) continue;
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(p.x, p.y, p.width, 8);
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur = 6;
        ctx.fillStyle = ACCENT;
        ctx.fillRect(p.x, p.y, p.width, 2);
        ctx.shadowBlur = 0;
      }

      // Trajectory preview
      if (previewDots.length > 0) {
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < previewDots.length; i++) {
          const dot = previewDots[i];
          const alpha = 0.3 * (1 - i / previewDots.length);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = ACCENT;
          ctx.beginPath();
          ctx.arc(dot.x + 7, dot.y + 10, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Player
      if (!player.dead) {
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur = 12;
        ctx.fillStyle = ACCENT;
        // Head
        ctx.beginPath();
        ctx.arc(player.x + 7, player.y + 5, 5, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.strokeStyle = ACCENT;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(player.x + 7, player.y + 10);
        ctx.lineTo(player.x + 7, player.y + 18);
        ctx.stroke();
        // Legs
        ctx.beginPath();
        ctx.moveTo(player.x + 7, player.y + 18);
        ctx.lineTo(player.x + 2, player.y + 24);
        ctx.moveTo(player.x + 7, player.y + 18);
        ctx.lineTo(player.x + 12, player.y + 24);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Particles
      for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life / 0.4);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      // HUD
      ctx.save();
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur = 10;
      ctx.fillStyle = ACCENT;
      ctx.font = "bold 20px 'JetBrains Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${score}m`, W - 15, 30);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Game over
      if (player.dead) {
        ctx.fillStyle = "rgba(10,10,15,0.7)";
        ctx.fillRect(0, 0, W, H);
        ctx.save();
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur = 20;
        ctx.fillStyle = ACCENT;
        ctx.font = "bold 36px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", W / 2, H / 2 - 15);
        ctx.font = "bold 20px 'JetBrains Mono', monospace";
        ctx.fillText(`Height: ${score}m`, W / 2, H / 2 + 20);
        ctx.font = "16px 'Inter', sans-serif";
        ctx.fillStyle = "#8888a0";
        ctx.shadowBlur = 0;
        ctx.fillText("Tap to restart", W / 2, H / 2 + 55);
        ctx.restore();
      }
    }

    function loop(now: number) {
      if (!running) return;
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;
      update(dt);
      render();
      requestAnimationFrame(loop);
    }

    lastTime = performance.now();
    requestAnimationFrame(loop);

    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      running = false;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  );
}
