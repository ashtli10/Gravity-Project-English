import type { SlideDefinition } from "./index";
import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import ForceArrow from "../components/ForceArrow";

/* ─── Slide 1: Section Title ───────────────────────────────────────── */
function JourneyTitleSlide({ active }: { active: boolean }) {
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
          zIndex: 1,
        }}
      >
        The Journey
      </div>

      <AnimatedText
        size="var(--slide-subtitle)"
        color="var(--text-secondary)"
        delay={0.6}
        style={{ marginTop: "1.25rem", zIndex: 1 }}
      >
        How we&apos;ll cross the void
      </AnimatedText>

      {/* Decorative pink glow ring */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "440px",
          height: "440px",
          borderRadius: "50%",
          border: "2px solid rgba(255,45,123,0.4)",
          boxShadow:
            "0 0 40px rgba(255,45,123,0.4), inset 0 0 60px rgba(255,45,123,0.15)",
          pointerEvents: "none",
          animation: "pulse-glow 3s ease-in-out infinite",
        }}
      />
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
            "radial-gradient(circle, rgba(255,45,123,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </SlideLayout>
  );
}

/* ─── Slide 2: Escaping Earth ──────────────────────────────────────── */
function EscapeVelocitySlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="pink" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--pink)"
        glow
        weight={800}
        delay={0.1}
      >
        Escaping Earth
      </AnimatedText>

      <AnimatedText
        size="var(--slide-huge)"
        color="var(--text-primary)"
        mono
        delay={0.4}
        glow
        style={{ marginTop: "0.5rem" }}
      >
        11.2 km/s
      </AnimatedText>

      <div
        style={{
          marginTop: "1.5rem",
          animation: "fade-in-up 0.6s ease 0.6s both",
        }}
      >
        <svg
          width="460"
          height="300"
          viewBox="0 0 460 300"
          style={{ overflow: "visible" }}
        >
          {/* Curved planet horizon */}
          <defs>
            <linearGradient id="s2-horizon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a1430" />
              <stop offset="100%" stopColor="#120618" />
            </linearGradient>
          </defs>
          <path
            d="M-60,300 Q230,180 520,300 Z"
            fill="url(#s2-horizon)"
            stroke="#ff2d7b"
            strokeWidth="2.5"
            style={{ filter: "drop-shadow(0 -4px 14px rgba(255,45,123,0.5))" }}
          />
          {/* Atmosphere glow band */}
          <path
            d="M-60,300 Q230,180 520,300"
            fill="none"
            stroke="rgba(255,45,123,0.25)"
            strokeWidth="14"
            style={{ filter: "blur(4px)" }}
          />

          {/* Stars */}
          {[
            [40, 50], [120, 30], [200, 60], [300, 40], [400, 70],
            [70, 110], [360, 110], [430, 30],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={1.6}
              fill="#ffffff"
              opacity={0.7}
              style={{
                animation: `pulse-glow 2.5s ease-in-out ${i * 0.25}s infinite`,
              }}
            />
          ))}

          {/* Rocket climbing away (tilted, ascending right) */}
          <g
            transform="translate(250 150) rotate(35)"
            style={{ filter: "drop-shadow(0 0 8px rgba(0,229,255,0.5))" }}
          >
            {/* Body */}
            <path
              d="M0,-46 C13,-30 13,12 8,30 L-8,30 C-13,12 -13,-30 0,-46 Z"
              fill="#1a1a2e"
              stroke="#00e5ff"
              strokeWidth="2.5"
            />
            {/* Nose tip */}
            <circle cx="0" cy="-40" r="3" fill="#00e5ff" />
            {/* Window */}
            <circle cx="0" cy="-8" r="5.5" fill="none" stroke="#00e5ff" strokeWidth="2" />
            {/* Fins */}
            <path d="M-8,18 L-20,38 L-8,30 Z" fill="#ff2d7b" />
            <path d="M8,18 L20,38 L8,30 Z" fill="#ff2d7b" />
            {/* Exhaust flame */}
            <path
              d="M-6,32 Q0,62 6,32 Q0,46 -6,32 Z"
              fill="#ffb800"
              style={{ filter: "drop-shadow(0 0 6px #ffb800)" }}
            />
          </g>

          {/* Ascent trail */}
          <path
            d="M150,300 Q200,220 230,170"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="2"
            strokeDasharray="5,6"
            opacity="0.45"
            style={{ animation: "fade-in 0.6s ease 1s both" }}
          />
        </svg>
      </div>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1}
        style={{ marginTop: "1rem", maxWidth: "82%" }}
      >
        <span className="grammar-conditional">If a ship reaches 11.2 km/s</span>, it{" "}
        <span className="grammar-future">will</span> break free of Earth&apos;s gravity.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 3: How Rockets Fight Gravity ───────────────────────────── */
function HowRocketsWorkSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="pink" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--pink)"
        glow
        weight={800}
        delay={0.1}
      >
        How Rockets Fight Gravity
      </AnimatedText>

      <div
        style={{
          marginTop: "1.5rem",
          animation: "fade-in-up 0.6s ease 0.4s both",
        }}
      >
        <svg
          width="420"
          height="420"
          viewBox="0 0 420 420"
          style={{ overflow: "visible" }}
        >
          {/* Rocket centered, pointing up */}
          <g
            transform="translate(210 210)"
            style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.25))" }}
          >
            {/* Body */}
            <path
              d="M0,-70 C18,-46 18,40 11,72 L-11,72 C-18,40 -18,-46 0,-70 Z"
              fill="#1a1a2e"
              stroke="var(--text-primary)"
              strokeWidth="3"
            />
            {/* Nose */}
            <circle cx="0" cy="-62" r="4" fill="var(--text-primary)" />
            {/* Window */}
            <circle cx="0" cy="-18" r="9" fill="none" stroke="#00e5ff" strokeWidth="2.5" />
            {/* Fins */}
            <path d="M-11,52 L-30,84 L-11,72 Z" fill="#ff2d7b" />
            <path d="M11,52 L30,84 L11,72 Z" fill="#ff2d7b" />
          </g>

          {/* Thrust arrow: green, pointing UP (angle 270) */}
          <ForceArrow
            x={210}
            y={150}
            angle={270}
            length={110}
            color="#3dff9a"
            label="thrust"
            delay={0.8}
            thickness={6}
          />

          {/* Gravity arrow: pink, pointing DOWN (angle 90) */}
          <ForceArrow
            x={210}
            y={282}
            angle={90}
            length={90}
            color="#ff2d7b"
            label="gravity"
            delay={1.1}
            thickness={6}
          />
        </svg>
      </div>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.4}
        style={{ marginTop: "1rem", maxWidth: "80%" }}
      >
        Thrust <span className="grammar-future">will</span> push harder than gravity pulls.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 4: Staying Alive Out There ─────────────────────────────── */
