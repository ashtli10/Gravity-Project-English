import { useState, useCallback } from "react";

interface DropTestProps {
  mode: "vacuum" | "air";
}

interface DropObject {
  id: string;
  name: string;
  airResistance: number; // 0 = no resistance, higher = more (only matters in air mode)
  color: string;
}

const objects: DropObject[] = [
  { id: "feather", name: "Feather", airResistance: 0.95, color: "#00e5ff" },
  { id: "bowling", name: "Bowling Ball", airResistance: 0.05, color: "#666680" },
  { id: "cat", name: "Cat", airResistance: 0.4, color: "#ffc107" },
  { id: "brick", name: "Brick", airResistance: 0.15, color: "#d4845a" },
  { id: "human", name: "Human", airResistance: 0.3, color: "#e0e0e8" },
];

// Draw each object as CSS
function ObjectIcon({ id, color }: { id: string; color: string }) {
  switch (id) {
    case "feather":
      return (
        <div style={{
          width: 40, height: 12, borderRadius: "50%",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 10px ${color}`,
          transform: "rotate(-15deg)",
        }} />
      );
    case "bowling":
      return (
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: `radial-gradient(circle at 40% 40%, #888, ${color})`,
          position: "relative",
        }}>
          <div style={{ position: "absolute", top: 10, left: 12, width: 4, height: 4, borderRadius: "50%", background: "#333" }} />
          <div style={{ position: "absolute", top: 10, left: 20, width: 4, height: 4, borderRadius: "50%", background: "#333" }} />
          <div style={{ position: "absolute", top: 16, left: 16, width: 4, height: 4, borderRadius: "50%", background: "#333" }} />
        </div>
      );
    case "cat":
      return (
        <div style={{ position: "relative", width: 36, height: 36 }}>
          {/* Ears */}
          <div style={{ position: "absolute", left: 4, top: 0, width: 0, height: 0,
            borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
            borderBottom: `10px solid ${color}` }} />
          <div style={{ position: "absolute", right: 4, top: 0, width: 0, height: 0,
            borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
            borderBottom: `10px solid ${color}` }} />
          {/* Head */}
          <div style={{ position: "absolute", top: 6, left: 3, width: 30, height: 26, borderRadius: "50%", background: color }} />
          {/* Eyes */}
          <div style={{ position: "absolute", top: 15, left: 11, width: 5, height: 5, borderRadius: "50%", background: "#0a0a0f" }} />
          <div style={{ position: "absolute", top: 15, left: 20, width: 5, height: 5, borderRadius: "50%", background: "#0a0a0f" }} />
        </div>
      );
    case "brick":
      return (
        <div style={{
          width: 44, height: 24, background: color, borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.3)",
          boxShadow: `inset 0 -2px 0 rgba(0,0,0,0.2)`,
        }} />
      );
    case "human":
      return (
        <svg width="30" height="40" viewBox="0 0 30 40">
          <circle cx="15" cy="6" r="5" fill={color} />
          <line x1="15" y1="11" x2="15" y2="28" stroke={color} strokeWidth="2" />
          <line x1="15" y1="16" x2="5" y2="22" stroke={color} strokeWidth="2" />
          <line x1="15" y1="16" x2="25" y2="22" stroke={color} strokeWidth="2" />
          <line x1="15" y1="28" x2="8" y2="38" stroke={color} strokeWidth="2" />
          <line x1="15" y1="28" x2="22" y2="38" stroke={color} strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DropTest({ mode }: DropTestProps) {
  const [order, setOrder] = useState(() => [...objects].sort(() => Math.random() - 0.5));
  const [dropped, setDropped] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleDrop = useCallback(() => {
    setDropped(true);
    // Show result after animation
    setTimeout(() => setShowResult(true), mode === "vacuum" ? 2000 : 3000);
  }, [mode]);

  const moveItem = (fromIdx: number, toIdx: number) => {
    const newOrder = [...order];
    const [item] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, item);
    setOrder(newOrder);
  };

  if (dropped) {
    // Animation phase
    return (
      <div style={{
        width: "100vw", height: "100vh", background: "#0a0a0f",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "flex-start", padding: "2rem",
      }}>
        <div style={{
          fontSize: "1.5rem", color: mode === "vacuum" ? "#00e5ff" : "#ff2d7b",
          fontWeight: 700, marginBottom: "2rem",
          textShadow: `0 0 15px ${mode === "vacuum" ? "#00e5ff" : "#ff2d7b"}`,
        }}>
          {mode === "vacuum" ? "VACUUM DROP" : "AIR RESISTANCE DROP"}
        </div>
        <div style={{
          flex: 1, width: "100%", maxWidth: "400px",
          display: "flex", justifyContent: "space-around", alignItems: "flex-start",
          position: "relative",
        }}>
          {objects.map((obj) => {
            const delay = mode === "vacuum" ? 0 : obj.airResistance * 1.5;
            const duration = mode === "vacuum" ? 1.5 : 1.5 + obj.airResistance * 2;
            return (
              <div
                key={obj.id}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem",
                  animation: `drop-fall ${duration}s ease-in ${delay}s both`,
                  position: "relative",
                }}
              >
                <ObjectIcon id={obj.id} color={obj.color} />
                <span style={{ fontSize: "0.7rem", color: obj.color }}>{obj.name}</span>
              </div>
            );
          })}
        </div>
        {showResult && (
          <div style={{
            position: "absolute", bottom: "15%", left: "50%", transform: "translateX(-50%)",
            textAlign: "center", animation: "fade-in-up 0.5s ease both",
          }}>
            <div style={{
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: 700,
              color: mode === "vacuum" ? "#00e5ff" : "#ff2d7b",
              textShadow: `0 0 20px ${mode === "vacuum" ? "#00e5ff" : "#ff2d7b"}`,
            }}>
              {mode === "vacuum"
                ? "They ALL hit at the same time!"
                : "The bowling ball wins! The feather floats down last."}
            </div>
            <div style={{
              fontSize: "1rem", color: "var(--text-secondary)", marginTop: "0.5rem",
            }}>
              {mode === "vacuum"
                ? "Without air, gravity pulls everything equally at 9.8 m/s\u00B2"
                : "Air resistance depends on shape and surface area"}
            </div>
          </div>
        )}
        <style>{`
          @keyframes drop-fall {
            0% { transform: translateY(0); }
            100% { transform: translateY(60vh); }
          }
        `}</style>
      </div>
    );
  }

  // Prediction phase -- drag to reorder
  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#0a0a0f",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "1.5rem",
    }}>
      <div style={{
        fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
        color: mode === "vacuum" ? "#00e5ff" : "#ff2d7b",
        fontWeight: 700, textAlign: "center", marginBottom: "0.5rem",
        textShadow: `0 0 15px ${mode === "vacuum" ? "#00e5ff" : "#ff2d7b"}`,
      }}>
        {mode === "vacuum" ? "VACUUM DROP TEST" : "AIR RESISTANCE DROP TEST"}
      </div>
      <div style={{
        fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "1.5rem", textAlign: "center",
      }}>
        Tap cards to reorder: #1 = hits ground first
      </div>
      <div style={{
        flex: 1, width: "100%", maxWidth: "400px",
        display: "flex", flexDirection: "column", gap: "0.7rem",
      }}>
        {order.map((obj, idx) => (
          <div
            key={obj.id}
            onClick={() => {
              if (dragIdx === null) {
                setDragIdx(idx);
              } else {
                moveItem(dragIdx, idx);
                setDragIdx(null);
              }
            }}
            style={{
              display: "flex", alignItems: "center", gap: "1rem",
              padding: "0.8rem 1rem",
              background: dragIdx === idx ? `${obj.color}20` : "var(--bg-card)",
              borderRadius: "12px",
              border: dragIdx === idx ? `2px solid ${obj.color}` : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{
              width: "2rem", height: "2rem", borderRadius: "50%",
              background: "var(--bg-secondary)", display: "flex",
              justifyContent: "center", alignItems: "center",
              fontSize: "1rem", fontWeight: 700, color: obj.color,
              fontFamily: "var(--font-mono)",
            }}>
              {idx + 1}
            </span>
            <ObjectIcon id={obj.id} color={obj.color} />
            <span style={{ color: obj.color, fontWeight: 600, fontSize: "1.1rem" }}>
              {obj.name}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={handleDrop}
        style={{
          marginTop: "1rem",
          padding: "1rem 3rem",
          fontSize: "1.3rem",
          fontWeight: 700,
          background: mode === "vacuum" ? "#00e5ff" : "#ff2d7b",
          color: "#0a0a0f",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          boxShadow: `0 0 30px ${mode === "vacuum" ? "#00e5ff60" : "#ff2d7b60"}`,
        }}
      >
        DROP!
      </button>
    </div>
  );
}
