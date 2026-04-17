import type { SlideDefinition } from "./index";
import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import PlanetComparison from "../components/PlanetComparison";
import GameLeaderboard from "../components/GameLeaderboard";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/* ─── Slide 22: Section Title ─── */
function WhatIfSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="green" active={active}>
      <AnimatedText
        color="#00e676"
        size="var(--slide-huge)"
        glow
        weight={900}
        delay={0}
        style={{ letterSpacing: "0.06em" }}
      >
        WHAT IF GRAVITY CHANGED?
      </AnimatedText>
      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-subtitle)"
        delay={0.5}
      >
        From floating to crushing — gravity rules everything
      </AnimatedText>
      {/* Decorative pulsing circle */}
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          border: "2px solid #00e67640",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.8s both",
          boxShadow: "0 0 30px #00e67620, inset 0 0 30px #00e67610",
        }}
      />
    </SlideLayout>
  );
}

/* ─── Slide 23: Planet Comparison ─── */
function PlanetComparisonSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="green" active={active}>
      <AnimatedText
        color="#00e676"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        GRAVITY ACROSS THE SOLAR SYSTEM
      </AnimatedText>
      <PlanetComparison />
    </SlideLayout>
  );
}

/* ─── Slide 24: Moon Parkour ─── */
function MoonParkourSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="green" active={active}>
      <AnimatedText
        color="#8888a0"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        PARKOUR ON THE MOON
      </AnimatedText>

      <AnimatedText
        color="#8888a0"
        size="var(--slide-body)"
        delay={0.2}
        mono
      >
        g = 1.6 m/s²
      </AnimatedText>

      {/* SVG: huge floaty jump arc */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.4s both" }}>
        <svg
          viewBox="0 0 600 350"
          style={{ width: "80%", maxWidth: "600px" }}
        >
          <defs>
            <filter id="moon-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Moon surface texture */}
            <linearGradient id="moon-surface" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a2a3e" />
              <stop offset="100%" stopColor="#1a1a2e" />
            </linearGradient>
          </defs>

          {/* Moon surface */}
          <rect
            x="0"
            y="310"
            width="600"
            height="40"
            fill="url(#moon-surface)"
            stroke="#8888a060"
            strokeWidth="1"
          />
          {/* Craters */}
          <ellipse cx="100" cy="320" rx="20" ry="5" fill="#1a1a2e" stroke="#8888a030" strokeWidth="1" />
          <ellipse cx="400" cy="325" rx="15" ry="4" fill="#1a1a2e" stroke="#8888a030" strokeWidth="1" />
          <ellipse cx="520" cy="318" rx="12" ry="3" fill="#1a1a2e" stroke="#8888a030" strokeWidth="1" />

          {/* Earth-height jump (small, reference) */}
          <path
            d="M 80 310 Q 130 260 180 310"
            fill="none"
            stroke="#00e67640"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
          <text x="130" y="280" fill="#00e67650" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">
            Earth jump
          </text>

          {/* MOON jump — enormous arc! */}
          <path
            d="M 80 310 Q 300 20 520 310"
            fill="none"
            stroke="#8888a0"
            strokeWidth="3"
            strokeDasharray="8,4"
            filter="url(#moon-glow)"
          />

          {/* Height markers */}
          <line x1="300" y1="310" x2="300" y2="20" stroke="#8888a040" strokeWidth="1" strokeDasharray="3,6" />
          <text x="315" y="30" fill="#8888a0" fontSize="14" fontFamily="var(--font-mono)">
            6x higher!
          </text>

          {/* Stick figure floating at peak */}
          <circle cx="300" cy="25" r="16" fill="#8888a0" opacity="0.7" />
          <line x1="300" y1="41" x2="300" y2="75" stroke="#8888a0" strokeWidth="4" opacity="0.7" />
          {/* Arms out wide (floating) */}
          <line x1="300" y1="55" x2="270" y2="45" stroke="#8888a0" strokeWidth="4" opacity="0.7" />
          <line x1="300" y1="55" x2="330" y2="45" stroke="#8888a0" strokeWidth="4" opacity="0.7" />
          {/* Legs (floating, spread) */}
          <line x1="300" y1="75" x2="285" y2="95" stroke="#8888a0" strokeWidth="4" opacity="0.7" />
          <line x1="300" y1="75" x2="315" y2="95" stroke="#8888a0" strokeWidth="4" opacity="0.7" />

          {/* Stick figure on ground */}
          <circle cx="80" cy="278" r="14" fill="#00e676" />
          <line x1="80" y1="292" x2="80" y2="310" stroke="#00e676" strokeWidth="4" />
          {/* Arms */}
          <line x1="80" y1="298" x2="65" y2="305" stroke="#00e676" strokeWidth="4" />
          <line x1="80" y1="298" x2="95" y2="305" stroke="#00e676" strokeWidth="4" />
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.7}
        style={{ maxWidth: "85%" }}
      >
        On the Moon, you{" "}
        <span className="grammar-modal">would</span> jump six times
        higher.
      </AnimatedText>

      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-body)"
        delay={1.0}
        style={{ maxWidth: "85%", marginTop: "0.3rem" }}
      >
        You <span className="grammar-modal">can</span> float for seconds{" "}
        <span className="grammar-purpose">in order to</span> cover huge
        distances.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 25: Jupiter Parkour ─── */
function JupiterParkourSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="green" active={active}>
      <AnimatedText
        color="#ffc107"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        PARKOUR ON JUPITER
      </AnimatedText>

      <AnimatedText
        color="#ffc107"
        size="var(--slide-body)"
        delay={0.2}
        mono
      >
        g = 24.8 m/s²
      </AnimatedText>

      {/* SVG: tiny crushed jump */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.4s both" }}>
        <svg
          viewBox="0 0 600 300"
          style={{ width: "80%", maxWidth: "600px" }}
        >
          <defs>
            <filter id="jup-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Jupiter surface banding */}
            <linearGradient id="jup-surface" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3a2a10" />
              <stop offset="30%" stopColor="#4a3520" />
              <stop offset="60%" stopColor="#3a2a10" />
              <stop offset="100%" stopColor="#4a3520" />
            </linearGradient>
          </defs>

          {/* Jupiter surface */}
          <rect
            x="0"
            y="250"
            width="600"
            height="50"
            fill="url(#jup-surface)"
            stroke="#ffc10730"
            strokeWidth="1"
          />

          {/* Earth-height jump (reference, now looks huge by comparison) */}
          <path
            d="M 200 250 Q 300 130 400 250"
            fill="none"
            stroke="#00e67630"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
          <text x="300" y="125" fill="#00e67640" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">
            Earth jump
          </text>

          {/* Jupiter jump — barely leaves the ground */}
          <path
            d="M 280 250 Q 300 235 320 250"
            fill="none"
            stroke="#ffc107"
            strokeWidth="3"
            filter="url(#jup-glow)"
          />
          <text x="300" y="215" fill="#ffc107" fontSize="14" fontFamily="var(--font-mono)" textAnchor="middle">
            Jupiter jump
          </text>

          {/* Massive gravity arrows pushing down */}
          <line x1="300" y1="60" x2="300" y2="200" stroke="#ff2d7b" strokeWidth="4" opacity="0.6" />
          <polygon points="300,215 293,195 307,195" fill="#ff2d7b" opacity="0.7" />
          <line x1="200" y1="80" x2="200" y2="180" stroke="#ff2d7b" strokeWidth="3" opacity="0.3" />
          <polygon points="200,190 195,175 205,175" fill="#ff2d7b" opacity="0.3" />
          <line x1="400" y1="80" x2="400" y2="180" stroke="#ff2d7b" strokeWidth="3" opacity="0.3" />
          <polygon points="400,190 395,175 405,175" fill="#ff2d7b" opacity="0.3" />

          <text x="420" y="130" fill="#ff2d7b" fontSize="14" fontFamily="var(--font-mono)" opacity="0.8">
            24.8 m/s²
          </text>

          {/* Crushed stick figure */}
          <circle cx="300" cy="230" r="12" fill="#ffc107" />
          <line x1="300" y1="242" x2="300" y2="250" stroke="#ffc107" strokeWidth="4" />
          {/* Arms (crushed, splayed out) */}
          <line x1="300" y1="245" x2="282" y2="248" stroke="#ffc107" strokeWidth="4" />
          <line x1="300" y1="245" x2="318" y2="248" stroke="#ffc107" strokeWidth="4" />
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.7}
        style={{ maxWidth: "85%" }}
      >
        On Jupiter, you{" "}
        <span className="grammar-modal">wouldn&apos;t</span> be able to
        jump at all.
      </AnimatedText>

      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-body)"
        delay={1.0}
        style={{ maxWidth: "85%", marginTop: "0.3rem" }}
      >
        Your body <span className="grammar-modal">can&apos;t</span> fight
        24.8 m/s² of gravity.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 26: Find Out (Planetary Parkour) ─── */
