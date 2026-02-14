import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { interviewPrepAPI, getAuthToken } from "../api";
import "./InterviewSetup.css";

function InterviewSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [difficultyLevels, setDifficultyLevels] = useState([]);

  const [formData, setFormData] = useState({
    role: "",
    experience: "",
    company: "",
    currentCompany: "",
    yearsOfExperience: "",
    technologies: [],
    additionalInfo: "",
    difficulty: "Medium",
    numberOfQuestions: 3
  });

  const [systemStatus, setSystemStatus] = useState({
    camera: false,
    microphone: false
  });

  useEffect(() => {
    if (!getAuthToken()) {
      navigate("/login");
    }
    fetchDropdownData();
  }, [navigate]);

  const fetchDropdownData = async () => {
    try {
      const [rolesRes, experienceRes, difficultyRes] = await Promise.all([
        interviewPrepAPI.getRoles(),
        interviewPrepAPI.getExperienceLevels(),
        interviewPrepAPI.getDifficultyLevels()
      ]);

      setRoles(rolesRes.data);
      setExperienceLevels(experienceRes.data);
      setDifficultyLevels(difficultyRes.data);
    } catch (err) {
      setError("Failed to load interview options");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTechChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      technologies: value.split(",").map(t => t.trim()).filter(t => t)
    }));
  };

  const handleSystemVerification = async () => {
    try {
      setLoading(true);
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });

      // Check if we got both video and audio
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      setSystemStatus({
        camera: videoTracks.length > 0,
        microphone: audioTracks.length > 0
      });

      // Stop the stream
      stream.getTracks().forEach(track => track.stop());

      if (videoTracks.length > 0 && audioTracks.length > 0) {
        setError("");
        setStep(3);
      } else {
        setError("Please enable both camera and microphone");
      }
    } catch (err) {
      setError("Please grant camera and microphone permissions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.role || !formData.experience) {
        setError("Please select role and experience level");
        setLoading(false);
        return;
      }

      // Save interview prep
      const response = await interviewPrepAPI.savePrep(formData);
      
      // Verify system
      await interviewPrepAPI.verifySystem({
        prepId: response.data.prepId,
        cameraAccess: systemStatus.camera,
        microphoneAccess: systemStatus.microphone
      });

      // Navigate to interview page
      localStorage.setItem("prepId", response.data.prepId);
      navigate("/interview", { 
        state: { 
          prepId: response.data.prepId,
          role: formData.role,
          experience: formData.experience,
          difficulty: formData.difficulty
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to setup interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h2>Interview Setup</h2>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Step 1: Role & Experience Selection */}
        {step === 1 && (
          <div className="setup-step">
            <h3>Step 1: Select Your Role & Experience</h3>
            
            <div className="form-group">
              <label>Interview Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose a role</option>
                {roles.map((role, idx) => (
                  <option key={idx} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Experience Level *</label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose experience level</option>
                {experienceLevels.map((level, idx) => (
                  <option key={idx} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Target Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="e.g., Google, Microsoft, Amazon"
              />
            </div>

            <div className="form-group">
              <label>Current Company</label>
              <input
                type="text"
                name="currentCompany"
                value={formData.currentCompany}
                onChange={handleInputChange}
                placeholder="Your current workplace"
              />
            </div>

            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                min="0"
                placeholder="e.g., 5"
              />
            </div>

            <div className="button-group">
              <button
                className="next-btn"
                onClick={() => {
                  if (formData.role && formData.experience) {
                    setStep(2);
                  } else {
                    setError("Please select role and experience level");
                  }
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: System Verification */}
        {step === 2 && (
          <div className="setup-step">
            <h3>Step 2: Verify System Requirements</h3>
            <p className="info-text">
              Please grant permissions for camera and microphone. These are required for proctoring.
            </p>

            <div className="system-check">
              <div className={`check-item ${systemStatus.camera ? "success" : ""}`}>
                <span className="icon">📹</span>
                <span className="text">Camera</span>
                {systemStatus.camera && <span className="badge">✓ Enabled</span>}
              </div>
              <div className={`check-item ${systemStatus.microphone ? "success" : ""}`}>
                <span className="icon">🎤</span>
                <span className="text">Microphone</span>
                {systemStatus.microphone && <span className="badge">✓ Enabled</span>}
              </div>
            </div>

            <div className="requirements">
              <h4>System Requirements:</h4>
              <ul>
                <li>✓ Stable internet connection</li>
                <li>✓ Working camera and microphone</li>
                <li>✓ Quiet environment</li>
                <li>✓ Well-lit room (minimum 300 lux)</li>
                <li>✓ Close all other browser tabs</li>
              </ul>
            </div>

            <div className="button-group">
              <button
                className="back-btn"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                className="next-btn"
                onClick={handleSystemVerification}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Interview Details */}
        {step === 3 && (
          <div className="setup-step">
            <h3>Step 3: Interview Details</h3>

            <div className="form-group">
              <label>Difficulty Level</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                {difficultyLevels.map((level, idx) => (
                  <option key={idx} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Number of Questions</label>
              <input
                type="number"
                name="numberOfQuestions"
                value={formData.numberOfQuestions}
                onChange={handleInputChange}
                min="1"
                max="10"
              />
            </div>

            <div className="form-group">
              <label>Technologies/Skills (comma-separated)</label>
              <textarea
                value={formData.technologies.join(", ")}
                onChange={handleTechChange}
                placeholder="e.g., JavaScript, React, Node.js"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Additional Information</label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                placeholder="Any additional info you'd like to share (optional)"
                rows="3"
              />
            </div>

            <div className="agreement">
              <input type="checkbox" id="agreement" required />
              <label htmlFor="agreement">
                I understand and accept the proctoring terms and conditions
              </label>
            </div>

            <div className="button-group">
              <button
                className="back-btn"
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Starting Interview..." : "Start Interview"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewSetupPage;
