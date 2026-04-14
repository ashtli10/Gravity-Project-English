const planets = [
  { name: "Moon", gravity: 1.6, color: "#8888a0", emoji: "\u{1F319}" },
  { name: "Mars", gravity: 3.7, color: "#ff6b35", emoji: "\u{1F534}" },
  { name: "Earth", gravity: 9.8, color: "#00e676", emoji: "\u{1F30D}" },
  { name: "Jupiter", gravity: 24.8, color: "#ffc107", emoji: "\u{1F7E0}" },
];

export default function PlanetComparison() {
  const maxG = 24.8;

  return (
    <div style={{
      display: "flex",
      gap: "2rem",
      alignItems: "flex-end",
      height: "50vh",
      padding: "2rem",
    }}>
      {planets.map((planet, i) => {
        const height = (planet.gravity / maxG) * 100;
        return (
          <div
            key={planet.name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              animation: `fade-in-up 0.6s ease ${i * 0.15}s both`,
            }}
          >
            <span style={{
              fontSize: "var(--slide-small)",
              color: planet.color,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              textShadow: `0 0 10px ${planet.color}`,
            }}>
              {planet.gravity} m/s²
            </span>
            <div style={{
              width: "clamp(3rem, 8vw, 5rem)",
              height: `${height}%`,
              background: `linear-gradient(to top, ${planet.color}40, ${planet.color})`,
              borderRadius: "8px 8px 0 0",
              boxShadow: `0 0 20px ${planet.color}40`,
              transition: "height 1s ease",
              minHeight: "20px",
            }} />
            <span style={{ fontSize: "2rem" }}>{planet.emoji}</span>
            <span style={{
              fontSize: "var(--slide-small)",
              color: "var(--text-primary)",
              fontWeight: 600,
            }}>
              {planet.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
