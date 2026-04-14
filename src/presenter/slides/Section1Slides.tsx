import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import type { SlideDefinition } from "./index";

/* ─── Slide 0: Title ───────────────────────────────────────────────── */
function TitleSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      <div
        style={{
          animation: "float 4s ease-in-out infinite",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
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
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            animation: "fade-in-up 0.8s ease 0.2s both",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          Defying Gravity
        </div>
        <div
          style={{
            fontSize: "var(--slide-subtitle)",
            color: "var(--text-secondary)",
            fontWeight: 300,
            animation: "fade-in-up 0.6s ease 0.8s both",
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          How Parkour Athletes Fight the Force That Rules Us All
        </div>
      </div>

      {/* Decorative glow orb behind title */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </SlideLayout>
  );
}

/* ─── Slide 1: What is Gravity? ────────────────────────────────────── */
function WhatIsGravitySlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--cyan)"
        glow
        weight={800}
        delay={0.1}
      >
        What is Gravity?
      </AnimatedText>

      <AnimatedText
        size="var(--slide-subtitle)"
        color="var(--text-primary)"
        delay={0.4}
        weight={400}
        style={{ marginTop: "2rem", maxWidth: "75%" }}
      >
        The invisible force that pulls everything toward the ground.
      </AnimatedText>

      {/* Animated downward arrow */}
      <div
        style={{
          marginTop: "2.5rem",
          animation: "fade-in-up 0.6s ease 0.8s both",
        }}
      >
        <svg width="60" height="120" viewBox="0 0 60 120">
          <line
            x1="30"
            y1="10"
            x2="30"
            y2="90"
            stroke="#00e5ff"
            strokeWidth="4"
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 0 8px #00e5ff)",
              strokeDasharray: 200,
              strokeDashoffset: 200,
              animation: "draw-line 1s ease 1s forwards",
            }}
          />
          <polygon
            points="30,110 18,85 42,85"
            fill="#00e5ff"
            style={{
              filter: "drop-shadow(0 0 8px #00e5ff)",
              animation: "fade-in 0.4s ease 1.8s both",
            }}
          />
        </svg>
      </div>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.2}
        style={{ marginTop: "1.5rem", maxWidth: "80%" }}
      >
        Everything{" "}
        <span className="grammar-modal">must</span> fall — gravity
        never takes a break.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 2: 9.8 m/s² ───────────────────────────────────────────── */
