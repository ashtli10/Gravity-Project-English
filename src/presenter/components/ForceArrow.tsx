interface ForceArrowProps {
  x: number;
  y: number;
  angle: number; // degrees, 0 = right, 90 = down
  length: number;
  color: string;
  label?: string;
  delay?: number;
  thickness?: number;
}

export default function ForceArrow({
  x, y, angle, length, color, label, delay = 0, thickness = 3,
}: ForceArrowProps) {
  const rad = (angle * Math.PI) / 180;
  const endX = x + Math.cos(rad) * length;
  const endY = y + Math.sin(rad) * length;
  const headLen = 12;
  const h1x = endX - Math.cos(rad - 0.4) * headLen;
  const h1y = endY - Math.sin(rad - 0.4) * headLen;
  const h2x = endX - Math.cos(rad + 0.4) * headLen;
  const h2y = endY - Math.sin(rad + 0.4) * headLen;
  const midX = (x + endX) / 2;
  const midY = (y + endY) / 2;

  return (
    <g style={{ animation: `fade-in 0.5s ease ${delay}s both` }}>
      <line
        x1={x} y1={y} x2={endX} y2={endY}
        stroke={color} strokeWidth={thickness}
        strokeLinecap="round"
        filter={`drop-shadow(0 0 6px ${color})`}
      />
      <polygon
        points={`${endX},${endY} ${h1x},${h1y} ${h2x},${h2y}`}
        fill={color}
        filter={`drop-shadow(0 0 6px ${color})`}
      />
      {label && (
        <text
          x={midX + Math.cos(rad + Math.PI / 2) * 20}
          y={midY + Math.sin(rad + Math.PI / 2) * 20}
          fill={color}
          fontSize="14"
          fontFamily="var(--font-mono)"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
}
