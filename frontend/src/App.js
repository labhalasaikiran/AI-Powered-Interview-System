import React, { useState } from "react";
import StartPage from "./pages/StartPage";
import InterviewPage from "./pages/InterviewPage";
import ScorecardPage from "./pages/ScorecardPage";

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [showScorecard, setShowScorecard] = useState(false);

  if (!sessionId)
    return <StartPage setSessionId={setSessionId} setQuestion={setQuestion} />;

  if (showScorecard)
    return <ScorecardPage sessionId={sessionId} />;

  return (
    <InterviewPage
      sessionId={sessionId}
      question={question}
      setQuestion={setQuestion}
      setShowScorecard={setShowScorecard}
    />
  );
}

export default App;
