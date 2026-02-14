import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "../api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!getAuthToken()) {
      navigate("/login");
      return;
    }
    
    // Fetch user data and interview history
    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      // Mock data - replace with actual API call
      setUserData({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        totalInterviews: 5,
        averageScore: 78
      });

      setInterviews([
        {
          id: 1,
          role: "Software Engineer",
          date: "2026-02-10",
          score: 85,
          status: "Passed"
        },
        {
          id: 2,
          role: "Data Scientist",
          date: "2026-02-12",
          score: 72,
          status: "Passed"
        },
        {
          id: 3,
          role: "Frontend Developer",
          date: "2026-02-14",
          score: 78,
          status: "Passed"
        }
      ]);

      setStats({
        totalInterviews: 5,
        averageScore: 78,
        passRate: 80,
        bestScore: 92,
        worstScore: 65,
        improvementTrend: "+8%"
      });

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleStartNewInterview = () => {
    navigate("/interview-setup");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>📊 My Dashboard</h1>
          <p>Welcome back, {userData?.firstName}!</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn" onClick={handleStartNewInterview}>
            🚀 New Interview
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Interview History
        </button>
        <button
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "overview" && (
          <div className="overview-section">
            <h2>Performance Overview</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">📊 Total Interviews</div>
                <div className="stat-value">{stats?.totalInterviews}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">⭐ Average Score</div>
                <div className="stat-value">{stats?.averageScore}%</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">✅ Pass Rate</div>
                <div className="stat-value">{stats?.passRate}%</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">🎯 Best Score</div>
                <div className="stat-value">{stats?.bestScore}%</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">📈 Improvement</div>
                <div className="stat-value" style={{ color: "#4CAF50" }}>
                  {stats?.improvementTrend}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">🔄 Trend</div>
                <div className="stat-value">Improving</div>
              </div>
            </div>

            <div className="insights-section">
              <h3>📈 Performance Insights</h3>
              <div className="insights-content">
                <div className="insight-item">
                  <span className="insight-icon">💪</span>
                  <div>
                    <strong>Strengths:</strong>
                    <p>Strong technical knowledge and problem-solving skills</p>
                  </div>
                </div>
                <div className="insight-item">
                  <span className="insight-icon">🎯</span>
                  <div>
                    <strong>Focus Areas:</strong>
                    <p>Communication and behavioral question responses</p>
                  </div>
                </div>
                <div className="insight-item">
                  <span className="insight-icon">📚</span>
                  <div>
                    <strong>Recommendation:</strong>
                    <p>Practice more behavioral interviews and soft skills</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="history-section">
            <h2>Interview History</h2>
            
            <div className="interviews-table">
              <div className="table-header">
                <div className="col-role">Role</div>
                <div className="col-date">Date</div>
                <div className="col-score">Score</div>
                <div className="col-status">Status</div>
                <div className="col-action">Action</div>
              </div>

              {interviews.map((interview) => (
                <div key={interview.id} className="table-row">
                  <div className="col-role">{interview.role}</div>
                  <div className="col-date">{interview.date}</div>
                  <div className="col-score">
                    <span className="score-badge">{interview.score}%</span>
                  </div>
                  <div className="col-status">
                    <span className={`status-badge ${interview.status.toLowerCase()}`}>
                      {interview.status}
                    </span>
                  </div>
                  <div className="col-action">
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/scorecard/${interview.id}`)}
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="profile-section">
            <h2>User Profile</h2>
            
            <div className="profile-card">
              <div className="profile-info">
                <div className="profile-field">
                  <label>First Name</label>
                  <p>{userData?.firstName}</p>
                </div>
                <div className="profile-field">
                  <label>Last Name</label>
                  <p>{userData?.lastName}</p>
                </div>
                <div className="profile-field">
                  <label>Email</label>
                  <p>{userData?.email}</p>
                </div>
              </div>

              <div className="profile-stats">
                <h3>Career Statistics</h3>
                <div className="stat-list">
                  <div className="stat-item">
                    <span>Total Interviews Completed:</span>
                    <strong>{userData?.totalInterviews}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Average Score:</span>
                    <strong>{userData?.averageScore}%</strong>
                  </div>
                </div>
              </div>

              <div className="actions-list">
                <h3>Actions</h3>
                <button className="action-link">Update Profile</button>
                <button className="action-link">Change Password</button>
                <button className="action-link delete">Delete Account</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
