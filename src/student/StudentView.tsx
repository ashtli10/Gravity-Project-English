import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import LookUp from "./components/LookUp";
import WaitingScreen from "./components/WaitingScreen";
import DropTest from "./components/DropTest";
import VideoQuiz from "./components/VideoQuiz";
import PollView from "./components/PollView";
import RooftopRun from "../games/RooftopRun";
import PlanetaryParkour from "../games/PlanetaryParkour";
import GravitySurge from "../games/GravitySurge";
import WallClimber from "../games/WallClimber";

function getVoterId(): string {
  const stored = localStorage.getItem("gravity-voter-id");
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem("gravity-voter-id", id);
  return id;
}

export default function StudentView() {
  const session = useQuery(api.sessions.getCurrent);
  const [voterId] = useState(getVoterId);

  if (!session || !session.isActive) {
    return <WaitingScreen />;
  }

  const event = session.activeEvent;
  if (!event) {
    // First slide (title) = play while waiting. Other slides = look at the screen.
    if (session.slideIndex === 0) return <WaitingScreen />;
    return <LookUp />;
  }

  switch (event.type) {
    case "lookUp":
      return <LookUp />;
    case "dropTest_vacuum":
      return <DropTest mode="vacuum" />;
    case "dropShow_vacuum":
      return <DropTest mode="vacuum" showDrop />;
    case "dropTest_air":
      return <DropTest mode="air" />;
    case "dropShow_air":
      return <DropTest mode="air" showDrop />;
    case "moveSpotter":
      return <VideoQuiz />;
    case "rooftopRun":
      return <RooftopRun />;
    case "planetaryParkour":
      return <PlanetaryParkour />;
    case "gravitySurge":
      return <GravitySurge />;
    case "wallClimber":
      return <WallClimber />;
    case "poll":
      return <PollView sessionId={session._id} voterId={voterId} />;
    default:
      return <LookUp />;
  }
}