function PlanetaryParkourSlide({ active }: { active: boolean }) {
  const planets = [
    { name: "Moon", color: "#8888a0", size: 30 },
    { name: "Mars", color: "#ff6b35", size: 36 },
    { name: "Earth", color: "#00e676", size: 42 },
    { name: "Jupiter", color: "#ffc107", size: 60 },
  ];

  return (
    <SlideLayout accent="green" active={active}>
      <AnimatedText
        color="#00e676"
        size="var(--slide-huge)"
        glow
        weight={900}
        delay={0}
        style={{ letterSpacing: "0.06em" }}
      >
        FIND OUT YOURSELF
      </AnimatedText>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-subtitle)"
        delay={0.4}
      >
        Planetary Parkour — Choose your planet!
      </AnimatedText>

      {/* Planet circles */}
      <div
        style={{
          display: "flex",
          gap: "3rem",
          marginTop: "2.5rem",
          alignItems: "center",
          animation: "fade-in-up 0.6s ease 0.7s both",
        }}
      >
        {planets.map((planet, i) => (
          <div
            key={planet.name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.8rem",
              animation: `fade-in-up 0.6s ease ${0.7 + i * 0.15}s both`,
            }}
          >
            <div
              style={{
                width: `${planet.size}px`,
                height: `${planet.size}px`,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${planet.color}90, ${planet.color}40)`,
                boxShadow: `0 0 20px ${planet.color}40, 0 0 40px ${planet.color}20`,
              }}
            />
            <span
              style={{
                color: planet.color,
                fontSize: "var(--slide-small, 1rem)",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
              }}
            >
              {planet.name}
            </span>
          </div>
        ))}
      </div>

      {/* Pulsing indicator */}
      <div
        style={{
          marginTop: "2rem",
          fontSize: "var(--slide-body)",
          color: "#00e676",
          fontFamily: "var(--font-mono)",
          animation: "fade-in-up 0.6s ease 1.3s both",
          opacity: 0.8,
        }}
      >
        Check your devices now!
      </div>
    </SlideLayout>
  );
}

/* ─── Slide: Planetary Parkour Leaderboard ─── */
function PlanetaryParkourLeaderboardSlide({ active }: { active: boolean }) {
  const session = useQuery(api.sessions.getCurrent);
  return (
    <SlideLayout accent="green" active={active}>
      {session ? (
        <GameLeaderboard
          sessionId={session._id}
          game="planetaryParkour"
          title="PLANETARY PARKOUR LEADERBOARD"
          accent="#00e676"
          scoreUnit="pts"
        />
      ) : (
        <AnimatedText color="#00e676" size="var(--slide-body)" delay={0}>
          Waiting for session...
        </AnimatedText>
      )}
    </SlideLayout>
  );
}

export const section4Slides: SlideDefinition[] = [
  {
    id: "what-if-gravity-changed",
    section: 4,
    accent: "green",
    component: WhatIfSlide,
  },
  {
    id: "planet-comparison",
    section: 4,
    accent: "green",
    component: PlanetComparisonSlide,
  },
  {
    id: "moon-parkour",
    section: 4,
    accent: "green",
    component: MoonParkourSlide,
  },
  {
    id: "jupiter-parkour",
    section: 4,
    accent: "green",
    component: JupiterParkourSlide,
  },
  {
    id: "planetary-parkour",
    section: 4,
    accent: "green",
    component: PlanetaryParkourSlide,
    studentEvent: "planetaryParkour",
  },
  {
    id: "planetary-parkour-leaderboard",
    section: 4,
    accent: "green",
    component: PlanetaryParkourLeaderboardSlide,
    studentEvent: "planetaryParkour",
  },
];
