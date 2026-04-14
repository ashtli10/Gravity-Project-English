import { useRef, useEffect, useState } from "react";
import { GameEngine } from "./engine/GameEngine";

export default function GravitySurge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gravityLevel, setGravityLevel] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const engine = new GameEngine(canvas, {
      gravity: 160, // Start at Moon gravity
      jumpVelocity: -480,
      moveSpeed: 250,
      platformMinWidth: 130,
      platformMaxWidth: 350,
      gapMinWidth: 50,
      gapMaxWidth: 120,
      playerWidth: 24,
      playerHeight: 40,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      accentColor: "#b388ff",
      lives: 1,
      onScore: setScore,
      onGameOver: () => setGameOver(true),
    });

    engineRef.current = engine;
    engine.start();
    engine.setExtraHudInfo("GRAVITY: 0.16g");

    // Gravity escalation timer
    let currentG = 160;
    let level = 1;
    const gravityInterval = setInterval(() => {
      if (engine.isGameOver()) return;
      currentG = Math.min(currentG * 1.2, 3000);
      level++;
      engine.setGravity(currentG);
      engine.setExtraHudInfo(`GRAVITY: ${(currentG / 1000).toFixed(2)}g`);
      setGravityLevel(level);

      // Sky color shift: purple -> red
      const t = Math.min((currentG - 160) / 2800, 1);
      const r = Math.floor(10 + t * 40);
      const g = Math.floor(10 - t * 5);
      const b = Math.floor(15 - t * 10);
      engine.setBgColor(`rgb(${r}, ${g}, ${b})`);
    }, 10000);

    const handleRestart = () => {
      if (engine.isGameOver()) {
        engine.restart();
        engine.setGravity(160);
        engine.setBgColor("#0a0a0f");
        engine.setExtraHudInfo("GRAVITY: 0.16g");
        currentG = 160;
        level = 1;
        setGameOver(false);
        setScore(0);
        setGravityLevel(1);
      }
    };
    canvas.addEventListener("touchstart", handleRestart);
    canvas.addEventListener("click", handleRestart);

    return () => {
      clearInterval(gravityInterval);
      engine.destroy();
      canvas.removeEventListener("touchstart", handleRestart);
      canvas.removeEventListener("click", handleRestart);
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0f", position: "relative" }}>
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  );
}
