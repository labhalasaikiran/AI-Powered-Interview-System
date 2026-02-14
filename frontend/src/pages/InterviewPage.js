import React, { useState, useEffect, useRef } from "react";
import { nextQuestion } from "../api";

function InterviewPage({
  sessionId,
  question,
  setQuestion,
  setShowScorecard
}) {
  const [answer, setAnswer] = useState("");
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [phase, setPhase] = useState("intro");
  const [isListening, setIsListening] = useState(false);
  const [integrityFlags, setIntegrityFlags] = useState(0);

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);

  const MAX_QUESTIONS = 5;

  /* -----------------------------
     🔊 TEXT TO SPEECH
  ------------------------------ */
  const speakQuestion = (text) => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (started && question) {
      speakQuestion(question);
    }
  }, [question, started]);

  /* -----------------------------
     🎙 SPEECH TO TEXT
  ------------------------------ */
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

  /* -----------------------------
     📷 CAMERA START
  ------------------------------ */
  useEffect(() => {
    if (!started) return;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        console.log("Camera permission denied");
      });
  }, [started]);

  /* -----------------------------
     🚨 TAB SWITCH DETECTION
  ------------------------------ */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIntegrityFlags((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  /* -----------------------------
     ⏱ TIMER
  ------------------------------ */
  useEffect(() => {
    if (!started) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase("wrapup");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started]);

  /* -----------------------------
     NEXT BUTTON LOGIC
  ------------------------------ */
  const handleNext = async () => {
    if (!answer.trim()) return;

    if (phase === "wrapup") {
      setShowScorecard(true);
      return;
    }

    const res = await nextQuestion({
      sessionId,
      answer,
      phase,
      questionCount: count
    });

    setQuestion(res.data.next_question);
    setAnswer("");
    setCount((prev) => prev + 1);

    if (count === 0) setPhase("calibration");
    else if (count === 1) setPhase("technical");
    else if (count === 3) setPhase("communication");

    if (count + 1 >= MAX_QUESTIONS) {
      setPhase("wrapup");
    }
  };

  /* -----------------------------
     GREETING SCREEN
  ------------------------------ */
  if (!started) {
    return (
      <div style={containerStyle}>
        <h1>AI Interview System</h1>
        <p>This interview will:</p>
        <ul>
          <li>Last 10 minutes</li>
          <li>Adaptive difficulty</li>
          <li>Voice + Text interaction</li>
          <li>Live integrity monitoring</li>
        </ul>

        <button style={primaryButton} onClick={() => setStarted(true)}>
          Start Interview
        </button>
      </div>
    );
  }

  /* -----------------------------
     MAIN INTERVIEW SCREEN
  ------------------------------ */
  return (
    <div style={containerStyle}>
      {/* Camera */}
      <div style={cameraBox}>
        <video ref={videoRef} autoPlay muted style={videoStyle} />
      </div>

      {/* Timer */}
      <div style={timerStyle}>
        ⏱ Time Remaining: {Math.floor(timeLeft / 60)}:
        {timeLeft % 60 < 10 ? "0" : ""}
        {timeLeft % 60}
      </div>

      {/* Integrity Alerts */}
      <div style={{ color: "red", marginBottom: 15 }}>
        Integrity Alerts: {integrityFlags}
      </div>

      {phase === "wrapup" ? (
        <>
          <h2>Interview Wrap-Up</h2>
          <p>Do you have any final questions?</p>

          <textarea
            rows="5"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onPaste={() => setIntegrityFlags((prev) => prev + 1)}
            style={textareaStyle}
          />

          <div style={{ marginTop: 15 }}>
            <button onClick={toggleListening} style={micButton(isListening)}>
              {isListening ? "Stop Recording 🎤" : "Start Speaking 🎙"}
            </button>

            <button onClick={handleNext} style={primaryButton}>
              Finish Interview
            </button>
          </div>
        </>
      ) : (
        <>
          <h3>Question {count + 1}</h3>
          <p style={{ fontSize: 18 }}>{question}</p>

          <button onClick={() => speakQuestion(question)}>
            🔊 Speak Again
          </button>

          <textarea
            rows="5"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onPaste={() => setIntegrityFlags((prev) => prev + 1)}
            style={textareaStyle}
          />

          <div style={{ marginTop: 15 }}>
            <button onClick={toggleListening} style={micButton(isListening)}>
              {isListening ? "Stop Recording 🎤" : "Start Speaking 🎙"}
            </button>

            <button onClick={handleNext} style={primaryButton}>
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* -----------------------------
   STYLES
------------------------------ */

const containerStyle = {
  maxWidth: 850,
  margin: "50px auto",
  padding: 40,
  background: "#ffffff",
  borderRadius: 16,
  boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
  fontFamily: "Arial"
};

const cameraBox = {
  position: "absolute",
  top: 20,
  right: 20
};

const videoStyle = {
  width: 160,
  height: 120,
  borderRadius: 8,
  border: "2px solid #ccc"
};

const timerStyle = {
  padding: 10,
  background: "#f3f4f6",
  borderRadius: 8,
  fontWeight: 600,
  marginBottom: 15
};

const textareaStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 16
};

const primaryButton = {
  padding: "10px 20px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  marginLeft: 10
};

const micButton = (active) => ({
  padding: "10px 20px",
  background: active ? "red" : "green",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
});

export default InterviewPage;
