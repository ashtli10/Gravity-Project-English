import { useState, useRef, useEffect } from "react";

interface AirlockDropProps {
  mode: "vacuum" | "air";
  showDrop?: boolean;
  onScored?: (score: number) => void;
}

interface DropObject {
  id: string;
  name: string;
  airResistance: number; // 0 = no resistance, higher = more (only matters in atmosphere)
  color: string;
}

// Ordered conceptually heaviest/densest (low resistance) -> lightest (high resistance).
const objects: DropObject[] = [
  { id: "shard", name: "Ice Shard", airResistance: 0.05, color: "#88ccff" },
  { id: "wrench", name: "Wrench", airResistance: 0.15, color: "#c0c0d0" },
  { id: "helmet", name: "Helmet", airResistance: 0.3, color: "#e0e0e8" },
  { id: "drone", name: "Sensor Drone", airResistance: 0.4, color: "#ffc107" },
  { id: "sail", name: "Solar Sail", airResistance: 0.95, color: "#00e5ff" },
];

// Draw each object as CSS/SVG — no emoji.
function ObjectIcon({ id, color }: { id: string; color: string }) {
  switch (id) {
    case "shard":
      return (
        <svg width="38" height="48" viewBox="0 0 30 40">
          <polygon
            points="15,2 26,16 18,38 12,38 4,16"
            fill={color}
            opacity="0.85"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
          <polygon points="15,2 26,16 15,20" fill="#ffffff" opacity="0.5" />
        </svg>
      );
    case "wrench":
      return (
        <svg width="46" height="46" viewBox="0 0 40 40" style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
          <path
            d="M28 6a8 8 0 0 0-9.5 10.3L6 28.8l5.2 5.2 12.5-12.5A8 8 0 1 0 28 6zm0 5.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"
            fill={color}
          />
        </svg>
      );
    case "helmet":
      return (
        <div style={{ position: "relative", width: 46, height: 46 }}>
          <div style={{
            position: "absolute", inset: 2, borderRadius: "50%",
            background: `radial-gradient(circle at 38% 34%, #ffffff, ${color})`,
            boxShadow: `0 0 10px ${color}`,
          }} />
          {/* Visor */}
          <div style={{
            position: "absolute", top: 14, left: 9, width: 28, height: 16,
            borderRadius: "10px", background: "#0a0a0f", opacity: 0.85,
            border: "1px solid #00e5ff55",
          }} />
        </div>
      );
    case "drone":
      return (
        <div style={{ position: "relative", width: 50, height: 40 }}>
          {/* Body */}
          <div style={{
            position: "absolute", top: 12, left: 17, width: 16, height: 16,
            borderRadius: 4, background: color, boxShadow: `0 0 8px ${color}`,
          }} />
          {/* Rotors */}
          {[[4, 6], [38, 6], [4, 28], [38, 28]].map(([x, y], i) => (
            <div key={i} style={{
              position: "absolute", left: x, top: y, width: 9, height: 9,
              borderRadius: "50%", border: `2px solid ${color}`,
            }} />
          ))}
          {/* Sensor eye */}
          <div style={{ position: "absolute", top: 18, left: 22, width: 6, height: 6, borderRadius: "50%", background: "#00e5ff" }} />
        </div>
      );
    case "sail":
      return (
        <div style={{
          width: 54, height: 16, borderRadius: "3px",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 12px ${color}`,
          transform: "rotate(-12deg)",
          border: `1px solid ${color}55`,
        }} />
      );
    default:
      return null;
  }
}

// Correct order for atmosphere mode: lowest air resistance falls fastest.
function scoreArrangement(studentOrder: DropObject[]): number {
  let correct = 0;
  for (let i = 0; i < studentOrder.length; i++) {
    for (let j = i + 1; j < studentOrder.length; j++) {
      // Student says i lands before j; correct if i has <= air resistance.
      if (studentOrder[i].airResistance <= studentOrder[j].airResistance) {
        correct++;
      }
    }
  }
  return correct; // 0-10
}

export default function AirlockDrop({ mode, showDrop, onScored }: AirlockDropProps) {
  const [order, setOrder] = useState(() => [...objects].sort(() => Math.random() - 0.5));
  const [dropped, setDropped] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [dragState, setDragState] = useState<{ index: number; startY: number; currentY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scoredRef = useRef(false);

  useEffect(() => {
    if (showDrop && !dropped) {
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
    const accent = mode === "vacuum" ? "#00e5ff" : "#ff2d7b";
    return (
      <div style={{
        width: "100vw", height: "100vh", background: "#0a0a0f",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "flex-start", padding: "1rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          fontSize: "clamp(1.4rem, 4vw, 2rem)", color: accent,
          fontWeight: 700, marginBottom: "1rem",
          textShadow: `0 0 15px ${accent}`,
          zIndex: 2,
        }}>
          {mode === "vacuum" ? "AIRLESS SURFACE" : "DOME ATMOSPHERE"}
        </div>

        {showResult && (
          <div style={{
            zIndex: 3, textAlign: "center", padding: "0 1rem",
            animation: "scale-in 0.5s ease both",
          }}>
            <div style={{
              fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
              fontWeight: 900,
              color: accent,
              textShadow: `0 0 25px ${accent}, 0 0 50px ${accent}60`,
            }}>
              {mode === "vacuum"
                ? "They ALL hit at the same time!"
                : "The ice shard wins! The solar sail drifts down last."}
            </div>
            <div style={{
              fontSize: "1rem", color: "var(--text-secondary)", marginTop: "0.5rem",
            }}>
              {mode === "vacuum"
                ? "With no air, gravity pulls every mass at the same rate."
                : "In atmosphere, air resistance depends on shape and surface area."}
            </div>
          </div>
        )}

        <div style={{
          flex: 1, width: "100%", maxWidth: "min(95vw, 600px)",
          display: "flex", justifyContent: "space-around", alignItems: "flex-start",
          position: "relative", marginTop: "1rem",
          zIndex: 1,
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
                <span style={{ fontSize: "0.75rem", color: obj.color, opacity: 0.8 }}>{obj.name}</span>
              </div>
            );
          })}
        </div>
        <style>{`
          @keyframes drop-fall {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(60vh); opacity: 0.4; }
          }
          @keyframes scale-in {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Prediction phase — drag to reorder
  const ROW_HEIGHT = 78;

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
        {mode === "vacuum" ? "AIRLOCK · VACUUM TEST" : "DOME · ATMOSPHERE TEST"}
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
        Waiting for the airlock to open...
      </div>
    </div>
  );
}
