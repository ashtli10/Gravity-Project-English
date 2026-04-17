import type { SlideDefinition } from "./index";
import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import ForceArrow from "../components/ForceArrow";
import GameLeaderboard from "../components/GameLeaderboard";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/* ─── Slide 17: Section Title ─── */
function GravityVsTraceurSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="gold" active={active}>
      <AnimatedText
        color="#ffc107"
        size="var(--slide-huge)"
        glow
        weight={900}
        delay={0}
        style={{ letterSpacing: "0.05em" }}
      >
        GRAVITY VS. THE TRACEUR
      </AnimatedText>
      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-subtitle)"
        delay={0.4}
      >
        Every movement is a battle against 9.8 m/s²
      </AnimatedText>
      {/* Decorative gold line pulse */}
      <div
        style={{
          width: "40%",
          height: "3px",
          background:
            "linear-gradient(90deg, transparent, #ffc107, transparent)",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.7s both",
        }}
      />
    </SlideLayout>
  );
}

/* ─── Slide 18: Every Jump Is a Calculation ─── */
function JumpCalculationSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="gold" active={active}>
      <AnimatedText
        color="#ffc107"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        EVERY JUMP IS A CALCULATION
      </AnimatedText>

      {/* SVG parabolic jump diagram */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.3s both" }}>
        <svg
          viewBox="0 0 600 300"
          style={{ width: "80%", maxWidth: "600px" }}
        >
          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Platform 1 */}
          <rect
            x="20"
            y="220"
            width="150"
            height="60"
            fill="#1a1a2e"
            stroke="#ffc107"
            strokeWidth="2"
          />
          {/* Platform 2 */}
          <rect
            x="380"
            y="220"
            width="150"
            height="60"
            fill="#1a1a2e"
            stroke="#ffc107"
            strokeWidth="2"
          />
          {/* Arc path */}
          <path
            d="M 170 220 Q 300 50 380 220"
            fill="none"
            stroke="#ffc107"
            strokeWidth="3"
            strokeDasharray="8,4"
            filter="url(#glow)"
          />
          {/* Gravity arrow */}
          <line
            x1="300"
            y1="100"
            x2="300"
            y2="200"
            stroke="#ff2d7b"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <polygon points="300,210 295,195 305,195" fill="#ff2d7b" />
          <text
            x="315"
            y="160"
            fill="#ff2d7b"
            fontSize="14"
            fontFamily="var(--font-mono)"
          >
            gravity
          </text>
          {/* Stick figure at start */}
          <circle cx="155" cy="155" r="16" fill="#ffc107" />
          <line
            x1="155"
            y1="171"
            x2="158"
            y2="205"
            stroke="#ffc107"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="158"
            y1="205"
            x2="148"
            y2="220"
            stroke="#ffc107"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="158"
            y1="205"
            x2="168"
            y2="220"
            stroke="#ffc107"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.6}
        style={{ maxWidth: "80%" }}
      >
        A traceur{" "}
        <span className="grammar-modal">should</span> calculate every
        jump <span className="grammar-purpose">in order to</span> land
        safely.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 19: Landing Roll ─── */
function LandingRollSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="gold" active={active}>
      <AnimatedText
        color="#ffc107"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        THE LANDING ROLL
      </AnimatedText>

      {/* SVG: stick figure landing with force redirection */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.3s both" }}>
        <svg
          viewBox="0 0 500 300"
          style={{ width: "85%", maxWidth: "600px" }}
        >
          <defs>
            <filter id="glow-gold">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ground */}
          <rect
            x="0"
            y="250"
            width="500"
            height="50"
            fill="#1a1a2e"
            stroke="#ffc107"
            strokeWidth="1"
          />

          {/* Stick figure landing (slightly crouched) */}
          {/* Head */}
          <circle cx="180" cy="125" r="20" fill="#ffc107" />
          {/* Body (angled forward) */}
          <line
            x1="180"
            y1="145"
            x2="190"
            y2="210"
            stroke="#ffc107"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Arms out for balance */}
          <line
            x1="185"
            y1="175"
            x2="155"
            y2="160"
            stroke="#ffc107"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="185"
            y1="175"
            x2="210"
            y2="165"
            stroke="#ffc107"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Bent legs */}
          <line
            x1="190"
            y1="210"
            x2="170"
            y2="248"
            stroke="#ffc107"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="190"
            y1="210"
            x2="200"
            y2="248"
            stroke="#ffc107"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Downward force arrow (impact) */}
          <line
            x1="190"
            y1="60"
            x2="190"
            y2="95"
            stroke="#ff2d7b"
            strokeWidth="3"
            strokeDasharray="6,3"
          />
          <polygon points="190,105 185,93 195,93" fill="#ff2d7b" />
          <text
            x="205"
            y="78"
            fill="#ff2d7b"
            fontSize="12"
            fontFamily="var(--font-mono)"
          >
            impact
          </text>

          {/* Curved arrow showing force redirection: down to forward */}
          <path
            d="M 220 250 Q 260 220 310 240"
            fill="none"
            stroke="#00e676"
            strokeWidth="3"
            filter="url(#glow-gold)"
          />
          <polygon points="315,240 302,234 304,246" fill="#00e676" />
          <text
            x="260"
            y="215"
            fill="#00e676"
            fontSize="12"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            redirected force
          </text>

          {/* Rolling motion ghost */}
          <circle
            cx="310"
            cy="230"
            r="18"
            fill="none"
            stroke="#ffc10740"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
          <circle
            cx="350"
            cy="235"
            r="14"
            fill="none"
            stroke="#ffc10725"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.5}
        style={{ maxWidth: "85%" }}
      >
        Athletes <span className="grammar-modal">should</span> always roll
        on landing{" "}
        <span className="grammar-purpose">in order not to</span> injure
        their joints.
      </AnimatedText>

      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-body)"
        delay={0.8}
        style={{ maxWidth: "85%", marginTop: "0.5rem" }}
      >
        You <span className="grammar-modal">shouldn&apos;t</span> land
        with straight legs.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 20: Why Traceurs Lean Forward ─── */
function LeanForwardSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="gold" active={active}>
      <AnimatedText
        color="#ffc107"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        WHY TRACEURS LEAN FORWARD
      </AnimatedText>

      {/* SVG force diagram with stick figure leaning */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.3s both" }}>
        <svg
          viewBox="0 0 500 350"
          style={{ width: "90%", maxWidth: "700px" }}
        >
          {/* Ground */}
          <rect
            x="0"
            y="300"
            width="500"
            height="50"
            fill="#1a1a2e"
            stroke="#ffc10730"
            strokeWidth="1"
          />

          {/* Stick figure leaning forward — LARGE */}
          {/* Head */}
          <circle cx="235" cy="90" r="22" fill="#ffc107" />
          {/* Body (leaned forward) */}
          <line
            x1="228"
            y1="112"
            x2="205"
            y2="210"
            stroke="#ffc107"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Right arm (forward) */}
          <line
            x1="220"
            y1="150"
            x2="260"
            y2="135"
            stroke="#ffc107"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Left arm (back) */}
          <line
            x1="220"
            y1="150"
            x2="185"
            y2="168"
            stroke="#ffc107"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Left leg */}
          <line
            x1="205"
            y1="210"
            x2="180"
            y2="296"
            stroke="#ffc107"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Right leg */}
          <line
            x1="205"
            y1="210"
            x2="225"
            y2="296"
            stroke="#ffc107"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Feet */}
          <circle cx="180" cy="296" r="4" fill="#ffc107" />
          <circle cx="225" cy="296" r="4" fill="#ffc107" />

          {/* Forward momentum arrow (gold) */}
          <ForceArrow
            x={245}
            y={155}
            angle={0}
            length={120}
            color="#ffc107"
            label="momentum"
            delay={0.5}
            thickness={4}
          />

          {/* Gravity arrow (pink, pointing down) */}
          <ForceArrow
            x={210}
            y={140}
            angle={90}
            length={100}
            color="#ff2d7b"
            label="gravity"
            delay={0.7}
            thickness={4}
          />

          {/* Resultant arrow (green, diagonal) */}
          <ForceArrow
            x={230}
            y={155}
            angle={38}
            length={135}
            color="#00e676"
            label="resultant"
            delay={0.9}
            thickness={4}
          />
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={1.0}
        style={{ maxWidth: "85%" }}
      >
        A traceur <span className="grammar-modal">should</span> lean
        forward <span className="grammar-purpose">in order to</span>{" "}
        maintain momentum.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 21: Try It Yourself (Rooftop Run) ─── */
function RooftopRunSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="gold" active={active}>
      <AnimatedText
        color="#ffc107"
        size="var(--slide-huge)"
        glow
        weight={900}
        delay={0}
        style={{ letterSpacing: "0.08em" }}
      >
        YOUR TURN
      </AnimatedText>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-subtitle)"
        delay={0.4}
      >
        Rooftop Run — Jump across the rooftops!
      </AnimatedText>

      {/* Rooftop silhouette */}
      <div
        style={{
          width: "80%",
          maxWidth: "700px",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.7s both",
        }}
      >
        <svg
          viewBox="0 0 700 200"
          style={{ width: "100%" }}
        >
          {/* Sky glow */}
          <defs>
            <linearGradient id="sky-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffc10710" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="700" height="200" fill="url(#sky-glow)" />

          {/* Buildings/rooftops as silhouettes */}
          <rect x="10" y="110" width="80" height="90" fill="#1a1a2e" stroke="#ffc10740" strokeWidth="1" />
          <rect x="100" y="90" width="70" height="110" fill="#1a1a2e" stroke="#ffc10740" strokeWidth="1" />
          <rect x="180" y="120" width="60" height="80" fill="#1a1a2e" stroke="#ffc10740" strokeWidth="1" />
          <rect x="260" y="80" width="90" height="120" fill="#1a1a2e" stroke="#ffc10740" strokeWidth="1" />
          <rect x="370" y="100" width="65" height="100" fill="#1a1a2e" stroke="#ffc10740" strokeWidth="1" />
          <rect x="445" y="70" width="80" height="130" fill="#1a1a2e" stroke="#ffc10740" strokeWidth="1" />
          <rect x="535" y="95" width="75" height="105" fill="#1a1a2e" stroke="#ffc10740" strokeWidth="1" />
          <rect x="620" y="115" width="70" height="85" fill="#1a1a2e" stroke="#ffc10740" strokeWidth="1" />

          {/* Dotted jump paths between rooftops */}
          <path
            d="M 90 108 Q 130 60 170 118"
            fill="none"
            stroke="#ffc107"
            strokeWidth="2"
            strokeDasharray="6,4"
            opacity="0.6"
          />
          <path
            d="M 240 118 Q 280 50 350 98"
            fill="none"
            stroke="#ffc107"
            strokeWidth="2"
            strokeDasharray="6,4"
            opacity="0.6"
          />
          <path
            d="M 435 98 Q 460 30 525 68"
            fill="none"
            stroke="#ffc107"
            strokeWidth="2"
            strokeDasharray="6,4"
            opacity="0.6"
          />

          {/* Stick figure on first building */}
          <circle cx="50" cy="82" r="10" fill="#ffc107" />
          <line x1="50" y1="92" x2="50" y2="106" stroke="#ffc107" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="106" x2="44" y2="110" stroke="#ffc107" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="106" x2="56" y2="110" stroke="#ffc107" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Pulsing indicator */}
      <div
        style={{
          marginTop: "1.5rem",
          fontSize: "var(--slide-body)",
          color: "#ffc107",
          fontFamily: "var(--font-mono)",
          animation: "fade-in-up 0.6s ease 1s both",
          opacity: 0.8,
        }}
      >
        Check your devices now!
      </div>
    </SlideLayout>
  );
}

/* ─── Slide: Rooftop Run Leaderboard ─── */
function RooftopRunLeaderboardSlide({ active }: { active: boolean }) {
  const session = useQuery(api.sessions.getCurrent);
  return (
    <SlideLayout accent="gold" active={active}>
      {session ? (
        <GameLeaderboard
          sessionId={session._id}
          game="rooftopRun"
          title="ROOFTOP RUN LEADERBOARD"
          accent="#ffc107"
          scoreUnit="m"
        />
      ) : (
        <AnimatedText color="#ffc107" size="var(--slide-body)" delay={0}>
          Waiting for session...
        </AnimatedText>
      )}
    </SlideLayout>
  );
}

export const section3Slides: SlideDefinition[] = [
  {
    id: "gravity-vs-traceur",
    section: 3,
    accent: "gold",
    component: GravityVsTraceurSlide,
  },
  {
    id: "jump-calculation",
    section: 3,
    accent: "gold",
    component: JumpCalculationSlide,
  },
  {
    id: "landing-roll",
    section: 3,
    accent: "gold",
    component: LandingRollSlide,
  },
  {
    id: "lean-forward",
    section: 3,
    accent: "gold",
    component: LeanForwardSlide,
  },
  {
    id: "rooftop-run",
    section: 3,
    accent: "gold",
    component: RooftopRunSlide,
    studentEvent: "rooftopRun",
  },
  {
    id: "rooftop-run-leaderboard",
    section: 3,
    accent: "gold",
    component: RooftopRunLeaderboardSlide,
    studentEvent: "rooftopRun",
  },
];
