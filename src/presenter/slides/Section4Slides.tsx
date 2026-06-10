import type { SlideDefinition } from "./index";
import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import GameLeaderboard from "../components/GameLeaderboard";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/* ════════════════════════════════════════════════════════════════
   SECTION 4 — LIFE BEYOND EARTH
   Homes, food, and community on the frontier of 2200.
   ════════════════════════════════════════════════════════════════ */

/* ─── Slide 1: Section Title ─── */
function BeyondTitleSlide({ active }: { active: boolean }) {
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
        LIFE BEYOND EARTH
      </AnimatedText>
      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-subtitle)"
        delay={0.5}
      >
        Humanity's address won't be just one planet
      </AnimatedText>

      {/* Green pulsing world-circle */}
      <div
        style={{
          position: "relative",
          width: "140px",
          height: "140px",
          marginTop: "2.5rem",
          animation: "scale-in 0.8s ease 0.9s both",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid #00e67650",
            boxShadow: "0 0 35px #00e67630, inset 0 0 35px #00e67615",
            animation: "pulse-glow 2.4s ease-in-out 1.7s infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "28%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 35%, #00e676e0, #00e67625)",
            boxShadow: "0 0 26px #00e67660",
            animation: "pulse-glow 2.4s ease-in-out 0.5s infinite",
          }}
        />
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 2: The First Colonies ─── */
function FirstColoniesSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="green" active={active}>
      <AnimatedText color="#00e676" size="var(--slide-title)" glow weight={800}>
        THE FIRST COLONIES
      </AnimatedText>

      {/* Red-tinted horizon: three connected habitat domes + antenna */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.3s both" }}>
        <svg viewBox="0 0 640 360" style={{ width: "80%", maxWidth: "640px" }}>
          <defs>
            <filter id="s4fc-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="s4fc-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06060c" />
              <stop offset="65%" stopColor="#180c10" />
              <stop offset="100%" stopColor="#3a1612" />
            </linearGradient>
            <linearGradient id="s4fc-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#46201a" />
              <stop offset="100%" stopColor="#1d0c09" />
            </linearGradient>
          </defs>

          {/* Dusky red sky */}
          <rect x="0" y="0" width="640" height="250" fill="url(#s4fc-sky)" />
          <circle cx="60" cy="40" r="1.4" fill="#ffffff" opacity="0.5" />
          <circle cx="150" cy="90" r="1" fill="#ffffff" opacity="0.35" />
          <circle cx="240" cy="30" r="1.2" fill="#ffffff" opacity="0.5" />
          <circle cx="330" cy="70" r="1" fill="#ffffff" opacity="0.3" />
          <circle cx="420" cy="40" r="1.5" fill="#ffffff" opacity="0.55" />
          <circle cx="520" cy="100" r="1" fill="#ffffff" opacity="0.3" />
          <circle cx="600" cy="50" r="1.2" fill="#ffffff" opacity="0.45" />
          <circle cx="90" cy="140" r="1" fill="#ffffff" opacity="0.25" />

          {/* Distant ridgeline */}
          <path
            d="M 0 250 L 70 236 L 150 248 L 260 240 L 360 250 L 470 238 L 560 250 L 640 242 L 640 250 Z"
            fill="#2e120e"
          />
          {/* Ground */}
          <rect x="0" y="250" width="640" height="110" fill="url(#s4fc-ground)" />
          <line x1="0" y1="250" x2="640" y2="250" stroke="#ff6b3530" strokeWidth="1.5" />

          {/* Habitat dome 1 */}
          <path
            d="M 90 250 A 60 60 0 0 1 210 250 Z"
            fill="#101c26"
            stroke="#7fb3d5"
            strokeWidth="1.5"
            opacity="0.95"
          />
          <path d="M 105 250 A 45 45 0 0 1 195 250" fill="none" stroke="#7fb3d525" strokeWidth="1" />
          <line x1="150" y1="190" x2="150" y2="250" stroke="#7fb3d525" strokeWidth="1" />
          <rect x="122" y="231" width="11" height="9" rx="2" fill="#ffd98a" opacity="0.85" />
          <rect x="158" y="231" width="11" height="9" rx="2" fill="#ffd98a" opacity="0.7" />

          {/* Connector tunnel 1 */}
          <rect x="205" y="230" width="50" height="20" rx="9" fill="#13202b" stroke="#7fb3d550" strokeWidth="1.2" />
          <circle cx="230" cy="240" r="4" fill="#ffd98a" opacity="0.5" />

          {/* Greenhouse dome — glowing green */}
          <path
            d="M 250 250 A 70 70 0 0 1 390 250 Z"
            fill="#08210f"
            stroke="#00e676"
            strokeWidth="2"
            filter="url(#s4fc-glow)"
          />
          <ellipse cx="320" cy="249" rx="64" ry="7" fill="#00e67622" />
          {/* Crops inside */}
          <line x1="285" y1="250" x2="285" y2="224" stroke="#00e676" strokeWidth="2" opacity="0.9" />
          <ellipse cx="285" cy="221" rx="5" ry="3" fill="#00e676" opacity="0.9" />
          <line x1="305" y1="250" x2="305" y2="216" stroke="#00e676" strokeWidth="2" opacity="0.9" />
          <ellipse cx="305" cy="213" rx="5.5" ry="3.5" fill="#00e676" opacity="0.9" />
          <line x1="325" y1="250" x2="325" y2="208" stroke="#00e676" strokeWidth="2" opacity="0.9" />
          <ellipse cx="325" cy="205" rx="6" ry="3.5" fill="#00e676" />
          <line x1="345" y1="250" x2="345" y2="220" stroke="#00e676" strokeWidth="2" opacity="0.9" />
          <ellipse cx="345" cy="217" rx="5" ry="3" fill="#00e676" opacity="0.9" />

          {/* Connector tunnel 2 */}
          <rect x="385" y="230" width="50" height="20" rx="9" fill="#13202b" stroke="#7fb3d550" strokeWidth="1.2" />
          <circle cx="410" cy="240" r="4" fill="#ffd98a" opacity="0.5" />

          {/* Habitat dome 3 */}
          <path
            d="M 430 250 A 60 60 0 0 1 550 250 Z"
            fill="#101c26"
            stroke="#7fb3d5"
            strokeWidth="1.5"
            opacity="0.95"
          />
          <path d="M 445 250 A 45 45 0 0 1 535 250" fill="none" stroke="#7fb3d525" strokeWidth="1" />
          <line x1="490" y1="190" x2="490" y2="250" stroke="#7fb3d525" strokeWidth="1" />
          <rect x="462" y="231" width="11" height="9" rx="2" fill="#ffd98a" opacity="0.85" />
          <rect x="498" y="231" width="11" height="9" rx="2" fill="#ffd98a" opacity="0.7" />

          {/* Antenna tower */}
          <line x1="587" y1="250" x2="595" y2="142" stroke="#9fb4c8" strokeWidth="2" />
          <line x1="603" y1="250" x2="595" y2="142" stroke="#9fb4c8" strokeWidth="2" />
          <line x1="589" y1="225" x2="601" y2="225" stroke="#9fb4c8" strokeWidth="1.5" />
          <line x1="590.5" y1="200" x2="599.5" y2="200" stroke="#9fb4c8" strokeWidth="1.5" />
          <line x1="592" y1="176" x2="598" y2="176" stroke="#9fb4c8" strokeWidth="1.5" />
          <circle cx="595" cy="136" r="4" fill="#ff5252">
            <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <path d="M 580 128 A 17 17 0 0 1 610 128" fill="none" stroke="#00e676" strokeWidth="1.5" opacity="0.5" />
          <path d="M 570 119 A 27 27 0 0 1 620 119" fill="none" stroke="#00e676" strokeWidth="1.5" opacity="0.3" />
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.7}
        style={{ maxWidth: "85%" }}
      >
        The first settlers <span className="grammar-future">are going to</span>{" "}
        live under glass domes.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 3: A Day on the Frontier ─── */
function ColonyLifeSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="green" active={active}>
      <AnimatedText color="#00e676" size="var(--slide-title)" glow weight={800}>
        A DAY ON THE FRONTIER
      </AnimatedText>

      <div
        style={{
          display: "flex",
          gap: "3.5rem",
          marginTop: "2rem",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        {/* DOME FARM */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.9rem",
            animation: "fade-in-up 0.6s ease 0.4s both",
          }}
        >
          <svg viewBox="0 0 120 120" style={{ width: "130px", height: "130px" }}>
            <defs>
              <filter id="s4cl-gf">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <line x1="8" y1="96" x2="112" y2="96" stroke="#00e67640" strokeWidth="2" />
            <path
              d="M 16 96 A 44 44 0 0 1 104 96"
              fill="#082313"
              stroke="#00e676"
              strokeWidth="2"
              filter="url(#s4cl-gf)"
            />
            <line x1="40" y1="96" x2="40" y2="72" stroke="#2fff8f" strokeWidth="2.5" />
            <ellipse cx="40" cy="69" rx="5" ry="3" fill="#00e676" />
            <ellipse cx="35" cy="81" rx="4" ry="2.5" fill="#00e676" opacity="0.85" />
            <ellipse cx="45" cy="83" rx="4" ry="2.5" fill="#00e676" opacity="0.85" />
            <line x1="60" y1="96" x2="60" y2="62" stroke="#2fff8f" strokeWidth="2.5" />
            <ellipse cx="60" cy="59" rx="5.5" ry="3.5" fill="#00e676" />
            <ellipse cx="54" cy="72" rx="4" ry="2.5" fill="#00e676" opacity="0.85" />
            <ellipse cx="66" cy="72" rx="4" ry="2.5" fill="#00e676" opacity="0.85" />
            <line x1="80" y1="96" x2="80" y2="74" stroke="#2fff8f" strokeWidth="2.5" />
            <ellipse cx="80" cy="71" rx="5" ry="3" fill="#00e676" />
            <ellipse cx="75" cy="83" rx="4" ry="2.5" fill="#00e676" opacity="0.85" />
            <ellipse cx="85" cy="84" rx="4" ry="2.5" fill="#00e676" opacity="0.85" />
          </svg>
          <span
            style={{
              color: "#00e676",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--slide-small)",
              fontWeight: 700,
              letterSpacing: "0.12em",
            }}
          >
            DOME FARM
          </span>
        </div>

        {/* WATER RECYCLER */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.9rem",
            animation: "fade-in-up 0.6s ease 0.6s both",
          }}
        >
          <svg viewBox="0 0 120 120" style={{ width: "130px", height: "130px" }}>
            <defs>
              <filter id="s4cl-gw">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Looping arrows */}
            <path
              d="M 60 22 A 38 38 0 0 1 98 60"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#s4cl-gw)"
            />
            <polygon points="98,74 91,59 105,59" fill="#00e5ff" />
            <path
              d="M 60 98 A 38 38 0 0 1 22 60"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#s4cl-gw)"
            />
            <polygon points="22,46 15,61 29,61" fill="#00e5ff" />
            {/* Drops */}
            <path
              d="M 60 42 C 69 55 69 65 60 71 C 51 65 51 55 60 42 Z"
              fill="#00e5ff"
              opacity="0.95"
            />
            <path
              d="M 44 50 C 48 56 48 60 44 63 C 40 60 40 56 44 50 Z"
              fill="#00e5ff"
              opacity="0.55"
            />
            <path
              d="M 76 50 C 80 56 80 60 76 63 C 72 60 72 56 76 50 Z"
              fill="#00e5ff"
              opacity="0.55"
            />
          </svg>
          <span
            style={{
              color: "#00e5ff",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--slide-small)",
              fontWeight: 700,
              letterSpacing: "0.12em",
            }}
          >
            WATER RECYCLER
          </span>
        </div>

        {/* FAMILY HAB */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.9rem",
            animation: "fade-in-up 0.6s ease 0.8s both",
          }}
        >
          <svg viewBox="0 0 120 120" style={{ width: "130px", height: "130px" }}>
            <defs>
              <filter id="s4cl-gh">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <line x1="8" y1="96" x2="112" y2="96" stroke="#00e67640" strokeWidth="2" />
            <path
              d="M 16 96 A 44 44 0 0 1 104 96"
              fill="#0b1d29"
              stroke="#00e676"
              strokeWidth="2"
              filter="url(#s4cl-gh)"
            />
            <rect x="46" y="70" width="28" height="26" fill="#102a3c" stroke="#7fb3d5" strokeWidth="1.5" />
            <polygon points="42,70 60,54 78,70" fill="#7fb3d5" opacity="0.9" />
            <rect x="55" y="78" width="10" height="10" fill="#ffd98a" />
          </svg>
          <span
            style={{
              color: "#7fb3d5",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--slide-small)",
              fontWeight: 700,
              letterSpacing: "0.12em",
            }}
          >
            FAMILY HAB
          </span>
        </div>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={1.1}
        style={{ maxWidth: "85%", marginTop: "2rem" }}
      >
        Colonists <span className="grammar-future">will grow</span> their own
        food, and children <span className="grammar-possibility">may</span> be
        born off-world.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 4: The 1,000-Year Project ─── */
function TerraformDreamSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="green" active={active}>
      <AnimatedText color="#00e676" size="var(--slide-title)" glow weight={800}>
        THE 1,000-YEAR PROJECT
      </AnimatedText>

      {/* One world, three phases: barren red → domed → green */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.3s both" }}>
        <svg viewBox="0 0 760 300" style={{ width: "85%", maxWidth: "760px" }}>
          <defs>
            <filter id="s4tf-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="s4tf-red" cx="35%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#6b2a1c" />
              <stop offset="100%" stopColor="#2a0f0a" />
            </radialGradient>
            <radialGradient id="s4tf-mid" cx="35%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#5d2b1d" />
              <stop offset="100%" stopColor="#271009" />
            </radialGradient>
            <radialGradient id="s4tf-green" cx="35%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#2fae66" />
              <stop offset="100%" stopColor="#0b3a22" />
            </radialGradient>
          </defs>

          {/* Phase 1: barren red world */}
          <circle cx="130" cy="140" r="85" fill="url(#s4tf-red)" stroke="#ff6b3540" strokeWidth="1.5" />
          <ellipse cx="105" cy="115" rx="12" ry="8" fill="#00000040" />
          <ellipse cx="160" cy="170" rx="9" ry="6" fill="#00000040" />
          <ellipse cx="140" cy="95" rx="6" ry="4" fill="#00000035" />
          <ellipse cx="95" cy="170" rx="7" ry="5" fill="#00000035" />
          <text x="130" y="262" textAnchor="middle" fill="#ff6b35" fontSize="15" fontFamily="var(--font-mono)">
            YEAR 0
          </text>

          {/* Arrow 1 */}
          <line x1="228" y1="140" x2="278" y2="140" stroke="#00e676" strokeWidth="3" filter="url(#s4tf-glow)" />
          <polygon points="292,140 276,132 276,148" fill="#00e676" />

          {/* Phase 2: domed settlements */}
          <circle cx="380" cy="140" r="85" fill="url(#s4tf-mid)" stroke="#ffc10730" strokeWidth="1.5" />
          <ellipse cx="355" cy="105" rx="10" ry="6" fill="#00000035" />
          <ellipse cx="420" cy="120" rx="7" ry="5" fill="#00000030" />
          <ellipse cx="352" cy="196" rx="17" ry="4" fill="#00e67620" />
          <ellipse cx="404" cy="204" rx="13" ry="3.5" fill="#00e67620" />
          <path
            d="M 338 192 A 12 12 0 0 1 362 192 Z"
            fill="#0d2517"
            stroke="#00e676"
            strokeWidth="1.5"
            filter="url(#s4tf-glow)"
          />
          <path
            d="M 389 202 A 9 9 0 0 1 407 202 Z"
            fill="#0d2517"
            stroke="#00e676"
            strokeWidth="1.5"
            filter="url(#s4tf-glow)"
          />
          <path
            d="M 417 172 A 8 8 0 0 1 433 172 Z"
            fill="#0d2517"
            stroke="#00e676"
            strokeWidth="1.5"
          />
          <circle cx="350" cy="188" r="1.3" fill="#ffd98a" />
          <circle cx="398" cy="199" r="1.2" fill="#ffd98a" />
          <text x="380" y="262" textAnchor="middle" fill="#ffc107" fontSize="15" fontFamily="var(--font-mono)">
            YEAR 500
          </text>

          {/* Arrow 2 */}
          <line x1="478" y1="140" x2="528" y2="140" stroke="#00e676" strokeWidth="3" filter="url(#s4tf-glow)" />
          <polygon points="542,140 526,132 526,148" fill="#00e676" />

          {/* Phase 3: green world with clouds */}
          <g filter="url(#s4tf-glow)">
            <circle cx="630" cy="140" r="85" fill="url(#s4tf-green)" stroke="#00e67660" strokeWidth="2" />
          </g>
          <ellipse cx="610" cy="122" rx="22" ry="14" fill="#1c8a50" opacity="0.8" />
          <ellipse cx="657" cy="172" rx="18" ry="11" fill="#1c8a50" opacity="0.8" />
          <ellipse cx="600" cy="178" rx="12" ry="8" fill="#1c8a50" opacity="0.7" />
          <ellipse cx="640" cy="103" rx="26" ry="7" fill="#ffffff" opacity="0.5" />
          <ellipse cx="603" cy="150" rx="20" ry="6" fill="#ffffff" opacity="0.45" />
          <ellipse cx="662" cy="140" rx="14" ry="5" fill="#ffffff" opacity="0.4" />
          <text x="630" y="262" textAnchor="middle" fill="#00e676" fontSize="15" fontFamily="var(--font-mono)">
            YEAR 1,000
          </text>
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.7}
        style={{ maxWidth: "85%" }}
      >
        <span className="grammar-conditional">If we work for centuries</span>,
        a dead world <span className="grammar-future">will turn</span> green.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 5: Danger from Above ─── */
function DangerAboveSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="green" active={active}>
      <AnimatedText color="#ff6b35" size="var(--slide-title)" glow weight={800}>
        DANGER FROM ABOVE
      </AnimatedText>

      {/* Debris streaks vs. one shield arc over the domes */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.3s both" }}>
        <svg viewBox="0 0 640 380" style={{ width: "78%", maxWidth: "620px" }}>
          <defs>
            <filter id="s4da-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="s4da-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#05050a" />
              <stop offset="100%" stopColor="#150a12" />
            </linearGradient>
            <linearGradient id="s4da-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2b1410" />
              <stop offset="100%" stopColor="#150a08" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="640" height="330" fill="url(#s4da-sky)" />
          <circle cx="45" cy="120" r="1.2" fill="#ffffff" opacity="0.4" />
          <circle cx="135" cy="220" r="1" fill="#ffffff" opacity="0.3" />
          <circle cx="305" cy="150" r="1.1" fill="#ffffff" opacity="0.35" />
          <circle cx="455" cy="80" r="1.3" fill="#ffffff" opacity="0.45" />
          <circle cx="595" cy="210" r="1" fill="#ffffff" opacity="0.3" />
          <circle cx="240" cy="60" r="1" fill="#ffffff" opacity="0.3" />

          {/* Ground + dome cluster */}
          <rect x="0" y="330" width="640" height="50" fill="url(#s4da-ground)" />
          <line x1="0" y1="330" x2="640" y2="330" stroke="#ff6b3525" strokeWidth="1.5" />
          <path d="M 252 330 A 28 28 0 0 1 308 330 Z" fill="#0e1d2a" stroke="#7fb3d5" strokeWidth="1.5" />
          <path d="M 291 330 A 34 34 0 0 1 359 330 Z" fill="#0e1d2a" stroke="#7fb3d5" strokeWidth="1.5" />
          <path d="M 343 330 A 22 22 0 0 1 387 330 Z" fill="#0e1d2a" stroke="#7fb3d5" strokeWidth="1.5" />
          <circle cx="278" cy="318" r="3" fill="#ffd98a" opacity="0.85" />
          <circle cx="325" cy="310" r="3" fill="#ffd98a" opacity="0.85" />
          <circle cx="364" cy="320" r="2.5" fill="#ffd98a" opacity="0.75" />

          {/* Shield arc */}
          <path
            d="M 225 330 A 95 95 0 0 1 415 330"
            fill="#00e6760a"
            stroke="#00e676"
            strokeWidth="2.5"
            filter="url(#s4da-glow)"
          />
          <path
            d="M 205 330 A 115 115 0 0 1 435 330"
            fill="none"
            stroke="#00e67635"
            strokeWidth="1.5"
            strokeDasharray="6,8"
          />

          {/* Debris streaks */}
          <g>
            <line x1="70" y1="28" x2="150" y2="158" stroke="#ff9248" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="150" cy="158" r="3.5" fill="#ffd180" filter="url(#s4da-glow)" />
            <animate attributeName="opacity" values="0.55;1;0.55" dur="2s" repeatCount="indefinite" />
          </g>
          <g>
            <line x1="208" y1="12" x2="262" y2="128" stroke="#ff9248" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="262" cy="128" r="3.5" fill="#ffd180" filter="url(#s4da-glow)" />
            <animate attributeName="opacity" values="1;0.5;1" dur="1.7s" repeatCount="indefinite" />
          </g>
          <g opacity="0.5">
            <line x1="350" y1="30" x2="390" y2="110" stroke="#ff9248" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="390" cy="110" r="2.5" fill="#ffd180" />
          </g>
          <g>
            <line x1="565" y1="55" x2="512" y2="165" stroke="#ff9248" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="512" cy="165" r="3.5" fill="#ffd180" filter="url(#s4da-glow)" />
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.3s" repeatCount="indefinite" />
          </g>

          {/* Intercepted streak + burst on the shield */}
          <line x1="484" y1="18" x2="374" y2="240" stroke="#ff9248" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="370" cy="246" r="5" fill="#ffffff" filter="url(#s4da-glow)" />
          <line x1="358" y1="234" x2="350" y2="226" stroke="#00e676" strokeWidth="2" />
          <line x1="382" y1="236" x2="391" y2="229" stroke="#00e676" strokeWidth="2" />
          <line x1="360" y1="258" x2="352" y2="265" stroke="#00e676" strokeWidth="2" />
          <line x1="381" y1="257" x2="389" y2="265" stroke="#00e676" strokeWidth="2" />
          <circle cx="370" cy="246" r="10" fill="none" stroke="#00e676" strokeWidth="2">
            <animate attributeName="r" values="6;22" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.7}
        style={{ maxWidth: "85%" }}
      >
        Space junk and meteor showers{" "}
        <span className="grammar-possibility">could</span> threaten every dome.
        The colony <span className="grammar-future">will need</span> defenders.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 6: Shield Command Intro ─── */
