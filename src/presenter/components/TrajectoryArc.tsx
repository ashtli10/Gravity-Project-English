interface TrajectoryArcProps {
  startX: number;
  startY: number;
  peakHeight: number;
  distance: number;
  color: string;
  animated?: boolean;
  showGravityVector?: boolean;
}

export default function TrajectoryArc({
  startX, startY, peakHeight, distance, color,
  animated = true, showGravityVector = false,
}: TrajectoryArcProps) {
  const midX = startX + distance / 2;
  const endX = startX + distance;
  const peakY = startY - peakHeight;

  const path = `M ${startX} ${startY} Q ${midX} ${peakY} ${endX} ${startY}`;
  const totalLength = 1000;

  return (
    <g>
      {/* Arc path */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeDasharray={animated ? totalLength : "none"}
        strokeDashoffset={animated ? totalLength : 0}
        filter={`drop-shadow(0 0 8px ${color})`}
        style={animated ? {
          animation: `draw-line 1.5s ease forwards`,
        } : undefined}
      />
      {/* Dotted extension showing gravity pull */}
      {showGravityVector && (
        <>
          <line
            x1={midX} y1={peakY} x2={midX} y2={startY + 30}
            stroke="#ff2d7b"
            strokeWidth={2}
            strokeDasharray="5,5"
            opacity={0.7}
          />
          <text
            x={midX + 15} y={(peakY + startY) / 2}
            fill="#ff2d7b"
            fontSize="12"
            fontFamily="var(--font-mono)"
          >
            9.8 m/s²
          </text>
        </>
      )}
      {/* Start and end dots */}
      <circle cx={startX} cy={startY} r={5} fill={color} />
      <circle cx={endX} cy={startY} r={5} fill={color} />
    </g>
  );
}
