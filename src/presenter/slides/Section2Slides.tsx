import type { SlideDefinition } from "./index";
import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import GameLeaderboard from "../components/GameLeaderboard";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const PINK = "#ff2d7b";

/* ─── Slide 1: Section Title ───────────────────────────────────────── */
function CitiesTitleSlide({ active }: { active: boolean }) {
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
          lineHeight: 1.05,
          zIndex: 1,
        }}
      >
        Cities of Tomorrow
      </div>

      <AnimatedText
        size="var(--slide-subtitle)"
        color="var(--text-secondary)"
        delay={0.6}
        style={{ marginTop: "1.25rem", zIndex: 1 }}
      >
        Where 10 billion people will live
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

/* ─── Slide 2: Cities Will Grow Upward ─────────────────────────────── */
function VerticalCitiesSlide({ active }: { active: boolean }) {
  // Towers get progressively taller left → right
  const towers = [
    { x: 36, w: 62, h: 96 },
    { x: 128, w: 66, h: 150 },
    { x: 224, w: 70, h: 206 },
    { x: 324, w: 74, h: 258 },
    { x: 428, w: 80, h: 306 },
  ];

  // Sky-bridges spanning the gaps between adjacent towers
  const bridges = [
    { x1: 98, x2: 128, y: 262 },
    { x1: 194, x2: 224, y: 200 },
    { x1: 294, x2: 324, y: 142 },
    { x1: 398, x2: 428, y: 86 },
    { x1: 294, x2: 324, y: 250 },
  ];

  // Small glowing pads climbing the tower sides
  const pads = [
    { x: 24, y: 258 },
    { x: 98, y: 268 },
    { x: 116, y: 226 },
    { x: 194, y: 214 },
    { x: 212, y: 168 },
    { x: 294, y: 156 },
    { x: 312, y: 112 },
    { x: 398, y: 100 },
    { x: 416, y: 56 },
    { x: 508, y: 44 },
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
        CITIES WILL GROW UPWARD
      </AnimatedText>

      <div style={{ marginTop: "1.25rem" }}>
        <svg
          width="620"
          height="350"
          viewBox="0 0 640 350"
          style={{ overflow: "visible" }}
        >
          {/* Stars */}
          {[
            [60, 30], [150, 60], [250, 26], [380, 40], [560, 70],
            [600, 24], [110, 110], [270, 90],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={1.6}
              fill="#ffffff"
              opacity={0.65}
              style={{
                animation: `pulse-glow 2.6s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}

          {/* Towers, progressively taller, each with window strips */}
          {towers.map((t, ti) => {
            const top = 330 - t.h;
            const rows = Math.floor((t.h - 26) / 26);
            return (
              <g
                key={ti}
                style={{
                  animation: `fade-in-up 0.6s ease ${0.3 + ti * 0.15}s both`,
                }}
              >
                <rect
                  x={t.x}
                  y={top}
                  width={t.w}
                  height={t.h}
                  rx={4}
                  fill="#16101f"
                  stroke={PINK}
                  strokeWidth={2}
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(255,45,123,0.35))",
                  }}
                />
                {Array.from({ length: rows }, (_, r) => (
                  <rect
                    key={r}
                    x={t.x + 9}
                    y={top + 16 + r * 26}
                    width={t.w - 18}
                    height={3.5}
                    rx={1.5}
                    fill="#00e5ff"
                    opacity={0.28}
                  />
                ))}
              </g>
            );
          })}

          {/* Beacon antenna on the tallest tower */}
          <line
            x1={468}
            y1={24}
            x2={468}
            y2={8}
            stroke={PINK}
            strokeWidth={2.5}
            style={{ animation: "fade-in 0.5s ease 1.2s both" }}
          />
          <circle
            cx={468}
            cy={5}
            r={3.5}
            fill={PINK}
            style={{
              filter: "drop-shadow(0 0 6px #ff2d7b)",
              animation: "pulse-glow 1.6s ease-in-out infinite",
            }}
          />

          {/* Sky-bridges connecting the towers */}
          {bridges.map((b, i) => (
            <rect
              key={i}
              x={b.x1 - 2}
              y={b.y}
              width={b.x2 - b.x1 + 4}
              height={5}
              rx={2.5}
              fill="#00e5ff"
              opacity={0.85}
              style={{
                filter: "drop-shadow(0 0 6px rgba(0,229,255,0.8))",
                animation: `fade-in 0.5s ease ${1 + i * 0.12}s both`,
              }}
            />
          ))}

          {/* Glowing pads climbing the tower sides */}
          {pads.map((p, i) => (
            <rect
              key={i}
              x={p.x}
              y={p.y}
              width={12}
              height={5}
              rx={2.5}
              fill={PINK}
              style={{
                filter: "drop-shadow(0 0 6px rgba(255,45,123,0.9))",
                animation: `pulse-glow 2.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}

          {/* Street level */}
          <line
            x1={10}
            y1={330}
            x2={630}
            y2={330}
            stroke="rgba(255,45,123,0.45)"
            strokeWidth={2}
          />
        </svg>
      </div>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.4}
        style={{ marginTop: "1rem", maxWidth: "82%" }}
      >
        With limited land, our cities{" "}
        <span className="grammar-future">will grow</span> toward the clouds.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 3: Transport Without Roads ─────────────────────────────── */
function HoverTransportSlide({ active }: { active: boolean }) {
  const lanes = [
    { y: 110, color: "#00e5ff", label: "AIR LANE 01" },
    { y: 185, color: "#ff2d7b", label: "AIR LANE 02" },
    { y: 260, color: "#ffc107", label: "AIR LANE 03" },
  ];

  const vehicles = [
    { x: 210, y: 110, dir: 1, delay: 0.9 },
    { x: 430, y: 110, dir: -1, delay: 1.0 },
    { x: 330, y: 185, dir: 1, delay: 1.1 },
    { x: 190, y: 260, dir: -1, delay: 1.2 },
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
        TRANSPORT WITHOUT ROADS
      </AnimatedText>

      <div style={{ marginTop: "1.25rem" }}>
        <svg
          width="620"
          height="340"
          viewBox="0 0 640 340"
          style={{ overflow: "visible" }}
        >
          {/* Dim background towers in the city canyon */}
          <rect
            x={250}
            y={150}
            width={56}
            height={170}
            rx={3}
            fill="#130d1b"
            stroke="rgba(255,45,123,0.25)"
            strokeWidth={1.5}
            style={{ animation: "fade-in 0.6s ease 0.3s both" }}
          />
          <rect
            x={336}
            y={180}
            width={48}
            height={140}
            rx={3}
            fill="#130d1b"
            stroke="rgba(255,45,123,0.25)"
            strokeWidth={1.5}
            style={{ animation: "fade-in 0.6s ease 0.4s both" }}
          />

          {/* Foreground towers framing the cross-section */}
          {[
            { x: 24, y: 70, w: 78, h: 250 },
            { x: 538, y: 50, w: 78, h: 270 },
          ].map((t, ti) => (
            <g
              key={ti}
              style={{ animation: `fade-in-up 0.6s ease ${0.2 + ti * 0.15}s both` }}
            >
              <rect
                x={t.x}
                y={t.y}
                width={t.w}
                height={t.h}
                rx={4}
                fill="#16101f"
                stroke={PINK}
                strokeWidth={2}
                style={{ filter: "drop-shadow(0 0 8px rgba(255,45,123,0.35))" }}
              />
              {Array.from({ length: Math.floor((t.h - 26) / 30) }, (_, r) => (
                <rect
                  key={r}
                  x={t.x + 10}
                  y={t.y + 18 + r * 30}
                  width={t.w - 20}
                  height={3.5}
                  rx={1.5}
                  fill="#00e5ff"
                  opacity={0.28}
                />
              ))}
            </g>
          ))}

          {/* Dashed flight lanes between the towers */}
          {lanes.map((lane, i) => (
            <g
              key={i}
              style={{ animation: `fade-in 0.6s ease ${0.5 + i * 0.18}s both` }}
            >
              <line
                x1={104}
                y1={lane.y}
                x2={536}
                y2={lane.y}
                stroke={lane.color}
                strokeWidth={2}
                strokeDasharray="10,8"
                opacity={0.55}
              />
              <text
                x={112}
                y={lane.y - 9}
                fill={lane.color}
                fontSize={11}
                fontFamily="var(--font-mono)"
                opacity={0.85}
              >
                {lane.label}
              </text>
            </g>
          ))}

          {/* Hover-vehicles riding the lanes */}
          {vehicles.map((vh, i) => (
            <g key={i} transform={`translate(${vh.x} ${vh.y}) scale(${vh.dir},1)`}>
              <g style={{ animation: `fade-in 0.5s ease ${vh.delay}s both` }}>
                <g
                  style={{
                    animation: `float 3s ease-in-out ${i * 0.45}s infinite`,
                  }}
                >
                  {/* Wake trail */}
                  <line
                    x1={-54}
                    y1={0}
                    x2={-30}
                    y2={0}
                    stroke="#00e5ff"
                    strokeWidth={2}
                    strokeDasharray="4,4"
                    opacity={0.5}
                  />
                  {/* Hull */}
                  <ellipse
                    cx={0}
                    cy={0}
                    rx={26}
                    ry={10}
                    fill="#1a1a2e"
                    stroke={PINK}
                    strokeWidth={2}
                    style={{
                      filter: "drop-shadow(0 0 7px rgba(255,45,123,0.6))",
                    }}
                  />
                  {/* Canopy */}
                  <path d="M2,-9 A12,9 0 0 1 16,-4 L2,-4 Z" fill="rgba(0,229,255,0.7)" />
                  {/* Under-glow */}
                  <ellipse
                    cx={0}
                    cy={13}
                    rx={13}
                    ry={3}
                    fill={PINK}
                    opacity={0.5}
                    style={{ filter: "blur(2px)" }}
                  />
                </g>
              </g>
            </g>
          ))}

          {/* Empty street far below — no cars needed */}
          <line
            x1={104}
            y1={320}
            x2={536}
            y2={320}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={2}
          />
          <text
            x={320}
            y={336}
            fill="rgba(255,255,255,0.35)"
            fontSize={11}
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            QUIET STREET BELOW
          </text>
        </svg>
      </div>

      <AnimatedText
        size="var(--slide-body)"
        color="var(--text-primary)"
        delay={1.4}
        style={{ marginTop: "1rem", maxWidth: "84%" }}
      >
        Flying taxis <span className="grammar-possibility">could</span> replace
        cars, and traffic jams{" "}
        <span className="grammar-future">will become</span> history.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 4: Homes That Think ────────────────────────────────────── */
function SmartHomesSlide({ active }: { active: boolean }) {
  const icons = [
    {
      label: "Adaptive Walls",
      delay: 0.5,
      svg: (
        <g>
          {/* Room frame */}
          <rect
            x={14}
            y={16}
            width={84}
            height={80}
            rx={6}
            fill="none"
            stroke={PINK}
            strokeWidth={3}
            style={{ filter: "drop-shadow(0 0 6px rgba(255,45,123,0.5))" }}
          />
          {/* Sliding panels */}
          <rect
            x={24}
            y={28}
            width={26}
            height={56}
            rx={3}
            fill="rgba(255,45,123,0.15)"
            stroke={PINK}
            strokeWidth={2.5}
          />
          <rect
            x={46}
            y={36}
            width={26}
            height={48}
            rx={3}
            fill="rgba(0,229,255,0.12)"
            stroke="#00e5ff"
            strokeWidth={2.5}
          />
          {/* Slide direction chevron */}
          <path
            d="M80,52 l9,8 l-9,8"
            fill="none"
            stroke="#00e5ff"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ),
    },
    {
      label: "Helper Bot",
      delay: 0.7,
      svg: (
        <g>
          {/* Antenna */}
          <line x1={56} y1={34} x2={56} y2={22} stroke={PINK} strokeWidth={2.5} />
          <circle
            cx={56}
            cy={19}
            r={3.5}
            fill={PINK}
            style={{
              filter: "drop-shadow(0 0 5px #ff2d7b)",
              animation: "pulse-glow 1.8s ease-in-out infinite",
            }}
          />
          {/* Round body */}
          <circle
            cx={56}
            cy={60}
            r={24}
            fill="#1a1a2e"
            stroke="#00e5ff"
            strokeWidth={3}
            style={{ filter: "drop-shadow(0 0 6px rgba(0,229,255,0.5))" }}
          />
          {/* Eyes + smile */}
          <circle cx={47} cy={56} r={4} fill="#00e5ff" />
          <circle cx={65} cy={56} r={4} fill="#00e5ff" />
          <path
            d="M48,70 Q56,76 64,70"
            fill="none"
            stroke="#00e5ff"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* Hover glow */}
          <ellipse
            cx={56}
            cy={94}
            rx={18}
            ry={4}
            fill={PINK}
            opacity={0.4}
            style={{ filter: "blur(2px)" }}
          />
        </g>
      ),
    },
    {
      label: "Energy Skin",
      delay: 0.9,
      svg: (
        <g>
          {/* Solar facade */}
          <rect
            x={28}
            y={16}
            width={56}
            height={80}
            rx={4}
            fill="rgba(255,193,7,0.08)"
            stroke="#ffc107"
            strokeWidth={3}
            style={{ filter: "drop-shadow(0 0 6px rgba(255,193,7,0.5))" }}
          />
          {/* Cell grid */}
          <line x1={47} y1={16} x2={47} y2={96} stroke="#ffc107" strokeWidth={1.5} opacity={0.5} />
          <line x1={65} y1={16} x2={65} y2={96} stroke="#ffc107" strokeWidth={1.5} opacity={0.5} />
          <line x1={28} y1={36} x2={84} y2={36} stroke="#ffc107" strokeWidth={1.5} opacity={0.5} />
          <line x1={28} y1={56} x2={84} y2={56} stroke="#ffc107" strokeWidth={1.5} opacity={0.5} />
          <line x1={28} y1={76} x2={84} y2={76} stroke="#ffc107" strokeWidth={1.5} opacity={0.5} />
          {/* Energy bolt */}
          <path
            d="M58,34 L44,60 L54,60 L48,82 L66,52 L55,52 Z"
            fill="#ffc107"
            style={{ filter: "drop-shadow(0 0 8px #ffc107)" }}
          />
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
        HOMES THAT THINK
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
        <span className="grammar-conditional">If your home knows you</span>, it{" "}
        <span className="grammar-future">will prepare</span> everything before
        you arrive.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 5: Could You Live on Floor 500? ────────────────────────── */
function CityQuestionSlide({ active }: { active: boolean }) {
  const floors = [500, 400, 300, 200, 100];

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
          letterSpacing: "0.04em",
          textAlign: "center",
          lineHeight: 1.05,
          maxWidth: "85%",
          animation: "scale-in 0.7s ease 0.2s both",
          zIndex: 1,
        }}
      >
        COULD YOU LIVE ON FLOOR 500?
      </div>

      <AnimatedText
        size="var(--slide-subtitle)"
        color="var(--text-secondary)"
        delay={0.7}
        style={{ marginTop: "1.5rem", zIndex: 1 }}
      >
        The elevators of 2200 go UP.
      </AnimatedText>

      {/* Decorative vertical glowing line with floor ticks */}
      <div
        style={{
          position: "absolute",
          left: "9%",
          top: "14%",
          height: "72%",
          width: "2px",
          background:
            "linear-gradient(180deg, #ff2d7b, rgba(255,45,123,0.05))",
          boxShadow: "0 0 12px rgba(255,45,123,0.6)",
          pointerEvents: "none",
          animation: "fade-in 0.8s ease 0.5s both",
        }}
      >
        {/* Top beacon */}
        <div
          style={{
            position: "absolute",
            top: "-7px",
            left: "-5px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: PINK,
            boxShadow: "0 0 14px #ff2d7b",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        />
        {floors.map((f, i) => (
          <div
            key={f}
            style={{
              position: "absolute",
              top: `${i * 23}%`,
              left: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "2px",
                background: PINK,
                boxShadow: "0 0 8px rgba(255,45,123,0.8)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                letterSpacing: "0.08em",
              }}
            >
              {f}
            </span>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 6: Sky Climb Intro ─────────────────────────────────────── */
function SkyClimbIntroSlide({ active }: { active: boolean }) {
  // Hover-pads zigzagging up the tower edge
  const pads = [
    { x: 90, y: 296 },
    { x: 166, y: 248 },
    { x: 90, y: 200 },
    { x: 166, y: 152 },
    { x: 90, y: 104 },
    { x: 166, y: 56 },
  ];

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
          animation: "scale-in 0.7s ease 0.1s both",
          textAlign: "center",
          lineHeight: 1.05,
        }}
      >
        YOUR TURN
      </div>

      <AnimatedText
        size="var(--slide-subtitle)"
        color="var(--text-secondary)"
        delay={0.5}
        style={{ marginTop: "0.75rem" }}
      >
        Sky Climb — bounce up the hover-pads of the vertical city!
      </AnimatedText>

      <div style={{ marginTop: "1rem", animation: "fade-in-up 0.6s ease 0.7s both" }}>
        <svg width="220" height="300" viewBox="0 0 250 330" style={{ overflow: "visible" }}>
          {/* Stars */}
          {[
            [220, 30], [236, 110], [214, 190], [232, 260],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={1.6}
              fill="#ffffff"
              opacity={0.65}
              style={{
                animation: `pulse-glow 2.6s ease-in-out ${i * 0.35}s infinite`,
              }}
            />
          ))}

          {/* Tower wall */}
          <rect
            x={18}
            y={14}
            width={52}
            height={306}
            rx={3}
            fill="#150f1e"
            stroke={PINK}
            strokeWidth={2}
          />
          {Array.from({ length: 10 }, (_, r) => (
            <rect
              key={r}
              x={28}
              y={26 + r * 29}
              width={24}
              height={3.5}
              rx={1.5}
              fill="#00e5ff"
              opacity={0.25}
            />
          ))}
          {/* Glowing tower edge */}
          <line
            x1={70}
            y1={14}
            x2={70}
            y2={320}
            stroke={PINK}
            strokeWidth={2.5}
            style={{ filter: "drop-shadow(0 0 6px rgba(255,45,123,0.8))" }}
          />

          {/* Dotted bounce route through the pads */}
          <polyline
            points="112,292 188,244 112,196 188,148 112,100 188,52"
            fill="none"
            stroke="#00e5ff"
            strokeWidth={2}
            strokeDasharray="3,6"
            opacity={0.35}
            strokeLinecap="round"
          />

          {/* Zigzag hover-pads */}
          {pads.map((p, i) => (
            <g key={i}>
              <rect
                x={p.x}
                y={p.y}
                width={44}
                height={7}
                rx={3.5}
                fill={PINK}
                style={{
                  filter: "drop-shadow(0 0 7px rgba(255,45,123,0.9))",
                  animation: `pulse-glow 2s ease-in-out ${i * 0.22}s infinite`,
                }}
              />
              <ellipse
                cx={p.x + 22}
                cy={p.y + 11}
                rx={16}
                ry={3}
                fill={PINK}
                opacity={0.3}
                style={{ filter: "blur(2px)" }}
              />
            </g>
          ))}

          {/* Tiny climber, arms up, mid-route */}
          <g
            stroke="#00e5ff"
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
            style={{ filter: "drop-shadow(0 0 5px rgba(0,229,255,0.8))" }}
          >
            <circle cx={112} cy={177} r={5} />
            <line x1={112} y1={182} x2={112} y2={193} />
            <line x1={112} y1={186} x2={104} y2={178} />
            <line x1={112} y1={186} x2={120} y2={178} />
            <line x1={112} y1={193} x2={106} y2={200} />
            <line x1={112} y1={193} x2={118} y2={200} />
          </g>
        </svg>
      </div>

      <div
        style={{
          marginTop: "0.75rem",
          fontSize: "var(--slide-body)",
          color: PINK,
          fontFamily: "var(--font-mono)",
          animation: "pulse-glow 1.6s ease-in-out infinite",
          textShadow: "0 0 12px #ff2d7b",
        }}
      >
        Check your devices now!
      </div>
    </SlideLayout>
  );
}

/* ─── Slide 7: Sky Climb Leaderboard ───────────────────────────────── */
function SkyClimbLeaderboardSlide({ active }: { active: boolean }) {
  const session = useQuery(api.sessions.getCurrent);
  return (
    <SlideLayout accent="pink" active={active}>
      {session ? (
        <GameLeaderboard
          sessionId={session._id}
          game="skyClimb"
          title="SKY CLIMB LEADERBOARD"
          accent="#ff2d7b"
          scoreUnit="m"
        />
      ) : (
        <AnimatedText color="#ff2d7b" size="var(--slide-body)">
          Waiting for session...
        </AnimatedText>
      )}
    </SlideLayout>
  );
}

/* ─── Export ───────────────────────────────────────────────────────── */
export const section2Slides: SlideDefinition[] = [
  { id: "cities-title", section: 2, accent: "pink", component: CitiesTitleSlide },
  { id: "vertical-cities", section: 2, accent: "pink", component: VerticalCitiesSlide, studentEvent: "lookUp" },
  { id: "hover-transport", section: 2, accent: "pink", component: HoverTransportSlide },
  { id: "smart-homes", section: 2, accent: "pink", component: SmartHomesSlide },
  { id: "city-question", section: 2, accent: "pink", component: CityQuestionSlide },
  { id: "skyclimb-intro", section: 2, accent: "pink", component: SkyClimbIntroSlide, studentEvent: "skyClimb" },
  { id: "skyclimb-leaderboard", section: 2, accent: "pink", component: SkyClimbLeaderboardSlide, studentEvent: "skyClimb" },
];