function LifeSupportSlide({ active }: { active: boolean }) {
  const icons = [
    {
      label: "Oxygen",
      delay: 0.5,
      svg: (
        <g>
          {/* Air / oxygen: swirling molecule O2 */}
          <circle cx="38" cy="42" r="20" fill="none" stroke="#00e5ff" strokeWidth="3" />
          <circle cx="74" cy="42" r="20" fill="none" stroke="#00e5ff" strokeWidth="3" />
          <text
            x="38"
            y="48"
            fill="#00e5ff"
            fontSize="18"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            O
          </text>
          <text
            x="74"
            y="48"
            fill="#00e5ff"
            fontSize="18"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            O
          </text>
          {/* Airflow arcs */}
          <path
            d="M18,78 Q56,66 94,78"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity="0.6"
          />
        </g>
      ),
    },
    {
      label: "Water",
      delay: 0.7,
      svg: (
        <g>
          {/* Water drop */}
          <path
            d="M56,14 C56,14 86,52 86,72 A30,30 0 1 1 26,72 C26,52 56,14 56,14 Z"
            fill="rgba(0,229,255,0.12)"
            stroke="#00b4ff"
            strokeWidth="3"
            style={{ filter: "drop-shadow(0 0 6px rgba(0,180,255,0.5))" }}
          />
          {/* Highlight */}
          <path
            d="M46,70 A14,14 0 0 1 60,58"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            opacity="0.7"
            strokeLinecap="round"
          />
        </g>
      ),
    },
    {
      label: "Food",
      delay: 0.9,
      svg: (
        <g>
          {/* Leaf (grown food in domes) */}
          <path
            d="M22,90 C22,40 62,18 92,20 C92,70 56,92 22,90 Z"
            fill="rgba(61,255,154,0.12)"
            stroke="#3dff9a"
            strokeWidth="3"
            style={{ filter: "drop-shadow(0 0 6px rgba(61,255,154,0.5))" }}
          />
          {/* Vein */}
          <path
            d="M28,86 C50,64 72,42 88,26"
            fill="none"
            stroke="#3dff9a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Side veins */}
          <path d="M52,64 L40,58" stroke="#3dff9a" strokeWidth="2" />
          <path d="M66,48 L56,42" stroke="#3dff9a" strokeWidth="2" />
        </g>
      ),
    },
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
        Staying Alive Out There
      </AnimatedText>

      <div
        style={{
          display: "flex",
          gap: "3rem",
          marginTop: "2rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {icons.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.85rem",
              animation: `fade-in-up 0.6s ease ${item.delay}s both`,
            }}
          >
            <svg width="112" height="112" viewBox="0 0 112 112" style={{ overflow: "visible" }}>
              {item.svg}
            </svg>
            <div
              style={{
                fontSize: "var(--slide-small)",
                fontFamily: "var(--font-mono)",
                color: "var(--text-secondary)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.2}
        style={{ marginTop: "2rem", maxWidth: "84%" }}
      >
        Colonists <span className="grammar-possibility">could</span> grow food in domes, and
        they <span className="grammar-possibility">may</span> recycle every drop of water.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 5: Nine Months to Mars ─────────────────────────────────── */
function TheTripSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="pink" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--pink)"
        glow
        weight={800}
        delay={0.1}
      >
        Nine Months to Mars
      </AnimatedText>

      <div
        style={{
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.4s both",
        }}
      >
        <svg
          width="640"
          height="320"
          viewBox="0 0 640 320"
          style={{ overflow: "visible" }}
        >
          <defs>
            <radialGradient id="s2-earth" cx="40%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#4db8ff" />
              <stop offset="100%" stopColor="#0a3a66" />
            </radialGradient>
            <radialGradient id="s2-mars" cx="40%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#ff8a5c" />
              <stop offset="100%" stopColor="#7a2410" />
            </radialGradient>
          </defs>

          {/* Stars */}
          {[
            [120, 40], [260, 70], [380, 50], [500, 90], [200, 250],
            [440, 240], [560, 160], [90, 180],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={1.6}
              fill="#ffffff"
              opacity={0.65}
              style={{
                animation: `pulse-glow 2.5s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}

          {/* Earth */}
          <circle
            cx="90"
            cy="220"
            r="48"
            fill="url(#s2-earth)"
            stroke="#00e5ff"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 14px rgba(0,180,255,0.5))" }}
          />
          <text
            x="90"
            y="296"
            fill="#00e5ff"
            fontSize="15"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            EARTH
          </text>

          {/* Mars */}
          <circle
            cx="560"
            cy="90"
            r="36"
            fill="url(#s2-mars)"
            stroke="#ff8a5c"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 14px rgba(255,138,92,0.5))" }}
          />
          <text
            x="560"
            y="46"
            fill="#ff8a5c"
            fontSize="15"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            MARS
          </text>

          {/* Dashed trajectory arc Earth → Mars */}
          <path
            d="M130,190 Q320,-40 528,108"
            fill="none"
            stroke="#ff2d7b"
            strokeWidth="2.5"
            strokeDasharray="8,7"
            style={{
              filter: "drop-shadow(0 0 6px #ff2d7b)",
              animation: "fade-in 0.6s ease 0.8s both",
            }}
          />

          {/* Small ship at midpoint of the arc */}
          <g
            transform="translate(320 64) rotate(55)"
            style={{
              filter: "drop-shadow(0 0 8px rgba(0,229,255,0.6))",
              animation: "fade-in 0.5s ease 1.2s both",
            }}
          >
            <path
              d="M0,-20 C7,-12 7,8 4,16 L-4,16 C-7,8 -7,-12 0,-20 Z"
              fill="#1a1a2e"
              stroke="#00e5ff"
              strokeWidth="2"
            />
            <circle cx="0" cy="-2" r="3" fill="none" stroke="#00e5ff" strokeWidth="1.5" />
            <path d="M-4,10 L-11,22 L-4,16 Z" fill="#ff2d7b" />
            <path d="M4,10 L11,22 L4,16 Z" fill="#ff2d7b" />
            <path
              d="M-3,17 Q0,32 3,17 Z"
              fill="#ffb800"
              style={{ filter: "drop-shadow(0 0 5px #ffb800)" }}
            />
          </g>
        </svg>
      </div>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.3}
        style={{ marginTop: "1.5rem", maxWidth: "80%" }}
      >
        The trip <span className="grammar-future">is going to</span> take about nine months.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Export ───────────────────────────────────────────────────────── */
export const section2Slides: SlideDefinition[] = [
  { id: "journey-title", section: 2, accent: "pink", component: JourneyTitleSlide },
  { id: "escape-velocity", section: 2, accent: "pink", component: EscapeVelocitySlide, studentEvent: "lookUp" },
  { id: "how-rockets-work", section: 2, accent: "pink", component: HowRocketsWorkSlide },
  { id: "life-support", section: 2, accent: "pink", component: LifeSupportSlide },
  { id: "the-trip", section: 2, accent: "pink", component: TheTripSlide },
];
