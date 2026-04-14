// ==========================================
// CHANGE THIS URL TO YOUR YOUTUBE VIDEO
// ==========================================
const YOUTUBE_VIDEO_ID = "dQw4w9WgXcQ"; // Replace with your parkour video ID
// ==========================================

export default function VideoEmbed() {
  return (
    <div style={{
      width: "85vw",
      maxWidth: "960px",
      aspectRatio: "16 / 9",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 0 40px rgba(255, 45, 123, 0.3)",
      border: "1px solid rgba(255, 45, 123, 0.3)",
    }}>
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
        title="Parkour Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ border: "none" }}
      />
    </div>
  );
}
