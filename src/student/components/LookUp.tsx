import { useEffect, useRef } from "react";

export default function LookUp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Floating particles effect
    const particles: { x: number; y: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vy: -0.3 - Math.random() * 0.5,
        size: 1 + Math.random() * 3,
        alpha: 0.2 + Math.random() * 0.4,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.y += p.vy;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#0a0a0f",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      />
      <div style={{
        fontSize: "4rem",
        animation: "float 3s ease-in-out infinite",
        marginBottom: "1rem",
        zIndex: 1,
      }}>
        {"\uD83D\uDC46"}
      </div>
      <div style={{
        fontSize: "clamp(2rem, 5vw, 3rem)",
        color: "#00e5ff",
        fontWeight: 700,
        textShadow: "0 0 30px #00e5ff, 0 0 60px #00e5ff40",
        fontFamily: "var(--font-display)",
        animation: "pulse-glow 2s ease-in-out infinite",
        zIndex: 1,
      }}>
        LOOK UP
      </div>
    </div>
  );
}
