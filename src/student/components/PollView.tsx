import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface PollViewProps {
  sessionId: Id<"sessions">;
  voterId: string;
}

const options = [
  { label: "Yes, definitely!", value: "yes", color: "#00e676" },
  { label: "Maybe with training", value: "maybe", color: "#ffc107" },
  { label: "No way!", value: "no", color: "#ff2d7b" },
];

const SLIDE_CONTEXT = "would-you-try-parkour";

export default function PollView({ sessionId, voterId }: PollViewProps) {
  const [voted, setVoted] = useState<string | null>(null);
  const submitVote = useMutation(api.polls.submitVote);
  const results = useQuery(api.polls.getResults, { sessionId, slideContext: SLIDE_CONTEXT });

  const handleVote = async (value: string) => {
    setVoted(value);
    await submitVote({
      sessionId,
      slideContext: SLIDE_CONTEXT,
      vote: value,
      voterId,
    });
  };

  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#0a0a0f",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "2rem", gap: "1.5rem",
    }}>
      <div style={{
        fontSize: "clamp(1.5rem, 4vw, 2rem)",
        color: "#b388ff", fontWeight: 700,
        textShadow: "0 0 15px #b388ff",
        textAlign: "center",
      }}>
        Would you try parkour?
      </div>

      <div style={{
        display: "flex", flexDirection: "column", gap: "1rem",
        width: "100%", maxWidth: "400px",
      }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleVote(opt.value)}
            disabled={voted !== null}
            style={{
              padding: "1.2rem",
              fontSize: "1.2rem",
              fontWeight: 600,
              background: voted === opt.value ? `${opt.color}30` : "var(--bg-card)",
              color: opt.color,
              border: voted === opt.value ? `2px solid ${opt.color}` : "2px solid transparent",
              borderRadius: "12px",
              cursor: voted ? "default" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: voted === opt.value ? `0 0 20px ${opt.color}40` : "none",
              opacity: voted && voted !== opt.value ? 0.5 : 1,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {voted && results && (
        <div style={{
          width: "100%", maxWidth: "400px",
          animation: "fade-in-up 0.5s ease both",
        }}>
          <div style={{
            fontSize: "1rem", color: "var(--text-secondary)",
            textAlign: "center", marginBottom: "1rem",
          }}>
            {results.total} votes so far
          </div>
          {options.map((opt) => {
            const count = results.counts[opt.value] ?? 0;
            const pct = results.total > 0 ? Math.round((count / results.total) * 100) : 0;
            return (
              <div key={opt.value} style={{ marginBottom: "0.6rem" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: "0.9rem", color: opt.color, marginBottom: "0.2rem",
                }}>
                  <span>{opt.label}</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>{pct}%</span>
                </div>
                <div style={{
                  height: "1.5rem", background: "var(--bg-secondary)", borderRadius: "8px", overflow: "hidden",
                }}>
                  <div style={{
                    width: `${pct}%`, height: "100%",
                    background: `linear-gradient(90deg, ${opt.color}60, ${opt.color})`,
                    borderRadius: "8px",
                    transition: "width 0.5s ease",
                    boxShadow: `0 0 10px ${opt.color}40`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {voted && (
        <div style={{
          fontSize: "1.1rem", color: "#00e676",
          textShadow: "0 0 10px #00e67640",
          animation: "fade-in 0.3s ease",
        }}>
          {"\u2713"} Vote recorded!
        </div>
      )}
    </div>
  );
}
