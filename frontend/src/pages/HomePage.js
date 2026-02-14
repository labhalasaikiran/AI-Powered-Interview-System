import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  const handleStartInterview = () => {
    if (isAuthenticated) {
      navigate("/interview-setup");
    } else {
      navigate("/login");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  const handleDashboard = () => {
    navigate("/admin-dashboard");
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo">
          <h1>🤖 AI Interview System</h1>
          <p>Intelligent Interviewing Powered by Artificial Intelligence</p>
        </div>
        <nav className="auth-nav">
          {isAuthenticated ? (
            <>
              <button className="nav-btn secondary" onClick={handleDashboard}>
                Dashboard
              </button>
              <button className="nav-btn danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="nav-btn secondary" onClick={handleLogin}>
                Login
              </button>
              <button className="nav-btn primary" onClick={handleRegister}>
                Register
              </button>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h2>Welcome to the AI-Powered Interview Platform</h2>
          <p>
            Experience the future of technical interviews with advanced AI
            assessment, real-time proctoring, and instant performance feedback.
          </p>
          <button className="cta-button" onClick={handleStartInterview}>
            {isAuthenticated ? "Start Interview Now" : "Get Started"}
          </button>
        </div>
        <div className="hero-image">
          <div className="animation-box">
            <div className="rotating-cube">
              <div className="cube-face">AI</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h3>Key Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👁️</div>
            <h4>Eye Tracking</h4>
            <p>Real-time monitoring to ensure focus and integrity</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📹</div>
            <h4>Face Detection</h4>
            <p>Verify participant identity and check for multiple people</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚫</div>
            <h4>Device Detection</h4>
            <p>Detect phones and unauthorized devices</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎤</div>
            <h4>Audio Monitoring</h4>
            <p>Monitor for background noise and interruptions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h4>AI Assessment</h4>
            <p>Intelligent evaluation of technical and soft skills</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Detailed Reports</h4>
            <p>Comprehensive feedback with actionable insights</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h3>How It Works</h3>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Register/Login</h4>
            <p>Create an account or login to your profile</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Select Role & Level</h4>
            <p>Choose your interview role and experience level</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>System Verification</h4>
            <p>Grant camera and microphone access</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h4>Start Interview</h4>
            <p>Answer AI-generated questions with proctoring active</p>
          </div>
          <div className="step">
            <div className="step-number">5</div>
            <h4>Get Report</h4>
            <p>Receive detailed performance analysis and feedback</p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <p>&copy; 2026 AI Interview System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
