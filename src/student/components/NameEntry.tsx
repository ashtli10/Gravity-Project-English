import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface NameEntryProps {
  sessionId: Id<"sessions"> | null;
  voterId: string;
  onRegistered: (name: string) => void;
}

export default function NameEntry({
  sessionId,
  voterId,
  onRegistered,
}: NameEntryProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const registerName = useMutation(api.leaderboard.registerName);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (trimmed.length > 16) {
      setError("Name must be 16 characters or less");
      return;
    }

    if (!sessionId) {
      // No session yet — save locally, will register when session appears
      localStorage.setItem("gravity-player-name", trimmed);
      onRegistered(trimmed);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await registerName({ sessionId, voterId, name: trimmed });
      localStorage.setItem("gravity-player-name", trimmed);
      onRegistered(trimmed);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      if (msg.includes("already taken")) {
        setError("That name is taken — try another!");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

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
        padding: "2rem",
        gap: "1.5rem",
      }}
    >
      <div
        style={{
          fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
          fontWeight: 900,
          color: "#00e5ff",
          textShadow: "0 0 20px #00e5ff80, 0 0 40px #00e5ff40",
          textAlign: "center",
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
          marginBottom: "0.5rem",
        }}
      />

      <div
        style={{
          fontSize: "clamp(1rem, 3vw, 1.3rem)",
          color: "#e0e0e8",
          textAlign: "center",
        }}
      >
        Enter your name to join
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%",
          maxWidth: "360px",
        }}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !submitting) handleSubmit();
          }}
          maxLength={16}
          placeholder="Your name..."
          autoFocus
          style={{
            padding: "1rem 1.2rem",
            fontSize: "1.3rem",
            fontWeight: 600,
            background: "#12121a",
            color: "#e0e0e8",
            border: error
              ? "2px solid #ff2d7b"
              : "2px solid #00e5ff40",
            borderRadius: "12px",
            outline: "none",
            textAlign: "center",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            boxShadow: error
              ? "0 0 15px #ff2d7b30"
              : "0 0 15px #00e5ff15",
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = "#00e5ff";
              e.target.style.boxShadow = "0 0 20px #00e5ff30";
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = "#00e5ff40";
              e.target.style.boxShadow = "0 0 15px #00e5ff15";
            }
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.8rem",
            color: name.trim().length > 14 ? "#ffc107" : "#ffffff30",
            fontFamily: "monospace",
            padding: "0 0.3rem",
          }}
        >
          <span>{error ? "" : "\u00A0"}</span>
          <span>{name.trim().length}/16</span>
        </div>

        {error && (
          <div
            style={{
              fontSize: "0.95rem",
              color: "#ff2d7b",
              textAlign: "center",
              textShadow: "0 0 8px #ff2d7b40",
              animation: "fade-in 0.2s ease",
              marginTop: "-0.5rem",
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || name.trim().length < 2}
          style={{
            padding: "1rem",
            fontSize: "1.2rem",
            fontWeight: 700,
            background:
              name.trim().length >= 2
                ? "linear-gradient(135deg, #00e5ff20, #00e5ff10)"
                : "#12121a",
            color: name.trim().length >= 2 ? "#00e5ff" : "#ffffff30",
            border:
              name.trim().length >= 2
                ? "2px solid #00e5ff"
                : "2px solid #ffffff15",
            borderRadius: "12px",
            cursor:
              submitting || name.trim().length < 2
                ? "default"
                : "pointer",
            transition: "all 0.2s ease",
            boxShadow:
              name.trim().length >= 2
                ? "0 0 20px #00e5ff30"
                : "none",
            letterSpacing: "0.05em",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? "Joining..." : "JOIN"}
        </button>
      </div>

      {!sessionId && (
        <div
          style={{
            fontSize: "0.85rem",
            color: "#ffffff40",
            textAlign: "center",
            marginTop: "1rem",
          }}
        >
          Waiting for presenter to start...
        </div>
      )}
    </div>
  );
}
