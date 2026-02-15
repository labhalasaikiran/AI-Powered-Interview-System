import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { interviewAPI } from "../api";
import "./InterviewPage.css";

function InterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role || null;

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("Loading question...");
  const [answer, setAnswer] = useState("");
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [phase, setPhase] = useState("intro");
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const synthRef = useRef(null);

  const MAX_QUESTIONS = 5;

  // ===== Speech synthesis =====
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
  }, []);

  const speakQuestion = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    synthRef.current.speak(utterance);
  };

  // ===== Speech recognition =====
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

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

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

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

  // ===== Camera setup =====
  useEffect(() => {
    if (!started) return;

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.log(err));
    }
  }, [started]);

  useEffect(() => {
    const videoEl = videoRef.current;
    return () => {
      if (videoEl?.srcObject) {
        const tracks = videoEl.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // ===== Fetch first question =====
  useEffect(() => {
    if (!started) return;

    if (!role) {
      console.error("Role missing. Redirecting...");
      navigate("/interview-setup");
      return;
    }

    const fetchFirstQuestion = async () => {
      try {
        setLoading(true);

        const res = await interviewAPI.startInterview({ role });

        const firstQuestion =
          res.data.question ||
          res.data.next_question ||
          "Tell me about yourself";

        setSessionId(res.data.sessionId);
        setQuestion(firstQuestion);

        if (res.data.phase) {
          setPhase(res.data.phase);
        }

        setTimeout(() => speakQuestion(firstQuestion), 500);
      } catch (error) {
        console.error("Error fetching question:", error);
        setQuestion("Tell me about yourself.");
      } finally {
        setLoading(false);
      }
    };

    fetchFirstQuestion();
  }, [started, role, navigate]);

  // ===== Timer =====
  useEffect(() => {
    if (!started) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started]);

  useEffect(() => {
    if (timeLeft === 0 && started) {
      setPhase("wrapup");
    }
  }, [timeLeft, started]);

  // ===== Submit answer =====
  const handleNext = async () => {
    if (!answer.trim()) return;

    if (phase === "wrapup") {
      try {
        await interviewAPI.endInterview(sessionId);
      } catch (err) {
        console.error(err);
      }
      navigate(`/scorecard/${sessionId}`);
      return;
    }

    try {
      const res = await interviewAPI.submitAnswer({
        sessionId,
        answer,
      });

      const nextQ =
        res.data.next_question ||
        res.data.question ||
        "Thank you for your answer.";

      setQuestion(nextQ);

      if (res.data.phase) {
        setPhase(res.data.phase);
      }

      setTimeout(() => speakQuestion(nextQ), 300);

      setAnswer("");

      setCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= MAX_QUESTIONS) {
          setPhase("wrapup");
        }
        return newCount;
      });
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Error submitting answer.");
    }
  };

  // ===== JSX (this is where your earlier snippet must live) =====

  // Start screen
  if (!started) {
    return (
      <div className="start-screen">
        <div className="start-card">
          <h1 className="start-title">AI Interview System</h1>
          <p className="start-text">This interview will last 10 minutes.</p>
          <button
            className="btn btn-primary"
            onClick={() => setStarted(true)}
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  // Interview UI
  return (
    <div className="interview-page">
      <div className="interview-card">
        <div className="interview-header">
          <div>
            <h2 className="interview-title">AI Interview</h2>
            <p className="interview-subtitle">
              Answer clearly and confidently. You can speak or type.
            </p>
          </div>

          <div className="timer-badge">
            <span>⏱</span>
            <span>
              {Math.floor(timeLeft / 60)}:
              {timeLeft % 60 < 10 ? "0" : ""}
              {timeLeft % 60}
            </span>
          </div>
        </div>

        <div className="interview-body">
          {/* Left: video */}
          <div className="video-panel">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="video-frame"
            />
            <span className="video-label">Camera preview</span>
          </div>

          {/* Right: question + answer */}
          <div>
            <div className="question-meta">
              <span className="question-count">
                Question {count + 1} of {MAX_QUESTIONS}
              </span>
              <span className="phase-pill">
                {phase === "wrapup" ? "Wrap-up" : "Live"}
              </span>
            </div>

            {phase === "wrapup" ? (
              <>
                <h2 className="wrapup-title">Interview Wrap-Up</h2>
                <div className="answer-area">
                  <textarea
                    className="answer-textarea"
                    rows="5"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Share any final comments, feedback, or reflections on the interview."
                  />
                </div>
                <div className="actions-row">
                  <button className="btn btn-primary" onClick={handleNext}>
                    Finish Interview
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="question-box">
                  {loading ? (
                    <p className="question-text">Loading question…</p>
                  ) : (
                    <p className="question-text">{question}</p>
                  )}
                </div>

                <div className="actions-row">
                  <button
                    className="btn btn-secondary"
                    onClick={() => speakQuestion(question)}
                  >
                    🔊 Repeat Question
                  </button>
                </div>

                <div className="answer-area">
                  <textarea
                    className="answer-textarea"
                    rows="5"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Speak or type your answer here…"
                  />
                </div>

                <div className="actions-row">
                  <button
                    className={
                      "btn btn-secondary " + (isListening ? "btn-listening" : "")
                    }
                    onClick={toggleListening}
                  >
                    {isListening ? "Stop 🎤" : "Speak 🎙"}
                  </button>

                  <button className="btn btn-primary" onClick={handleNext}>
                    Submit Answer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;
