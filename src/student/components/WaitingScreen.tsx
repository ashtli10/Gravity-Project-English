export default function WaitingScreen() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0a0a0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
      }}
    >
      <div
        style={{
          fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
          fontWeight: 900,
          color: "#00e5ff",
          textShadow: "0 0 20px #00e5ff80, 0 0 40px #00e5ff40",
          letterSpacing: "0.05em",
        }}
      >
        DEFYING GRAVITY
      </div>
      <div
        style={{
          width: "40%",
          maxWidth: "200px",
          height: "3px",
          background:
            "linear-gradient(90deg, transparent, #00e5ff, transparent)",
        }}
      />
      <div
        style={{
          fontSize: "1.1rem",
          color: "#ffffff50",
          textAlign: "center",
        }}
      >
        Waiting for the presentation to start...
      </div>
    </div>
  );
}
