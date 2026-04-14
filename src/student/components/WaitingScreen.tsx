import WallClimber from "../../games/WallClimber";

export default function WaitingScreen() {
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#0a0a0f",
      display: "flex",
      flexDirection: "column",
      position: "relative",
    }}>
      <div style={{
        padding: "1rem",
        textAlign: "center",
        color: "#b388ff",
        fontSize: "1.2rem",
        fontWeight: 600,
        textShadow: "0 0 15px #b388ff",
        zIndex: 10,
      }}>
        Waiting for presentation... Play while you wait!
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <WallClimber />
      </div>
    </div>
  );
}
