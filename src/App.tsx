import { Routes, Route } from "react-router-dom";
import PresenterView from "./presenter/PresenterView";
import StudentView from "./student/StudentView";

export default function App() {
  return (
    <Routes>
      <Route path="/presenter" element={<PresenterView />} />
      <Route path="/student" element={<StudentView />} />
      <Route path="/" element={<StudentView />} />
    </Routes>
  );
}
