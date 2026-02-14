import React, { useEffect, useState } from "react";

function AdminDashboard() {
  const [audits, setAudits] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/drift")
      .then(res => res.json())
      .then(data => setAudits(data));
  }, []);

  return (
    <div>
      <h1>Drift Monitoring</h1>
      {audits.map((a, i) => (
        <p key={i}>Avg Score: {a.averageScore}</p>
      ))}
    </div>
  );
}

export default AdminDashboard;
