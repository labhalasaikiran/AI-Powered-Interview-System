import React, { useState } from "react";
import axios from "axios";

function StartInterview({ setSessionData }) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [error, setError] = useState("");

  const handleStart = async () => {
    if (!fullName || !role || !experience) {
      setError("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/interview/start", {
        fullName,
        role,
        experience
      });

      setSessionData(res.data); // pass sessionId + first question
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={containerStyle}>
      <h1>AI Interview System</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: 20 }}>
        <label>Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter full name"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>Job Role</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Backend Developer"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>Experience Level</label>
        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select Experience</option>
          <option value="0-1">0-1 Years (Beginner)</option>
          <option value="1-3">1-3 Years (Junior)</option>
          <option value="3-5">3-5 Years (Mid-Level)</option>
          <option value="5+">5+ Years (Senior)</option>
        </select>
      </div>

      <button onClick={handleStart} style={buttonStyle}>
        Start Interview
      </button>
    </div>
  );
}

const containerStyle = {
  maxWidth: 500,
  margin: "100px auto",
  padding: 40,
  borderRadius: 12,
  background: "#ffffff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  fontFamily: "Arial"
};

const inputStyle = {
  width: "100%",
  padding: 10,
  marginTop: 5,
  borderRadius: 6,
  border: "1px solid #ccc"
};

const buttonStyle = {
  padding: "12px 20px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};

export default StartInterview;
