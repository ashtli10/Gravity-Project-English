import { useState, useRef } from "react";

interface VideoQuizProps {
  onFinished?: (score: number) => void;
}

interface Question {
  question: string;
  options: string[];
  correct: number; // index of correct answer
}

const questions: Question[] = [
  {
    question: "Why did they start running across the rooftops?",
    options: [
      "They were racing each other",
      "A security guard told them to leave",
      "They were late for something",
      "The police were chasing them",
    ],
    correct: 1,
  },
  {
    question: "What color was the security guard's vest?",
    options: ["Orange", "Red", "Green", "Yellow"],
    correct: 3,
  },
  {
    question: "What was the color of the double-decker bus they landed on?",
    options: [
      "Red",
      "Blue, white and orange",
      "Green",
      "Yellow",
    ],
    correct: 1,
  },
  {
    question: "What were the rooftops covered with?",
    options: [
      "Grass and plants",
      "Solar panels",
      "AC units and ventilation ducts",
      "Antennas",
    ],
    correct: 2,
  },
];

export default function VideoQuiz({ onFinished }: VideoQuizProps = {}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const submittedRef = useRef(false);

  const q = questions[currentQ];

  const handleSelect = (optionIdx: number) => {
    if (selected !== null) return; // already answered
    setSelected(optionIdx);

    const newScore = optionIdx === q.correct ? score + 1 : score;
    if (optionIdx === q.correct) {
      setScore((s) => s + 1);
    }

    // Auto-advance after a short pause
    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ((prev) => prev + 1);
        setSelected(null);
      } else {
        setFinished(true);
        if (!submittedRef.current) {
          submittedRef.current = true;
          onFinished?.(newScore);
        }
      }
    }, 1200);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const message =
      pct === 100
        ? "Perfect! You watched closely!"
        : pct >= 75
          ? "Great job! You were paying attention!"
          : pct >= 50
            ? "Not bad! You caught most of it."
            : "Watch more carefully next time!";

    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#0a0a0f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            fontSize: "clamp(2.5rem, 8vw, 4rem)",
            fontWeight: 900,
            color: pct >= 75 ? "#00e676" : pct >= 50 ? "#ffc107" : "#ff2d7b",
            textShadow: `0 0 30px ${pct >= 75 ? "#00e676" : pct >= 50 ? "#ffc107" : "#ff2d7b"}`,
            animation: "scale-in 0.5s ease both",
          }}
        >
          {score}/{questions.length}
        </div>
        <div
          style={{
            fontSize: "clamp(1.2rem, 3.5vw, 1.6rem)",
            color: "var(--text-primary)",
            fontWeight: 600,
            textAlign: "center",
            animation: "fade-in-up 0.5s ease 0.3s both",
          }}
        >
          {message}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0a0a0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: "clamp(1.2rem, 3.5vw, 1.6rem)",
          color: "#ff2d7b",
          fontWeight: 700,
          textShadow: "0 0 15px #ff2d7b",
          marginBottom: "0.3rem",
        }}
      >
        VIDEO QUIZ
      </div>

      {/* Progress */}
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          marginBottom: "1rem",
        }}
      >
        {questions.map((_, i) => (
          <div
            key={i}
            style={{
              width: "clamp(20px, 4vw, 32px)",
              height: 4,
              borderRadius: 2,
              background:
                i < currentQ
                  ? "#00e676"
                  : i === currentQ
                    ? "#ff2d7b"
                    : "rgba(255,255,255,0.15)",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Question */}
      <div
        key={currentQ}
        style={{
          width: "100%",
          maxWidth: "min(95vw, 600px)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          animation: "fade-in-up 0.35s ease both",
        }}
      >
        <div
          style={{
            fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
            color: "var(--text-primary)",
            fontWeight: 600,
            textAlign: "center",
            lineHeight: 1.4,
            marginBottom: "0.5rem",
          }}
        >
          {q.question}
        </div>

        {/* Options */}
        {q.options.map((option, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === q.correct;
          const revealed = selected !== null;

          let bg = "var(--bg-card)";
          let border = "2px solid rgba(255,255,255,0.08)";
          let textColor = "var(--text-primary)";

          if (revealed) {
            if (isCorrect) {
              bg = "rgba(0, 230, 118, 0.15)";
              border = "2px solid #00e676";
              textColor = "#00e676";
            } else if (isSelected && !isCorrect) {
              bg = "rgba(255, 45, 123, 0.15)";
              border = "2px solid #ff2d7b";
              textColor = "#ff2d7b";
            } else {
              textColor = "rgba(255,255,255,0.3)";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                width: "100%",
                padding: "1rem 1.2rem",
                background: bg,
                border,
                borderRadius: "12px",
                cursor: revealed ? "default" : "pointer",
                transition: "all 0.25s ease",
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  width: "2.2rem",
                  height: "2.2rem",
                  borderRadius: "50%",
                  background: revealed && isCorrect
                    ? "rgba(0,230,118,0.2)"
                    : revealed && isSelected
                      ? "rgba(255,45,123,0.2)"
                      : "var(--bg-secondary)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: textColor,
                  fontFamily: "var(--font-mono)",
                  flexShrink: 0,
                }}
              >
                {revealed && isCorrect
                  ? "\u2713"
                  : revealed && isSelected
                    ? "\u2717"
                    : String.fromCharCode(65 + idx)}
              </span>
              <span
                style={{
                  fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                  fontWeight: 500,
                  color: textColor,
                }}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Score counter */}
      <div
        style={{
          marginTop: "0.5rem",
          fontSize: "0.9rem",
          color: "rgba(255,255,255,0.4)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {currentQ + 1} / {questions.length}
      </div>
    </div>
  );
}
