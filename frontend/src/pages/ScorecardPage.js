import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { scorecardAPI } from "../api";
import "./ScorecardPage.css";

function ScorecardPage() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await scorecardAPI.getScorecard(sessionId);
        setReport(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch scorecard:", err);
        setLoading(false);
      }
    };

    if (location.state?.report) {
      setReport(location.state.report);
      setLoading(false);
    } else {
      fetchReport();
    }
  }, [sessionId, location.state]);

  const handleDownloadReport = async () => {
    try {
      const response = await scorecardAPI.downloadPDF(report);
      
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Interview_Report_${sessionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download report:", error);
      alert("Failed to download report. Please try again.");
    }
  };

  const handleRetake = () => {
    navigate("/interview-setup");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Generating Your Report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="error-container">
        <h2>Error Loading Report</h2>
        <p>We couldn't load your interview report. Please try again.</p>
        <button onClick={() => navigate("/")} className="home-btn">
          Back to Home
        </button>
      </div>
    );
  }

  const calculateGrade = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#4CAF50";
    if (score >= 60) return "#FF9800";
    return "#f44336";
  };

  return (
    <div className="scorecard-container">
      <div className="report-header">
        <div className="header-content">
          <h1>Interview Performance Report</h1>
          <p className="report-date">
            Interview Date: {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="header-actions">
          <button className="download-btn" onClick={handleDownloadReport}>
            📥 Download Report
          </button>
          <button className="retake-btn" onClick={handleRetake}>
            🔄 Retake Interview
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Detailed Analysis
        </button>
        <button
          className={`tab ${activeTab === "proctoring" ? "active" : ""}`}
          onClick={() => setActiveTab("proctoring")}
        >
          Proctoring Report
        </button>
        <button
          className={`tab ${activeTab === "feedback" ? "active" : ""}`}
          onClick={() => setActiveTab("feedback")}
        >
          Feedback & Recommendations
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="tab-content">
          <div className="score-grid">
            <div className="score-card primary">
              <div className="score-value" style={{ color: getScoreColor(report.totalScore || 0) }}>
                {report.totalScore || 0}
              </div>
              <div className="score-label">Overall Score</div>
              <div className="score-grade">Grade: {calculateGrade(report.totalScore || 0)}</div>
            </div>

            <div className="score-card">
              <div className="score-value" style={{ color: getScoreColor(report.technicalScore || 0) }}>
                {report.technicalScore || 0}
              </div>
              <div className="score-label">Technical Skills</div>
            </div>

            <div className="score-card">
              <div className="score-value" style={{ color: getScoreColor(report.communicationScore || 0) }}>
                {report.communicationScore || 0}
              </div>
              <div className="score-label">Communication</div>
            </div>

            <div className="score-card">
              <div className="score-value" style={{ color: getScoreColor(report.integrityScore || 100) }}>
                {report.integrityScore || 100}
              </div>
              <div className="score-label">Proctoring Integrity</div>
            </div>
          </div>

          <div className="summary-section">
            <h3>Interview Summary</h3>
            <div className="summary-content">
              <div className="summary-item">
                <span className="label">📝 Role Applied For:</span>
                <span className="value">{report.role || "Not specified"}</span>
              </div>
              <div className="summary-item">
                <span className="label">📊 Experience Level:</span>
                <span className="value">{report.experience || "Not specified"}</span>
              </div>
              <div className="summary-item">
                <span className="label">❓ Questions Answered:</span>
                <span className="value">{report.questionsAnswered || 0} / {report.totalQuestions || 3}</span>
              </div>
              <div className="summary-item">
                <span className="label">⏱️ Duration:</span>
                <span className="value">{report.duration || 10} minutes</span>
              </div>
              <div className="summary-item">
                <span className="label">✅ Result:</span>
                <span className={`value status ${(report.totalScore || 0) >= 70 ? "passed" : "failed"}`}>
                  {(report.totalScore || 0) >= 70 ? "PASSED" : "NEEDS IMPROVEMENT"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS TAB */}
      {activeTab === "details" && (
        <div className="tab-content">
          <div className="competency-section">
            <h3>Competency Breakdown</h3>
            <div className="competency-grid">
              {[
                { name: "Technical Knowledge", score: report.technicalScore },
                { name: "Problem Solving", score: report.problemSolvingScore },
                { name: "Communication", score: report.communicationScore },
                { name: "Behavioral Skills", score: report.behavioralScore }
              ].map((comp, idx) => (
                <div key={idx} className="competency-card">
                  <div className="competency-name">{comp.name}</div>
                  <div className="competency-bar">
                    <div
                      className="competency-fill"
                      style={{
                        width: `${comp.score || 0}%`,
                        background: getScoreColor(comp.score || 0)
                      }}
                    ></div>
                  </div>
                  <div className="competency-score">{comp.score || 0}/100</div>
                </div>
              ))}
            </div>
          </div>

          <div className="questions-review">
            <h3>Question-by-Question Analysis</h3>
            {report.answers && report.answers.map((answer, idx) => (
              <div key={idx} className="answer-card">
                <div className="answer-header">
                  <h4>Question {idx + 1}</h4>
                  <span className="answer-score">{answer.scores?.technical || 0}/10</span>
                </div>
                <div className="answer-content">
                  <p><strong>Question:</strong> {answer.question}</p>
                  <p><strong>Your Answer:</strong> {answer.answer}</p>
                  <div className="score-breakdown">
                    <span>Technical: {answer.scores?.technical || 0}/10</span>
                    <span>Communication: {answer.scores?.communication || 0}/10</span>
                    <span>Clarity: {answer.scores?.clarity || 0}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROCTORING TAB */}
      {activeTab === "proctoring" && (
        <div className="tab-content">
          <div className="proctoring-section">
            <h3>Proctoring Integrity Report</h3>
            <div className="integrity-card primary">
              <div className="integrity-score">{report.integrityScore || 100}%</div>
              <p>Overall Integrity Score</p>
            </div>

            <div className="violations-review">
              <h4>Detected Violations</h4>
              {report.violations && report.violations.length > 0 ? (
                <div className="violations-list">
                  {report.violations.map((v, idx) => (
                    <div key={idx} className={`violation-item ${v.severity}`}>
                      <span className="violation-type">{v.type}</span>
                      <span className="violation-message">{v.message}</span>
                      <span className="violation-time">
                        {new Date(v.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-violations">✓ No violations detected</p>
              )}
            </div>

            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">👁️ Eye Tracking</div>
                <div className="metric-value">
                  {report.eyeTrackingViolations || 0} violations
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">📹 Face Detection</div>
                <div className="metric-value">
                  {report.faceDetectionViolations || 0} violations
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">📱 Device Detection</div>
                <div className="metric-value">
                  {report.deviceDetectionViolations || 0} violations
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">🎤 Audio Quality</div>
                <div className="metric-value">
                  {report.audioIssues || 0} issues
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK TAB */}
      {activeTab === "feedback" && (
        <div className="tab-content">
          <div className="feedback-section">
            <div className="strengths-box">
              <h4>💪 Your Strengths</h4>
              <ul>
                {report.strengths && report.strengths.length > 0
                  ? report.strengths.map((s, idx) => <li key={idx}>{s}</li>)
                  : <li>Great job on your interview!</li>}
              </ul>
            </div>

            <div className="improvements-box">
              <h4>🎯 Areas for Improvement</h4>
              <ul>
                {report.improvements && report.improvements.length > 0
                  ? report.improvements.map((imp, idx) => <li key={idx}>{imp}</li>)
                  : <li>Focus on completing more interview practice.</li>}
              </ul>
            </div>

            <div className="recommendations-box">
              <h4>📚 Recommendations</h4>
              <div className="recommendations-content">
                {report.recommendations || (
                  <>
                    <p>
                      • Practice answering technical questions with clear explanations
                    </p>
                    <p>
                      • Work on communicating your thought process more clearly
                    </p>
                    <p>
                      • Review data structures and algorithms for your role
                    </p>
                    <p>
                      • Participate in mock interviews to improve confidence
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="next-steps">
              <h4>📝 Next Steps</h4>
              <div className="steps-list">
                <div className="step">
                  <span className="step-number">1</span>
                  <span>Review the detailed feedback above</span>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <span>Practice identified weak areas</span>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <span>Schedule another interview in 1-2 weeks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="report-footer">
        <button className="home-btn" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default ScorecardPage;
