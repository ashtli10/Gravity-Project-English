import type { SlideDefinition } from "./index";
import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import PollResults from "../components/PollResults";
import GameLeaderboard from "../components/GameLeaderboard";
import ChampionSlideComponent from "../components/ChampionSlide";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/* ─── Slide 1: Section Title ─── */
function YourFutureSlide({ active }: { active: boolean }) {
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
        What will you do with what you know?
      </AnimatedText>
      {/* Decorative divider */}
      <div
        style={{
          width: "30%",
          height: "3px",
          background:
            "linear-gradient(90deg, transparent, #b388ff, transparent)",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.8s both",
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
        delay={0.5}
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
          animation: "fade-in-up 0.6s ease 0.8s both",
        }}
      >
        {[
          { label: "Yes — sign me up!", color: "#00e676" },
          { label: "Maybe, with training", color: "#ffc107" },
          { label: "No, Earth is home", color: "#ff2d7b" },
        ].map((opt) => (
          <div
            key={opt.label}
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
            }}
          >
            {opt.label}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "2rem",
          fontSize: "var(--slide-body)",
          color: "#b388ff",
          fontFamily: "var(--font-mono)",
          animation: "fade-in-up 0.6s ease 1.1s both",
          opacity: 0.8,
        }}
      >
        Vote on your devices now!
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
        style={{ marginBottom: "1.5rem" }}
      >
        POLL RESULTS
      </AnimatedText>
      {session ? (
        <PollResults
          sessionId={session._id}
          slideContext="would-you-live-on-mars"
          options={[
            { label: "Yes — sign me up!", value: "yes", color: "#00e676" },
            { label: "Maybe, with training", value: "maybe", color: "#ffc107" },
            { label: "No, Earth is home", value: "no", color: "#ff2d7b" },
          ]}
        />
      ) : (
        <AnimatedText color="#b388ff" size="var(--slide-body)">
          Waiting for session...
        </AnimatedText>
      )}
    </SlideLayout>
  );
}

/* ─── Slide 4: My Opinion Backdrop ─── */
function MyOpinionSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="mixed" active={active}>
      <AnimatedText
        color="#b388ff"
        size="var(--slide-huge)"
        glow
        weight={900}
        delay={0}
      >
        MY OPINION
      </AnimatedText>

      {/* Multi-color gradient bar */}
      <div
        style={{
          width: "60%",
          height: "6px",
          borderRadius: "3px",
          background:
            "linear-gradient(90deg, #00e5ff, #ff2d7b, #ffc107, #00e676, #b388ff)",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.4s both",
          boxShadow:
            "0 0 20px rgba(179,136,255,0.3), 0 0 40px rgba(179,136,255,0.1)",
        }}
      />

      {/* Floating geometric shapes */}
      <div
        style={{
          position: "relative",
          width: "320px",
          height: "200px",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.6s both",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "40px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            border: "2px solid #b388ff30",
            boxShadow: "0 0 15px #b388ff15",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "70px",
            right: "50px",
            width: "40px",
            height: "40px",
            border: "2px solid #00e67630",
            transform: "rotate(45deg)",
            boxShadow: "0 0 15px #00e67615",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "130px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            border: "2px solid #ffc10730",
            boxShadow: "0 0 15px #ffc10715",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "0px",
            right: "120px",
            width: "0",
            height: "0",
            borderLeft: "22px solid transparent",
            borderRight: "22px solid transparent",
            borderBottom: "38px solid #00e5ff20",
            filter: "drop-shadow(0 0 12px #00e5ff15)",
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
      >
        SHOULD WE COLONIZE SPACE?
      </AnimatedText>

      {/* Planet cradled in protective hands / shield */}
      <div
        style={{
          marginTop: "1.5rem",
          animation: "fade-in-up 0.6s ease 0.3s both",
        }}
      >
        <svg viewBox="0 0 200 170" style={{ width: "200px", height: "170px" }}>
          <defs>
            <radialGradient id="ethicsPlanet" cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#7fd4ff" />
              <stop offset="55%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#1466a8" />
            </radialGradient>
          </defs>
          {/* Protective shield arc */}
          <path
            d="M 30 70 A 80 80 0 0 1 170 70"
            fill="none"
            stroke="#b388ff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
            filter="drop-shadow(0 0 8px #b388ff60)"
          />
          {/* Planet */}
          <circle
            cx="100"
            cy="78"
            r="34"
            fill="url(#ethicsPlanet)"
            filter="drop-shadow(0 0 14px #00e5ff50)"
          />
          {/* Planet ring */}
          <ellipse
            cx="100"
            cy="78"
            rx="50"
            ry="14"
            fill="none"
            stroke="#ffc107"
            strokeWidth="2.5"
            opacity="0.65"
            transform="rotate(-18 100 78)"
          />
          {/* Cradling hands */}
          <path
            d="M 40 120 Q 60 100 100 118 Q 140 100 160 120 Q 150 150 100 150 Q 50 150 40 120 Z"
            fill="none"
            stroke="#00e676"
            strokeWidth="3"
            strokeLinejoin="round"
            filter="drop-shadow(0 0 8px #00e67650)"
          />
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.6}
        style={{ maxWidth: "85%", marginTop: "1.2rem" }}
      >
        <span className="grammar-conditional">If we treat new worlds with care</span>,
        the future <span className="grammar-future">will</span> be brighter for everyone.
      </AnimatedText>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.9}
        style={{ maxWidth: "85%", marginTop: "0.8rem" }}
      >
        We <span className="grammar-possibility">may</span> need new laws for life beyond Earth.
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
          height: "45%",
          background:
            "radial-gradient(ellipse at center, #b388ff10 0%, #00e5ff08 25%, #ff2d7b06 50%, #ffc10704 70%, transparent 85%)",
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
            "0 0 20px rgba(179,136,255,0.4), 0 0 40px rgba(0,229,255,0.2), 0 0 60px rgba(255,45,123,0.1)",
        }}
      >
        The future belongs to those who reach for it.
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

