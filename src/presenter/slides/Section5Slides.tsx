import type { SlideDefinition } from "./index";
import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import PollResults from "../components/PollResults";
import ChampionSlideComponent from "../components/ChampionSlide";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const POLL_OPTIONS = [
  { label: "Yes — sign me up!", value: "yes", color: "#00e676" },
  { label: "Maybe, with training", value: "maybe", color: "#ffc107" },
  { label: "No, Earth is home", value: "no", color: "#ff2d7b" },
];

/* ─── Slide 1: Section Title ─── */
function YourFutureTitleSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="mixed" active={active}>
      <AnimatedText
        color="#b388ff"
        size="var(--slide-huge)"
        glow
        weight={900}
        delay={0}
        style={{ letterSpacing: "0.08em" }}
      >
        YOUR FUTURE
      </AnimatedText>
      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-subtitle)"
        delay={0.5}
      >
        The year 2200 starts with the choices you make today
      </AnimatedText>
      {/* Purple divider */}
      <div
        style={{
          width: "30%",
          height: "3px",
          borderRadius: "2px",
          background:
            "linear-gradient(90deg, transparent, #b388ff, transparent)",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.8s both",
          boxShadow: "0 0 18px rgba(179,136,255,0.4)",
        }}
      />
    </SlideLayout>
  );
}

/* ─── Slide 2: Would You Live On Mars? ─── */
function WouldYouGoSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="mixed" active={active}>
      <AnimatedText
        color="#b388ff"
        size="var(--slide-huge)"
        glow
        weight={900}
        delay={0}
        style={{ letterSpacing: "0.04em" }}
      >
        WOULD YOU LIVE ON MARS?
      </AnimatedText>
      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-subtitle)"
        delay={0.4}
      >
        Tell us what you think.
      </AnimatedText>

      {/* Three preview option cards */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          marginTop: "2.5rem",
          flexWrap: "wrap",
          justifyContent: "center",
          animation: "fade-in-up 0.6s ease 0.7s both",
        }}
      >
        {POLL_OPTIONS.map((opt) => (
          <div
            key={opt.value}
            style={{
              padding: "1rem 2rem",
              border: `2px solid ${opt.color}50`,
              borderRadius: "12px",
              color: opt.color,
              fontSize: "var(--slide-body)",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              textShadow: `0 0 10px ${opt.color}40`,
              background: `${opt.color}08`,
              boxShadow: `0 0 18px ${opt.color}15`,
            }}
          >
            {opt.label}
          </div>
        ))}
      </div>

      {/* Pulsing call to action */}
      <div
        style={{
          marginTop: "2.2rem",
          animation: "fade-in-up 0.6s ease 1s both",
        }}
      >
        <div
          style={{
            fontSize: "var(--slide-body)",
            color: "#b388ff",
            fontFamily: "var(--font-mono)",
            textShadow: "0 0 12px rgba(179,136,255,0.6)",
            animation: "pulse-glow 1.6s ease-in-out infinite",
          }}
        >
          Vote on your devices now!
        </div>
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 3: Poll Results ─── */
function PollResultsSlide({ active }: { active: boolean }) {
  const session = useQuery(api.sessions.getCurrent);
  return (
    <SlideLayout accent="mixed" active={active}>
      <AnimatedText
        color="#b388ff"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
        style={{ marginBottom: "1.5rem" }}
      >
        POLL RESULTS
      </AnimatedText>
      {session ? (
        <PollResults
          sessionId={session._id}
          slideContext="would-you-live-on-mars"
          options={POLL_OPTIONS}
        />
      ) : (
        <AnimatedText color="#b388ff" size="var(--slide-body)">
          Waiting for session...
        </AnimatedText>
      )}
    </SlideLayout>
  );
}

