import type { SlideDefinition } from "./index";
import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import PollResults from "../components/PollResults";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/* ─── Slide 27: Section Title ─── */
function YourCallSlide({ active }: { active: boolean }) {
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
        YOUR CALL
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

/* ─── Slide 28: Would You Try Parkour? ─── */
function WouldYouTrySlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="mixed" active={active}>
      <AnimatedText
        color="#b388ff"
        size="var(--slide-huge)"
        glow
        weight={900}
        delay={0}
      >
        WOULD YOU TRY PARKOUR?
      </AnimatedText>
      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-subtitle)"
        delay={0.5}
      >
        Tell us what you think.
      </AnimatedText>

      {/* Three option cards preview */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          marginTop: "2.5rem",
          animation: "fade-in-up 0.6s ease 0.8s both",
        }}
      >
        {[
          { label: "Yes!", color: "#00e676" },
          { label: "Maybe", color: "#ffc107" },
          { label: "No way!", color: "#ff2d7b" },
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

/* ─── Slide 29: Poll Results ─── */
const pollOptions = [
  { label: "Yes, definitely!", value: "yes", color: "#00e676" },
  { label: "Maybe with training", value: "maybe", color: "#ffc107" },
  { label: "No way!", value: "no", color: "#ff2d7b" },
];

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
      >
        POLL RESULTS
      </AnimatedText>

      {session ? (
        <div style={{ animation: "fade-in-up 0.6s ease 0.3s both", width: "100%", display: "flex", justifyContent: "center" }}>
          <PollResults
            sessionId={session._id}
            slideContext="would-you-try-parkour"
            options={pollOptions}
          />
        </div>
      ) : (
        <AnimatedText
          color="var(--text-secondary)"
          size="var(--slide-body)"
          delay={0.3}
        >
          Waiting for session...
        </AnimatedText>
      )}
    </SlideLayout>
  );
}

/* ─── Slide 30: My Opinion Backdrop ─── */
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

      {/* Subtle decorative backdrop — gradient bar with shifting colors */}
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

      {/* Minimal geometric shapes for visual interest */}
      <div
        style={{
          position: "relative",
          width: "300px",
          height: "200px",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.6s both",
        }}
      >
        {/* Floating geometric elements */}
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
            left: "120px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            border: "2px solid #ffc10730",
            boxShadow: "0 0 15px #ffc10715",
          }}
        />
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 31: Is Parkour Safe? ─── */
function ParkourSafetySlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="mixed" active={active}>
      <AnimatedText
        color="#b388ff"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        IS PARKOUR SAFE?
      </AnimatedText>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.3}
        style={{ maxWidth: "85%" }}
      >
        Parkour <span className="grammar-modal">may</span> look
        dangerous, but with training you{" "}
        <span className="grammar-modal">can</span> do it safely.
      </AnimatedText>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.6}
        style={{ maxWidth: "85%", marginTop: "0.8rem" }}
      >
        You <span className="grammar-modal">mustn&apos;t</span> try
        advanced moves without preparation{" "}
        <span className="grammar-purpose">in order not to</span> get
        hurt.
      </AnimatedText>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.9}
        style={{ maxWidth: "85%", marginTop: "0.8rem" }}
      >
        Proper training exists{" "}
        <span className="grammar-purpose">in order to</span> keep
        athletes safe.
      </AnimatedText>

      {/* Visual: shield icon made with CSS */}
      <div
        style={{
          marginTop: "1.5rem",
          animation: "fade-in-up 0.6s ease 1.2s both",
        }}
      >
        <svg
          viewBox="0 0 100 120"
          style={{ width: "80px", height: "96px" }}
        >
          <path
            d="M 50 10 L 90 30 L 85 80 L 50 110 L 15 80 L 10 30 Z"
            fill="none"
            stroke="#00e676"
            strokeWidth="3"
            filter="drop-shadow(0 0 8px #00e67640)"
          />
          <text
            x="50"
            y="68"
            fill="#00e676"
            fontSize="32"
            fontFamily="var(--font-display)"
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="900"
          >
            ✓
          </text>
        </svg>
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 32: Closing Statement ─── */
function ClosingStatementSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="mixed" active={active}>
      {/* Subtle multi-color gradient glow behind text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          height: "40%",
          background:
            "radial-gradient(ellipse at center, #00e5ff08 0%, #ff2d7b06 30%, #ffc10704 60%, transparent 80%)",
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
        Gravity is the one opponent every athlete shares.
      </AnimatedText>

      {/* Multi-color gradient bar */}
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

/* ─── Slide 33: Gravity Surge ─── */
function GravitySurgeSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="mixed" active={active}>
      <AnimatedText
        color="#ff2d7b"
        size="var(--slide-huge)"
        glow
        weight={900}
        delay={0}
        style={{ letterSpacing: "0.06em" }}
      >
        GRAVITY SURGE
      </AnimatedText>

      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-subtitle)"
        delay={0.4}
      >
        How long can you survive?
      </AnimatedText>

      {/* Gravity meter — vertical bar that fills up */}
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
            border: "2px solid #ff2d7b40",
            borderRadius: "8px",
            position: "relative",
            overflow: "hidden",
            background: "rgba(255,45,123,0.03)",
          }}
        >
          {/* Fill bar with gradient */}
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
                "0 0 20px rgba(255,45,123,0.4), inset 0 0 15px rgba(255,255,255,0.05)",
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
            MAX G
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
            SAFE
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: "1.5rem",
          fontSize: "var(--slide-body)",
          color: "#ff2d7b",
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

/* ─── Slide 34: Thank You ─── */
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
              color: letter === " " ? "transparent" : colors[i % colors.length],
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
        Defying Gravity — An English Presentation
      </AnimatedText>

      {/* Multi-color line */}
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
        {["#00e5ff", "#ff2d7b", "#ffc107", "#00e676", "#b388ff"].map(
          (c) => (
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
          )
        )}
      </div>
    </SlideLayout>
  );
}

export const section5Slides: SlideDefinition[] = [
  {
    id: "your-call",
    section: 5,
    accent: "mixed",
    component: YourCallSlide,
  },
  {
    id: "would-you-try",
    section: 5,
    accent: "mixed",
    component: WouldYouTrySlide,
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
    id: "parkour-safety",
    section: 5,
    accent: "mixed",
    component: ParkourSafetySlide,
  },
  {
    id: "closing-statement",
    section: 5,
    accent: "mixed",
    component: ClosingStatementSlide,
  },
  {
    id: "gravity-surge",
    section: 5,
    accent: "mixed",
    component: GravitySurgeSlide,
    studentEvent: "gravitySurge",
  },
  {
    id: "thank-you",
    section: 5,
    accent: "mixed",
    component: ThankYouSlide,
  },
];
