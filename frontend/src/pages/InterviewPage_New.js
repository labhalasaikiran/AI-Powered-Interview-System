import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { interviewAPI, getAuthToken } from "../api";
import "./InterviewPage.css";

function InterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState("intro");
  const [started, setStarted] = useState(false);
  const [answer, setAnswer] = useState("");
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  // Proctoring state
  const [violations, setViolations] = useState([]);
  const [integrityScore, setIntegrityScore] = useState(100);
  const [proctoringActive, setProctoringActive] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const sessionIdRef = useRef(null);
  const proctoringIntervalRef = useRef(null);

  const MAX_QUESTIONS = 3;
  const prepId = location.state?.prepId || localStorage.getItem("prepId");

  // Mock question data (can be replaced with actual API call)
  const questions = [
    "Tell me about your experience with your programming language of choice.",
    "How would you approach solving a complex problem? Walk me through your thought process.",
    "Describe a challenging project you worked on and how you overcame obstacles."
  ];

  useEffect(() => {
    if (!getAuthToken()) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported");
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

    recog.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
    };

    recognitionRef.current = recog;
  }, []);

  // Setup camera and proctoring
  useEffect(() => {
    if (!started) return;

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        startProctoring();
      } catch (err) {
        addViolation({
          type: "camera_access",
          severity: "critical",
          message: "Failed to access camera"
        });
      }
    };

    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [started]);

  // Timer logic
  useEffect(() => {
    if (!started || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [started]);

  // Auto-end interview when time expires
  useEffect(() => {
    if (timeLeft <= 0 && started) {
      alert("Time's up! Ending interview...");
      endInterview();
    }
  }, [timeLeft]);

  // Proctoring system
  const startProctoring = () => {
    setProctoringActive(true);
    let eyeAwayCounter = 0;
    let faceCounter = 0;

    proctoringIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0);

        // Simple face detection (checks for skin-tone pixels)
        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const faceDetected = analyzeFrame(imageData);

        if (!faceDetected) {
          faceCounter++;
          if (faceCounter > 5) {
            addViolation({
              type: "no_face",
              severity: "critical",
              message: "Face not detected in frame"
            });
            faceCounter = 0;
          }
        } else {
          faceCounter = 0;
        }

        // Eye tracking (checks if eyes are looking at screen)
        const eyesOnScreen = checkEyeFocus(imageData);
        if (!eyesOnScreen) {
          eyeAwayCounter++;
          if (eyeAwayCounter > 10) {
            addViolation({
              type: "eye_movement",
              severity: "warning",
              message: "Eyes detected away from screen"
            });
            eyeAwayCounter = 0;
          }
        } else {
          eyeAwayCounter = 0;
        }
      }
    }, 1000);
  };

  // Analyze frame for face detection
  const analyzeFrame = (imageData) => {
    const data = imageData.data;
    let skinPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
        skinPixels++;
      }
    }

    return skinPixels > (imageData.width * imageData.height * 0.05);
  };

  // Check eye focus
  const checkEyeFocus = (imageData) => {
    const data = imageData.data;
    let darkPixels = 0;

    // Check upper portion of image (where eyes typically are)
    const quarterHeight = imageData.height / 4;
    for (let i = 0; i < quarterHeight * imageData.width * 4; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness < 50) darkPixels++;
    }

    return darkPixels > (imageData.width * quarterHeight * 0.1);
  };

  const addViolation = (violation) => {
    setViolations(prev => [...prev, { ...violation, timestamp: new Date() }]);
    setIntegrityScore(prev => Math.max(0, prev - getViolationPenalty(violation.severity)));
  };

  const getViolationPenalty = (severity) => {
    switch (severity) {
      case "critical":
        return 10;
      case "major":
        return 5;
      case "warning":
        return 2;
      default:
        return 1;
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleStartInterview = () => {
    setStarted(true);
    setPhase("questions");
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert("Please provide an answer");
      return;
    }

    setLoading(true);
    try {
      await interviewAPI.submitAnswer({
        sessionId: sessionIdRef.current,
        questionNumber: count,
        answer,
        integrity: integrityScore
      });

      if (count < questions.length - 1) {
        setCount(count + 1);
        setAnswer("");
        setIsListening(false);
      } else {
        setPhase("wrapup");
      }
    } catch (err) {
      alert("Error submitting answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishInterview = async () => {
    setLoading(true);
    try {
      if (proctoringIntervalRef.current) {
        clearInterval(proctoringIntervalRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const response = await interviewAPI.endInterview(sessionIdRef.current);
      navigate(`/scorecard/${sessionIdRef.current}`, {
        state: { report: response.data }
      });
    } catch (err) {
      alert("Error finishing interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    try {
      if (proctoringIntervalRef.current) {
        clearInterval(proctoringIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      navigate("/");
    } catch (err) {
      console.error("Error ending interview:", err);
    }
  };

  return (
    <div className="interview-container">
      <div className="interview-header">
        <h1>AI Interview Session</h1>
        <div className="timer">Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? "0" : ""}{timeLeft % 60}</div>
        <div className={`integrity-score ${integrityScore >= 70 ? "good" : integrityScore >= 40 ? "warning" : "critical"}`}>
          Integrity: {integrityScore}%
        </div>
      </div>

      <div className="interview-content">
        <div className="camera-section">
          <div className="camera-container">
            <video
              ref={videoRef}
              autoPlay
              muted
              style={{ width: "100%", borderRadius: "10px" }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {proctoringActive && <div className="active-indicator">● Recording</div>}
          </div>

          {violations.length > 0 && (
            <div className="violations-panel">
              <h4>⚠️ Violations ({violations.length})</h4>
              <div className="violations-list">
                {violations.slice(-5).map((v, idx) => (
                  <div key={idx} className={`violation ${v.severity}`}>
                    <span className="type">{v.type}</span>
                    <span className="message">{v.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="question-section">
          {phase === "intro" && (
            <div className="intro-section">
              <h2>Welcome to Your Interview</h2>
              <div className="info-box">
                <p>📌 <strong>Number of Questions:</strong> {questions.length}</p>
                <p>⏱️ <strong>Duration:</strong> 10 minutes</p>
                <p>📹 <strong>Camera:</strong> Required</p>
                <p>🎤 <strong>Microphone:</strong> Required</p>
              </div>

              <div className="proctoring-info">
                <h3>Proctoring Rules:</h3>
                <ul>
                  <li>✓ Keep your face visible on camera</li>
                  <li>✓ Look at the screen while answering</li>
                  <li>✓ Do not use your phone or external devices</li>
                  <li>✓ Ensure quiet environment</li>
                  <li>✓ Only one person in frame</li>
                </ul>
              </div>

              <button className="action-btn start-btn" onClick={handleStartInterview}>
                Start Interview
              </button>
            </div>
          )}

          {phase === "questions" && (
            <div className="question-section-content">
              <div className="question-header">
                <h3>Question {count + 1} of {questions.length}</h3>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${((count + 1) / questions.length) * 100}%` }}></div>
                </div>
              </div>

              <div className="question-text">
                <p>{questions[count]}</p>
              </div>

              <textarea
                className="answer-input"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here or use the speak button..."
                rows="6"
              />

              <div className="action-buttons">
                <button className="action-btn speak-btn" onClick={toggleListening}>
                  {isListening ? "Stop 🎤" : "Speak 🎙"}
                </button>
                <button className="action-btn submit-btn" onClick={handleSubmitAnswer} disabled={loading}>
                  {loading ? "Submitting..." : "Submit Answer"}
                </button>
              </div>
            </div>
          )}

          {phase === "wrapup" && (
            <div className="wrapup-section">
              <h3>Interview Complete</h3>
              <p>Thank you for completing the interview!</p>
              <p>Final answers and integrity assessment will be reviewed.</p>
              <button className="action-btn finish-btn" onClick={handleFinishInterview} disabled={loading}>
                {loading ? "Generating Report..." : "View Report"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;