function ShieldCommandIntroSlide({ active }: { active: boolean }) {
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
        SHIELD COMMAND
      </AnimatedText>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-subtitle)"
        delay={0.4}
      >
        Protect the colony domes from falling debris!
      </AnimatedText>

      {/* Domes + shield towers + tap-burst rings */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.7s both" }}>
        <svg viewBox="0 0 640 320" style={{ width: "72%", maxWidth: "600px" }}>
          <defs>
            <filter id="s4sc-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="s4sc-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10241a" />
              <stop offset="100%" stopColor="#081209" />
            </linearGradient>
          </defs>

          {/* Incoming streaks (each ends at a burst point) */}
          <line x1="96" y1="8" x2="146" y2="84" stroke="#ff9248" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <line x1="282" y1="0" x2="326" y2="52" stroke="#ff9248" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <line x1="548" y1="22" x2="504" y2="106" stroke="#ff9248" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <g opacity="0.6">
            <line x1="612" y1="10" x2="586" y2="72" stroke="#ff9248" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="586" cy="72" r="2.5" fill="#ffd180" />
          </g>

          {/* Tap-burst rings intercepting the streaks */}
          <circle cx="150" cy="90" r="3.5" fill="#00e676" filter="url(#s4sc-glow)" />
          <circle cx="150" cy="90" r="6" fill="none" stroke="#00e676" strokeWidth="2">
            <animate attributeName="r" values="5;30" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="150" cy="90" r="6" fill="none" stroke="#00e676" strokeWidth="1.5">
            <animate attributeName="r" values="5;30" dur="1.6s" begin="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0" dur="1.6s" begin="0.8s" repeatCount="indefinite" />
          </circle>

          <circle cx="330" cy="58" r="3.5" fill="#00e676" filter="url(#s4sc-glow)" />
          <circle cx="330" cy="58" r="6" fill="none" stroke="#00e676" strokeWidth="2">
            <animate attributeName="r" values="5;30" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="330" cy="58" r="6" fill="none" stroke="#00e676" strokeWidth="1.5">
            <animate attributeName="r" values="5;30" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
          </circle>

          <circle cx="500" cy="112" r="3.5" fill="#00e676" filter="url(#s4sc-glow)" />
          <circle cx="500" cy="112" r="6" fill="none" stroke="#00e676" strokeWidth="2">
            <animate attributeName="r" values="5;30" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="500" cy="112" r="6" fill="none" stroke="#00e676" strokeWidth="1.5">
            <animate attributeName="r" values="5;30" dur="1.4s" begin="0.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0" dur="1.4s" begin="0.7s" repeatCount="indefinite" />
          </circle>

          {/* Ground */}
          <rect x="0" y="280" width="640" height="40" fill="url(#s4sc-ground)" />
          <line x1="0" y1="280" x2="640" y2="280" stroke="#00e67630" strokeWidth="1.5" />

          {/* Dome row */}
          <path d="M 60 280 A 30 30 0 0 1 120 280 Z" fill="#0d2418" stroke="#00e676" strokeWidth="2" opacity="0.95" />
          <path d="M 150 280 A 21 21 0 0 1 192 280 Z" fill="#0d2418" stroke="#00e676" strokeWidth="2" opacity="0.95" />
          <path d="M 284 280 A 36 36 0 0 1 356 280 Z" fill="#0d2418" stroke="#00e676" strokeWidth="2" opacity="0.95" />
          <path d="M 448 280 A 21 21 0 0 1 490 280 Z" fill="#0d2418" stroke="#00e676" strokeWidth="2" opacity="0.95" />
          <path d="M 520 280 A 30 30 0 0 1 580 280 Z" fill="#0d2418" stroke="#00e676" strokeWidth="2" opacity="0.95" />
          <circle cx="90" cy="266" r="2" fill="#ffd98a" opacity="0.9" />
          <circle cx="171" cy="270" r="2" fill="#ffd98a" opacity="0.9" />
          <circle cx="320" cy="258" r="2" fill="#ffd98a" opacity="0.9" />
          <circle cx="469" cy="270" r="2" fill="#ffd98a" opacity="0.9" />
          <circle cx="550" cy="266" r="2" fill="#ffd98a" opacity="0.9" />

          {/* Shield towers */}
          <rect x="234" y="272" width="12" height="8" fill="#0d2418" stroke="#00e676aa" strokeWidth="1.2" />
          <line x1="240" y1="272" x2="240" y2="228" stroke="#9fb4c8" strokeWidth="2" />
          <path d="M 214 220 A 26 26 0 0 1 266 220" fill="none" stroke="#00e67640" strokeWidth="1.5" />
          <circle cx="240" cy="222" r="5" fill="#00e676" filter="url(#s4sc-glow)">
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>

          <rect x="394" y="272" width="12" height="8" fill="#0d2418" stroke="#00e676aa" strokeWidth="1.2" />
          <line x1="400" y1="272" x2="400" y2="228" stroke="#9fb4c8" strokeWidth="2" />
          <path d="M 374 220 A 26 26 0 0 1 426 220" fill="none" stroke="#00e67640" strokeWidth="1.5" />
          <circle cx="400" cy="222" r="5" fill="#00e676" filter="url(#s4sc-glow)">
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="0.6s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <AnimatedText
        color="#00e676"
        size="var(--slide-body)"
        delay={1.2}
        mono
        style={{
          marginTop: "1.5rem",
          animation:
            "fade-in-up 0.6s ease 1.2s both, pulse-glow 1.6s ease-in-out 1.8s infinite",
        }}
      >
        Check your devices now!
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 7: Shield Command Leaderboard ─── */
function ShieldCommandLeaderboardSlide({ active }: { active: boolean }) {
  const session = useQuery(api.sessions.getCurrent);
  return (
    <SlideLayout accent="green" active={active}>
      {session ? (
        <GameLeaderboard
          sessionId={session._id}
          game="shieldCommand"
          title="SHIELD COMMAND LEADERBOARD"
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
    id: "beyond-title",
    section: 4,
    accent: "green",
    component: BeyondTitleSlide,
  },
  {
    id: "first-colonies",
    section: 4,
    accent: "green",
    component: FirstColoniesSlide,
  },
  {
    id: "colony-life",
    section: 4,
    accent: "green",
    component: ColonyLifeSlide,
  },
  {
    id: "terraform-dream",
    section: 4,
    accent: "green",
    component: TerraformDreamSlide,
  },
  {
    id: "danger-above",
    section: 4,
    accent: "green",
    component: DangerAboveSlide,
  },
  {
    id: "shieldcommand-intro",
    section: 4,
    accent: "green",
    component: ShieldCommandIntroSlide,
    studentEvent: "shieldCommand",
  },
  {
    id: "shieldcommand-leaderboard",
    section: 4,
    accent: "green",
    component: ShieldCommandLeaderboardSlide,
    studentEvent: "shieldCommand",
  },
];
