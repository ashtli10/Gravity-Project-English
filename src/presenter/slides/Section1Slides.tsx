import type { SlideDefinition } from "./index";
import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import GameLeaderboard from "../components/GameLeaderboard";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const CYAN = "#00e5ff";

/* ─── Slide 1: Title ───────────────────────────────────────────────── */
function TitleSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      {/* Decorative glow orb behind title */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "560px",
          height: "560px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,229,255,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          animation: "float 4s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: "var(--slide-huge)",
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            color: "var(--cyan)",
            textShadow:
              "0 0 30px var(--cyan), 0 0 60px var(--cyan), 0 0 120px rgba(0,229,255,0.3)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            animation: "scale-in 0.8s ease 0.2s both",
            textAlign: "center",
            lineHeight: 1.05,
          }}
        >
          Frontier 2200
        </div>

        {/* Decorative cyan divider with node */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            animation: "fade-in 0.6s ease 0.7s both",
          }}
        >
          <div
            style={{
              width: "120px",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, var(--cyan))",
            }}
          />
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "var(--cyan)",
              boxShadow: "0 0 14px var(--cyan)",
            }}
          />
          <div
            style={{
              width: "120px",
              height: "2px",
              background:
                "linear-gradient(90deg, var(--cyan), transparent)",
            }}
          />
        </div>

        <AnimatedText
          size="var(--slide-subtitle)"
          color="var(--text-secondary)"
          weight={300}
          delay={0.9}
          style={{ maxWidth: "80%" }}
        >
          A Journey to the World of Tomorrow
        </AnimatedText>
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 2: Imagine the Year 2200 ───────────────────────────────── */
function ImagineSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      {/* Decorative concentric rings */}
      {[280, 430, 580].map((size, i) => (
        <div
          key={size}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            border: "1.5px solid var(--cyan)",
            opacity: 0.16 - i * 0.04,
            animation: `pulse-glow ${3 + i * 0.6}s ease-in-out ${i * 0.5}s infinite`,
            pointerEvents: "none",
          }}
        />
      ))}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <AnimatedText
          size="var(--slide-title)"
          color="var(--cyan)"
          glow
          weight={900}
          delay={0.1}
        >
          IMAGINE THE YEAR 2200
        </AnimatedText>

        <AnimatedText
          size="var(--slide-subtitle)"
          color="var(--text-primary)"
          delay={0.6}
          weight={400}
          style={{ marginTop: "2.2rem", maxWidth: "75%" }}
        >
          Close your eyes. The world you know{" "}
          <span className="grammar-future">is going to</span> change
          completely.
        </AnimatedText>
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 3: What Will Tomorrow Look Like? ───────────────────────── */
function PredictionsSlide({ active }: { active: boolean }) {
  const cards = [
    {
      label: "Smart Cities",
      delay: 0.6,
      svg: (
        <svg width="110" height="110" viewBox="0 0 110 110">
          {/* Ground */}
          <line x1="10" y1="92" x2="100" y2="92" stroke={CYAN} strokeWidth="2" opacity="0.6" />
          {/* Tower skyline */}
          <rect x="14" y="46" width="16" height="46" fill="#0c1a22" stroke={CYAN} strokeWidth="2" />
          <rect
            x="36"
            y="26"
            width="20"
            height="66"
            fill="#0c1a22"
            stroke={CYAN}
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 5px #00e5ff)" }}
          />
          <rect x="62" y="52" width="14" height="40" fill="#0c1a22" stroke={CYAN} strokeWidth="2" />
          <rect x="80" y="38" width="18" height="54" fill="#0c1a22" stroke={CYAN} strokeWidth="2" />
          {/* Antenna */}
          <line x1="46" y1="26" x2="46" y2="14" stroke={CYAN} strokeWidth="2" />
          <circle cx="46" cy="11" r="2.5" fill={CYAN} style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }} />
          {/* Lit windows */}
          {[
            [18, 52], [24, 52], [18, 60], [24, 60], [18, 68],
            [40, 32], [48, 32], [40, 40], [48, 40], [40, 48], [48, 48], [40, 56],
            [65, 58], [70, 58], [65, 66],
            [84, 44], [91, 44], [84, 52], [91, 52], [84, 60],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="3.5" height="3.5" fill={CYAN} opacity="0.85" />
          ))}
        </svg>
      ),
    },
    {
      label: "Thinking Machines",
      delay: 0.8,
      svg: (
        <svg width="110" height="110" viewBox="0 0 110 110">
          {/* Chip body */}
          <rect
            x="32"
            y="32"
            width="46"
            height="46"
            rx="6"
            fill="#0c1a22"
            stroke={CYAN}
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
          />
          {/* Pins */}
          {[42, 55, 68].map((o) => (
            <g key={o} stroke={CYAN} strokeWidth="2" opacity="0.8">
              <line x1={o} y1="32" x2={o} y2="22" />
              <line x1={o} y1="78" x2={o} y2="88" />
              <line x1="32" y1={o} x2="22" y2={o} />
              <line x1="78" y1={o} x2="88" y2={o} />
            </g>
          ))}
          {/* Neural traces inside */}
          {[
            [45, 46], [64, 44], [48, 64], [66, 62],
          ].map(([x, y], i) => (
            <g key={i}>
              <line
                x1={x}
                y1={y}
                x2="55"
                y2="54"
                stroke={CYAN}
                strokeWidth="1.5"
                opacity="0.5"
              />
              <circle cx={x} cy={y} r="3" fill={CYAN} opacity="0.9" />
            </g>
          ))}
          <line x1="45" y1="46" x2="64" y2="44" stroke={CYAN} strokeWidth="1" opacity="0.35" />
          <circle cx="55" cy="54" r="3.5" fill={CYAN} style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }} />
        </svg>
      ),
    },
    {
      label: "New Worlds",
      delay: 1.0,
      svg: (
        <svg width="110" height="110" viewBox="0 0 110 110">
          {/* Stars */}
          <circle cx="14" cy="16" r="1.5" fill={CYAN} opacity="0.7" />
          <circle cx="90" cy="20" r="2" fill={CYAN} opacity="0.6" />
          <circle cx="98" cy="70" r="1.5" fill={CYAN} opacity="0.7" />
          <circle cx="12" cy="56" r="1.5" fill={CYAN} opacity="0.5" />
          {/* Planet */}
          <circle
            cx="55"
            cy="62"
            r="30"
            fill="#0c1a22"
            stroke={CYAN}
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
          />
          <path d="M28,54 Q52,44 82,56" fill="none" stroke={CYAN} strokeWidth="1.5" opacity="0.4" />
          <path d="M30,74 Q55,82 80,72" fill="none" stroke={CYAN} strokeWidth="1.5" opacity="0.3" />
          {/* Habitat dome on the surface */}
          <path
            d="M43,34.5 A12,12 0 0,1 67,34.5"
            fill={CYAN}
            fillOpacity="0.15"
            stroke={CYAN}
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
          />
          <line x1="43" y1="34.5" x2="67" y2="34.5" stroke={CYAN} strokeWidth="2" />
          <circle cx="55" cy="29" r="2" fill={CYAN} opacity="0.9" />
        </svg>
      ),
    },
  ];

  return (
    <SlideLayout accent="cyan" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--cyan)"
        glow
        weight={900}
        delay={0.1}
      >
        WHAT WILL TOMORROW LOOK LIKE?
      </AnimatedText>

      <div
        style={{
          display: "flex",
          gap: "2.5rem",
          marginTop: "2.5rem",
          alignItems: "stretch",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.8rem",
              padding: "1.6rem 1.4rem 1.2rem",
              borderRadius: "16px",
              border: "1px solid rgba(0,229,255,0.25)",
              background:
                "linear-gradient(180deg, rgba(0,229,255,0.06), rgba(0,229,255,0.02))",
              boxShadow: "0 0 24px rgba(0,229,255,0.08)",
              width: "210px",
              animation: `fade-in-up 0.6s ease ${card.delay}s both`,
            }}
          >
            {card.svg}
            <span
              style={{
                color: "var(--text-primary)",
                fontSize: "var(--slide-small)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              {card.label}
            </span>
          </div>
        ))}
      </div>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.3}
        style={{ marginTop: "2rem", maxWidth: "80%" }}
      >
        Nobody knows for sure — but we{" "}
        <span className="grammar-possibility">can</span> make predictions.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 4: Technology Never Stops ──────────────────────────────── */
