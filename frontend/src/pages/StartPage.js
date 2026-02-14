import React, { useState } from "react";
import { startInterview } from "../api";

function StartPage({ setSessionId, setQuestion }) {
  const [role, setRole] = useState("Backend Developer");

  const handleStart = async () => {
    const res = await startInterview(role);
    setSessionId(res.data.sessionId);
    setQuestion(res.data.firstQuestion);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>AI Interview System</h2>

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option>Backend Developer</option>
        <option>Frontend Developer</option>
        <option>Full Stack Developer</option>
      </select>

      <br /><br />
      <button onClick={handleStart}>Start Interview</button>
    </div>
  );
}

export default StartPage;
