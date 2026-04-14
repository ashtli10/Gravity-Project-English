import { useState } from "react";

const moves = [
  { name: "Wall Run", correct: true, icon: "\uD83C\uDFC3" },
  { name: "Kong Vault", correct: true, icon: "\uD83D\uDC12" },
  { name: "Precision Jump", correct: true, icon: "\uD83C\uDFAF" },
  { name: "Roll", correct: true, icon: "\uD83D\uDD04" },
  { name: "Cat Leap", correct: false, icon: "\uD83D\uDC31" },
  { name: "Dash Vault", correct: false, icon: "\uD83D\uDCA8" },
];

export default function MoveSpotter() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const toggle = (name: string) => {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const correctCount = moves.filter((m) => m.correct && selected.has(m.name)).length;
  const wrongCount = moves.filter((m) => !m.correct && selected.has(m.name)).length;

  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#0a0a0f",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "1.5rem", gap: "1rem",
    }}>
      <div style={{
        fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
        color: "#ff2d7b", fontWeight: 700,
        textShadow: "0 0 15px #ff2d7b",
      }}>
        MOVE SPOTTER
      </div>
      <div style={{
        fontSize: "1rem", color: "var(--text-secondary)", textAlign: "center",
      }}>
        Which moves did you spot in the video? Tap to select.
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "0.8rem",
        width: "100%",
        maxWidth: "400px",
        flex: 1,
        alignContent: "center",
      }}>
        {moves.map((move) => {
          const isSelected = selected.has(move.name);
          const isCorrect = move.correct;
          let bg = "var(--bg-card)";
          let border = "2px solid transparent";
          if (submitted) {
            if (isSelected && isCorrect) {
              bg = "#00e67620";
              border = "2px solid #00e676";
            } else if (isSelected && !isCorrect) {
              bg = "#ff2d7b20";
              border = "2px solid #ff2d7b";
            } else if (!isSelected && isCorrect) {
              bg = "#ffc10720";
              border = "2px dashed #ffc107";
            }
          } else if (isSelected) {
            bg = "#ff2d7b15";
            border = "2px solid #ff2d7b";
          }

          return (
            <div
              key={move.name}
              onClick={() => toggle(move.name)}
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "1.2rem 0.5rem",
                background: bg, border, borderRadius: "12px",
                cursor: submitted ? "default" : "pointer",
                transition: "all 0.2s ease",
                gap: "0.4rem",
              }}
            >
              <span style={{ fontSize: "2rem" }}>{move.icon}</span>
              <span style={{
                fontSize: "1rem", fontWeight: 600,
                color: isSelected ? "#ff2d7b" : "var(--text-primary)",
              }}>
                {move.name}
              </span>
              {submitted && (
                <span style={{
                  fontSize: "0.75rem",
                  color: isCorrect ? "#00e676" : "#ff2d7b",
                }}>
                  {isSelected && isCorrect ? "\u2713 Correct!" : ""}
                  {isSelected && !isCorrect ? "\u2717 Not in video" : ""}
                  {!isSelected && isCorrect ? "Missed!" : ""}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          style={{
            padding: "1rem 3rem", fontSize: "1.2rem", fontWeight: 700,
            background: "#ff2d7b", color: "#0a0a0f", border: "none",
            borderRadius: "12px", cursor: "pointer",
            boxShadow: "0 0 25px #ff2d7b60",
          }}
        >
          CHECK ANSWERS
        </button>
      ) : (
        <div style={{
          fontSize: "1.2rem", fontWeight: 600, textAlign: "center",
          color: correctCount >= 3 ? "#00e676" : "#ffc107",
        }}>
          {correctCount} correct, {wrongCount} wrong!
        </div>
      )}
    </div>
  );
}
