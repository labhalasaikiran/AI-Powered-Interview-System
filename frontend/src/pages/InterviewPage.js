import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { interviewAPI } from "../api";

function InterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get sessionId, prepId, role, and experience from location state
  const [sessionId, setSessionId] = useState(location.state?.sessionId || null);
  const [prepId] = useState(location.state?.prepId || null);
  const [role] = useState(location.state?.role || null);
  // eslint-disable-next-line no-unused-vars
  const [experience] = useState(location.state?.experience || null);
  
  const [question, setQuestion] = useState("Loading question...");
  const [answer, setAnswer] = useState("");
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [phase, setPhase] = useState("intro");
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const syntheRef = useRef(null);

  const MAX_QUESTIONS = 5;

  // Initialize speech synthesis for reading questions
  useEffect(() => {
    syntheRef.current = window.speechSynthesis;
  }, []);

  // Speak the question aloud
  const speakQuestion = (text) => {
    if (!syntheRef.current) return;
    
    // Cancel any ongoing speech
    syntheRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    syntheRef.current.speak(utterance);
  };

  // Fetch first question when interview starts
  useEffect(() => {
    if (!started) return;
    
    const fetchFirstQuestion = async () => {
      try {
        setLoading(true);
        const res = await interviewAPI.startInterview({
          sessionId: sessionId || prepId,
          prepId: prepId,
          role: role
        });
        
        const firstQuestion = res.data.question || res.data.next_question || res.data.firstQuestion || "Tell me about yourself";
        setQuestion(firstQuestion);
        setSessionId(res.data.sessionId || sessionId);
        
        // Update phase from response
        if (res.data.phase) {
          setPhase(res.data.phase);
        }
        
        // Speak the question
        setTimeout(() => speakQuestion(firstQuestion), 500);
      } catch (error) {
        console.error("Error fetching first question:", error);
        setQuestion("What is your name and background?");
        // Still speak even if API fails
        setTimeout(() => speakQuestion("What is your name and background?"), 500);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFirstQuestion();
  }, [started, prepId, sessionId, role]);

  /* ==============================
     🎤 Speech Recognition Setup
  ============================== */
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
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
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

  /* ==============================
     🎥 Camera Setup
  ============================== */
  useEffect(() => {
    if (!started) return;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  /* ==============================
     ⏱ Timer Logic
  ============================== */
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

  /* ==============================
     🚀 Submit Logic
  ============================== */
  const handleNext = async () => {
    if (!answer.trim()) return;

    // If wrapup phase → end interview
    if (phase === "wrapup") {
      try {
        await interviewAPI.endInterview(sessionId);
      } catch (err) {
        console.error("Error ending interview:", err);
      }

      // Navigate to scorecard
      navigate(`/scorecard/${sessionId}`);
      return;
    }

    try {
      const res = await interviewAPI.submitAnswer({
        sessionId,
        answer
      });

      const nextQ = res.data.next_question || res.data.question || "Thank you for your answer";
      setQuestion(nextQ);
      
      // Update phase if returned from API
      if (res.data.phase) {
        setPhase(res.data.phase);
      }
      
      // Speak the next question
      setTimeout(() => speakQuestion(nextQ), 300);

      setAnswer("");

      // Update question count
      setCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= MAX_QUESTIONS || res.data.phase === "wrapup") {
          setPhase("wrapup");
        }
        return newCount;
      });

    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("Error submitting answer. Please try again.");
    }
  };

  /* ==============================
     🎬 Start Screen
  ============================== */
  if (!started) {
    return (
      <div style={containerStyle}>
        <h1>AI Interview System</h1>
        <p>This interview will last 10 minutes.</p>
        <button style={buttonStyle} onClick={() => setStarted(true)}>
          Start Interview
        </button>
      </div>
    );
  }

  /* ==============================
     🧠 Interview Screen
  ============================== */
  return (
    <div style={containerStyle}>
      {/* Camera */}
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{
          width: 250,
          borderRadius: 12,
          marginBottom: 20
        }}
      />

      {/* Timer */}
      <div style={{ marginBottom: 20 }}>
        <strong>
          Time Remaining: {Math.floor(timeLeft / 60)}:
          {timeLeft % 60 < 10 ? "0" : ""}
          {timeLeft % 60}
        </strong>
      </div>

      {phase === "wrapup" ? (
        <div>
          <h2>Interview Wrap-Up</h2>
          <p>Please share your final thoughts.</p>

          <textarea
            rows="5"
            style={textareaStyle}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          <br /><br />

          <button style={buttonStyle} onClick={handleNext}>
            Finish Interview
          </button>
        </div>
      ) : (
        <>
          <h3>Question {count + 1} of {MAX_QUESTIONS}</h3>
          
          {loading ? (
            <p style={{ color: "#666", fontStyle: "italic" }}>Loading question...</p>
          ) : (
            <p style={{ fontSize: "18px", fontWeight: "500", minHeight: "50px" }}>
              {question}
            </p>
          )}

          <button 
            style={secondaryButtonStyle} 
            onClick={() => speakQuestion(question)}
            disabled={loading}
          >
            🔊 Repeat Question
          </button>

          <br />

          <textarea
            rows="5"
            style={textareaStyle}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here or use the Speak button..."
          />

          <br /><br />

          <button style={secondaryButtonStyle} onClick={toggleListening}>
            {isListening ? "Stop 🎤" : "Speak 🎙"}
          </button>

          <button style={buttonStyle} onClick={handleNext}>
            Submit Answer
          </button>
        </>
      )}
    </div>
  );
}

/* ==============================
   🎨 Styles
============================== */

const containerStyle = {
  padding: 40,
  maxWidth: 700,
  margin: "40px auto",
  background: "#ffffff",
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  textAlign: "center"
};

const textareaStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc"
};

const buttonStyle = {
  padding: "10px 20px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  margin: 5
};

const secondaryButtonStyle = {
  padding: "10px 20px",
  background: "#10b981",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  margin: 5,
  opacity: 1,
  transition: "opacity 0.2s"
};

export default InterviewPage;
