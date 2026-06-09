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
          Humanity&apos;s Next Giant Leap
        </AnimatedText>
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 2: The Future Is Off-World ─────────────────────────────── */
function FutureOffworldSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--cyan)"
        glow
        weight={900}
        delay={0.1}
      >
        THE FUTURE IS OFF-WORLD
      </AnimatedText>

      {/* Starfield + orbiting world */}
      <div
        style={{
          marginTop: "2.5rem",
          animation: "fade-in-up 0.6s ease 0.5s both",
        }}
      >
        <svg width="260" height="160" viewBox="0 0 260 160">
          {[
            [30, 30],
            [70, 18],
            [210, 40],
            [240, 90],
            [20, 110],
            [190, 130],
            [120, 22],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={1.5 + (i % 2)}
              fill="#00e5ff"
              opacity={0.5 + (i % 3) * 0.15}
            />
          ))}
          {/* Orbit */}
          <ellipse
            cx="130"
            cy="80"
            rx="90"
            ry="32"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="1.5"
            opacity="0.4"
          />
          {/* Planet */}
          <circle
            cx="130"
            cy="80"
            r="34"
            fill="#0c1a22"
            stroke="#00e5ff"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 10px #00e5ff)" }}
          />
          <path
            d="M104,72 Q120,64 140,70 Q156,76 156,86"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="1.5"
            opacity="0.5"
          />
          {/* Colony dome */}
          <circle
            cx="220"
            cy="80"
            r="7"
            fill="#00e5ff"
            style={{ filter: "drop-shadow(0 0 8px #00e5ff)" }}
          />
        </svg>
      </div>

      <AnimatedText
        size="var(--slide-subtitle)"
        color="var(--text-primary)"
        delay={0.9}
        weight={400}
        style={{ marginTop: "2rem", maxWidth: "80%" }}
      >
        By 2200, humans{" "}
        <span className="grammar-future">will live</span> among the
        stars.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 3: Big Stat ────────────────────────────────────────────── */
function BigStatSlide({ active }: { active: boolean }) {
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
        }}
      >
        1,000,000
      </div>

      <AnimatedText
        size="var(--slide-subtitle)"
        color="var(--text-primary)"
        delay={0.7}
        weight={500}
        style={{ marginTop: "1.5rem", maxWidth: "80%" }}
      >
        people will call Mars home
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
        We <span className="grammar-future">are going to</span> build
        cities beyond Earth.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 4: Why We'll Leave Earth ───────────────────────────────── */
function WhyLeaveEarthSlide({ active }: { active: boolean }) {
  const icons = [
    {
      label: "Room to Grow",
      delay: 0.8,
      svg: (
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle
            cx="45"
            cy="45"
            r="30"
            fill="#0c1a22"
            stroke="#00e5ff"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
          />
          {/* Crowd of dots */}
          {[
            [34, 40],
            [45, 36],
            [56, 40],
            [38, 50],
            [52, 50],
            [45, 46],
            [30, 48],
            [60, 48],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3.2" fill="#00e5ff" opacity="0.85" />
          ))}
        </svg>
      ),
    },
    {
      label: "New Resources",
      delay: 1.0,
      svg: (
        <svg width="90" height="90" viewBox="0 0 90 90">
          {/* Resource crystal */}
          <polygon
            points="45,8 64,32 54,80 36,80 26,32"
            fill="#0c1a22"
            stroke="#00e5ff"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
          />
          <line x1="45" y1="8" x2="45" y2="80" stroke="#00e5ff" strokeWidth="1.5" opacity="0.5" />
          <line x1="26" y1="32" x2="64" y2="32" stroke="#00e5ff" strokeWidth="1.5" opacity="0.5" />
          <line x1="45" y1="8" x2="36" y2="80" stroke="#00e5ff" strokeWidth="1" opacity="0.3" />
          <line x1="45" y1="8" x2="54" y2="80" stroke="#00e5ff" strokeWidth="1" opacity="0.3" />
        </svg>
      ),
    },
    {
      label: "Backup for Humanity",
      delay: 1.2,
      svg: (
        <svg width="90" height="90" viewBox="0 0 90 90">
          {/* Shield */}
          <path
            d="M45,8 L72,20 L72,46 Q72,72 45,84 Q18,72 18,46 L18,20 Z"
            fill="#0c1a22"
            stroke="#00e5ff"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
          />
          <path
            d="M33,46 L42,57 L60,32"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
        WHY WE&apos;LL LEAVE EARTH
      </AnimatedText>

      <div
        style={{
          display: "flex",
          gap: "3.5rem",
          marginTop: "2.5rem",
          alignItems: "flex-start",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {icons.map((icon) => (
          <div
            key={icon.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: `fade-in-up 0.6s ease ${icon.delay}s both`,
            }}
          >
            {icon.svg}
            <span
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--slide-small)",
                marginTop: "0.6rem",
                maxWidth: "120px",
                textAlign: "center",
              }}
            >
              {icon.label}
            </span>
          </div>
        ))}
      </div>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.5}
        style={{ marginTop: "2rem", maxWidth: "80%" }}
      >
        Earth alone <span className="grammar-possibility">might</span>{" "}
        not hold us all.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 5: Gravity Rules Space ─────────────────────────────────── */
function GravityInSpaceSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--cyan)"
        glow
        weight={900}
        delay={0.1}
      >
        GRAVITY RULES SPACE
      </AnimatedText>

      <div
        style={{
          fontSize: "var(--slide-subtitle)",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          color: "var(--cyan)",
          textShadow: "0 0 18px var(--cyan), 0 0 36px var(--cyan)",
          marginTop: "1.5rem",
          letterSpacing: "0.04em",
          animation: "fade-in-up 0.6s ease 0.5s both",
        }}
      >
        escape velocity = 11.2 km/s
      </div>

      {/* Rocket arcing away from a planet */}
      <div
        style={{
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.8s both",
        }}
      >
        <svg width="320" height="180" viewBox="0 0 320 180">
          {/* Planet */}
          <circle
            cx="60"
            cy="140"
            r="48"
            fill="#0c1a22"
            stroke="#00e5ff"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 8px #00e5ff)" }}
          />
          <path
            d="M22,128 Q50,118 78,126"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="1.5"
            opacity="0.4"
          />
          {/* Escape arc trajectory */}
          <path
            d="M70,96 Q150,10 300,20"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="2"
            strokeDasharray="6,5"
            opacity="0.6"
            style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
          />
          {/* Rocket near top of arc */}
          <g transform="translate(252,22) rotate(35)">
            <path
              d="M0,-14 Q6,-4 6,8 L-6,8 Q-6,-4 0,-14 Z"
              fill="#0c1a22"
              stroke="#00e5ff"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
            />
            <polygon points="-6,8 -11,16 -3,12" fill="#00e5ff" />
            <polygon points="6,8 11,16 3,12" fill="#00e5ff" />
            <circle cx="0" cy="-3" r="2.5" fill="#00e5ff" />
            {/* Exhaust */}
            <polygon points="-3,12 0,26 3,12" fill="#00e5ff" opacity="0.6" />
          </g>
        </svg>
      </div>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.2}
        style={{ marginTop: "1.5rem", maxWidth: "80%" }}
      >
        To leave Earth, a ship <span className="grammar-future">will</span>{" "}
        reach 11.2 km/s.
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
        Let&apos;s run an experiment&hellip;
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 7: Airlock Intro ───────────────────────────────────────── */
function AirlockIntroSlide({ active }: { active: boolean }) {
  const objects = [
    {
      label: "Ice Shard",
      delay: 0.8,
      svg: (
        <svg width="60" height="80" viewBox="0 0 60 80">
          <polygon
            points="30,8 44,34 36,70 24,70 16,34"
            fill="#0c1a22"
            stroke="#00e5ff"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 5px #00e5ff)" }}
          />
          <line x1="30" y1="8" x2="30" y2="70" stroke="#00e5ff" strokeWidth="1" opacity="0.4" />
        </svg>
      ),
    },
    {
      label: "Wrench",
      delay: 0.95,
      svg: (
        <svg width="60" height="80" viewBox="0 0 60 80">
          <path
            d="M20,12 a10,10 0 1,0 8,16 L40,52 a6,6 0 0,0 10,-2 a6,6 0 0,0 -8,-6 L30,20 a10,10 0 0,0 -10,-8 Z"
            fill="#0c1a22"
            stroke="#00e5ff"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 5px #00e5ff)" }}
          />
        </svg>
      ),
    },
    {
      label: "Helmet",
      delay: 1.1,
      svg: (
        <svg width="60" height="80" viewBox="0 0 60 80">
          <circle
            cx="30"
            cy="40"
            r="26"
            fill="#0c1a22"
            stroke="#00e5ff"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 5px #00e5ff)" }}
          />
          {/* Visor */}
          <path
            d="M16,34 Q30,24 44,34 L44,46 Q30,52 16,46 Z"
            fill="#00e5ff"
            opacity="0.25"
            stroke="#00e5ff"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
    {
      label: "Sensor Drone",
      delay: 1.25,
      svg: (
        <svg width="60" height="80" viewBox="0 0 60 80">
          <rect
            x="20"
            y="30"
            width="20"
            height="20"
            rx="4"
            fill="#0c1a22"
            stroke="#00e5ff"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 5px #00e5ff)" }}
          />
          <circle cx="30" cy="40" r="4" fill="#00e5ff" />
          {/* Rotors */}
          <line x1="20" y1="30" x2="8" y2="20" stroke="#00e5ff" strokeWidth="2" />
          <line x1="40" y1="30" x2="52" y2="20" stroke="#00e5ff" strokeWidth="2" />
          <ellipse cx="8" cy="20" rx="8" ry="2.5" fill="none" stroke="#00e5ff" strokeWidth="1.5" opacity="0.6" />
          <ellipse cx="52" cy="20" rx="8" ry="2.5" fill="none" stroke="#00e5ff" strokeWidth="1.5" opacity="0.6" />
        </svg>
      ),
    },
    {
      label: "Solar Sail",
      delay: 1.4,
      svg: (
        <svg width="60" height="80" viewBox="0 0 60 80">
          <rect
            x="10"
            y="12"
            width="40"
            height="40"
            rx="2"
            fill="#0c1a22"
            stroke="#00e5ff"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 5px #00e5ff)" }}
          />
          <line x1="30" y1="12" x2="30" y2="52" stroke="#00e5ff" strokeWidth="1" opacity="0.4" />
          <line x1="10" y1="32" x2="50" y2="32" stroke="#00e5ff" strokeWidth="1" opacity="0.4" />
          {/* Mast */}
          <line x1="30" y1="52" x2="30" y2="72" stroke="#00e5ff" strokeWidth="2" />
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
        THE AIRLOCK TEST
      </AnimatedText>

      <AnimatedText
        size="var(--slide-subtitle)"
        color="var(--text-primary)"
        delay={0.45}
        weight={400}
        style={{ marginTop: "1rem" }}
      >
        Which object hits the ground first?
      </AnimatedText>

      <div
        style={{
          display: "flex",
          gap: "2.5rem",
          marginTop: "2.5rem",
          alignItems: "flex-end",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {objects.map((obj) => (
          <div
            key={obj.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: `fade-in-up 0.6s ease ${obj.delay}s both`,
            }}
          >
            {obj.svg}
            <span
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--slide-small)",
                marginTop: "0.4rem",
              }}
            >
              {obj.label}
            </span>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 8: Vacuum Result ───────────────────────────────────────── */
function VacuumResultSlide({ active }: { active: boolean }) {
  const labels = ["Ice Shard", "Wrench", "Helmet", "Drone", "Solar Sail"];
  return (
    <SlideLayout accent="cyan" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--cyan)"
        glow
        weight={900}
        delay={0.1}
      >
        They ALL hit at the same time!
      </AnimatedText>

      {/* Five equal-length down-arrows landing on a line */}
      <div
        style={{
          display: "flex",
          gap: "3rem",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.5s both",
        }}
      >
        {labels.map((label, i) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: `fade-in-up 0.5s ease ${0.6 + i * 0.12}s both`,
            }}
          >
            <svg width="30" height="80" viewBox="0 0 30 80">
              <line
                x1="15"
                y1="5"
                x2="15"
                y2="60"
                stroke="#00e5ff"
                strokeWidth="3"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
              />
              <polygon
                points="15,75 7,58 23,58"
                fill="#00e5ff"
                style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
              />
            </svg>
            <span
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--slide-small)",
                marginTop: "0.3rem",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Ground line */}
      <div
        style={{
          width: "62%",
          height: "3px",
          background: "var(--cyan)",
          boxShadow: "0 0 10px var(--cyan)",
          borderRadius: "2px",
          marginTop: "0.5rem",
          animation: "fade-in 0.4s ease 1.3s both",
        }}
      />

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.4}
        style={{ marginTop: "1.5rem", maxWidth: "82%" }}
      >
        With no air, every mass <span className="grammar-future">will</span>{" "}
        fall at the same rate.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 9: Now, Inside the Dome ────────────────────────────────── */
function AirlockAirSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--cyan)"
        glow
        weight={900}
        delay={0.1}
      >
        NOW, INSIDE THE DOME
      </AnimatedText>

      {/* Air swirl / flow lines */}
      <div
        style={{
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.5s both",
        }}
      >
        <svg width="320" height="200" viewBox="0 0 320 200">
          {/* Dome outline */}
          <path
            d="M30,170 A130,130 0 0,1 290,170 Z"
            fill="#00e5ff08"
            stroke="#00e5ff"
            strokeWidth="2"
            opacity="0.5"
          />
          <line x1="20" y1="170" x2="300" y2="170" stroke="#00e5ff" strokeWidth="2" opacity="0.5" />
          {/* Swirling air currents */}
          {[
            { d: "M70,70 Q120,40 170,70 Q220,100 270,70", o: 0.6, delay: 0.6 },
            { d: "M60,110 Q110,80 160,110 Q210,140 260,110", o: 0.45, delay: 0.8 },
            { d: "M80,140 Q130,115 180,140 Q230,165 270,140", o: 0.3, delay: 1.0 },
          ].map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2"
              opacity={p.o}
              strokeLinecap="round"
              style={{
                filter: "drop-shadow(0 0 4px #00e5ff)",
                animation: `slide-in-left 0.9s ease ${p.delay}s both`,
              }}
            />
          ))}
          {/* Spiral swirl accent */}
          <path
            d="M160,95 q14,-14 0,-26 q-18,0 -18,16 q0,20 24,20 q26,0 26,-26"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="1.5"
            opacity="0.4"
            style={{ animation: "fade-in 0.5s ease 1.2s both" }}
          />
        </svg>
      </div>

      <AnimatedText
        size="var(--slide-subtitle)"
        color="var(--text-secondary)"
        delay={1.0}
        weight={400}
        style={{ marginTop: "1rem" }}
      >
        What happens with air?
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 10: Air Result ─────────────────────────────────────────── */
function AirResultSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--cyan)"
        glow
        weight={900}
        delay={0.1}
      >
        Atmosphere changes everything!
      </AnimatedText>

      <div
        style={{
          display: "flex",
          gap: "5rem",
          marginTop: "2rem",
          alignItems: "flex-start",
          animation: "fade-in-up 0.6s ease 0.5s both",
        }}
      >
        {/* Ice Shard — fast, straight */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <svg width="100" height="200" viewBox="0 0 100 200">
            {/* Ice shard */}
            <polygon
              points="50,8 62,30 56,52 44,52 38,30"
              fill="#0c1a22"
              stroke="#00e5ff"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
            />
            <line x1="50" y1="8" x2="50" y2="52" stroke="#00e5ff" strokeWidth="1" opacity="0.4" />
            {/* Long straight arrow down */}
            <line
              x1="50"
              y1="58"
              x2="50"
              y2="165"
              stroke="#00e5ff"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 8px #00e5ff)" }}
            />
            <polygon
              points="50,180 38,158 62,158"
              fill="#00e5ff"
              style={{ filter: "drop-shadow(0 0 8px #00e5ff)" }}
            />
          </svg>
          <span
            style={{
              color: "var(--cyan)",
              fontSize: "var(--slide-body)",
              fontWeight: 700,
              marginTop: "0.5rem",
            }}
          >
            FAST
          </span>
        </div>

        {/* VS divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "200px",
            color: "var(--text-secondary)",
            fontSize: "var(--slide-subtitle)",
            fontWeight: 300,
            opacity: 0.5,
          }}
        >
          vs
        </div>

        {/* Solar Sail — slow, drifting zigzag */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <svg width="100" height="200" viewBox="0 0 100 200">
            {/* Sail */}
            <rect
              x="34"
              y="10"
              width="32"
              height="32"
              rx="2"
              fill="#0c1a22"
              stroke="#00e5ff"
              strokeWidth="2"
              opacity="0.8"
              style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
            />
            <line x1="50" y1="10" x2="50" y2="42" stroke="#00e5ff" strokeWidth="1" opacity="0.4" />
            <line x1="34" y1="26" x2="66" y2="26" stroke="#00e5ff" strokeWidth="1" opacity="0.4" />
            {/* Drifting zigzag path */}
            <path
              d="M50,48 Q66,75 40,100 Q62,128 46,155"
              stroke="#00e5ff"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
              strokeDasharray="5,4"
              style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
            />
            <polygon points="46,170 38,152 54,152" fill="#00e5ff" opacity="0.6" />
          </svg>
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--slide-body)",
              fontWeight: 700,
              marginTop: "0.5rem",
            }}
          >
            SLOW
          </span>
        </div>
      </div>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.0}
        style={{ marginTop: "1.5rem", maxWidth: "85%" }}
      >
        In air, shape and surface area{" "}
        <span className="grammar-future">will</span> decide what falls
        fastest.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 11: Airlock Leaderboard ────────────────────────────────── */