/* ─── Slide 7: Gravity Drive Intro ─── */
function GravityDriveIntroSlide({ active }: { active: boolean }) {
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
        GRAVITY DRIVE
      </AnimatedText>

      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-subtitle)"
        delay={0.4}
      >
        How long will you survive the reactor core?
      </AnimatedText>

      {/* Gravity meter */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "1.5rem",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.6s both",
        }}
      >
        {/* Meter frame */}
        <div
          style={{
            width: "60px",
            height: "250px",
            border: "2px solid #b388ff40",
            borderRadius: "8px",
            position: "relative",
            overflow: "hidden",
            background: "rgba(179,136,255,0.03)",
          }}
        >
          {/* Fill bar ~75% */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "75%",
              background:
                "linear-gradient(to top, #00e676, #ffc107, #ff2d7b)",
              borderRadius: "0 0 6px 6px",
              boxShadow:
                "0 0 20px rgba(179,136,255,0.4), inset 0 0 15px rgba(255,255,255,0.05)",
              animation: "fade-in 0.5s ease 0.8s both",
            }}
          />
          {/* Tick marks */}
          {[20, 40, 60, 80].map((pct) => (
            <div
              key={pct}
              style={{
                position: "absolute",
                bottom: `${pct}%`,
                left: 0,
                width: "100%",
                height: "1px",
                background: "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>

        {/* Labels */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "250px",
          }}
        >
          <span
            style={{
              color: "#ff2d7b",
              fontSize: "var(--slide-small, 0.9rem)",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
            }}
          >
            MAX-G
          </span>
          <span
            style={{
              color: "#ffc107",
              fontSize: "var(--slide-small, 0.9rem)",
              fontFamily: "var(--font-mono)",
            }}
          >
            WARNING
          </span>
          <span
            style={{
              color: "#00e676",
              fontSize: "var(--slide-small, 0.9rem)",
              fontFamily: "var(--font-mono)",
            }}
          >
            STABLE
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: "1.5rem",
          fontSize: "var(--slide-body)",
          color: "#b388ff",
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

/* ─── Slide 8: Gravity Drive Leaderboard ─── */
function GravityDriveLeaderboardSlide({ active }: { active: boolean }) {
  const session = useQuery(api.sessions.getCurrent);
  return (
    <SlideLayout accent="mixed" active={active}>
      {session ? (
        <GameLeaderboard
          sessionId={session._id}
          game="gravitySurge"
          title="GRAVITY DRIVE LEADERBOARD"
          accent="#b388ff"
          scoreUnit="pts"
        />
      ) : (
        <AnimatedText color="#b388ff" size="var(--slide-body)">
          Waiting for session...
        </AnimatedText>
      )}
    </SlideLayout>
  );
}

/* ─── Slide 9: Champion ─── */
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

/* ─── Slide 10: Thank You ─── */
function ThankYouSlide({ active }: { active: boolean }) {
  const colors = [
    "#00e5ff", // T - cyan
    "#ff2d7b", // H - pink
    "#ffc107", // A - gold
    "#00e676", // N - green
    "#b388ff", // K - purple
    "#00e5ff", // (space)
    "#ff2d7b", // Y - pink
    "#ffc107", // O - gold
    "#00e676", // U - green
  ];
  const letters = "THANK YOU";

  return (
    <SlideLayout accent="mixed" active={active}>
      {/* Each letter glows a different section color */}
      <div
        style={{
          display: "flex",
          gap: "0.3em",
          animation: "fade-in-up 0.6s ease 0s both",
        }}
      >
        {letters.split("").map((letter, i) => (
          <span
            key={i}
            style={{
              fontSize: "var(--slide-huge)",
              fontWeight: 900,
              fontFamily: "var(--font-display)",
              color:
                letter === " " ? "transparent" : colors[i % colors.length],
              textShadow:
                letter === " "
                  ? "none"
                  : `0 0 20px ${colors[i % colors.length]}, 0 0 40px ${colors[i % colors.length]}60`,
              animation: `fade-in-up 0.6s ease ${i * 0.08}s both`,
              display: "inline-block",
              minWidth: letter === " " ? "0.4em" : "auto",
              letterSpacing: "0.04em",
            }}
          >
            {letter}
          </span>
        ))}
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

      {/* Section color dots */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          marginTop: "1.5rem",
          animation: "fade-in-up 0.6s ease 1.4s both",
        }}
      >
        {["#00e5ff", "#ff2d7b", "#ffc107", "#00e676", "#b388ff"].map((c) => (
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
    component: YourFutureSlide,
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
    id: "gravity-drive-intro",
    section: 5,
    accent: "mixed",
    component: GravityDriveIntroSlide,
    studentEvent: "gravitySurge",
  },
  {
    id: "gravity-drive-leaderboard",
    section: 5,
    accent: "mixed",
    component: GravityDriveLeaderboardSlide,
    studentEvent: "gravitySurge",
  },
  {
    id: "champion",
    section: 5,
    accent: "mixed",
    component: ChampionSlide,
    studentEvent: "gravitySurge",
  },
  {
    id: "thank-you",
    section: 5,
    accent: "mixed",
    component: ThankYouSlide,
  },
];
