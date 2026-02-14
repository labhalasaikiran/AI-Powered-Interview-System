 import React, { useState } from "react";
import axios from "axios";

function StartPage({ onStart }) {
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
      const res = await axios.post(
        "http://localhost:5000/api/interview/start",
        {
          fullName,
          role,
          experience,
        }
      );

      // 🔥 THIS IS IMPORTANT
      onStart(res.data.sessionId, res.data.firstQuestion);

    } catch (err) {
      console.log(err);
      setError("Failed to start interview");
    }
  };

  return (
    <div style={containerStyle}>
      <h1>AI Interview System</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Job Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={inputStyle}
      />

      <select
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        style={inputStyle}
      >
        <option value="">Select Experience</option>
        <option value="0-1">0-1 Years</option>
        <option value="1-3">1-3 Years</option>
        <option value="3-5">3-5 Years</option>
        <option value="5+">5+ Years</option>
      </select>

      <button onClick={handleStart} style={buttonStyle}>
        Start Interview
      </button>
    </div>
  );
}

const containerStyle = {
  maxWidth: 500,
  margin: "120px auto",
  padding: 40,
  background: "white",
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
};

const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 15,
  borderRadius: 6,
  border: "1px solid #ccc"
};

const buttonStyle = {
  width: "100%",
  padding: 12,
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};

export default StartPage;