function AccelerationSlide({ active }: { active: boolean }) {
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
        9.8 m/s&sup2;
      </div>

      <AnimatedText
        size="var(--slide-subtitle)"
        color="var(--text-primary)"
        delay={0.7}
        weight={400}
        style={{ marginTop: "2rem", maxWidth: "80%" }}
      >
        Every second you fall, you accelerate by 9.8 meters per second.
      </AnimatedText>

      {/* Decorative speed lines */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "1.2rem",
          animation: "fade-in 0.5s ease 1.2s both",
        }}
      >
        {[40, 70, 100, 70, 40].map((h, i) => (
          <div
            key={i}
            style={{
              width: "3px",
              height: `${h}px`,
              background:
                "linear-gradient(to bottom, var(--cyan), transparent)",
              borderRadius: "2px",
              opacity: 0.5,
              animation: `fade-in 0.3s ease ${1.4 + i * 0.1}s both`,
            }}
          />
        ))}
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 3: Why Gravity Matters in Sports ───────────────────────── */
function GravitySportsSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--cyan)"
        glow
        weight={800}
        delay={0.1}
      >
        Why Gravity Matters in Sports
      </AnimatedText>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={0.5}
        style={{ marginTop: "1.5rem", maxWidth: "85%" }}
      >
        Every athlete{" "}
        <span className="grammar-modal">must</span> work against
        gravity{" "}
        <span className="grammar-purpose">in order to</span> jump,
        run, and climb.
      </AnimatedText>

      {/* Sport icons as CSS shapes */}
      <div
        style={{
          display: "flex",
          gap: "3.5rem",
          marginTop: "2.5rem",
          alignItems: "flex-end",
        }}
      >
        {/* Basketball Arc */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: "fade-in-up 0.6s ease 0.8s both",
          }}
        >
          <svg width="100" height="90" viewBox="0 0 100 90">
            {/* Parabolic arc */}
            <path
              d="M10,80 Q50,5 90,80"
              stroke="#00e5ff"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
            />
            {/* Ball */}
            <circle
              cx="50"
              cy="15"
              r="10"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
            />
          </svg>
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--slide-small)",
              marginTop: "0.5rem",
            }}
          >
            Basketball
          </span>
        </div>

        {/* High Jump Bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: "fade-in-up 0.6s ease 1s both",
          }}
        >
          <svg width="100" height="90" viewBox="0 0 100 90">
            {/* Uprights */}
            <line
              x1="15"
              y1="85"
              x2="15"
              y2="25"
              stroke="#00e5ff"
              strokeWidth="3"
            />
            <line
              x1="85"
              y1="85"
              x2="85"
              y2="25"
              stroke="#00e5ff"
              strokeWidth="3"
            />
            {/* Bar */}
            <line
              x1="10"
              y1="30"
              x2="90"
              y2="30"
              stroke="#00e5ff"
              strokeWidth="3"
              style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
            />
            {/* Stick figure arcing over */}
            <circle cx="55" cy="20" r="6" fill="none" stroke="#00e5ff" strokeWidth="2" />
            <line x1="55" y1="26" x2="60" y2="38" stroke="#00e5ff" strokeWidth="2" />
          </svg>
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--slide-small)",
              marginTop: "0.5rem",
            }}
          >
            High Jump
          </span>
        </div>

        {/* Climbing Figure */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: "fade-in-up 0.6s ease 1.2s both",
          }}
        >
          <svg width="100" height="90" viewBox="0 0 100 90">
            {/* Wall */}
            <rect
              x="60"
              y="5"
              width="30"
              height="80"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2"
              opacity="0.4"
            />
            {/* Climber stick figure */}
            <circle cx="50" cy="30" r="7" fill="none" stroke="#00e5ff" strokeWidth="2" />
            <line x1="50" y1="37" x2="50" y2="58" stroke="#00e5ff" strokeWidth="2" />
            {/* Arms reaching to wall */}
            <line x1="50" y1="42" x2="62" y2="33" stroke="#00e5ff" strokeWidth="2" />
            <line x1="50" y1="48" x2="62" y2="50" stroke="#00e5ff" strokeWidth="2" />
            {/* Legs */}
            <line x1="50" y1="58" x2="42" y2="72" stroke="#00e5ff" strokeWidth="2" />
            <line x1="50" y1="58" x2="58" y2="72" stroke="#00e5ff" strokeWidth="2" />
          </svg>
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--slide-small)",
              marginTop: "0.5rem",
            }}
          >
            Climbing
          </span>
        </div>

        {/* Running Sprinter */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: "fade-in-up 0.6s ease 1.4s both",
          }}
        >
          <svg width="100" height="90" viewBox="0 0 100 90">
            {/* Ground line */}
            <line
              x1="5"
              y1="80"
              x2="95"
              y2="80"
              stroke="#00e5ff"
              strokeWidth="1"
              opacity="0.3"
            />
            {/* Sprinter stick figure */}
            <circle cx="55" cy="28" r="7" fill="none" stroke="#00e5ff" strokeWidth="2" />
            <line x1="55" y1="35" x2="48" y2="55" stroke="#00e5ff" strokeWidth="2" />
            {/* Arms pumping */}
            <line x1="52" y1="40" x2="38" y2="35" stroke="#00e5ff" strokeWidth="2" />
            <line x1="52" y1="40" x2="65" y2="45" stroke="#00e5ff" strokeWidth="2" />
            {/* Legs running */}
            <line x1="48" y1="55" x2="35" y2="78" stroke="#00e5ff" strokeWidth="2" />
            <line x1="48" y1="55" x2="62" y2="78" stroke="#00e5ff" strokeWidth="2" />
          </svg>
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--slide-small)",
              marginTop: "0.5rem",
            }}
          >
            Sprinting
          </span>
        </div>
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 4: PARKOUR ─────────────────────────────────────────────── */
function ParkourSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      <div
        style={{
          fontSize: "var(--slide-huge)",
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          color: "var(--cyan)",
          textShadow:
            "0 0 40px var(--cyan), 0 0 80px var(--cyan), 0 0 140px rgba(0,229,255,0.3)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          animation: "scale-in 0.7s ease 0.2s both",
          textAlign: "center",
        }}
      >
        Parkour
      </div>

      {/* CSS Traceur silhouette */}
      <div
        style={{
          marginTop: "2.5rem",
          position: "relative",
          width: "120px",
          height: "180px",
          animation: "fade-in-up 0.6s ease 0.8s both",
        }}
      >
        {/* Head */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "var(--cyan)",
            boxShadow: "0 0 15px var(--cyan)",
          }}
        />
        {/* Body */}
        <div
          style={{
            position: "absolute",
            top: "32px",
            left: "50%",
            transform: "translateX(-50%) rotate(-15deg)",
            width: "8px",
            height: "60px",
            background: "var(--cyan)",
            borderRadius: "4px",
            boxShadow: "0 0 10px var(--cyan)",
          }}
        />
        {/* Left arm (reaching forward) */}
        <div
          style={{
            position: "absolute",
            top: "38px",
            left: "50%",
            transform: "rotate(-50deg)",
            transformOrigin: "left center",
            width: "45px",
            height: "6px",
            background: "var(--cyan)",
            borderRadius: "3px",
            boxShadow: "0 0 10px var(--cyan)",
          }}
        />
        {/* Right arm (behind) */}
        <div
          style={{
            position: "absolute",
            top: "44px",
            left: "calc(50% - 8px)",
            transform: "rotate(130deg)",
            transformOrigin: "left center",
            width: "40px",
            height: "6px",
            background: "var(--cyan)",
            borderRadius: "3px",
            boxShadow: "0 0 10px var(--cyan)",
          }}
        />
        {/* Left leg (extended forward) */}
        <div
          style={{
            position: "absolute",
            top: "85px",
            left: "50%",
            transform: "rotate(-30deg)",
            transformOrigin: "left top",
            width: "55px",
            height: "7px",
            background: "var(--cyan)",
            borderRadius: "3px",
            boxShadow: "0 0 10px var(--cyan)",
          }}
        />
        {/* Right leg (tucked) */}
        <div
          style={{
            position: "absolute",
            top: "82px",
            left: "calc(50% - 10px)",
            transform: "rotate(60deg)",
            transformOrigin: "left top",
            width: "50px",
            height: "7px",
            background: "var(--cyan)",
            borderRadius: "3px",
            boxShadow: "0 0 10px var(--cyan)",
          }}
        />
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 5: Parkour Definition ──────────────────────────────────── */
function ParkourDefinitionSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--cyan)"
        glow
        weight={800}
        delay={0.1}
      >
        The Art of Movement
      </AnimatedText>

      <AnimatedText
        size="var(--slide-subtitle)"
        color="var(--text-primary)"
        delay={0.5}
        weight={400}
        style={{ marginTop: "1.5rem", maxWidth: "80%" }}
      >
        The art of moving through obstacles using only your body.
      </AnimatedText>

      <div
        style={{
          width: "60%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, var(--cyan), transparent)",
          margin: "2rem 0",
          opacity: 0.5,
          animation: "fade-in 0.5s ease 0.9s both",
        }}
      />

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.0}
        style={{ maxWidth: "80%" }}
      >
        A traceur{" "}
        <span className="grammar-modal">can&apos;t</span> rely on
        equipment — only skill and practice.
      </AnimatedText>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.4}
        style={{ marginTop: "1.2rem", maxWidth: "80%" }}
      >
        You <span className="grammar-modal">must</span> train your
        body{" "}
        <span className="grammar-purpose">in order to</span> overcome
        every obstacle.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 6: Transition ──────────────────────────────────────────── */
function TransitionSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      <div
        style={{
          fontSize: "var(--slide-title)",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          color: "var(--cyan)",
          textShadow:
            "0 0 20px var(--cyan), 0 0 40px var(--cyan)",
          animation: "pulse-glow 2s ease-in-out infinite",
          textAlign: "center",
        }}
      >
        Let&apos;s test what you know...
      </div>

      {/* Decorative pulsing ring */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          border: "2px solid var(--cyan)",
          opacity: 0.15,
          animation: "pulse-glow 2s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "450px",
          height: "450px",
          borderRadius: "50%",
          border: "1px solid var(--cyan)",
          opacity: 0.08,
          animation: "pulse-glow 2.5s ease-in-out 0.5s infinite",
          pointerEvents: "none",
        }}
      />
    </SlideLayout>
  );
}

/* ─── Slide 7: Drop Test Intro ─────────────────────────────────────── */
function DropTestIntroSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--cyan)"
        glow
        weight={900}
        delay={0.1}
      >
        THE DROP TEST
      </AnimatedText>

      <AnimatedText
        size="var(--slide-subtitle)"
        color="var(--text-primary)"
        delay={0.5}
        weight={400}
        style={{ marginTop: "1rem" }}
      >
        Which object hits the ground first?
      </AnimatedText>

      {/* Five objects in a row */}
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
        {/* Feather */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: "fade-in-up 0.6s ease 0.8s both",
          }}
        >
          <svg width="60" height="80" viewBox="0 0 60 80">
            {/* Feather — quill with vanes */}
            <line
              x1="30"
              y1="5"
              x2="30"
              y2="75"
              stroke="#00e5ff"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
            />
            <ellipse
              cx="30"
              cy="25"
              rx="18"
              ry="12"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="1.5"
              opacity="0.7"
            />
            <ellipse
              cx="30"
              cy="45"
              rx="14"
              ry="10"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="1.5"
              opacity="0.5"
            />
          </svg>
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--slide-small)",
              marginTop: "0.4rem",
            }}
          >
            Feather
          </span>
        </div>

        {/* Bowling Ball */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: "fade-in-up 0.6s ease 1s both",
          }}
        >
          <svg width="70" height="80" viewBox="0 0 70 80">
            <circle
              cx="35"
              cy="40"
              r="30"
              fill="#1a1a2e"
              stroke="#00e5ff"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
            />
            {/* Finger holes */}
            <circle cx="28" cy="30" r="4" fill="#00e5ff" opacity="0.6" />
            <circle cx="40" cy="28" r="4" fill="#00e5ff" opacity="0.6" />
            <circle cx="36" cy="40" r="4" fill="#00e5ff" opacity="0.6" />
          </svg>
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--slide-small)",
              marginTop: "0.4rem",
            }}
          >
            Bowling Ball
          </span>
        </div>

        {/* Cat */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: "fade-in-up 0.6s ease 1.2s both",
          }}
        >
          <svg width="70" height="80" viewBox="0 0 70 80">
            {/* Cat head */}
            <circle
              cx="35"
              cy="38"
              r="22"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
            />
            {/* Ears */}
            <polygon points="18,22 13,6 27,18" fill="none" stroke="#00e5ff" strokeWidth="2" />
            <polygon points="52,22 57,6 43,18" fill="none" stroke="#00e5ff" strokeWidth="2" />
            {/* Eyes */}
            <circle cx="28" cy="35" r="3" fill="#00e5ff" opacity="0.8" />
            <circle cx="42" cy="35" r="3" fill="#00e5ff" opacity="0.8" />
            {/* Nose */}
            <polygon points="35,42 32,46 38,46" fill="#00e5ff" opacity="0.5" />
            {/* Whiskers */}
            <line x1="8" y1="40" x2="25" y2="42" stroke="#00e5ff" strokeWidth="1" opacity="0.5" />
            <line x1="8" y1="46" x2="25" y2="44" stroke="#00e5ff" strokeWidth="1" opacity="0.5" />
            <line x1="62" y1="40" x2="45" y2="42" stroke="#00e5ff" strokeWidth="1" opacity="0.5" />
            <line x1="62" y1="46" x2="45" y2="44" stroke="#00e5ff" strokeWidth="1" opacity="0.5" />
          </svg>
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--slide-small)",
              marginTop: "0.4rem",
            }}
          >
            Cat
          </span>
        </div>

        {/* Brick */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: "fade-in-up 0.6s ease 1.4s both",
          }}
        >
          <svg width="70" height="80" viewBox="0 0 70 80">
            <rect
              x="10"
              y="25"
              width="50"
              height="32"
              rx="3"
              fill="#1a1a2e"
              stroke="#00e5ff"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
            />
            {/* Brick lines */}
            <line x1="35" y1="25" x2="35" y2="57" stroke="#00e5ff" strokeWidth="1" opacity="0.3" />
            <line x1="10" y1="41" x2="60" y2="41" stroke="#00e5ff" strokeWidth="1" opacity="0.3" />
          </svg>
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--slide-small)",
              marginTop: "0.4rem",
            }}
          >
            Brick
          </span>
        </div>

        {/* Human (stick figure) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: "fade-in-up 0.6s ease 1.6s both",
          }}
        >
          <svg width="60" height="80" viewBox="0 0 60 80">
            {/* Head */}
            <circle cx="30" cy="14" r="10" fill="none" stroke="#00e5ff" strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }} />
            {/* Body */}
            <line x1="30" y1="24" x2="30" y2="52" stroke="#00e5ff" strokeWidth="2" />
            {/* Arms */}
            <line x1="30" y1="32" x2="14" y2="44" stroke="#00e5ff" strokeWidth="2" />
            <line x1="30" y1="32" x2="46" y2="44" stroke="#00e5ff" strokeWidth="2" />
            {/* Legs */}
            <line x1="30" y1="52" x2="18" y2="72" stroke="#00e5ff" strokeWidth="2" />
            <line x1="30" y1="52" x2="42" y2="72" stroke="#00e5ff" strokeWidth="2" />
          </svg>
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--slide-small)",
              marginTop: "0.4rem",
            }}
          >
            Human
          </span>
        </div>
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 8: Vacuum Result ───────────────────────────────────────── */
function VacuumResultSlide({ active }: { active: boolean }) {
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

      {/* Visual: five arrows all the same length pointing down */}
      <div
        style={{
          display: "flex",
          gap: "3rem",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.6s both",
        }}
      >
        {["Feather", "Ball", "Cat", "Brick", "Human"].map((label, i) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: `fade-in-up 0.5s ease ${0.7 + i * 0.12}s both`,
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
          width: "60%",
          height: "3px",
          background: "var(--cyan)",
          boxShadow: "0 0 10px var(--cyan)",
          borderRadius: "2px",
          animation: "fade-in 0.4s ease 1.4s both",
          marginTop: "0.5rem",
        }}
      />

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.2}
        style={{ marginTop: "1.5rem", maxWidth: "80%" }}
      >
        In a vacuum, mass doesn&apos;t matter. Gravity pulls everything
        at 9.8 m/s&sup2;.
      </AnimatedText>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.6}
        style={{ marginTop: "1rem", maxWidth: "85%" }}
      >
        Without air, a feather{" "}
        <span className="grammar-modal">must</span> fall at the same
        speed as a bowling ball.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 9: Drop Test Air ───────────────────────────────────────── */
function DropTestAirSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="cyan" active={active}>
      <AnimatedText
        size="var(--slide-title)"
        color="var(--cyan)"
        glow
        weight={900}
        delay={0.1}
      >
        Now let&apos;s add AIR RESISTANCE
      </AnimatedText>

      {/* Wind lines */}
      <div
        style={{
          position: "relative",
          width: "300px",
          height: "200px",
          marginTop: "2rem",
          animation: "fade-in-up 0.6s ease 0.5s both",
        }}
      >
        <svg width="300" height="200" viewBox="0 0 300 200">
          {/* Horizontal wind lines */}
          {[30, 60, 90, 120, 150, 170].map((y, i) => (
            <g key={i}>
              <line
                x1={20 + (i % 2) * 30}
                y1={y}
                x2={180 + (i % 3) * 40}
                y2={y}
                stroke="#00e5ff"
                strokeWidth={2 - (i % 3) * 0.5}
                strokeLinecap="round"
                opacity={0.3 + (i % 3) * 0.15}
                style={{
                  filter: "drop-shadow(0 0 4px #00e5ff)",
                  animation: `slide-in-left 0.8s ease ${0.6 + i * 0.15}s both`,
                }}
              />
              {/* Small arrow heads */}
              <polygon
                points={`${180 + (i % 3) * 40},${y} ${170 + (i % 3) * 40},${y - 4} ${170 + (i % 3) * 40},${y + 4}`}
                fill="#00e5ff"
                opacity={0.3 + (i % 3) * 0.15}
                style={{
                  animation: `slide-in-left 0.8s ease ${0.6 + i * 0.15}s both`,
                }}
              />
            </g>
          ))}

          {/* Swirl decorations */}
          <path
            d="M60,40 Q80,20 100,40 Q120,60 140,40"
            stroke="#00e5ff"
            strokeWidth="1.5"
            fill="none"
            opacity="0.25"
            style={{ animation: "fade-in 0.5s ease 1.2s both" }}
          />
          <path
            d="M100,140 Q120,120 140,140 Q160,160 180,140"
            stroke="#00e5ff"
            strokeWidth="1.5"
            fill="none"
            opacity="0.2"
            style={{ animation: "fade-in 0.5s ease 1.4s both" }}
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
        What happens when objects fall through air?
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
        Air resistance changes everything!
      </AnimatedText>

      {/* Side-by-side comparison: bowling ball fast vs feather slow */}
      <div
        style={{
          display: "flex",
          gap: "5rem",
          marginTop: "2rem",
          alignItems: "flex-start",
          animation: "fade-in-up 0.6s ease 0.5s both",
        }}
      >
        {/* Bowling Ball — fast, straight down */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <svg width="100" height="200" viewBox="0 0 100 200">
            {/* Ball */}
            <circle
              cx="50"
              cy="30"
              r="22"
              fill="#1a1a2e"
              stroke="#00e5ff"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 6px #00e5ff)" }}
            />
            <circle cx="44" cy="22" r="3" fill="#00e5ff" opacity="0.5" />
            <circle cx="54" cy="20" r="3" fill="#00e5ff" opacity="0.5" />
            <circle cx="52" cy="32" r="3" fill="#00e5ff" opacity="0.5" />
            {/* Long straight arrow down */}
            <line
              x1="50"
              y1="55"
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

        {/* Feather — slow, drifting */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <svg width="100" height="200" viewBox="0 0 100 200">
            {/* Feather */}
            <line
              x1="50"
              y1="10"
              x2="50"
              y2="50"
              stroke="#00e5ff"
              strokeWidth="1.5"
              opacity="0.7"
            />
            <ellipse
              cx="50"
              cy="25"
              rx="16"
              ry="10"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="1.5"
              opacity="0.5"
            />
            {/* Short drifting arrow (zigzag path) */}
            <path
              d="M50,55 Q60,80 45,105 Q55,130 48,155"
              stroke="#00e5ff"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
              strokeDasharray="5,4"
              style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
            />
            <polygon
              points="48,170 40,152 56,152"
              fill="#00e5ff"
              opacity="0.6"
            />
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
        You <span className="grammar-modal">can&apos;t</span> ignore
        air resistance.{" "}
        <span className="grammar-purpose">In order to</span> understand
        falling, you need to think about shape and surface area.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Export ───────────────────────────────────────────────────────── */
export const section1Slides: SlideDefinition[] = [
  { id: "title", section: 1, accent: "cyan", component: TitleSlide },
  { id: "what-is-gravity", section: 1, accent: "cyan", component: WhatIsGravitySlide },
  { id: "acceleration", section: 1, accent: "cyan", component: AccelerationSlide },
  { id: "gravity-sports", section: 1, accent: "cyan", component: GravitySportsSlide },
  { id: "parkour", section: 1, accent: "cyan", component: ParkourSlide },
  { id: "parkour-definition", section: 1, accent: "cyan", component: ParkourDefinitionSlide },
  { id: "transition", section: 1, accent: "cyan", component: TransitionSlide },
  { id: "drop-test-intro", section: 1, accent: "cyan", component: DropTestIntroSlide, studentEvent: "dropTest_vacuum" },
  { id: "vacuum-result", section: 1, accent: "cyan", component: VacuumResultSlide },
  { id: "drop-test-air", section: 1, accent: "cyan", component: DropTestAirSlide, studentEvent: "dropTest_air" },
  { id: "air-result", section: 1, accent: "cyan", component: AirResultSlide },
];
