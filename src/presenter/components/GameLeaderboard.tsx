import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface GameLeaderboardProps {
  sessionId: Id<"sessions">;
  game: "rooftopRun" | "planetaryParkour" | "gravitySurge" | "videoQuiz" | "dropTestAir";
  title: string;
  accent: string;
  scoreUnit: string;
}

const RANK_COLORS = [
  "#ffd700", // 1st - gold
  "#c0c0c0", // 2nd - silver
  "#cd7f32", // 3rd - bronze
];

export default function GameLeaderboard({
  sessionId,
  game,
  title,
  accent,
  scoreUnit,
}: GameLeaderboardProps) {
  const leaderboard = useQuery(api.leaderboard.getLeaderboard, {
    sessionId,
    game,
  });

  if (!leaderboard) return null;

  if (leaderboard.length === 0) {
    return (
      <div
        style={{
          width: "80%",
          maxWidth: "700px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            fontWeight: 900,
            color: accent,
            textShadow: `0 0 20px ${accent}80, 0 0 40px ${accent}40`,
            marginBottom: "2rem",
            letterSpacing: "0.06em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "1.2rem",
            color: "#ffffff40",
            animation: "fade-in-up 0.6s ease both",
          }}
        >
          Waiting for scores...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "80%",
        maxWidth: "700px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.4rem",
      }}
    >
      <div
        style={{
          fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
          fontWeight: 900,
          color: accent,
          textShadow: `0 0 20px ${accent}80, 0 0 40px ${accent}40`,
          marginBottom: "1rem",
          letterSpacing: "0.06em",
        }}
      >
        {title}
      </div>

      {leaderboard.map((entry) => {
        const isTop3 = entry.rank <= 3;
        const isFirst = entry.rank === 1;
        const rankColor = RANK_COLORS[entry.rank - 1] ?? "#ffffff60";
        const delay = entry.rank * 0.1;

        return (
          <div
            key={entry.rank}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: isFirst
                ? "0.9rem 1.2rem"
                : isTop3
                  ? "0.7rem 1.2rem"
                  : "0.5rem 1.2rem",
              background: isFirst
                ? `linear-gradient(135deg, ${accent}18, ${accent}08)`
                : "rgba(255,255,255,0.03)",
              border: isFirst
                ? `2px solid ${accent}60`
                : isTop3
                  ? `1px solid ${rankColor}30`
                  : "1px solid transparent",
              borderRadius: "10px",
              animation: `fade-in-up 0.5s ease ${delay}s both`,
              boxShadow: isFirst
                ? `0 0 25px ${accent}25, inset 0 0 25px ${accent}08`
                : "none",
            }}
          >
            {/* Rank */}
            <div
              style={{
                fontSize: isFirst ? "1.8rem" : isTop3 ? "1.4rem" : "1.1rem",
                fontWeight: 900,
                color: rankColor,
                textShadow: isTop3 ? `0 0 12px ${rankColor}60` : "none",
                width: "2.5rem",
                textAlign: "center",
                fontFamily: "var(--font-mono)",
              }}
            >
              {isFirst ? "\u{1F451}" : `#${entry.rank}`}
            </div>

            {/* Name */}
            <div
              style={{
                flex: 1,
                fontSize: isFirst ? "1.5rem" : isTop3 ? "1.2rem" : "1rem",
                fontWeight: isFirst ? 800 : isTop3 ? 700 : 600,
                color: isFirst ? "#ffffff" : isTop3 ? "#e0e0e8" : "#a0a0b0",
                textShadow: isFirst
                  ? `0 0 15px ${accent}60`
                  : "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {entry.playerName}
            </div>

            {/* Score */}
            <div
              style={{
                fontSize: isFirst ? "1.4rem" : isTop3 ? "1.1rem" : "0.95rem",
                fontWeight: 700,
                color: isFirst ? accent : isTop3 ? rankColor : "#ffffff50",
                fontFamily: "var(--font-mono)",
                textShadow: isFirst ? `0 0 10px ${accent}80` : "none",
              }}
            >
              {entry.rawScore}
              <span style={{ fontSize: "0.75em", opacity: 0.7, marginLeft: "0.2em" }}>
                {scoreUnit}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
