import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useCallback, useEffect } from "react";
import LookUp from "./components/LookUp";
import WaitingScreen from "./components/WaitingScreen";
import PollView from "./components/PollView";
import NameEntry from "./components/NameEntry";
import TechMerge from "../games/TechMerge";
import SkyClimb from "../games/SkyClimb";
import DroneDefense from "../games/DroneDefense";
import ShieldCommand from "../games/ShieldCommand";

function getVoterId(): string {
  const stored = localStorage.getItem("frontier-voter-id");
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem("frontier-voter-id", id);
  return id;
}

function getStoredName(): string | null {
  return localStorage.getItem("frontier-player-name") || null;
}

export default function StudentView() {
  const session = useQuery(api.sessions.getCurrent);
  const [voterId] = useState(getVoterId);
  const [playerName, setPlayerName] = useState<string | null>(getStoredName);
  const submitScore = useMutation(api.leaderboard.submitScore);
  const registerName = useMutation(api.leaderboard.registerName);

  // Re-register name to Convex when a new session appears (handles session recreation)
  useEffect(() => {
    if (session && session.isActive && playerName) {
      registerName({
        sessionId: session._id,
        voterId,
        name: playerName,
      }).catch(() => {
        // Name might be taken in the new session — clear so user re-enters
        localStorage.removeItem("frontier-player-name");
        setPlayerName(null);
      });
    }
  }, [session?._id]);

  const handleScore = useCallback(
    (game: "techMerge" | "skyClimb" | "droneDefense" | "shieldCommand") =>
      (score: number) => {
        if (!session || !playerName) return;
        submitScore({
          sessionId: session._id,
          voterId,
          playerName,
          game,
          rawScore: score,
        });
      },
    [session?._id, voterId, playerName, submitScore]
  );

  // Name gate — must register before participating
  if (!playerName) {
    return (
      <NameEntry
        sessionId={session?.isActive ? session._id : null}
        voterId={voterId}
        onRegistered={(name) => setPlayerName(name)}
      />
    );
  }

  if (!session || !session.isActive) {
    return <WaitingScreen />;
  }

  const event = session.activeEvent;
  if (!event) {
    if (session.slideIndex === 0) return <WaitingScreen />;
    return <LookUp />;
  }

  // Games keep running across game→leaderboard slides (same event type persists).
  // Non-game events use triggeredAt as key so they reset when re-triggered.
  const eventKey = String(event.triggeredAt);

  switch (event.type) {
    case "lookUp":
      return <LookUp />;
    case "techMerge":
      return <TechMerge onGameOver={handleScore("techMerge")} />;
    case "skyClimb":
      return <SkyClimb onGameOver={handleScore("skyClimb")} />;
    case "droneDefense":
      return <DroneDefense onGameOver={handleScore("droneDefense")} />;
    case "shieldCommand":
      return <ShieldCommand onGameOver={handleScore("shieldCommand")} />;
    case "poll":
      return <PollView key={eventKey} sessionId={session._id} voterId={voterId} />;
    default:
      return <LookUp />;
  }
}
