import { useState, useRef, useEffect } from "react";

interface DropTestProps {
  mode: "vacuum" | "air";
  showDrop?: boolean;
  onScored?: (score: number) => void;
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
          width: 50, height: 15, borderRadius: "50%",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 10px ${color}`,
          transform: "rotate(-15deg)",
        }} />
      );
    case "bowling":
      return (
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: `radial-gradient(circle at 40% 40%, #888, ${color})`,
          position: "relative",
        }}>
          <div style={{ position: "absolute", top: 12, left: 15, width: 5, height: 5, borderRadius: "50%", background: "#333" }} />
          <div style={{ position: "absolute", top: 12, left: 24, width: 5, height: 5, borderRadius: "50%", background: "#333" }} />
          <div style={{ position: "absolute", top: 20, left: 20, width: 5, height: 5, borderRadius: "50%", background: "#333" }} />
        </div>
      );
    case "cat":
      return (
        <div style={{ position: "relative", width: 44, height: 44 }}>
          {/* Ears */}
          <div style={{ position: "absolute", left: 4, top: 0, width: 0, height: 0,
            borderLeft: "7px solid transparent", borderRight: "7px solid transparent",
            borderBottom: `12px solid ${color}` }} />
          <div style={{ position: "absolute", right: 4, top: 0, width: 0, height: 0,
            borderLeft: "7px solid transparent", borderRight: "7px solid transparent",
            borderBottom: `12px solid ${color}` }} />
          {/* Head */}
          <div style={{ position: "absolute", top: 7, left: 4, width: 36, height: 32, borderRadius: "50%", background: color }} />
          {/* Eyes */}
          <div style={{ position: "absolute", top: 19, left: 13, width: 6, height: 6, borderRadius: "50%", background: "#0a0a0f" }} />
          <div style={{ position: "absolute", top: 19, left: 25, width: 6, height: 6, borderRadius: "50%", background: "#0a0a0f" }} />
        </div>
      );
    case "brick":
      return (
        <div style={{
          width: 54, height: 30, background: color, borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.3)",
          boxShadow: `inset 0 -2px 0 rgba(0,0,0,0.2)`,
        }} />
      );
    case "human":
      return (
        <svg width="38" height="50" viewBox="0 0 30 40">
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

// Correct order for air mode: lowest air resistance falls fastest
const AIR_CORRECT_ORDER = [...objects].sort((a, b) => a.airResistance - b.airResistance);

function scoreArrangement(studentOrder: DropObject[]): number {
  // Count correctly ordered pairs (out of 10 total pairs for 5 items)
  let correct = 0;
  for (let i = 0; i < studentOrder.length; i++) {
    for (let j = i + 1; j < studentOrder.length; j++) {
      // Student says i falls before j. Check if that's correct (lower air resistance = falls faster).
      if (studentOrder[i].airResistance <= studentOrder[j].airResistance) {
        correct++;
      }
    }
  }
  return correct; // 0-10
}

export default function DropTest({ mode, showDrop, onScored }: DropTestProps) {
  const [order, setOrder] = useState(() => [...objects].sort(() => Math.random() - 0.5));
  const [dropped, setDropped] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [dragState, setDragState] = useState<{ index: number; startY: number; currentY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scoredRef = useRef(false);

  // Auto-drop when presenter triggers the show event
  useEffect(() => {
    if (showDrop && !dropped) {
      // Score the arrangement for air mode before dropping
      if (mode === "air" && !scoredRef.current) {
        scoredRef.current = true;
        onScored?.(scoreArrangement(order));
      }
      setDropped(true);
      setTimeout(() => setShowResult(true), mode === "vacuum" ? 2000 : 3000);
    }
  }, [showDrop, dropped, mode]);

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
        justifyContent: "flex-start", padding: "1rem",
      }}>
        <div style={{
          fontSize: "clamp(1.4rem, 4vw, 2rem)", color: mode === "vacuum" ? "#00e5ff" : "#ff2d7b",
          fontWeight: 700, marginBottom: "2rem",
          textShadow: `0 0 15px ${mode === "vacuum" ? "#00e5ff" : "#ff2d7b"}`,
        }}>
          {mode === "vacuum" ? "VACUUM DROP" : "AIR RESISTANCE DROP"}
        </div>
        <div style={{
          flex: 1, width: "100%", maxWidth: "min(95vw, 600px)",
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
                <span style={{ fontSize: "0.85rem", color: obj.color }}>{obj.name}</span>
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
  const ROW_HEIGHT = 78; // larger cards + slightly smaller gap

  const getDragTargetIndex = (fromIndex: number, deltaY: number) => {
    const rawTarget = fromIndex + Math.round(deltaY / ROW_HEIGHT);
    return Math.max(0, Math.min(order.length - 1, rawTarget));
  };

  const getShiftForIndex = (cardIndex: number) => {
    if (!dragState) return 0;
    const dragFrom = dragState.index;
    const deltaY = dragState.currentY - dragState.startY;
    const targetIndex = getDragTargetIndex(dragFrom, deltaY);
    if (dragFrom < targetIndex && cardIndex > dragFrom && cardIndex <= targetIndex) {
      return -ROW_HEIGHT;
    }
    if (dragFrom > targetIndex && cardIndex >= targetIndex && cardIndex < dragFrom) {
      return ROW_HEIGHT;
    }
    return 0;
  };

  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#0a0a0f",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "1rem",
    }}>
      <div style={{
        fontSize: "clamp(1.4rem, 4vw, 2rem)",
        color: mode === "vacuum" ? "#00e5ff" : "#ff2d7b",
        fontWeight: 700, textAlign: "center", marginBottom: "0.3rem",
        textShadow: `0 0 15px ${mode === "vacuum" ? "#00e5ff" : "#ff2d7b"}`,
      }}>
        {mode === "vacuum" ? "VACUUM DROP TEST" : "AIR RESISTANCE DROP TEST"}
      </div>
      <div style={{
        fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "0.8rem", textAlign: "center",
      }}>
        Drag to reorder: #1 = hits ground first
      </div>
      <div
        ref={containerRef}
        style={{
          flex: 1, width: "100%", maxWidth: "min(95vw, 600px)",
          display: "flex", flexDirection: "column", gap: "0.6rem",
          touchAction: "none",
        }}
      >
        {order.map((obj, idx) => {
          const isDragging = dragState !== null && dragState.index === idx;
          const deltaY = isDragging ? dragState.currentY - dragState.startY : 0;
          const shift = !isDragging ? getShiftForIndex(idx) : 0;

          return (
            <div
              key={obj.id}
              onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                setDragState({ index: idx, startY: e.clientY, currentY: e.clientY });
              }}
              onPointerMove={(e) => {
                if (dragState && dragState.index === idx) {
                  setDragState({ ...dragState, currentY: e.clientY });
                }
              }}
              onPointerUp={(e) => {
                if (dragState && dragState.index === idx) {
                  const finalDeltaY = e.clientY - dragState.startY;
                  const targetIndex = getDragTargetIndex(dragState.index, finalDeltaY);
                  if (targetIndex !== dragState.index) {
                    moveItem(dragState.index, targetIndex);
                  }
                  setDragState(null);
                }
              }}
              style={{
                display: "flex", alignItems: "center", gap: "1rem",
                padding: "1rem 1.2rem",
                background: isDragging ? `${obj.color}20` : "var(--bg-card)",
                borderRadius: "12px",
                border: isDragging ? `2px solid ${obj.color}` : "2px solid transparent",
                cursor: isDragging ? "grabbing" : "grab",
                transform: isDragging
                  ? `translateY(${deltaY}px) scale(1.05)`
                  : `translateY(${shift}px)`,
                transition: isDragging
                  ? "box-shadow 0.2s ease"
                  : "transform 0.2s ease, box-shadow 0.2s ease",
                boxShadow: isDragging ? `0 8px 24px rgba(0,0,0,0.4)` : "none",
                zIndex: isDragging ? 10 : 1,
                position: "relative",
                userSelect: "none",
              }}
            >
              <span style={{
                width: "2.4rem", height: "2.4rem", borderRadius: "50%",
                background: "var(--bg-secondary)", display: "flex",
                justifyContent: "center", alignItems: "center",
                fontSize: "1.1rem", fontWeight: 700, color: obj.color,
                fontFamily: "var(--font-mono)",
              }}>
                {idx + 1}
              </span>
              <ObjectIcon id={obj.id} color={obj.color} />
              <span style={{ color: obj.color, fontWeight: 600, fontSize: "1.25rem" }}>
                {obj.name}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop: "0.8rem",
        fontSize: "1rem",
        color: "rgba(255,255,255,0.35)",
        textAlign: "center",
        animation: "pulse-glow 2s ease-in-out infinite",
      }}>
        Waiting for drop...
      </div>
    </div>
  );
}
