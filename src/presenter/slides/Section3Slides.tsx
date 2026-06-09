import type { SlideDefinition } from "./index";
import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import GameLeaderboard from "../components/GameLeaderboard";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/* ─── Slide 1: Section Title ─── */
function FrontierTitleSlide({ active }: { active: boolean }) {
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
        LIFE ON THE FRONTIER
      </AnimatedText>
      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-subtitle)"
        delay={0.4}
      >
        Surviving on a new world
      </AnimatedText>
      {/* Decorative gold pulse line */}
      <div
        style={{
          width: "40%",
          height: "3px",
          background:
            "linear-gradient(90deg, transparent, #ffc107, transparent)",
          marginTop: "2rem",
          animation: "pulse-glow 2s ease-in-out infinite",
          boxShadow: "0 0 20px #ffc107",
        }}
      />
    </SlideLayout>
  );
}

/* ─── Slide 2: Moving in Low Gravity ─── */
function LowGravityMovementSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="gold" active={active}>
      <AnimatedText
        color="#ffc107"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        MOVING IN LOW GRAVITY
      </AnimatedText>

      {/* SVG: Earth jump arc vs tall colony jump arc */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.3s both" }}>
        <svg viewBox="0 0 600 340" style={{ width: "80%", maxWidth: "640px" }}>
          <defs>
            <filter id="glow-lowg">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Surface line */}
          <line
            x1="20"
            y1="300"
            x2="580"
            y2="300"
            stroke="#ffc107"
            strokeWidth="2"
          />
          {/* Surface ticks */}
          {[60, 140, 220, 300, 380, 460, 540].map((tx) => (
            <line
              key={tx}
              x1={tx}
              y1="300"
              x2={tx - 12}
              y2="314"
              stroke="#ffc10755"
              strokeWidth="2"
            />
          ))}

          {/* Earth jump: small low arc */}
          <path
            d="M 90 300 Q 165 230 240 300"
            fill="none"
            stroke="#ff2d7b"
            strokeWidth="3"
            strokeDasharray="7,5"
            filter="url(#glow-lowg)"
          />
          <circle cx="90" cy="290" r="9" fill="#ff2d7b" />
          <text
            x="165"
            y="218"
            fill="#ff2d7b"
            fontSize="15"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            Earth jump
          </text>

          {/* Colony jump: tall high arc */}
          <path
            d="M 340 300 Q 450 40 560 300"
            fill="none"
            stroke="#ffc107"
            strokeWidth="3"
            strokeDasharray="7,5"
            filter="url(#glow-lowg)"
          />
          <circle cx="340" cy="290" r="9" fill="#ffc107" />
          <text
            x="450"
            y="32"
            fill="#ffc107"
            fontSize="15"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            colony jump
          </text>
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.6}
        style={{ maxWidth: "82%" }}
      >
        <span className="grammar-conditional">If gravity is weaker</span>, you{" "}
        <span className="grammar-future">will</span> jump much higher.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 3: Frontier Hazards ─── */
function FrontierHazardsSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="gold" active={active}>
      <AnimatedText
        color="#ffc107"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        FRONTIER HAZARDS
      </AnimatedText>

      {/* SVG: three hazard icons */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.3s both" }}>
        <svg viewBox="0 0 660 260" style={{ width: "88%", maxWidth: "720px" }}>
          <defs>
            <filter id="glow-hazard">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Radiation (trefoil-ish) ── */}
          <g filter="url(#glow-hazard)">
            <circle cx="110" cy="100" r="14" fill="#ffc107" />
            {[0, 120, 240].map((a) => {
              const lr = ((a - 26) * Math.PI) / 180;
              const rr = ((a + 26) * Math.PI) / 180;
              return (
                <path
                  key={a}
                  d={`M ${110 + Math.cos(lr) * 22} ${100 + Math.sin(lr) * 22}
                      L ${110 + Math.cos(lr) * 60} ${100 + Math.sin(lr) * 60}
                      A 60 60 0 0 1 ${110 + Math.cos(rr) * 60} ${100 + Math.sin(rr) * 60}
                      L ${110 + Math.cos(rr) * 22} ${100 + Math.sin(rr) * 22} Z`}
                  fill="#ffc107"
                  opacity="0.85"
                />
              );
            })}
          </g>
          <text
            x="110"
            y="205"
            fill="#ffc107"
            fontSize="15"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            radiation
          </text>

          {/* ── Dust storm (swirl) ── */}
          <g filter="url(#glow-hazard)">
            <path
              d="M 330 70
                 C 380 60, 400 95, 360 110
                 C 320 122, 300 95, 335 88
                 C 358 84, 360 102, 345 104"
              fill="none"
              stroke="#ff2d7b"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 295 120 C 360 130, 390 120, 405 132"
              fill="none"
              stroke="#ff2d7b"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M 300 138 C 355 148, 380 142, 400 150"
              fill="none"
              stroke="#ff2d7b"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.5"
            />
          </g>
          <text
            x="350"
            y="205"
            fill="#ff2d7b"
            fontSize="15"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            dust storm
          </text>

          {/* ── Micrometeors (small streaks) ── */}
          <g filter="url(#glow-hazard)">
            {[
              [520, 60, 565, 95],
              [555, 50, 600, 85],
              [505, 95, 545, 125],
              [560, 100, 600, 128],
              [535, 120, 572, 146],
            ].map(([x1, y1, x2, y2], i) => (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#00e676"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx={x2} cy={y2} r="3.5" fill="#00e676" />
              </g>
            ))}
          </g>
          <text
            x="555"
            y="205"
            fill="#00e676"
            fontSize="15"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            micrometeors
          </text>
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.6}
        style={{ maxWidth: "85%" }}
      >
        Settlers <span className="grammar-possibility">might</span> face deadly
        radiation, so they <span className="grammar-future">will</span> need
        shielded suits.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 4: Mag-Rail Runner Intro ─── */