/* ─── Slide 4: My Opinion ─── */
function MyOpinionSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="mixed" active={active}>
      <AnimatedText
        color="#b388ff"
        size="var(--slide-huge)"
        glow
        weight={900}
        delay={0}
        style={{ letterSpacing: "0.06em" }}
      >
        MY OPINION
      </AnimatedText>

      {/* Multi-color gradient bar */}
      <div
        style={{
          width: "55%",
          height: "6px",
          borderRadius: "3px",
          background:
            "linear-gradient(90deg, #00e5ff, #ff2d7b, #ffc107, #00e676, #b388ff)",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.4s both",
          boxShadow:
            "0 0 20px rgba(179,136,255,0.3), 0 0 40px rgba(0,229,255,0.12)",
        }}
      />

      {/* Floating decorative shapes (backdrop while presenter speaks) */}
      <div
        style={{
          position: "relative",
          width: "360px",
          height: "210px",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.6s both",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "18px",
            left: "36px",
            width: "62px",
            height: "62px",
            borderRadius: "50%",
            border: "2px solid #b388ff35",
            boxShadow: "0 0 16px #b388ff20",
            animation: "float 4s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "76px",
            right: "48px",
            width: "44px",
            height: "44px",
            border: "2px solid #00e67635",
            transform: "rotate(45deg)",
            boxShadow: "0 0 16px #00e67620",
            animation: "float 5s ease-in-out 0.6s infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "140px",
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            border: "2px solid #ffc10735",
            boxShadow: "0 0 16px #ffc10720",
            animation: "float 4.4s ease-in-out 1.1s infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "0px",
            right: "130px",
            width: "0",
            height: "0",
            borderLeft: "24px solid transparent",
            borderRight: "24px solid transparent",
            borderBottom: "40px solid #00e5ff22",
            filter: "drop-shadow(0 0 12px #00e5ff20)",
            animation: "float 5.4s ease-in-out 0.3s infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "26px",
            right: "14px",
            width: "26px",
            height: "26px",
            borderRadius: "6px",
            border: "2px solid #ff2d7b35",
            transform: "rotate(18deg)",
            boxShadow: "0 0 14px #ff2d7b20",
            animation: "float 4.8s ease-in-out 1.6s infinite",
          }}
        />
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 5: Future Ethics ─── */
function FutureEthicsSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="mixed" active={active}>
      <AnimatedText
        color="#b388ff"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
        style={{ letterSpacing: "0.05em" }}
      >
        WHO DECIDES THE FUTURE?
      </AnimatedText>

      {/* Balance scale: a chip (machine) versus a heart (human) */}
      <div
        style={{
          marginTop: "1.2rem",
          animation: "fade-in-up 0.6s ease 0.3s both",
        }}
      >
        <svg viewBox="0 0 260 190" style={{ width: "320px", height: "234px" }}>
          {/* Base */}
          <path
            d="M 104 180 L 156 180 L 146 168 L 114 168 Z"
            fill="#b388ff30"
            stroke="#b388ff"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Pillar */}
          <rect x="127" y="70" width="6" height="98" rx="3" fill="#b388ff" opacity="0.85" />
          {/* Beam */}
          <rect
            x="53"
            y="66"
            width="154"
            height="5"
            rx="2.5"
            fill="#b388ff"
            filter="drop-shadow(0 0 8px #b388ff60)"
          />
          {/* Pivot ornament */}
          <circle cx="130" cy="68" r="6" fill="#0a0a0f" stroke="#b388ff" strokeWidth="2.5" />

          {/* Left strings */}
          <line x1="57" y1="71" x2="34" y2="121" stroke="#b388ff" strokeWidth="1.5" opacity="0.7" />
          <line x1="57" y1="71" x2="80" y2="121" stroke="#b388ff" strokeWidth="1.5" opacity="0.7" />
          {/* Left pan (machine side) */}
          <path
            d="M 32 122 A 25 13 0 0 0 82 122 Z"
            fill="#00e5ff15"
            stroke="#00e5ff"
            strokeWidth="2"
            filter="drop-shadow(0 0 8px #00e5ff40)"
          />
          {/* Chip on left pan */}
          <rect x="46" y="98" width="22" height="22" rx="3" fill="#00e5ff18" stroke="#00e5ff" strokeWidth="2" />
          <rect x="52" y="104" width="10" height="10" rx="1.5" fill="#00e5ff" opacity="0.55" />
          {/* Chip pins */}
          <line x1="40" y1="102" x2="46" y2="102" stroke="#00e5ff" strokeWidth="2" />
          <line x1="40" y1="109" x2="46" y2="109" stroke="#00e5ff" strokeWidth="2" />
          <line x1="40" y1="116" x2="46" y2="116" stroke="#00e5ff" strokeWidth="2" />
          <line x1="68" y1="102" x2="74" y2="102" stroke="#00e5ff" strokeWidth="2" />
          <line x1="68" y1="109" x2="74" y2="109" stroke="#00e5ff" strokeWidth="2" />
          <line x1="68" y1="116" x2="74" y2="116" stroke="#00e5ff" strokeWidth="2" />
          <line x1="51" y1="92" x2="51" y2="98" stroke="#00e5ff" strokeWidth="2" />
          <line x1="57" y1="92" x2="57" y2="98" stroke="#00e5ff" strokeWidth="2" />
          <line x1="63" y1="92" x2="63" y2="98" stroke="#00e5ff" strokeWidth="2" />

          {/* Right strings */}
          <line x1="203" y1="71" x2="180" y2="121" stroke="#b388ff" strokeWidth="1.5" opacity="0.7" />
          <line x1="203" y1="71" x2="226" y2="121" stroke="#b388ff" strokeWidth="1.5" opacity="0.7" />
          {/* Right pan (human side) */}
          <path
            d="M 178 122 A 25 13 0 0 0 228 122 Z"
            fill="#ff2d7b15"
            stroke="#ff2d7b"
            strokeWidth="2"
            filter="drop-shadow(0 0 8px #ff2d7b40)"
          />
          {/* Heart on right pan */}
          <path
            d="M 203 119 C 196 111 190 106.5 190 99 C 190 92.5 195.5 89.5 199.8 91.8 C 202 93 203 95.2 203 97.4 C 203 95.2 204 93 206.2 91.8 C 210.5 89.5 216 92.5 216 99 C 216 106.5 210 111 203 119 Z"
            fill="#ff2d7b"
            opacity="0.9"
            filter="drop-shadow(0 0 10px #ff2d7b70)"
          />

          {/* Labels */}
          <text
            x="57"
            y="150"
            textAnchor="middle"
            fill="#00e5ff"
            fontSize="11"
            fontFamily="var(--font-mono)"
            letterSpacing="2"
          >
            MACHINE
          </text>
          <text
            x="203"
            y="150"
            textAnchor="middle"
            fill="#ff2d7b"
            fontSize="11"
            fontFamily="var(--font-mono)"
            letterSpacing="2"
          >
            HUMAN
          </text>
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.6}
        style={{ maxWidth: "85%", marginTop: "1rem" }}
      >
        <span className="grammar-conditional">
          If we let machines decide everything
        </span>
        , we <span className="grammar-possibility">might</span> lose something
        human.
      </AnimatedText>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.9}
        style={{ maxWidth: "85%", marginTop: "0.8rem" }}
      >
        The future <span className="grammar-future">will need</span> wise
        hearts, not just smart machines.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 6: Closing Statement ─── */
function ClosingStatementSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="mixed" active={active}>
      {/* Radial multi-color glow backdrop */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "85%",
          height: "50%",
          background:
            "radial-gradient(ellipse at center, #b388ff12 0%, #00e5ff0a 25%, #ff2d7b08 50%, #ffc10705 70%, transparent 85%)",
          pointerEvents: "none",
        }}
      />
      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-huge)"
        glow
        weight={900}
        delay={0}
        style={{
          maxWidth: "85%",
          textShadow:
            "0 0 20px rgba(179,136,255,0.45), 0 0 40px rgba(0,229,255,0.2), 0 0 60px rgba(255,45,123,0.12)",
        }}
      >
        The future belongs to those who build it.
      </AnimatedText>

      <div
        style={{
          width: "50%",
          height: "4px",
          borderRadius: "2px",
          background:
            "linear-gradient(90deg, #00e5ff, #ff2d7b, #ffc107, #00e676, #b388ff)",
          marginTop: "2.5rem",
          animation: "fade-in-up 0.6s ease 0.6s both",
          boxShadow:
            "0 0 15px rgba(0,229,255,0.3), 0 0 15px rgba(255,45,123,0.2)",
        }}
      />
    </SlideLayout>
  );
}

/* ─── Slide 7: Champion Podium ─── */
function ChampionSlide({ active }: { active: boolean }) {
  const session = useQuery(api.sessions.getCurrent);
  return (
    <SlideLayout accent="mixed" active={active}>
      {session ? (
        <ChampionSlideComponent sessionId={session._id} />
      ) : (
        <AnimatedText color="#b388ff" size="var(--slide-body)">
          Waiting for session...
        </AnimatedText>
      )}
    </SlideLayout>
  );
}

