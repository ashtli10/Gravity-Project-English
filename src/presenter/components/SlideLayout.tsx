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
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: justify,
        alignItems: "center",
        padding: "3rem 4rem",
        background: `radial-gradient(ellipse at 50% 80%, ${color}08 0%, #0a0a0f 70%)`,
        position: "relative",
        overflow: "hidden",
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
      {children}
    </div>
  );
}