function MagRailIntroSlide({ active }: { active: boolean }) {
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
        Mag-Rail Runner — sprint across the colony!
      </AnimatedText>

      {/* Futuristic colony skyline */}
      <div
        style={{
          width: "82%",
          maxWidth: "720px",
          marginTop: "1.5rem",
          animation: "fade-in-up 0.6s ease 0.7s both",
        }}
      >
        <svg viewBox="0 0 720 220" style={{ width: "100%" }}>
          <defs>
            <linearGradient id="colony-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffc10712" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="720" height="220" fill="url(#colony-sky)" />

          {/* Towers */}
          <rect x="40" y="90" width="44" height="110" fill="#1a1a2e" stroke="#ffc10755" strokeWidth="1" />
          <rect x="250" y="70" width="40" height="130" fill="#1a1a2e" stroke="#ffc10755" strokeWidth="1" />
          <rect x="470" y="60" width="46" height="140" fill="#1a1a2e" stroke="#ffc10755" strokeWidth="1" />
          <rect x="650" y="95" width="40" height="105" fill="#1a1a2e" stroke="#ffc10755" strokeWidth="1" />

          {/* Tower windows */}
          {[55, 70, 85].map((y) =>
            [50, 64].map((x) => (
              <rect key={`${x}-${y}`} x={x + 0} y={y + 50} width="6" height="8" fill="#ffc10733" />
            )),
          )}

          {/* Geodesic domes */}
          <g>
            <path d="M 110 150 A 55 55 0 0 1 220 150 Z" fill="#1a1a2e" stroke="#ffc107" strokeWidth="2" />
            <path d="M 110 150 A 55 55 0 0 1 220 150" fill="none" stroke="#ffc10744" strokeWidth="1" />
            <line x1="165" y1="95" x2="165" y2="150" stroke="#ffc10733" strokeWidth="1" />
            <line x1="123" y1="125" x2="207" y2="125" stroke="#ffc10733" strokeWidth="1" />
            <rect x="110" y="150" width="110" height="50" fill="#1a1a2e" stroke="#ffc10755" strokeWidth="1" />
          </g>
          <g>
            <path d="M 320 150 A 60 60 0 0 1 440 150 Z" fill="#1a1a2e" stroke="#ffc107" strokeWidth="2" />
            <path d="M 320 150 A 60 60 0 0 1 440 150" fill="none" stroke="#ffc10744" strokeWidth="1" />
            <line x1="380" y1="90" x2="380" y2="150" stroke="#ffc10733" strokeWidth="1" />
            <line x1="330" y1="122" x2="430" y2="122" stroke="#ffc10733" strokeWidth="1" />
            <rect x="320" y="150" width="120" height="50" fill="#1a1a2e" stroke="#ffc10755" strokeWidth="1" />
          </g>
          <g>
            <path d="M 540 155 A 50 50 0 0 1 640 155 Z" fill="#1a1a2e" stroke="#ffc107" strokeWidth="2" />
            <path d="M 540 155 A 50 50 0 0 1 640 155" fill="none" stroke="#ffc10744" strokeWidth="1" />
            <line x1="590" y1="105" x2="590" y2="155" stroke="#ffc10733" strokeWidth="1" />
            <rect x="540" y="155" width="100" height="45" fill="#1a1a2e" stroke="#ffc10755" strokeWidth="1" />
          </g>

          {/* Dashed gold jump arcs between rooftops */}
          <path d="M 220 150 Q 270 95 320 150" fill="none" stroke="#ffc107" strokeWidth="2" strokeDasharray="6,4" opacity="0.7" />
          <path d="M 440 150 Q 490 100 540 155" fill="none" stroke="#ffc107" strokeWidth="2" strokeDasharray="6,4" opacity="0.7" />

          {/* Runner figure on the first dome rooftop */}
          <g>
            <circle cx="165" cy="128" r="9" fill="#ffc107" />
            <line x1="165" y1="137" x2="165" y2="150" stroke="#ffc107" strokeWidth="4" strokeLinecap="round" />
            <line x1="165" y1="150" x2="158" y2="150" stroke="#ffc107" strokeWidth="3" strokeLinecap="round" />
            <line x1="165" y1="150" x2="173" y2="150" stroke="#ffc107" strokeWidth="3" strokeLinecap="round" />
            <line x1="165" y1="142" x2="175" y2="138" stroke="#ffc107" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* Pulsing mono indicator */}
      <div
        style={{
          marginTop: "1.5rem",
          fontSize: "var(--slide-body)",
          color: "#ffc107",
          fontFamily: "var(--font-mono)",
          animation: "pulse-glow 1.6s ease-in-out infinite",
          textShadow: "0 0 12px #ffc107",
        }}
      >
        Check your devices now!
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 5: Mag-Rail Runner Leaderboard ─── */
function MagRailLeaderboardSlide({ active }: { active: boolean }) {
  const session = useQuery(api.sessions.getCurrent);
  return (
    <SlideLayout accent="gold" active={active}>
      {session ? (
        <GameLeaderboard
          sessionId={session._id}
          game="rooftopRun"
          title="MAG-RAIL RUNNER LEADERBOARD"
          accent="#ffc107"
          scoreUnit="m"
        />
      ) : (
        <AnimatedText color="#ffc107" size="var(--slide-body)">
          Waiting for session...
        </AnimatedText>
      )}
    </SlideLayout>
  );
}

export const section3Slides: SlideDefinition[] = [
  {
    id: "frontier-title",
    section: 3,
    accent: "gold",
    component: FrontierTitleSlide,
  },
  {
    id: "low-gravity-movement",
    section: 3,
    accent: "gold",
    component: LowGravityMovementSlide,
  },
  {
    id: "frontier-hazards",
    section: 3,
    accent: "gold",
    component: FrontierHazardsSlide,
  },
  {
    id: "magrail-intro",
    section: 3,
    accent: "gold",
    component: MagRailIntroSlide,
    studentEvent: "rooftopRun",
  },
  {
    id: "magrail-leaderboard",
    section: 3,
    accent: "gold",
    component: MagRailLeaderboardSlide,
    studentEvent: "rooftopRun",
  },
];