/* ─── Slide 8: Thank You ─── */
const THANK_YOU_COLORS = ["#00e5ff", "#ff2d7b", "#ffc107", "#00e676", "#b388ff"];

function ThankYouSlide({ active }: { active: boolean }) {
  const letters = "THANK YOU".split("");
  let colorIndex = -1;

  return (
    <SlideLayout accent="mixed" active={active}>
      {/* Each letter glows a different cycling color */}
      <div
        style={{
          display: "flex",
          gap: "0.06em",
          animation: "fade-in-up 0.6s ease 0s both",
        }}
      >
        {letters.map((letter, i) => {
          if (letter !== " ") colorIndex += 1;
          const color = THANK_YOU_COLORS[colorIndex % THANK_YOU_COLORS.length];
          return (
            <span
              key={i}
              style={{
                fontSize: "var(--slide-huge)",
                fontWeight: 900,
                fontFamily: "var(--font-display)",
                color: letter === " " ? "transparent" : color,
                textShadow:
                  letter === " "
                    ? "none"
                    : `0 0 20px ${color}, 0 0 40px ${color}60`,
                animation: `fade-in-up 0.6s ease ${i * 0.08}s both`,
                display: "inline-block",
                minWidth: letter === " " ? "0.45em" : "auto",
                letterSpacing: "0.04em",
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>

      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-subtitle)"
        delay={0.9}
      >
        Frontier 2200 — An English Presentation
      </AnimatedText>

      {/* Multi-color gradient line */}
      <div
        style={{
          width: "50%",
          height: "3px",
          borderRadius: "2px",
          background:
            "linear-gradient(90deg, #00e5ff, #ff2d7b, #ffc107, #00e676, #b388ff)",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 1.2s both",
        }}
      />

      {/* Five section color dots */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          marginTop: "1.5rem",
          animation: "fade-in-up 0.6s ease 1.4s both",
        }}
      >
        {THANK_YOU_COLORS.map((c) => (
          <div
            key={c}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: c,
              boxShadow: `0 0 8px ${c}80`,
            }}
          />
        ))}
      </div>
    </SlideLayout>
  );
}

export const section5Slides: SlideDefinition[] = [
  {
    id: "yourfuture-title",
    section: 5,
    accent: "mixed",
    component: YourFutureTitleSlide,
  },
  {
    id: "would-you-go",
    section: 5,
    accent: "mixed",
    component: WouldYouGoSlide,
    studentEvent: "poll",
  },
  {
    id: "poll-results",
    section: 5,
    accent: "mixed",
    component: PollResultsSlide,
  },
  {
    id: "my-opinion",
    section: 5,
    accent: "mixed",
    component: MyOpinionSlide,
  },
  {
    id: "future-ethics",
    section: 5,
    accent: "mixed",
    component: FutureEthicsSlide,
  },
  {
    id: "closing-statement",
    section: 5,
    accent: "mixed",
    component: ClosingStatementSlide,
  },
  {
    id: "champion",
    section: 5,
    accent: "mixed",
    component: ChampionSlide,
  },
  {
    id: "thank-you",
    section: 5,
    accent: "mixed",
    component: ThankYouSlide,
  },
];
