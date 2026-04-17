import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import ForceArrow from "../components/ForceArrow";
import VideoEmbed from "../components/VideoEmbed";
import GameLeaderboard from "../components/GameLeaderboard";
import type { SlideDefinition } from "./index";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/* ─── Slide 11: Section Title ──────────────────────────────────────── */
function WatchThisTitleSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="pink" active={active}>
      <div
        style={{
          fontSize: "var(--slide-huge)",
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          color: "var(--pink)",
          textShadow:
            "0 0 30px var(--pink), 0 0 60px var(--pink), 0 0 120px rgba(255,45,123,0.3)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          animation: "scale-in 0.7s ease 0.2s both",
          textAlign: "center",
        }}
      >
        Watch This.
      </div>

      {/* Decorative glow ring */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,45,123,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </SlideLayout>
  );
}

/* ─── Slide 12: Video ──────────────────────────────────────────────── */
function VideoSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="pink" active={active}>
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          animation: "fade-in-up 0.6s ease 0.2s both",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <VideoEmbed />
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 13: Let's Break It Down ────────────────────────────────── */
function BreakItDownSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="pink" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--pink)"
        glow
        weight={800}
        delay={0.1}
      >
        Let&apos;s break it down.
      </AnimatedText>

      <div
        style={{
          width: "50%",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, var(--pink), transparent)",
          margin: "2rem 0",
          opacity: 0.5,
          animation: "fade-in 0.5s ease 0.6s both",
        }}
      />

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={0.8}
        style={{ maxWidth: "80%" }}
      >
        These moves{" "}
        <span className="grammar-modal">will</span> show you how
        traceurs defy gravity.
      </AnimatedText>

      {/* Decorative accent dots */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "2.5rem",
          animation: "fade-in 0.5s ease 1.2s both",
        }}
      >
        {[1, 2, 3].map((_, i) => (
          <div
            key={i}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--pink)",
              boxShadow: "0 0 8px var(--pink)",
              animation: `pulse-glow 2s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 14: Wall Run Breakdown ─────────────────────────────────── */
function WallRunSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="pink" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--pink)"
        glow
        weight={800}
        delay={0.1}
      >
        Wall Run
      </AnimatedText>

      <div
        style={{
          marginTop: "1.5rem",
          animation: "fade-in-up 0.6s ease 0.4s both",
        }}
      >
        <svg
          width="500"
          height="340"
          viewBox="0 0 500 340"
          style={{ overflow: "visible" }}
        >
          {/* Wall */}
          <rect
            x="320"
            y="20"
            width="60"
            height="300"
            fill="#1a1a2e"
            stroke="#ff2d7b"
            strokeWidth="2"
            rx="3"
            style={{ filter: "drop-shadow(0 0 6px rgba(255,45,123,0.3))" }}
          />
          <text
            x="350"
            y="170"
            fill="#ff2d7b"
            fontSize="14"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
            opacity="0.5"
            transform="rotate(-90 350 170)"
          >
            WALL
          </text>

          {/* Ground */}
          <line
            x1="30"
            y1="320"
            x2="470"
            y2="320"
            stroke="#ff2d7b"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* Stick figure running up the wall */}
          {/* Head */}
          <circle
            cx="250"
            cy="130"
            r="25"
            fill="none"
            stroke="var(--text-primary)"
            strokeWidth="4.5"
            style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.3))" }}
          />
          {/* Body (angled toward wall) */}
          <line
            x1="250"
            y1="155"
            x2="275"
            y2="230"
            stroke="var(--text-primary)"
            strokeWidth="4.5"
          />
          {/* Left arm reaching up */}
          <line
            x1="260"
            y1="180"
            x2="300"
            y2="145"
            stroke="var(--text-primary)"
            strokeWidth="4.5"
          />
          {/* Right arm back */}
          <line
            x1="260"
            y1="180"
            x2="220"
            y2="198"
            stroke="var(--text-primary)"
            strokeWidth="4.5"
          />
          {/* Left leg on wall */}
          <line
            x1="275"
            y1="230"
            x2="318"
            y2="248"
            stroke="var(--text-primary)"
            strokeWidth="4.5"
          />
          {/* Right leg pushing */}
          <line
            x1="275"
            y1="230"
            x2="252"
            y2="290"
            stroke="var(--text-primary)"
            strokeWidth="4.5"
          />
          {/* Foot on wall */}
          <circle
            cx="318"
            cy="248"
            r="5"
            fill="var(--text-primary)"
          />

          {/* Force arrow: forward momentum (cyan) */}
          <ForceArrow
            x={200}
            y={200}
            angle={-50}
            length={90}
            color="#00e5ff"
            label="Forward momentum"
            delay={0.8}
            thickness={5}
          />

          {/* Force arrow: gravity (pink, pointing down) */}
          <ForceArrow
            x={280}
            y={255}
            angle={90}
            length={60}
            color="#ff2d7b"
            label="Gravity's pull"
            delay={1.1}
            thickness={5}
          />
        </svg>
      </div>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.4}
        style={{ marginTop: "1rem", maxWidth: "80%" }}
      >
        A wall run{" "}
        <span className="grammar-modal">won&apos;t</span> work without
        enough speed.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 15: Precision Jump + Landing Roll ──────────────────────── */
function PrecisionJumpRollSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="pink" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--pink)"
        glow
        weight={800}
        delay={0.1}
      >
        Precision Jump &amp; Landing Roll
      </AnimatedText>

      <div
        style={{
          display: "flex",
          gap: "4rem",
          marginTop: "1.5rem",
          alignItems: "flex-start",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT: Precision Jump */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: "slide-in-left 0.7s ease 0.4s both",
          }}
        >
          <div
            style={{
              fontSize: "var(--slide-subtitle)",
              color: "var(--pink)",
              fontWeight: 700,
              marginBottom: "1rem",
              textShadow: "0 0 10px var(--pink)",
            }}
          >
            Precision Jump
          </div>
          <svg width="400" height="260" viewBox="0 0 400 260">
            {/* Left platform */}
            <rect
              x="15"
              y="190"
              width="100"
              height="55"
              fill="#1a1a2e"
              stroke="#ff2d7b"
              strokeWidth="2"
              rx="3"
            />
            {/* Right platform */}
            <rect
              x="285"
              y="190"
              width="100"
              height="55"
              fill="#1a1a2e"
              stroke="#ff2d7b"
              strokeWidth="2"
              rx="3"
            />
            {/* Parabolic arc */}
            <path
              d="M80,185 Q200,15 335,185"
              stroke="#ff2d7b"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="6,4"
              style={{ filter: "drop-shadow(0 0 6px #ff2d7b)" }}
            />
            {/* Stick figure at peak */}
            <circle cx="200" cy="42" r="16" fill="none" stroke="var(--text-primary)" strokeWidth="4" />
            <line x1="200" y1="58" x2="200" y2="100" stroke="var(--text-primary)" strokeWidth="4" />
            <line x1="200" y1="72" x2="178" y2="86" stroke="var(--text-primary)" strokeWidth="4" />
            <line x1="200" y1="72" x2="222" y2="86" stroke="var(--text-primary)" strokeWidth="4" />
            <line x1="200" y1="100" x2="186" y2="126" stroke="var(--text-primary)" strokeWidth="4" />
            <line x1="200" y1="100" x2="214" y2="126" stroke="var(--text-primary)" strokeWidth="4" />
            {/* Label */}
            <text
              x="200"
              y="155"
              fill="#ff2d7b"
              fontSize="13"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
              opacity="0.7"
            >
              Trajectory arc
            </text>
          </svg>
        </div>

        {/* RIGHT: Landing Roll */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: "slide-in-right 0.7s ease 0.6s both",
          }}
        >
          <div
            style={{
              fontSize: "var(--slide-subtitle)",
              color: "var(--pink)",
              fontWeight: 700,
              marginBottom: "1rem",
              textShadow: "0 0 10px var(--pink)",
            }}
          >
            Landing Roll
          </div>
          <svg width="400" height="260" viewBox="0 0 400 260">
            {/* Ground */}
            <line
              x1="20"
              y1="220"
              x2="380"
              y2="220"
              stroke="#ff2d7b"
              strokeWidth="1"
              opacity="0.3"
            />

            {/* Stick figure in rolling position */}
            <circle cx="190" cy="150" r="18" fill="none" stroke="var(--text-primary)" strokeWidth="4" />
            <line x1="190" y1="168" x2="206" y2="205" stroke="var(--text-primary)" strokeWidth="4" />
            {/* Curved back for roll */}
            <path
              d="M190,168 Q215,185 205,218"
              stroke="var(--text-primary)"
              strokeWidth="4"
              fill="none"
            />
            {/* Arms tucked */}
            <line x1="190" y1="176" x2="172" y2="188" stroke="var(--text-primary)" strokeWidth="4" />
            <line x1="190" y1="176" x2="205" y2="182" stroke="var(--text-primary)" strokeWidth="4" />

            {/* Downward force arrow */}
            <ForceArrow
              x={160}
              y={60}
              angle={90}
              length={55}
              color="#ff2d7b"
              label="Impact"
              delay={1.0}
              thickness={4}
            />

            {/* Redirected force arrow (forward) */}
            <ForceArrow
              x={215}
              y={195}
              angle={0}
              length={85}
              color="#00e5ff"
              label="Redirected"
              delay={1.3}
              thickness={4}
            />

            {/* Curved redirect arrow */}
            <path
              d="M168,138 Q175,198 215,195"
              stroke="var(--text-secondary)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,4"
              opacity="0.4"
              style={{ animation: "fade-in 0.5s ease 1.5s both" }}
            />
          </svg>
        </div>
      </div>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.4}
        style={{ marginTop: "1rem", maxWidth: "85%" }}
      >
        Landing{" "}
        <span className="grammar-modal">might</span> seem easy, but a
        roll redirects the force{" "}
        <span className="grammar-purpose">in order to</span> protect
        your joints.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 16: Video Quiz ─────────────────────────────────────────── */
function SpotTheMovesSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="pink" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--pink)"
        glow
        weight={800}
        delay={0.1}
      >
        Video Quiz
      </AnimatedText>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-secondary)"
        delay={0.5}
      >
        Answer the questions on your phone!
      </AnimatedText>

      {/* Decorative bottom glow */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "400px",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, var(--pink), transparent)",
          opacity: 0.3,
          animation: "fade-in 0.5s ease 1.5s both",
        }}
      />
    </SlideLayout>
  );
}

/* ─── Slide: Video Quiz Leaderboard ─── */
function VideoQuizLeaderboardSlide({ active }: { active: boolean }) {
  const session = useQuery(api.sessions.getCurrent);
  return (
    <SlideLayout accent="pink" active={active}>
      {session ? (
        <GameLeaderboard
          sessionId={session._id}
          game="videoQuiz"
          title="VIDEO QUIZ LEADERBOARD"
          accent="#ff2d7b"
          scoreUnit="/4"
        />
      ) : (
        <AnimatedText color="#ff2d7b" size="var(--slide-body)" delay={0}>
          Waiting for session...
        </AnimatedText>
      )}
    </SlideLayout>
  );
}

/* ─── Export ───────────────────────────────────────────────────────── */
export const section2Slides: SlideDefinition[] = [
  { id: "watch-this", section: 2, accent: "pink", component: WatchThisTitleSlide },
  { id: "video", section: 2, accent: "pink", component: VideoSlide, studentEvent: "lookUp" },
  { id: "break-it-down", section: 2, accent: "pink", component: BreakItDownSlide },
  { id: "wall-run", section: 2, accent: "pink", component: WallRunSlide },
  { id: "precision-jump-roll", section: 2, accent: "pink", component: PrecisionJumpRollSlide },
  { id: "video-quiz", section: 2, accent: "pink", component: SpotTheMovesSlide, studentEvent: "moveSpotter" },
  { id: "video-quiz-leaderboard", section: 2, accent: "pink", component: VideoQuizLeaderboardSlide, studentEvent: "moveSpotter" },
];
