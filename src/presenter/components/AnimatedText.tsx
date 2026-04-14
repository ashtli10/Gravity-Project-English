import { CSSProperties, ReactNode } from "react";

interface AnimatedTextProps {
  children: ReactNode;
  color?: string;
  size?: string;
  glow?: boolean;
  delay?: number;
  weight?: number;
  style?: CSSProperties;
  mono?: boolean;
}

export default function AnimatedText({
  children,
  color = "var(--text-primary)",
  size = "var(--slide-body)",
  glow = false,
  delay = 0,
  weight = 400,
  style = {},
  mono = false,
}: AnimatedTextProps) {
  return (
    <div
      style={{
        fontSize: size,
        color,
        fontWeight: weight,
        fontFamily: mono ? "var(--font-mono)" : "var(--font-display)",
        textShadow: glow ? `0 0 20px ${color}, 0 0 40px ${color}` : "none",
        animation: `fade-in-up 0.6s ease ${delay}s both`,
        textAlign: "center",
        lineHeight: 1.4,
        maxWidth: "90%",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
