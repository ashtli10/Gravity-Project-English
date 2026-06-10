import type { SlideDefinition } from "./index";
import SlideLayout from "../components/SlideLayout";
import AnimatedText from "../components/AnimatedText";
import GameLeaderboard from "../components/GameLeaderboard";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/* ─── Slide 1: Section Title ─── */
function RobotsTitleSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="gold" active={active}>
      <AnimatedText
        color="#ffc107"
        size="var(--slide-huge)"
        glow
        weight={900}
        delay={0}
        style={{ letterSpacing: "0.06em" }}
      >
        ROBOTS &amp; AI
      </AnimatedText>
      <AnimatedText
        color="var(--text-secondary)"
        size="var(--slide-subtitle)"
        delay={0.4}
      >
        Our partners — or our problem?
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

/* ─── Slide 2: Robots at Work ─── */
function RobotsAtWorkSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="gold" active={active}>
      <AnimatedText
        color="#ffc107"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        ROBOTS WILL DO THE HARD WORK
      </AnimatedText>

      {/* SVG: three robot work stations — builder, farmer, medic */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.3s both" }}>
        <svg viewBox="0 0 690 310" style={{ width: "88%", maxWidth: "760px" }}>
          <defs>
            <filter id="s3-glow-work">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Factory floor line */}
          <line x1="15" y1="252" x2="675" y2="252" stroke="#ffc10766" strokeWidth="2" />
          {[80, 195, 310, 425, 540, 655].map((tx) => (
            <line
              key={tx}
              x1={tx}
              y1="252"
              x2={tx - 10}
              y2="264"
              stroke="#ffc10733"
              strokeWidth="2"
            />
          ))}

          {/* ── Station 1: BUILDER (crane arm) ── */}
          <g filter="url(#s3-glow-work)">
            {/* antenna + head */}
            <line x1="85" y1="122" x2="85" y2="110" stroke="#ffc107" strokeWidth="2" />
            <circle cx="85" cy="107" r="3" fill="#ffc107" />
            <rect x="67" y="122" width="36" height="26" rx="6" fill="#1a1a2e" stroke="#ffc107" strokeWidth="2" />
            <rect x="76" y="132" width="18" height="6" rx="3" fill="#ffc107" />
            {/* torso */}
            <rect x="62" y="154" width="46" height="58" rx="9" fill="#1a1a2e" stroke="#ffc107" strokeWidth="2" />
            <circle cx="85" cy="174" r="5" fill="#ffc107" />
            <line x1="70" y1="194" x2="100" y2="194" stroke="#ffc10755" strokeWidth="2" />
            {/* legs */}
            <rect x="69" y="212" width="11" height="40" fill="#1a1a2e" stroke="#ffc107" strokeWidth="2" />
            <rect x="90" y="212" width="11" height="40" fill="#1a1a2e" stroke="#ffc107" strokeWidth="2" />
            {/* crane arm: shoulder → elbow → jib, cable + hook + girder */}
            <line x1="108" y1="164" x2="152" y2="120" stroke="#ffc107" strokeWidth="4" strokeLinecap="round" />
            <line x1="152" y1="120" x2="196" y2="134" stroke="#ffc107" strokeWidth="4" strokeLinecap="round" />
            <circle cx="152" cy="120" r="5" fill="#ffc107" />
            <line x1="196" y1="134" x2="196" y2="168" stroke="#ffc107" strokeWidth="2" strokeDasharray="4,3" />
            <path d="M 196 168 q 0 9 -8 9" fill="none" stroke="#ffc107" strokeWidth="3" strokeLinecap="round" />
            <rect x="172" y="180" width="48" height="11" rx="2" fill="#1a1a2e" stroke="#ffc107" strokeWidth="2" />
          </g>
          <text
            x="130"
            y="290"
            fill="#ffc107"
            fontSize="16"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            BUILDER
          </text>

          {/* ── Station 2: FARMER (greenhouse rows) ── */}
          <g filter="url(#s3-glow-work)">
            {/* robot */}
            <rect x="280" y="138" width="32" height="24" rx="6" fill="#1a1a2e" stroke="#00e676" strokeWidth="2" />
            <rect x="288" y="147" width="16" height="6" rx="3" fill="#00e676" />
            <rect x="276" y="166" width="40" height="50" rx="8" fill="#1a1a2e" stroke="#00e676" strokeWidth="2" />
            <circle cx="296" cy="184" r="4" fill="#00e676" />
            <rect x="282" y="216" width="10" height="36" fill="#1a1a2e" stroke="#00e676" strokeWidth="2" />
            <rect x="300" y="216" width="10" height="36" fill="#1a1a2e" stroke="#00e676" strokeWidth="2" />
            {/* watering arm toward the rows */}
            <line x1="316" y1="176" x2="344" y2="192" stroke="#00e676" strokeWidth="3" strokeLinecap="round" />
            {[0, 1, 2].map((d) => (
              <line
                key={d}
                x1={344 + d * 6}
                y1="196"
                x2={340 + d * 6}
                y2="210"
                stroke="#00e67699"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
            {/* greenhouse dome */}
            <path d="M 336 252 A 62 62 0 0 1 460 252" fill="#00e67610" stroke="#00e676" strokeWidth="2" />
            <line x1="398" y1="190" x2="398" y2="252" stroke="#00e67644" strokeWidth="1.5" />
            <line x1="348" y1="222" x2="448" y2="222" stroke="#00e67644" strokeWidth="1.5" />
            {/* plant rows inside */}
            {[352, 374, 396, 418, 440].map((px) => (
              <g key={px}>
                <line x1={px} y1="252" x2={px} y2="238" stroke="#00e676" strokeWidth="2" strokeLinecap="round" />
                <circle cx={px} cy="235" r="4" fill="#00e676" />
              </g>
            ))}
          </g>
          <text
            x="368"
            y="290"
            fill="#00e676"
            fontSize="16"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            FARMER
          </text>

          {/* ── Station 3: MEDIC (cross + scanner) ── */}
          <g filter="url(#s3-glow-work)">
            {/* robot */}
            <rect x="510" y="138" width="32" height="24" rx="6" fill="#1a1a2e" stroke="#ff2d7b" strokeWidth="2" />
            <rect x="518" y="147" width="16" height="6" rx="3" fill="#ff2d7b" />
            <rect x="506" y="166" width="40" height="50" rx="8" fill="#1a1a2e" stroke="#ff2d7b" strokeWidth="2" />
            {/* cross emblem on chest */}
            <rect x="521" y="178" width="10" height="26" fill="#ff2d7b" />
            <rect x="513" y="186" width="26" height="10" fill="#ff2d7b" />
            <rect x="512" y="216" width="10" height="36" fill="#1a1a2e" stroke="#ff2d7b" strokeWidth="2" />
            <rect x="530" y="216" width="10" height="36" fill="#1a1a2e" stroke="#ff2d7b" strokeWidth="2" />
            {/* scanner gate */}
            <path
              d="M 580 252 L 580 168 Q 580 152 596 152 L 644 152 Q 660 152 660 168 L 660 252"
              fill="none"
              stroke="#ff2d7b"
              strokeWidth="3"
            />
            {/* scan beam sweeping inside the gate */}
            <line x1="586" y1="206" x2="654" y2="206" stroke="#ff2d7b" strokeWidth="3" opacity="0.9" />
            <line x1="586" y1="192" x2="654" y2="192" stroke="#ff2d7b55" strokeWidth="2" />
            <line x1="586" y1="220" x2="654" y2="220" stroke="#ff2d7b55" strokeWidth="2" />
            {/* cross beacon above the gate */}
            <rect x="615" y="118" width="10" height="26" fill="#ff2d7b" />
            <rect x="607" y="126" width="26" height="10" fill="#ff2d7b" />
          </g>
          <text
            x="585"
            y="290"
            fill="#ff2d7b"
            fontSize="16"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            MEDIC
          </text>
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.6}
        style={{ maxWidth: "85%" }}
      >
        Machines <span className="grammar-future">will take over</span> the
        dangerous and boring jobs.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 3: New Jobs Will Appear ─── */
function NewJobsSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="gold" active={active}>
      <AnimatedText
        color="#ffc107"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        NEW JOBS WILL APPEAR
      </AnimatedText>

      {/* SVG: three job badge cards */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.3s both" }}>
        <svg viewBox="0 0 690 290" style={{ width: "88%", maxWidth: "760px" }}>
          <defs>
            <filter id="s3-glow-jobs">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Badge 1: AI TRAINER ── */}
          <g>
            <rect x="18" y="18" width="200" height="250" rx="16" fill="#12121e" stroke="#ffc107" strokeWidth="2" />
            <rect x="18" y="18" width="200" height="250" rx="16" fill="none" stroke="#ffc10733" strokeWidth="6" opacity="0.5" />
            {/* chip with circuit brain */}
            <g filter="url(#s3-glow-jobs)">
              <rect x="78" y="68" width="80" height="80" rx="10" fill="#1a1a2e" stroke="#ffc107" strokeWidth="2" />
              {[88, 104, 120, 136, 152].map((px) => (
                <g key={px}>
                  <line x1={px} y1="56" x2={px} y2="68" stroke="#ffc107" strokeWidth="2" />
                  <line x1={px} y1="148" x2={px} y2="160" stroke="#ffc107" strokeWidth="2" />
                </g>
              ))}
              {/* circuit nodes */}
              <circle cx="98" cy="92" r="4" fill="#ffc107" />
              <circle cx="138" cy="86" r="4" fill="#ffc107" />
              <circle cx="118" cy="112" r="5" fill="#ffc107" />
              <circle cx="96" cy="130" r="4" fill="#ffc107" />
              <circle cx="140" cy="128" r="4" fill="#ffc107" />
              <line x1="98" y1="92" x2="118" y2="112" stroke="#ffc107" strokeWidth="1.5" />
              <line x1="138" y1="86" x2="118" y2="112" stroke="#ffc107" strokeWidth="1.5" />
              <line x1="96" y1="130" x2="118" y2="112" stroke="#ffc107" strokeWidth="1.5" />
              <line x1="140" y1="128" x2="118" y2="112" stroke="#ffc107" strokeWidth="1.5" />
            </g>
            <text x="118" y="206" fill="#ffc107" fontSize="18" fontWeight="bold" fontFamily="var(--font-mono)" textAnchor="middle">
              AI
            </text>
            <text x="118" y="230" fill="#ffc107" fontSize="18" fontWeight="bold" fontFamily="var(--font-mono)" textAnchor="middle">
              TRAINER
            </text>
          </g>

          {/* ── Badge 2: DRONE TRAFFIC PILOT ── */}
          <g>
            <rect x="245" y="18" width="200" height="250" rx="16" fill="#12121e" stroke="#00e5ff" strokeWidth="2" />
            <rect x="245" y="18" width="200" height="250" rx="16" fill="none" stroke="#00e5ff33" strokeWidth="6" opacity="0.5" />
            <g filter="url(#s3-glow-jobs)">
              {/* crossing flight paths */}
              <path d="M 265 140 Q 345 60 425 130" fill="none" stroke="#00e5ff55" strokeWidth="2" strokeDasharray="6,5" />
              <path d="M 270 70 Q 345 150 420 75" fill="none" stroke="#00e5ff55" strokeWidth="2" strokeDasharray="6,5" />
              {/* drone */}
              <rect x="325" y="96" width="40" height="14" rx="7" fill="#1a1a2e" stroke="#00e5ff" strokeWidth="2" />
              <circle cx="345" cy="103" r="4" fill="#00e5ff" />
              <line x1="325" y1="100" x2="305" y2="88" stroke="#00e5ff" strokeWidth="2" />
              <line x1="365" y1="100" x2="385" y2="88" stroke="#00e5ff" strokeWidth="2" />
              <ellipse cx="305" cy="86" rx="14" ry="3.5" fill="none" stroke="#00e5ff" strokeWidth="2" />
              <ellipse cx="385" cy="86" rx="14" ry="3.5" fill="none" stroke="#00e5ff" strokeWidth="2" />
              {/* control waypoints */}
              <circle cx="278" cy="128" r="4" fill="#00e5ff" />
              <circle cx="412" cy="122" r="4" fill="#00e5ff" />
            </g>
            <text x="345" y="206" fill="#00e5ff" fontSize="18" fontWeight="bold" fontFamily="var(--font-mono)" textAnchor="middle">
              DRONE TRAFFIC
            </text>
            <text x="345" y="230" fill="#00e5ff" fontSize="18" fontWeight="bold" fontFamily="var(--font-mono)" textAnchor="middle">
              PILOT
            </text>
          </g>

          {/* ── Badge 3: COLONY DESIGNER ── */}
          <g>
            <rect x="472" y="18" width="200" height="250" rx="16" fill="#12121e" stroke="#00e676" strokeWidth="2" />
            <rect x="472" y="18" width="200" height="250" rx="16" fill="none" stroke="#00e67633" strokeWidth="6" opacity="0.5" />
            <g filter="url(#s3-glow-jobs)">
              {/* blueprint grid */}
              {[60, 84, 108, 132].map((gy) => (
                <line key={gy} x1="492" y1={gy} x2="652" y2={gy} stroke="#00e67622" strokeWidth="1" />
              ))}
              {[512, 542, 572, 602, 632].map((gx) => (
                <line key={gx} x1={gx} y1="48" x2={gx} y2="148" stroke="#00e67622" strokeWidth="1" />
              ))}
              {/* dome blueprint */}
              <path d="M 512 140 A 46 46 0 0 1 604 140" fill="none" stroke="#00e676" strokeWidth="2.5" />
              <line x1="558" y1="94" x2="558" y2="140" stroke="#00e67666" strokeWidth="1.5" />
              <line x1="522" y1="120" x2="594" y2="120" stroke="#00e67666" strokeWidth="1.5" />
              <line x1="500" y1="140" x2="640" y2="140" stroke="#00e676" strokeWidth="2.5" />
              {/* drafting compass */}
              <line x1="616" y1="64" x2="604" y2="104" stroke="#00e676" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="616" y1="64" x2="630" y2="102" stroke="#00e676" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="616" cy="62" r="4" fill="#00e676" />
            </g>
            <text x="572" y="206" fill="#00e676" fontSize="18" fontWeight="bold" fontFamily="var(--font-mono)" textAnchor="middle">
              COLONY
            </text>
            <text x="572" y="230" fill="#00e676" fontSize="18" fontWeight="bold" fontFamily="var(--font-mono)" textAnchor="middle">
              DESIGNER
            </text>
          </g>
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.6}
        style={{ maxWidth: "85%" }}
      >
        Your future job <span className="grammar-possibility">might</span> not
        exist yet — you <span className="grammar-future">are going to</span>{" "}
        invent it.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 4: An AI in Every Pocket ─── */
function AiHelpersSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="gold" active={active}>
      <AnimatedText
        color="#ffc107"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        AN AI IN EVERY POCKET
      </AnimatedText>

      {/* SVG: person with a glowing assistant orb */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.3s both" }}>
        <svg viewBox="0 0 600 330" style={{ width: "76%", maxWidth: "620px" }}>
          <defs>
            <filter id="s3-glow-orb">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="s3-orb-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff3c4" />
              <stop offset="45%" stopColor="#ffc107" />
              <stop offset="100%" stopColor="#ffc10711" />
            </radialGradient>
          </defs>

          {/* person silhouette */}
          <g>
            <circle cx="200" cy="120" r="38" fill="#1a1a2e" stroke="#ffc107" strokeWidth="2.5" />
            <path
              d="M 116 320 L 116 268 Q 116 206 200 206 Q 284 206 284 268 L 284 320 Z"
              fill="#1a1a2e"
              stroke="#ffc107"
              strokeWidth="2.5"
            />
            {/* collar light */}
            <circle cx="200" cy="236" r="5" fill="#ffc10788" />
          </g>

          {/* thought-lines connecting head to the orb */}
          <g>
            <path d="M 240 100 Q 300 70 360 86" fill="none" stroke="#ffc107" strokeWidth="2" strokeDasharray="7,6" opacity="0.8" />
            <path d="M 242 122 Q 305 112 362 110" fill="none" stroke="#ffc107" strokeWidth="2" strokeDasharray="7,6" opacity="0.55" />
            <path d="M 238 142 Q 302 152 364 132" fill="none" stroke="#ffc107" strokeWidth="2" strokeDasharray="7,6" opacity="0.35" />
            <circle cx="300" cy="71" r="3" fill="#ffc107" opacity="0.8" />
            <circle cx="305" cy="113" r="3" fill="#ffc107" opacity="0.55" />
            <circle cx="302" cy="151" r="3" fill="#ffc107" opacity="0.35" />
          </g>

          {/* assistant orb */}
          <g filter="url(#s3-glow-orb)">
            <circle cx="425" cy="108" r="56" fill="#ffc10712" />
            <circle cx="425" cy="108" r="42" fill="none" stroke="#ffc10766" strokeWidth="1.5" strokeDasharray="5,7" />
            <circle cx="425" cy="108" r="27" fill="url(#s3-orb-core)" />
            <ellipse cx="425" cy="108" rx="42" ry="12" fill="none" stroke="#ffc107" strokeWidth="1.5" opacity="0.7" />
            {/* sparkle rays */}
            {[
              [425, 38, 425, 52],
              [425, 164, 425, 178],
              [355, 108, 369, 108],
              [481, 108, 495, 108],
              [378, 61, 388, 71],
              [462, 145, 472, 155],
            ].map(([x1, y1, x2, y2], i) => (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#ffc107"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
          </g>
          <text
            x="425"
            y="205"
            fill="#ffc107"
            fontSize="15"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            your assistant
          </text>
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.6}
        style={{ maxWidth: "82%" }}
      >
        <span className="grammar-conditional">If you forget something</span>,
        your AI <span className="grammar-future">will remember</span> it for
        you.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 5: What If Machines Go Wrong? ─── */
function WhatIfRogueSlide({ active }: { active: boolean }) {
  return (
    <SlideLayout accent="gold" active={active}>
      <AnimatedText
        color="#ffc107"
        size="var(--slide-title)"
        glow
        weight={800}
        delay={0}
      >
        BUT WHAT IF MACHINES GO WRONG?
      </AnimatedText>

      {/* SVG: delivery drone, normal vs rogue state */}
      <div style={{ animation: "fade-in-up 0.6s ease 0.3s both" }}>
        <svg viewBox="0 0 660 300" style={{ width: "84%", maxWidth: "720px" }}>
          <defs>
            <filter id="s3-glow-rogue">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── State 1: drone online (green eye) ── */}
          <g filter="url(#s3-glow-rogue)">
            <line x1="136" y1="128" x2="96" y2="104" stroke="#9aa0b4" strokeWidth="3" />
            <line x1="204" y1="128" x2="244" y2="104" stroke="#9aa0b4" strokeWidth="3" />
            <ellipse cx="96" cy="100" rx="24" ry="5" fill="none" stroke="#00e676" strokeWidth="2.5" />
            <ellipse cx="244" cy="100" rx="24" ry="5" fill="none" stroke="#00e676" strokeWidth="2.5" />
            <rect x="130" y="122" width="80" height="32" rx="14" fill="#1a1a2e" stroke="#9aa0b4" strokeWidth="2.5" />
            {/* eye-light: green */}
            <circle cx="170" cy="138" r="9" fill="#00e676" />
            <circle cx="170" cy="138" r="14" fill="none" stroke="#00e67655" strokeWidth="2" />
            {/* landing legs + parcel */}
            <line x1="146" y1="154" x2="140" y2="172" stroke="#9aa0b4" strokeWidth="2.5" />
            <line x1="194" y1="154" x2="200" y2="172" stroke="#9aa0b4" strokeWidth="2.5" />
            <rect x="156" y="162" width="28" height="22" rx="3" fill="#1a1a2e" stroke="#00e676" strokeWidth="2" />
            <line x1="170" y1="162" x2="170" y2="184" stroke="#00e676" strokeWidth="1.5" />
          </g>
          <text
            x="170"
            y="230"
            fill="#00e676"
            fontSize="15"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            delivering... OK
          </text>

          {/* transition arrow */}
          <g>
            <line x1="290" y1="140" x2="362" y2="140" stroke="#ffc107" strokeWidth="3" strokeDasharray="8,6" />
            <path d="M 362 140 l -14 -8 v 16 Z" fill="#ffc107" />
            <text
              x="326"
              y="122"
              fill="#ffc107"
              fontSize="14"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              signal lost
            </text>
          </g>

          {/* ── State 2: drone rogue (red eye + warning marks) ── */}
          <g filter="url(#s3-glow-rogue)">
            <line x1="456" y1="128" x2="416" y2="104" stroke="#9aa0b4" strokeWidth="3" />
            <line x1="524" y1="128" x2="564" y2="104" stroke="#9aa0b4" strokeWidth="3" />
            <ellipse cx="416" cy="100" rx="24" ry="5" fill="none" stroke="#ff2d7b" strokeWidth="2.5" transform="rotate(-8 416 100)" />
            <ellipse cx="564" cy="100" rx="24" ry="5" fill="none" stroke="#ff2d7b" strokeWidth="2.5" transform="rotate(8 564 100)" />
            <rect x="450" y="122" width="80" height="32" rx="14" fill="#1a1a2e" stroke="#ff2d7b" strokeWidth="2.5" />
            {/* eye-light: red, wide */}
            <circle cx="490" cy="138" r="9" fill="#ff2d7b" />
            <circle cx="490" cy="138" r="14" fill="none" stroke="#ff2d7b" strokeWidth="2" />
            <circle cx="490" cy="138" r="19" fill="none" stroke="#ff2d7b44" strokeWidth="2" />
            {/* legs bent, parcel dropped */}
            <line x1="466" y1="154" x2="454" y2="170" stroke="#9aa0b4" strokeWidth="2.5" />
            <line x1="514" y1="154" x2="528" y2="168" stroke="#9aa0b4" strokeWidth="2.5" />
            <rect x="500" y="180" width="26" height="20" rx="3" fill="#1a1a2e" stroke="#ff2d7b55" strokeWidth="2" transform="rotate(18 513 190)" />
            {/* glitch sparks */}
            <polyline points="448,112 438,122 446,126 434,138" fill="none" stroke="#ffc107" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="534,116 544,124 536,130 548,140" fill="none" stroke="#ffc107" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* warning triangle */}
            <path d="M 490 44 L 514 84 L 466 84 Z" fill="#1a1a2e" stroke="#ff2d7b" strokeWidth="2.5" strokeLinejoin="round" />
            <line x1="490" y1="56" x2="490" y2="70" stroke="#ff2d7b" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="490" cy="77" r="2.5" fill="#ff2d7b" />
          </g>
          <text
            x="490"
            y="230"
            fill="#ff2d7b"
            fontSize="15"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            ROGUE MODE
          </text>
        </svg>
      </div>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-body)"
        delay={0.6}
        style={{ maxWidth: "85%" }}
      >
        <span className="grammar-conditional">If a swarm loses control</span>,
        someone <span className="grammar-future">will have to</span> defend the
        city. That someone is YOU.
      </AnimatedText>
    </SlideLayout>
  );
}

/* ─── Slide 6: Drone Defense Intro ─── */
function DroneDefenseIntroSlide({ active }: { active: boolean }) {
  // Rogue swarm positions: three staggered rows
  const swarmRows: { y: number; xs: number[] }[] = [
    { y: 36, xs: [120, 220, 320, 420, 520, 620] },
    { y: 76, xs: [170, 270, 370, 470, 570] },
    { y: 116, xs: [120, 220, 320, 420, 520, 620] },
  ];

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
        DRONE DEFENSE
      </AnimatedText>

      <AnimatedText
        color="var(--text-primary)"
        size="var(--slide-subtitle)"
        delay={0.4}
      >
        Stop the rogue swarm before it reaches the city!
      </AnimatedText>

      {/* Swarm above the city, held back by the defense line */}
      <div
        style={{
          width: "82%",
          maxWidth: "740px",
          marginTop: "1.5rem",
          animation: "fade-in-up 0.6s ease 0.7s both",
        }}
      >
        <svg viewBox="0 0 720 260" style={{ width: "100%" }}>
          <defs>
            <linearGradient id="s3-dd-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff2d7b10" />
              <stop offset="60%" stopColor="transparent" />
            </linearGradient>
            <filter id="s3-glow-dd">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect x="0" y="0" width="720" height="260" fill="url(#s3-dd-sky)" />

          {/* rogue swarm rows */}
          {swarmRows.map((row) =>
            row.xs.map((cx) => (
              <g key={`${row.y}-${cx}`}>
                <line x1={cx - 9} y1={row.y - 5} x2={cx - 16} y2={row.y - 10} stroke="#ff2d7b88" strokeWidth="1.5" />
                <line x1={cx + 9} y1={row.y - 5} x2={cx + 16} y2={row.y - 10} stroke="#ff2d7b88" strokeWidth="1.5" />
                <ellipse cx={cx - 17} cy={row.y - 11} rx="7" ry="2" fill="none" stroke="#ff2d7b88" strokeWidth="1.5" />
                <ellipse cx={cx + 17} cy={row.y - 11} rx="7" ry="2" fill="none" stroke="#ff2d7b88" strokeWidth="1.5" />
                <rect x={cx - 10} y={row.y - 5} width="20" height="10" rx="5" fill="#1a1a2e" stroke="#ff2d7b" strokeWidth="1.5" />
                <circle cx={cx} cy={row.y} r="2.8" fill="#ff2d7b" />
              </g>
            )),
          )}

          {/* glowing defense line */}
          <g filter="url(#s3-glow-dd)">
            <line x1="20" y1="158" x2="700" y2="158" stroke="#ffc107" strokeWidth="3" />
            {[80, 200, 320, 440, 560, 680].map((sx) => (
              <g key={sx}>
                <circle cx={sx} cy="158" r="6" fill="#0a0a0f" stroke="#ffc107" strokeWidth="2.5" />
                <line x1={sx} y1="146" x2={sx} y2="136" stroke="#ffc107" strokeWidth="2" />
              </g>
            ))}
          </g>
          <text
            x="660"
            y="182"
            fill="#ffc107"
            fontSize="13"
            fontFamily="var(--font-mono)"
            textAnchor="end"
            opacity="0.85"
          >
            defense line
          </text>

          {/* city skyline */}
          <g>
            <line x1="0" y1="252" x2="720" y2="252" stroke="#ffc10755" strokeWidth="2" />
            {[
              [30, 206, 52],
              [96, 192, 44],
              [154, 214, 60],
              [228, 186, 50],
              [292, 200, 64],
              [370, 178, 46],
              [430, 208, 56],
              [500, 190, 48],
              [562, 212, 58],
              [634, 196, 52],
            ].map(([bx, by, bw], i) => (
              <rect
                key={i}
                x={bx}
                y={by}
                width={bw}
                height={252 - by}
                fill="#1a1a2e"
                stroke="#ffc10744"
                strokeWidth="1"
              />
            ))}
            {/* scattered windows */}
            {[
              [42, 216], [58, 228], [106, 202], [168, 224], [240, 196],
              [256, 210], [306, 212], [322, 228], [380, 190], [442, 218],
              [510, 200], [576, 222], [592, 236], [646, 206], [662, 220],
            ].map(([wx, wy], i) => (
              <rect key={i} x={wx} y={wy} width="6" height="8" fill="#ffc10744" />
            ))}
            {/* antenna on the tallest tower */}
            <line x1="393" y1="178" x2="393" y2="162" stroke="#ffc107" strokeWidth="2" />
            <circle cx="393" cy="160" r="2.5" fill="#ffc107" />
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

/* ─── Slide 7: Drone Defense Leaderboard ─── */
function DroneDefenseLeaderboardSlide({ active }: { active: boolean }) {
  const session = useQuery(api.sessions.getCurrent);
  return (
    <SlideLayout accent="gold" active={active}>
      {session ? (
        <GameLeaderboard
          sessionId={session._id}
          game="droneDefense"
          title="DRONE DEFENSE LEADERBOARD"
          accent="#ffc107"
          scoreUnit="pts"
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
    id: "robots-title",
    section: 3,
    accent: "gold",
    component: RobotsTitleSlide,
  },
  {
    id: "robots-at-work",
    section: 3,
    accent: "gold",
    component: RobotsAtWorkSlide,
  },
  {
    id: "new-jobs",
    section: 3,
    accent: "gold",
    component: NewJobsSlide,
  },
  {
    id: "ai-helpers",
    section: 3,
    accent: "gold",
    component: AiHelpersSlide,
  },
  {
    id: "what-if-rogue",
    section: 3,
    accent: "gold",
    component: WhatIfRogueSlide,
  },
  {
    id: "dronedefense-intro",
    section: 3,
    accent: "gold",
    component: DroneDefenseIntroSlide,
    studentEvent: "droneDefense",
  },
  {
    id: "dronedefense-leaderboard",
    section: 3,
    accent: "gold",
    component: DroneDefenseLeaderboardSlide,
    studentEvent: "droneDefense",
  },
];