function AirlockLeaderboardSlide({ active }: { active: boolean }) {
  const session = useQuery(api.sessions.getCurrent);
  return (
    <SlideLayout accent="cyan" active={active}>
      {session ? (
        <GameLeaderboard
          sessionId={session._id}
          game="dropTestAir"
          title="AIRLOCK TEST LEADERBOARD"
          accent={CYAN}
          scoreUnit="/10"
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
  { id: "future-offworld", section: 1, accent: "cyan", component: FutureOffworldSlide },
  { id: "big-stat", section: 1, accent: "cyan", component: BigStatSlide },
  { id: "why-leave-earth", section: 1, accent: "cyan", component: WhyLeaveEarthSlide },
  { id: "gravity-in-space", section: 1, accent: "cyan", component: GravityInSpaceSlide },
  { id: "transition", section: 1, accent: "cyan", component: TransitionSlide },
  { id: "airlock-intro", section: 1, accent: "cyan", component: AirlockIntroSlide, studentEvent: "dropTest_vacuum" },
  { id: "vacuum-result", section: 1, accent: "cyan", component: VacuumResultSlide, studentEvent: "dropShow_vacuum" },
  { id: "airlock-air", section: 1, accent: "cyan", component: AirlockAirSlide, studentEvent: "dropTest_air" },
  { id: "air-result", section: 1, accent: "cyan", component: AirResultSlide, studentEvent: "dropShow_air" },
  { id: "airlock-leaderboard", section: 1, accent: "cyan", component: AirlockLeaderboardSlide, studentEvent: "dropShow_air" },
];
