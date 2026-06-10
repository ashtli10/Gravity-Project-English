import { ReactNode } from "react";

interface SlideLayoutProps {
  accent: "cyan" | "pink" | "gold" | "green" | "mixed";
  children: ReactNode;
  active: boolean;
  justify?: "center" | "flex-start" | "flex-end" | "space-between" | "space-around";
}

const accentColors: Record<string, string> = {
  cyan: "#00e5ff",
  pink: "#ff2d7b",
  gold: "#ffc107",
  green: "#00e676",
  mixed: "#b388ff",
};

export default function SlideLayout({ accent, children, active, justify = "center" }: SlideLayoutProps) {
  const color = accentColors[accent];

  return (
    // Scroll container (block flow): if a slide's content is taller than the
    // viewport it scrolls instead of clipping; scrollbar is hidden globally.
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        background: `radial-gradient(ellipse at 50% 80%, ${color}08 0%, #0a0a0f 70%)`,
        position: "relative",
      }}
    >
      {/* Subtle accent glow at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.4,
        }}
      />
      {/* Content: min-height 100% centers vertically when it fits, grows (and
          lets the parent scroll) when it doesn't — so nothing ever clips. */}
      <div
        style={{
          minHeight: "100%",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: justify,
          alignItems: "center",
          gap: "clamp(0.6rem, 1.6vh, 1.4rem)",
          padding: "clamp(1.25rem, 4vh, 3rem) clamp(1rem, 4vw, 4rem)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
