import { useRef, useEffect, useState } from "react";
import { GameEngine } from "./engine/GameEngine";

const planets = [
  { name: "Moon", gravity: 160, color: "#8888a0", emoji: "\uD83C\uDF19" },
  { name: "Mars", gravity: 370, color: "#ff6b35", emoji: "\uD83D\uDD34" },
  { name: "Earth", gravity: 980, color: "#00e676", emoji: "\uD83C\uDF0D" },
  { name: "Jupiter", gravity: 2480, color: "#ffc107", emoji: "\uD83D\uDFE0" },
];

export default function PlanetaryParkour() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [customGravity, setCustomGravity] = useState(980);
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    if (selectedPlanet === null || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const planet = planets[selectedPlanet];
    const engine = new GameEngine(canvas, {
      gravity: planet.gravity,
      jumpVelocity: -480,
      moveSpeed: 260,
      platformMinWidth: 130,
      platformMaxWidth: 320,
      gapMinWidth: 50,
      gapMaxWidth: 130,
      playerWidth: 24,
      playerHeight: 40,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      accentColor: "#00e676",
      lives: 3,
      onScore: setScore,
      onGameOver: () => {
        setGameOver(true);
        setShowSlider(true);
      },
    });
    engine.setExtraHudInfo(`${planet.emoji} ${planet.name} (${planet.gravity / 100}g)`);

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

    return () => {
      engine.destroy();
      canvas.removeEventListener("touchstart", handleRestart);
      canvas.removeEventListener("click", handleRestart);
    };
  }, [selectedPlanet]);

  // Planet selector
  if (selectedPlanet === null) {
    return (
      <div style={{
        width: "100vw", height: "100vh", background: "#0a0a0f",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: "1.5rem", padding: "2rem",
      }}>
        <div style={{
          fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
          color: "#00e676", fontWeight: 700,
          textShadow: "0 0 20px #00e676",
        }}>
          CHOOSE YOUR PLANET
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "1rem", width: "100%", maxWidth: "400px",
        }}>
          {planets.map((planet, i) => (
            <button
              key={planet.name}
              onClick={() => setSelectedPlanet(i)}
              style={{
                padding: "1.5rem",
                background: "var(--bg-card)",
                border: `2px solid ${planet.color}40`,
                borderRadius: "12px",
                cursor: "pointer",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "0.5rem",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontSize: "2.5rem" }}>{planet.emoji}</span>
              <span style={{ fontSize: "1.2rem", fontWeight: 600, color: planet.color }}>
                {planet.name}
              </span>
              <span style={{
                fontSize: "0.85rem", color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
              }}>
                {planet.gravity / 100}g
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0f", position: "relative" }}>
      <canvas ref={canvasRef} className="game-canvas" />
      {showSlider && (
        <div
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            position: "absolute", bottom: "5rem", left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(10,10,15,0.9)",
            padding: "1rem 1.5rem", borderRadius: "12px",
            border: "1px solid #00e67640",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
            zIndex: 10,
          }}
        >
          <span style={{ color: "#00e676", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
            Custom Gravity: {(customGravity / 100).toFixed(1)}g
          </span>
          <input
            type="range"
            min="50"
            max="3000"
            value={customGravity}
            onChange={(e) => {
              const g = parseInt(e.target.value);
              setCustomGravity(g);
              engineRef.current?.setGravity(g);
            }}
            style={{ width: "200px", accentColor: "#00e676" }}
          />
          <button
            onClick={() => {
              setShowSlider(false);
              setGameOver(false);
              engineRef.current?.restart();
              engineRef.current?.setGravity(customGravity);
            }}
            style={{
              marginTop: "0.5rem", padding: "0.5rem 1.5rem",
              background: "#00e676", color: "#0a0a0f",
              border: "none", borderRadius: "8px",
              fontWeight: 700, cursor: "pointer",
            }}
          >
            PLAY WITH CUSTOM GRAVITY
          </button>
        </div>
      )}
      <button
        onClick={() => {
          engineRef.current?.destroy();
          setSelectedPlanet(null);
          setGameOver(false);
          setScore(0);
          setShowSlider(false);
        }}
        style={{
          position: "absolute", top: "0.5rem", left: "0.5rem",
          background: "rgba(10,10,15,0.7)", color: "#8888a0",
          border: "1px solid #8888a040", borderRadius: "8px",
          padding: "0.4rem 0.8rem", fontSize: "0.85rem",
          cursor: "pointer", zIndex: 10,
        }}
      >
        &larr; Planets
      </button>
    </div>
  );
}
