import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface PollResultsProps {
  sessionId: Id<"sessions">;
  slideContext: string;
  options: { label: string; value: string; color: string }[];
}

export default function PollResults({ sessionId, slideContext, options }: PollResultsProps) {
  const results = useQuery(api.polls.getResults, { sessionId, slideContext });

  if (!results) return null;

  const maxCount = Math.max(...Object.values(results.counts), 1);

  return (
    <div style={{
      width: "80%",
      maxWidth: "700px",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    }}>
      {options.map((option) => {
        const count = results.counts[option.value] ?? 0;
        const pct = results.total > 0 ? Math.round((count / results.total) * 100) : 0;
        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

        return (
          <div key={option.value} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "var(--slide-body)",
              fontWeight: 600,
            }}>
              <span style={{ color: option.color }}>{option.label}</span>
              <span style={{
                color: option.color,
                fontFamily: "var(--font-mono)",
                textShadow: `0 0 10px ${option.color}`,
              }}>
                {count} ({pct}%)
              </span>
            </div>
            <div style={{
              width: "100%",
              height: "2.5rem",
              background: "var(--bg-card)",
              borderRadius: "8px",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${barWidth}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${option.color}80, ${option.color})`,
                borderRadius: "8px",
                transition: "width 0.5s ease",
                boxShadow: `0 0 15px ${option.color}60`,
              }} />
            </div>
          </div>
        );
      })}
      <div style={{
        textAlign: "center",
        fontSize: "var(--slide-small)",
        color: "var(--text-secondary)",
        fontFamily: "var(--font-mono)",
        marginTop: "0.5rem",
      }}>
        {results.total} vote{results.total !== 1 ? "s" : ""} total
      </div>
    </div>
  );
}
