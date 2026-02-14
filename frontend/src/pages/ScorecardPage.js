import React, { useEffect, useState } from "react";
import { getScorecard } from "../api";

function ScorecardPage({ sessionId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchScorecard = async () => {
      const res = await getScorecard(sessionId);
      setData(res.data);
    };

    fetchScorecard();
  }, [sessionId]);

  if (!data) {
    return <div style={{ padding: 40 }}>Generating Final Report...</div>;
  }

  return (
    <div style={containerStyle}>
      <h1>Interview Evaluation Report</h1>

      <p><strong>Role:</strong> {data.role}</p>
      <p><strong>Total Questions:</strong> {data.totalQuestions}</p>
      <p><strong>Overall Average:</strong> {data.overallAverage} / 10</p>
      <p><strong>Recommendation:</strong> {data.recommendation}</p>

      <hr />

      <h2>Competency Breakdown</h2>
      <table style={tableStyle}>
        <tbody>
          {Object.entries(data.competencyBreakdown).map(([key, value]) => (
            <tr key={key}>
              <td style={cellStyle}>{key.replace("_", " ")}</td>
              <td style={cellStyle}>{value} / 10</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Strengths</h2>
      <ul>
        {data.strengths.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>

      <h2>Risks</h2>
      <ul>
        {data.risks.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

const containerStyle = {
  maxWidth: 900,
  margin: "40px auto",
  padding: 30,
  background: "#ffffff",
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  fontFamily: "Arial"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const cellStyle = {
  padding: 10,
  border: "1px solid #ddd"
};

export default ScorecardPage;