function TechEvolutionSlide({ active }: { active: boolean }) {
  const milestones = [
    {
      x: 80,
      year: "400,000 BC",
      name: "FIRE",
      icon: (
        <g>
          <path
            d="M0,-16 Q10,-4 8,6 Q6,15 0,16 Q-8,14 -9,4 Q-10,-5 0,-16 Z"
            fill="#0c1a22"
            stroke={CYAN}
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
          />
          <path
            d="M0,-4 Q4,2 2,7 Q0,10 -2,8 Q-5,4 0,-4 Z"
            fill={CYAN}
            opacity="0.5"
          />
        </g>
      ),
    },
    {
      x: 224,
      year: "3500 BC",
      name: "WHEEL",
      icon: (
        <g stroke={CYAN} strokeWidth="2">
          <circle
            cx="0"
            cy="0"
            r="13"
            fill="#0c1a22"
            style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
          />
          <line x1="-13" y1="0" x2="13" y2="0" strokeWidth="1.5" opacity="0.7" />
          <line x1="0" y1="-13" x2="0" y2="13" strokeWidth="1.5" opacity="0.7" />
          <line x1="-9" y1="-9" x2="9" y2="9" strokeWidth="1.5" opacity="0.7" />
          <line x1="-9" y1="9" x2="9" y2="-9" strokeWidth="1.5" opacity="0.7" />
          <circle cx="0" cy="0" r="3" fill={CYAN} stroke="none" />
        </g>
      ),
    },
    {
      x: 368,
      year: "1769",
      name: "ENGINE",
      icon: (
        <g stroke={CYAN} strokeWidth="2">
          {[
            [10, 0, 15, 0],
            [7.1, 7.1, 10.6, 10.6],
            [0, 10, 0, 15],
            [-7.1, 7.1, -10.6, 10.6],
            [-10, 0, -15, 0],
            [-7.1, -7.1, -10.6, -10.6],
            [0, -10, 0, -15],
            [7.1, -7.1, 10.6, -10.6],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
          <circle
            cx="0"
            cy="0"
            r="10"
            fill="#0c1a22"
            style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
          />
          <circle cx="0" cy="0" r="3.5" fill="none" strokeWidth="1.5" />
        </g>
      ),
    },
    {
      x: 512,
      year: "1946",
      name: "COMPUTER",
      icon: (
        <g stroke={CYAN} strokeWidth="2">
          <rect
            x="-14"
            y="-14"
            width="28"
            height="20"
            rx="2"
            fill="#0c1a22"
            style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
          />
          <line x1="-9" y1="-8" x2="9" y2="-8" strokeWidth="1.5" opacity="0.5" />
          <line x1="-9" y1="-3" x2="4" y2="-3" strokeWidth="1.5" opacity="0.35" />
          <line x1="0" y1="6" x2="0" y2="12" />
          <line x1="-8" y1="12" x2="8" y2="12" />
        </g>
      ),
    },
    {
      x: 656,
      year: "2025",
      name: "AI",
      icon: (
        <g stroke={CYAN} strokeWidth="1.5">
          <rect
            x="-11"
            y="-11"
            width="22"
            height="22"
            rx="3"
            fill="#0c1a22"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
          />
          {[-6, 0, 6].map((o) => (
            <g key={o}>
              <line x1={o} y1="-11" x2={o} y2="-16" />
              <line x1={o} y1="11" x2={o} y2="16" />
              <line x1="-11" y1={o} x2="-16" y2={o} />
              <line x1="11" y1={o} x2="16" y2={o} />
            </g>
          ))}
          <circle cx="0" cy="0" r="4.5" fill="none" />
          <circle cx="0" cy="0" r="1.5" fill={CYAN} stroke="none" />
        </g>
      ),
    },
  ];

  return (
    <SlideLayout accent="cyan" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--cyan)"
        glow
        weight={900}
        delay={0.1}
      >
        TECHNOLOGY NEVER STOPS
      </AnimatedText>

      <div
        style={{
          marginTop: "2.2rem",
          animation: "fade-in-up 0.6s ease 0.4s both",
        }}
      >
        <svg
          width="880"
          height="190"
          viewBox="0 0 880 190"
          style={{ maxWidth: "92vw", height: "auto" }}
        >
          {/* Timeline baseline */}
          <line
            x1="30"
            y1="118"
            x2="846"
            y2="118"
            stroke={CYAN}
            strokeWidth="2"
            opacity="0.35"
          />
          <polygon points="862,118 846,111 846,125" fill={CYAN} opacity="0.6" />

          {milestones.map((m, i) => (
            <g key={m.name} style={{ animation: `fade-in 0.5s ease ${0.6 + i * 0.18}s both` }}>
              <g transform={`translate(${m.x},72)`}>{m.icon}</g>
              <line
                x1={m.x}
                y1="96"
                x2={m.x}
                y2="112"
                stroke={CYAN}
                strokeWidth="1.5"
                opacity="0.3"
              />
              <circle
                cx={m.x}
                cy="118"
                r="5"
                fill={CYAN}
                style={{ filter: "drop-shadow(0 0 5px #00e5ff)" }}
              />
              <text
                x={m.x}
                y="146"
                textAnchor="middle"
                fill={CYAN}
                opacity="0.9"
                fontSize="13"
                fontFamily="var(--font-mono)"
              >
                {m.year}
              </text>
              <text
                x={m.x}
                y="166"
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="11"
                letterSpacing="0.1em"
              >
                {m.name}
              </text>
            </g>
          ))}

          {/* Glowing 2200? node */}
          <g style={{ animation: "fade-in 0.5s ease 1.6s both" }}>
            <g style={{ animation: "pulse-glow 2s ease-in-out infinite" }}>
              <circle
                cx="800"
                cy="72"
                r="22"
                fill="#0c1a22"
                stroke={CYAN}
                strokeWidth="2.5"
                style={{ filter: "drop-shadow(0 0 12px #00e5ff)" }}
              />
              <text
                x="800"
                y="80"
                textAnchor="middle"
                fill={CYAN}
                fontSize="24"
                fontWeight="900"
                fontFamily="var(--font-mono)"
              >
                ?
              </text>
            </g>
            <line
              x1="800"
              y1="96"
              x2="800"
              y2="112"
              stroke={CYAN}
              strokeWidth="1.5"
              opacity="0.3"
            />
            <circle
              cx="800"
              cy="118"
              r="5"
              fill={CYAN}
              style={{ filter: "drop-shadow(0 0 5px #00e5ff)" }}
            />
            <text
              x="800"
              y="146"
              textAnchor="middle"
              fill={CYAN}
              fontSize="14"
              fontWeight="700"
              fontFamily="var(--font-mono)"
              style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
            >
              2200?
            </text>
            <text
              x="800"
              y="166"
              textAnchor="middle"
              fill="var(--text-secondary)"
              fontSize="11"
              letterSpacing="0.1em"
            >
              NEXT
            </text>
          </g>
        </svg>
      </div>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.8}
        style={{ marginTop: "1.5rem", maxWidth: "80%" }}
      >
        Each invention <span className="grammar-future">will lead</span> to
        the next one.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 5: The Speed of Change ─────────────────────────────────── */
function SpeedOfChangeSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      <div
        style={{
          fontSize: "var(--slide-huge)",
          fontFamily: "var(--font-mono)",
          fontWeight: 900,
          color: "var(--cyan)",
          textShadow:
            "0 0 30px var(--cyan), 0 0 60px var(--cyan), 0 0 100px rgba(0,229,255,0.25)",
          animation: "number-count 0.8s ease 0.2s both",
          letterSpacing: "0.04em",
          textAlign: "center",
          lineHeight: 1.05,
        }}
      >
        100 YEARS
      </div>

      <AnimatedText
        size="var(--slide-subtitle)"
        color="var(--text-primary)"
        delay={0.7}
        weight={500}
        style={{ marginTop: "1.5rem", maxWidth: "80%" }}
      >
        of progress now happens in just 10
      </AnimatedText>

      {/* Decorative bar */}
      <div
        style={{
          width: "50%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, var(--cyan), transparent)",
          margin: "1.8rem 0",
          opacity: 0.5,
          animation: "fade-in 0.5s ease 1s both",
        }}
      />

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-secondary)"
        delay={1.2}
        style={{ maxWidth: "80%" }}
      >
        <span className="grammar-conditional">
          If progress keeps accelerating
        </span>
        , the next century <span className="grammar-future">will</span>{" "}
        arrive early.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 6: Transition ──────────────────────────────────────────── */
function TransitionSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      {[300, 440, 580].map((size, i) => (
        <div
          key={size}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            border: "1.5px solid var(--cyan)",
            opacity: 0.18 - i * 0.05,
            animation: `pulse-glow ${2 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
            pointerEvents: "none",
          }}
        />
      ))}

      <div
        style={{
          fontSize: "var(--slide-title)",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          color: "var(--cyan)",
          textShadow: "0 0 20px var(--cyan), 0 0 40px var(--cyan)",
          animation: "pulse-glow 2s ease-in-out infinite",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        Can YOU build the future?
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 7: Tech Merge Intro ────────────────────────────────────── */
function TechMergeIntroSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      <div
        style={{
          fontSize: "var(--slide-huge)",
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          color: "var(--cyan)",
          textShadow:
            "0 0 30px var(--cyan), 0 0 60px var(--cyan), 0 0 120px rgba(0,229,255,0.3)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          animation: "scale-in 0.8s ease 0.1s both",
          textAlign: "center",
          lineHeight: 1.05,
        }}
      >
        Tech Merge 2200
      </div>

      <AnimatedText
        size="var(--slide-subtitle)"
        color="var(--text-primary)"
        delay={0.6}
        weight={400}
        style={{ marginTop: "1.5rem", maxWidth: "80%" }}
      >
        Merge technologies to reach the year 2200!
      </AnimatedText>

      {/* Two tech tiles merging into a bigger one */}
      <div
        style={{
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.9s both",
        }}
      >
        <svg width="360" height="200" viewBox="0 0 360 200">
          {/* Tile A: gear */}
          <rect
            x="24"
            y="22"
            width="64"
            height="64"
            rx="10"
            fill="#0c1a22"
            stroke={CYAN}
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 5px #00e5ff)" }}
          />
          <g transform="translate(56,54)" stroke={CYAN} strokeWidth="2">
            {[
              [9, 0, 14, 0],
              [6.4, 6.4, 9.9, 9.9],
              [0, 9, 0, 14],
              [-6.4, 6.4, -9.9, 9.9],
              [-9, 0, -14, 0],
              [-6.4, -6.4, -9.9, -9.9],
              [0, -9, 0, -14],
              [6.4, -6.4, 9.9, -9.9],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
            <circle cx="0" cy="0" r="9" fill="#0c1a22" />
            <circle cx="0" cy="0" r="3" fill="none" strokeWidth="1.5" />
          </g>

          {/* Tile B: chip */}
          <rect
            x="24"
            y="114"
            width="64"
            height="64"
            rx="10"
            fill="#0c1a22"
            stroke={CYAN}
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 5px #00e5ff)" }}
          />
          <g transform="translate(56,146)" stroke={CYAN} strokeWidth="1.5">
            <rect x="-11" y="-11" width="22" height="22" rx="3" fill="#0c1a22" strokeWidth="2" />
            {[-6, 0, 6].map((o) => (
              <g key={o}>
                <line x1={o} y1="-11" x2={o} y2="-16" />
                <line x1={o} y1="11" x2={o} y2="16" />
                <line x1="-11" y1={o} x2="-16" y2={o} />
                <line x1="11" y1={o} x2="16" y2={o} />
              </g>
            ))}
            <circle cx="0" cy="0" r="3" fill={CYAN} stroke="none" />
          </g>

          {/* Flow arrows converging */}
          <path
            d="M96,54 C150,54 165,90 188,98"
            fill="none"
            stroke={CYAN}
            strokeWidth="2"
            strokeDasharray="6,5"
            opacity="0.7"
            style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
          />
          <path
            d="M96,146 C150,146 165,110 188,102"
            fill="none"
            stroke={CYAN}
            strokeWidth="2"
            strokeDasharray="6,5"
            opacity="0.7"
            style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
          />
          <polygon
            points="206,100 190,91 190,109"
            fill={CYAN}
            style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
          />

          {/* Big merged tile */}
          <g style={{ animation: "pulse-glow 2s ease-in-out infinite" }}>
            <rect
              x="216"
              y="48"
              width="104"
              height="104"
              rx="14"
              fill="#0c1a22"
              stroke={CYAN}
              strokeWidth="2.5"
              style={{ filter: "drop-shadow(0 0 14px #00e5ff)" }}
            />
            {/* Starburst core */}
            <g stroke={CYAN} strokeWidth="3" strokeLinecap="round">
              <line x1="268" y1="76" x2="268" y2="124" />
              <line x1="244" y1="100" x2="292" y2="100" />
              <line x1="252" y1="84" x2="284" y2="116" strokeWidth="2" opacity="0.6" />
              <line x1="284" y1="84" x2="252" y2="116" strokeWidth="2" opacity="0.6" />
            </g>
            <circle
              cx="268"
              cy="100"
              r="7"
              fill={CYAN}
              style={{ filter: "drop-shadow(0 0 8px #00e5ff)" }}
            />
          </g>

          {/* Sparkles */}
          <g stroke={CYAN} strokeWidth="2" strokeLinecap="round" opacity="0.8">
            <line x1="336" y1="54" x2="336" y2="66" />
            <line x1="330" y1="60" x2="342" y2="60" />
            <line x1="332" y1="148" x2="332" y2="156" />
            <line x1="328" y1="152" x2="336" y2="152" />
          </g>
        </svg>
      </div>

      <div
        style={{
          fontSize: "var(--slide-body)",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          color: "var(--cyan)",
          textShadow: "0 0 16px var(--cyan), 0 0 32px var(--cyan)",
          letterSpacing: "0.08em",
          marginTop: "1.5rem",
          animation: "pulse-glow 1.6s ease-in-out infinite",
          textAlign: "center",
        }}
      >
        Check your devices now!
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 8: Tech Merge Leaderboard ──────────────────────────────── */
function TechMergeLeaderboardSlide({ active }: { active: boolean }) {
  const session = useQuery(api.sessions.getCurrent);
  return (
    <SlideLayout accent="cyan" active={active}>
      {session ? (
        <GameLeaderboard
          sessionId={session._id}
          game="techMerge"
          title="TECH MERGE LEADERBOARD"
          accent={CYAN}
          scoreUnit="pts"
        />
      ) : (
        <AnimatedText color={CYAN} size="var(--slide-body)">
          Waiting for session...
        </AnimatedText>
      )}
    </SlideLayout>
  );
}

/* ─── Export ───────────────────────────────────────────────────────── */
export const section1Slides: SlideDefinition[] = [
  { id: "title", section: 1, accent: "cyan", component: TitleSlide },
  { id: "imagine", section: 1, accent: "cyan", component: ImagineSlide },
  { id: "predictions", section: 1, accent: "cyan", component: PredictionsSlide },
  { id: "tech-evolution", section: 1, accent: "cyan", component: TechEvolutionSlide },
  { id: "speed-of-change", section: 1, accent: "cyan", component: SpeedOfChangeSlide },
  { id: "transition", section: 1, accent: "cyan", component: TransitionSlide },
  { id: "techmerge-intro", section: 1, accent: "cyan", component: TechMergeIntroSlide, studentEvent: "techMerge" },
  { id: "techmerge-leaderboard", section: 1, accent: "cyan", component: TechMergeLeaderboardSlide, studentEvent: "techMerge" },
];
