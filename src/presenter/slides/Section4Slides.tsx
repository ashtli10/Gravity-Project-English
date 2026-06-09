import type { SlideDefinition } from "./index";
import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import PlanetComparison from "../components/PlanetComparison";
import GameLeaderboard from "../components/GameLeaderboard";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/* ─── Slide 1: Section Title ─── */
function NewWorldsTitleSlide({ active }: { active: boolean }) {
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
        NEW WORLDS, NEW GRAVITY
      </AnimatedText>
      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-subtitle)"
        delay={0.5}
      >
        Every world pulls differently
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

/* ─── Slide 2: Planet Comparison ─── */
function PlanetComparisonSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="green" active={active}>
      <AnimatedText color="#00e676" size="var(--slide-title)" glow weight={800}>
        GRAVITY ACROSS THE WORLDS
      </AnimatedText>
      <PlanetComparison />
    </SlideLayout>
  );
}

/* ─── Slide 3: A Colony on the Moon ─── */
function MoonColonySlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="green" active={active}>
      <AnimatedText
        color="#c0c0d0"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        A COLONY ON THE MOON
      </AnimatedText>

      <AnimatedText
        color="#c0c0d0"
        size="var(--slide-body)"
        delay={0.2}
        mono
      >
        g = 1.6 m/s²
      </AnimatedText>

      {/* SVG: huge floaty jump arc vs small Earth jump */}
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
            stroke="#c0c0d060"
            strokeWidth="1"
          />
          {/* Craters */}
          <ellipse cx="100" cy="320" rx="20" ry="5" fill="#1a1a2e" stroke="#c0c0d030" strokeWidth="1" />
          <ellipse cx="400" cy="325" rx="15" ry="4" fill="#1a1a2e" stroke="#c0c0d030" strokeWidth="1" />
          <ellipse cx="520" cy="318" rx="12" ry="3" fill="#1a1a2e" stroke="#c0c0d030" strokeWidth="1" />

          {/* Earth-height jump (small, dashed reference) */}
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
            stroke="#c0c0d0"
            strokeWidth="3"
            strokeDasharray="8,4"
            filter="url(#moon-glow)"
          />

          {/* Height markers */}
          <line x1="300" y1="310" x2="300" y2="20" stroke="#c0c0d040" strokeWidth="1" strokeDasharray="3,6" />
          <text x="315" y="30" fill="#c0c0d0" fontSize="14" fontFamily="var(--font-mono)">
            6x higher!
          </text>

          {/* Floating figure at the peak */}
          <circle cx="300" cy="25" r="16" fill="#c0c0d0" opacity="0.8" />
          <line x1="300" y1="41" x2="300" y2="75" stroke="#c0c0d0" strokeWidth="4" opacity="0.8" />
          <line x1="300" y1="55" x2="270" y2="45" stroke="#c0c0d0" strokeWidth="4" opacity="0.8" />
          <line x1="300" y1="55" x2="330" y2="45" stroke="#c0c0d0" strokeWidth="4" opacity="0.8" />
          <line x1="300" y1="75" x2="285" y2="95" stroke="#c0c0d0" strokeWidth="4" opacity="0.8" />
          <line x1="300" y1="75" x2="315" y2="95" stroke="#c0c0d0" strokeWidth="4" opacity="0.8" />

          {/* Figure on the ground (launch point) */}
          <circle cx="80" cy="278" r="14" fill="#00e676" />
          <line x1="80" y1="292" x2="80" y2="310" stroke="#00e676" strokeWidth="4" />
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
        On the Moon, you <span className="grammar-future">would</span> jump six
        times higher, and you <span className="grammar-possibility">could</span>{" "}
        float for seconds.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 4: A World Like Jupiter ─── */
function HeavyWorldSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="green" active={active}>
      <AnimatedText
        color="#ffc107"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        A WORLD LIKE JUPITER
      </AnimatedText>

      <AnimatedText
        color="#ffc107"
        size="var(--slide-body)"
        delay={0.2}
        mono
      >
        g = 24.8 m/s²
      </AnimatedText>

      {/* SVG: tiny crushed jump under heavy gravity */}
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

          {/* Earth-height jump (reference, looks huge by comparison) */}
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
          <text x="300" y="218" fill="#ffc107" fontSize="14" fontFamily="var(--font-mono)" textAnchor="middle">
            Jupiter jump
          </text>

          {/* Heavy gravity arrows pushing down */}
          <line x1="300" y1="60" x2="300" y2="200" stroke="#ff2d7b" strokeWidth="4" opacity="0.6" />
          <polygon points="300,215 293,195 307,195" fill="#ff2d7b" opacity="0.7" />
          <line x1="200" y1="80" x2="200" y2="180" stroke="#ff2d7b" strokeWidth="3" opacity="0.3" />
          <polygon points="200,190 195,175 205,175" fill="#ff2d7b" opacity="0.3" />
          <line x1="400" y1="80" x2="400" y2="180" stroke="#ff2d7b" strokeWidth="3" opacity="0.3" />
          <polygon points="400,190 395,175 405,175" fill="#ff2d7b" opacity="0.3" />
          <line x1="120" y1="100" x2="120" y2="170" stroke="#ff2d7b" strokeWidth="2" opacity="0.2" />
          <polygon points="120,180 116,168 124,168" fill="#ff2d7b" opacity="0.2" />
          <line x1="480" y1="100" x2="480" y2="170" stroke="#ff2d7b" strokeWidth="2" opacity="0.2" />
          <polygon points="480,180 476,168 484,168" fill="#ff2d7b" opacity="0.2" />

          <text x="420" y="130" fill="#ff2d7b" fontSize="14" fontFamily="var(--font-mono)" opacity="0.8">
            24.8 m/s²
          </text>

          {/* Crushed / splayed figure pinned to the ground */}
          <circle cx="300" cy="232" r="12" fill="#ffc107" />
          <line x1="300" y1="244" x2="300" y2="250" stroke="#ffc107" strokeWidth="4" />
          {/* Arms splayed flat */}
          <line x1="300" y1="246" x2="278" y2="249" stroke="#ffc107" strokeWidth="4" />
          <line x1="300" y1="246" x2="322" y2="249" stroke="#ffc107" strokeWidth="4" />
          {/* Legs splayed flat */}
          <line x1="300" y1="250" x2="284" y2="250" stroke="#ffc107" strokeWidth="4" />
          <line x1="300" y1="250" x2="316" y2="250" stroke="#ffc107" strokeWidth="4" />
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.7}
        style={{ maxWidth: "85%" }}
      >
        On Jupiter, you <span className="grammar-possibility">could</span>{" "}
        barely move — your body <span className="grammar-future">will</span>{" "}
        feel impossibly heavy.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 5: Find Out Yourself (Starship Drifter) ─── */
function DrifterIntroSlide({ active }: { active: boolean }) {
  const planets = [
    { name: "Moon", color: "#c0c0d0", size: 34 },
    { name: "Mars", color: "#ff6b35", size: 40 },
    { name: "Earth", color: "#00e676", size: 46 },
    { name: "Jupiter", color: "#ffc107", size: 64 },
    { name: "Sun", color: "#ffaa00", size: 84 },
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
        Starship Drifter — choose your world!
      </AnimatedText>

      {/* Glowing planet circles */}
      <div
        style={{
          display: "flex",
          gap: "2.5rem",
          marginTop: "2.5rem",
          alignItems: "center",
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
                background: `radial-gradient(circle at 35% 35%, ${planet.color}f0, ${planet.color}40)`,
                boxShadow: `0 0 24px ${planet.color}50, 0 0 48px ${planet.color}25`,
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

      <AnimatedText
        color="#00e676"
        size="var(--slide-body)"
        delay={1.5}
        mono
        style={{ marginTop: "2rem", opacity: 0.85 }}
      >
        Check your devices now!
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 6: Starship Drifter Leaderboard ─── */
function DrifterLeaderboardSlide({ active }: { active: boolean }) {
  const session = useQuery(api.sessions.getCurrent);
  return (
    <SlideLayout accent="green" active={active}>
      {session ? (
        <GameLeaderboard
          sessionId={session._id}
          game="planetaryParkour"
          title="STARSHIP DRIFTER LEADERBOARD"
          accent="#00e676"
          scoreUnit="pts"
        />
      ) : (
        <AnimatedText color="#00e676" size="var(--slide-body)">
          Waiting for session...
        </AnimatedText>
      )}
    </SlideLayout>
  );
}

export const section4Slides: SlideDefinition[] = [
  {
    id: "newworlds-title",
    section: 4,
    accent: "green",
    component: NewWorldsTitleSlide,
  },
  {
    id: "planet-comparison",
    section: 4,
    accent: "green",
    component: PlanetComparisonSlide,
  },
  {
    id: "moon-colony",
    section: 4,
    accent: "green",
    component: MoonColonySlide,
  },
  {
    id: "heavy-world",
    section: 4,
    accent: "green",
    component: HeavyWorldSlide,
  },
  {
    id: "drifter-intro",
    section: 4,
    accent: "green",
    component: DrifterIntroSlide,
    studentEvent: "planetaryParkour",
  },
  {
    id: "drifter-leaderboard",
    section: 4,
    accent: "green",
    component: DrifterLeaderboardSlide,
    studentEvent: "planetaryParkour",
  },
];
