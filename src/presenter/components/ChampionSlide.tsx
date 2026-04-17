import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface ChampionSlideProps {
  sessionId: Id<"sessions">;
}

const GAME_LABELS: Record<string, { label: string; color: string }> = {
  dropTestAir: { label: "Drop", color: "#00e5ff" },
  videoQuiz: { label: "Quiz", color: "#ff2d7b" },
  rooftopRun: { label: "Rooftop", color: "#ffc107" },
  planetaryParkour: { label: "Planets", color: "#00e676" },
  gravitySurge: { label: "Surge", color: "#b388ff" },
};

const PODIUM_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32"];

export default function ChampionSlide({ sessionId }: ChampionSlideProps) {
  const leaderboard = useQuery(api.leaderboard.getTotalLeaderboard, {
    sessionId,
  });

  if (!leaderboard) return null;

  if (leaderboard.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          animation: "fade-in-up 0.6s ease both",
        }}
      >
        <div
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 900,
            color: "#b388ff",
            textShadow: "0 0 20px #b388ff80",
          }}
        >
          No scores recorded yet
        </div>
      </div>
    );
  }

  const champion = leaderboard[0];

  return (
    <div
      style={{
        width: "85%",
        maxWidth: "750px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.8rem",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
          fontWeight: 900,
          letterSpacing: "0.08em",
          background:
            "linear-gradient(90deg, #00e5ff, #ff2d7b, #ffc107, #00e676, #b388ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "none",
          animation: "fade-in-up 0.6s ease 0s both",
          filter:
            "drop-shadow(0 0 20px rgba(179,136,255,0.4)) drop-shadow(0 0 40px rgba(0,229,255,0.2))",
        }}
      >
        GRAVITY CHAMPION
      </div>

      {/* Champion card */}
      <div
        style={{
          width: "100%",
          padding: "1.2rem 1.5rem",
          background:
            "linear-gradient(135deg, #ffd70015, #ffd70008)",
          border: "2px solid #ffd70060",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          gap: "1.2rem",
          animation: "fade-in-up 0.6s ease 0.2s both",
          boxShadow:
            "0 0 30px #ffd70020, inset 0 0 30px #ffd70008",
        }}
      >
        <div
          style={{
            fontSize: "2.5rem",
            lineHeight: 1,
          }}
        >
          {"\u{1F451}"}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2rem)",
              fontWeight: 900,
              color: "#ffffff",
              textShadow: "0 0 20px #ffd70060",
            }}
          >
            {champion.playerName}
          </div>
          {/* Game score badges */}
          <div
            style={{
              display: "flex",
              gap: "0.6rem",
              marginTop: "0.4rem",
              flexWrap: "wrap",
            }}
          >
            {(
              Object.entries(champion.gameScores) as [string, number][]
            ).map(([game, score]) => {
              const info = GAME_LABELS[game];
              if (!info || score === 0) return null;
              return (
                <span
                  key={game}
                  style={{
                    fontSize: "0.75rem",
                    fontFamily: "var(--font-mono)",
                    color: info.color,
                    background: `${info.color}15`,
                    border: `1px solid ${info.color}30`,
                    borderRadius: "6px",
                    padding: "0.15rem 0.5rem",
                  }}
                >
                  {info.label}: {score}
                </span>
              );
            })}
          </div>
        </div>
        <div
          style={{
            fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)",
            fontWeight: 800,
            color: "#ffd700",
            fontFamily: "var(--font-mono)",
            textShadow: "0 0 15px #ffd70080",
          }}
        >
          {champion.totalScore}
          <span
            style={{
              fontSize: "0.6em",
              opacity: 0.6,
              marginLeft: "0.2em",
            }}
          >
            pts
          </span>
        </div>
      </div>

      {/* Gradient divider */}
      <div
        style={{
          width: "50%",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, #b388ff40, transparent)",
          margin: "0.3rem 0",
        }}
      />

      {/* Remaining ranks */}
      {leaderboard.slice(1).map((entry) => {
        const isPodium = entry.rank <= 3;
        const podiumColor = PODIUM_COLORS[entry.rank - 1] ?? "#ffffff40";
        const delay = 0.3 + entry.rank * 0.08;

        return (
          <div
            key={entry.rank}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
              padding: isPodium ? "0.6rem 1rem" : "0.4rem 1rem",
              background: isPodium
                ? `${podiumColor}08`
                : "rgba(255,255,255,0.02)",
              border: isPodium
                ? `1px solid ${podiumColor}25`
                : "1px solid transparent",
              borderRadius: "8px",
              animation: `fade-in-up 0.5s ease ${delay}s both`,
            }}
          >
            {/* Rank */}
            <div
              style={{
                width: "2rem",
                textAlign: "center",
                fontSize: isPodium ? "1.2rem" : "0.95rem",
                fontWeight: 800,
                color: podiumColor,
                fontFamily: "var(--font-mono)",
                textShadow: isPodium ? `0 0 8px ${podiumColor}40` : "none",
              }}
            >
              #{entry.rank}
            </div>

            {/* Name */}
            <div
              style={{
                flex: 1,
                fontSize: isPodium ? "1.15rem" : "0.95rem",
                fontWeight: isPodium ? 700 : 500,
                color: isPodium ? "#e0e0e8" : "#808090",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {entry.playerName}
            </div>

            {/* Game mini-scores */}
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
              }}
            >
              {(
                Object.entries(entry.gameScores) as [string, number][]
              ).map(([game, score]) => {
                const info = GAME_LABELS[game];
                if (!info || score === 0) return null;
                return (
                  <span
                    key={game}
                    style={{
                      fontSize: "0.65rem",
                      fontFamily: "var(--font-mono)",
                      color: `${info.color}90`,
                      padding: "0.1rem 0.3rem",
                      borderRadius: "4px",
                      background: `${info.color}10`,
                    }}
                  >
                    {score}
                  </span>
                );
              })}
            </div>

            {/* Total score */}
            <div
              style={{
                fontSize: isPodium ? "1.1rem" : "0.9rem",
                fontWeight: 700,
                color: isPodium ? "#b388ff" : "#ffffff40",
                fontFamily: "var(--font-mono)",
              }}
            >
              {entry.totalScore}
            </div>
          </div>
        );
      })}
    </div>
  );
}
