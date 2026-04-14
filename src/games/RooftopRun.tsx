import { useRef, useEffect, useState } from "react";
import { GameEngine } from "./engine/GameEngine";

export default function RooftopRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const engine = new GameEngine(canvas, {
      gravity: 980,
      jumpVelocity: -480,
      moveSpeed: 280,
      platformMinWidth: 120,
      platformMaxWidth: 300,
      gapMinWidth: 60,
      gapMaxWidth: 140,
      playerWidth: 24,
      playerHeight: 40,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      accentColor: "#ffc107",
      lives: 3,
      onScore: setScore,
      onGameOver: () => setGameOver(true),
    });

    engineRef.current = engine;
    engine.start();

    const handleRestart = () => {
      if (engine.isGameOver()) {
        engine.restart();
        setGameOver(false);
        setScore(0);
      }
    };
    canvas.addEventListener("touchstart", handleRestart);
    canvas.addEventListener("click", handleRestart);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      engine.destroy();
      canvas.removeEventListener("touchstart", handleRestart);
      canvas.removeEventListener("click", handleRestart);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0f", position: "relative" }}>
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  );
}
