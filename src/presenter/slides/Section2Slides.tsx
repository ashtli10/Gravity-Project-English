import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import ForceArrow from "../components/ForceArrow";
import VideoEmbed from "../components/VideoEmbed";
import type { SlideDefinition } from "./index";

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
            cx="280"
            cy="180"
            r="14"
            fill="none"
            stroke="var(--text-primary)"
            strokeWidth="2.5"
            style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.3))" }}
          />
          {/* Body (angled toward wall) */}
          <line
            x1="280"
            y1="194"
            x2="295"
            y2="240"
            stroke="var(--text-primary)"
            strokeWidth="2.5"
          />
          {/* Left arm reaching up */}
          <line
            x1="286"
            y1="208"
            x2="310"
            y2="185"
            stroke="var(--text-primary)"
            strokeWidth="2.5"
          />
          {/* Right arm back */}
          <line
            x1="286"
            y1="208"
            x2="262"
            y2="220"
            stroke="var(--text-primary)"
            strokeWidth="2.5"
          />
          {/* Left leg on wall */}
          <line
            x1="295"
            y1="240"
            x2="318"
            y2="250"
            stroke="var(--text-primary)"
            strokeWidth="2.5"
          />
          {/* Right leg pushing */}
          <line
            x1="295"
            y1="240"
            x2="280"
            y2="275"
            stroke="var(--text-primary)"
            strokeWidth="2.5"
          />
          {/* Foot on wall */}
          <circle
            cx="318"
            cy="250"
            r="3"
            fill="var(--text-primary)"
          />

          {/* Force arrow: forward momentum (cyan) */}
          <ForceArrow
            x={240}
            y={220}
            angle={-50}
            length={80}
            color="#00e5ff"
            label="Forward momentum"
            delay={0.8}
            thickness={4}
          />

          {/* Force arrow: gravity (pink, pointing down) */}
          <ForceArrow
            x={300}
            y={260}
            angle={90}
            length={55}
            color="#ff2d7b"
            label="Gravity's pull"
            delay={1.1}
            thickness={4}
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
          <svg width="280" height="180" viewBox="0 0 280 180">
            {/* Left platform */}
            <rect
              x="10"
              y="130"
              width="70"
              height="40"
              fill="#1a1a2e"
              stroke="#ff2d7b"
              strokeWidth="2"
              rx="2"
            />
            {/* Right platform */}
            <rect
              x="200"
              y="130"
              width="70"
              height="40"
              fill="#1a1a2e"
              stroke="#ff2d7b"
              strokeWidth="2"
              rx="2"
            />
            {/* Parabolic arc */}
            <path
              d="M55,125 Q140,10 235,125"
              stroke="#ff2d7b"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="6,4"
              style={{ filter: "drop-shadow(0 0 6px #ff2d7b)" }}
            />
            {/* Stick figure at peak */}
            <circle cx="140" cy="35" r="8" fill="none" stroke="var(--text-primary)" strokeWidth="2" />
            <line x1="140" y1="43" x2="140" y2="65" stroke="var(--text-primary)" strokeWidth="2" />
            <line x1="140" y1="50" x2="128" y2="58" stroke="var(--text-primary)" strokeWidth="2" />
            <line x1="140" y1="50" x2="152" y2="58" stroke="var(--text-primary)" strokeWidth="2" />
            <line x1="140" y1="65" x2="132" y2="80" stroke="var(--text-primary)" strokeWidth="2" />
            <line x1="140" y1="65" x2="148" y2="80" stroke="var(--text-primary)" strokeWidth="2" />
            {/* Label */}
            <text
              x="140"
              y="105"
              fill="#ff2d7b"
              fontSize="12"
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
          <svg width="280" height="180" viewBox="0 0 280 180">
            {/* Ground */}
            <line
              x1="20"
              y1="150"
              x2="260"
              y2="150"
              stroke="#ff2d7b"
              strokeWidth="1"
              opacity="0.3"
            />

            {/* Stick figure in rolling position */}
            <circle cx="140" cy="110" r="10" fill="none" stroke="var(--text-primary)" strokeWidth="2" />
            <line x1="140" y1="120" x2="150" y2="140" stroke="var(--text-primary)" strokeWidth="2" />
            {/* Curved back for roll */}
            <path
              d="M140,120 Q155,130 148,148"
              stroke="var(--text-primary)"
              strokeWidth="2"
              fill="none"
            />
            {/* Arms tucked */}
            <line x1="140" y1="125" x2="130" y2="132" stroke="var(--text-primary)" strokeWidth="2" />
            <line x1="140" y1="125" x2="148" y2="128" stroke="var(--text-primary)" strokeWidth="2" />

            {/* Downward force arrow */}
            <ForceArrow
              x={120}
              y={55}
              angle={90}
              length={45}
              color="#ff2d7b"
              label="Impact"
              delay={1.0}
              thickness={3}
            />

            {/* Redirected force arrow (forward) */}
            <ForceArrow
              x={155}
              y={135}
              angle={0}
              length={65}
              color="#00e5ff"
              label="Redirected"
              delay={1.3}
              thickness={3}
            />

            {/* Curved redirect arrow */}
            <path
              d="M125,100 Q130,140 155,138"
              stroke="var(--text-secondary)"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4,3"
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

/* ─── Slide 16: Did You Spot the Moves? ────────────────────────────── */
function SpotTheMovesSlide({ active }: { active: boolean }) {
  const moves = [
    "Wall Run",
    "Kong Vault",
    "Precision Jump",
    "Roll",
    "Cat Leap",
    "Dash Vault",
  ];

  return (
    <SlideLayout accent="pink" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--pink)"
        glow
        weight={800}
        delay={0.1}
      >
        Did you spot the moves?
      </AnimatedText>

      {/* Move cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          marginTop: "2.5rem",
          maxWidth: "700px",
          width: "100%",
        }}
      >
        {moves.map((move, i) => (
          <div
            key={move}
            style={{
              background: "var(--bg-card)",
              border: "1px solid rgba(255,45,123,0.3)",
              borderRadius: "12px",
              padding: "1.2rem 1.5rem",
              textAlign: "center",
              fontSize: "var(--slide-body)",
              fontWeight: 700,
              color: "var(--text-primary)",
              boxShadow: "0 0 20px rgba(255,45,123,0.08)",
              animation: `fade-in-up 0.5s ease ${0.4 + i * 0.15}s both`,
              transition: "border-color 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            {move}
          </div>
        ))}
      </div>

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

/* ─── Export ───────────────────────────────────────────────────────── */
export const section2Slides: SlideDefinition[] = [
  { id: "watch-this", section: 2, accent: "pink", component: WatchThisTitleSlide },
  { id: "video", section: 2, accent: "pink", component: VideoSlide, studentEvent: "lookUp" },
  { id: "break-it-down", section: 2, accent: "pink", component: BreakItDownSlide },
  { id: "wall-run", section: 2, accent: "pink", component: WallRunSlide },
  { id: "precision-jump-roll", section: 2, accent: "pink", component: PrecisionJumpRollSlide },
  { id: "spot-the-moves", section: 2, accent: "pink", component: SpotTheMovesSlide, studentEvent: "moveSpotter" },
];
