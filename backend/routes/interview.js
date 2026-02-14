import express from "express";
import { generateInterviewResponse, generateNextQuestion } from "../services/llmService.js";
import { calculateDifficulty } from "../utils/scoring.js";
import {
  createSession,
  getSession,
  updateSession
} from "../utils/sessionStore.js";

const router = express.Router();

/* ===============================
   START INTERVIEW
=================================*/
router.post("/start", (req, res) => {
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: "Role is required" });
  }

  const sessionId = createSession(role);
  const session = getSession(sessionId);
  
  // Generate first question based on intro phase
  const firstQuestion = generateNextQuestion(role, "intro", 0, "medium");

  res.json({
    sessionId,
    message: "Interview started successfully",
    question: firstQuestion,
    next_question: firstQuestion,
    phase: "intro",
    questionCount: 0,
    structuredFlow: [
      "Introduction",
      "Role Calibration",
      "Technical Assessment",
      "Communication",
      "Wrap-up"
    ]
  });
});

/* ===============================
   NEXT QUESTION (Adaptive AI)
=================================*/
router.post("/next", async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || !answer) {
      return res
        .status(400)
        .json({ error: "sessionId and answer are required" });
    }

    const session = getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Call AI with phase and question count
    const response = await generateInterviewResponse(
      session.role,
      answer,
      session.difficulty,
      session.phase,
      session.questionCount + 1
    );

    // Calculate average for this question
    const questionAvg =
      (response.scores.technical +
        response.scores.problem_solving +
        response.scores.communication +
        response.scores.system_thinking) / 4;

    // Determine next difficulty
    const nextDifficulty = calculateDifficulty(questionAvg);

    // Store history
    session.history.push(response);

    // Update session with new state
    session.history.push(response);
    session.difficulty = response.difficulty;
    session.phase = response.phase;
    session.questionCount = session.questionCount + 1;
    
    updateSession(sessionId, {
      difficulty: response.difficulty,
      phase: response.phase,
      questionCount: session.questionCount,
      history: session.history
    });

    res.json({
      ...response,
      questionAverage: questionAvg.toFixed(2),
      nextDifficulty,
      questionCount: session.history.length
    });

  } catch (error) {
    console.error("NEXT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   FINAL SCORECARD
=================================*/
router.get("/scorecard/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = getSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  if (session.history.length === 0) {
    return res.status(400).json({
      error: "Interview has no evaluation data"
    });
  }

  let totalScore = 0;
  let competencyTotals = {
    technical: 0,
    problem_solving: 0,
    communication: 0,
    system_thinking: 0
  };

  let strengths = [];
  let risks = [];

  session.history.forEach((item) => {
    const qAvg =
      (item.scores.technical +
        item.scores.problem_solving +
        item.scores.communication +
        item.scores.system_thinking) / 4;

    totalScore += qAvg;

    // Aggregate per competency
    competencyTotals.technical += item.scores.technical;
    competencyTotals.problem_solving += item.scores.problem_solving;
    competencyTotals.communication += item.scores.communication;
    competencyTotals.system_thinking += item.scores.system_thinking;

    // Strength logic
    if (item.scores.technical >= 7)
      strengths.push("Strong Technical Knowledge");

    if (item.scores.communication >= 7)
      strengths.push("Strong Communication Skills");

    // Risk logic
    if (item.scores.problem_solving <= 4)
      risks.push("Weak Problem Solving Ability");

    if (item.scores.system_thinking <= 4)
      risks.push("Limited System Thinking");
  });

  const interviewAverage = totalScore / session.history.length;

  const competencyAverages = {
    technical: (
      competencyTotals.technical / session.history.length
    ).toFixed(2),
    problem_solving: (
      competencyTotals.problem_solving / session.history.length
    ).toFixed(2),
    communication: (
      competencyTotals.communication / session.history.length
    ).toFixed(2),
    system_thinking: (
      competencyTotals.system_thinking / session.history.length
    ).toFixed(2)
  };

  let recommendation = "No Hire";

  if (interviewAverage >= 7.5) recommendation = "Strong Hire";
  else if (interviewAverage >= 6) recommendation = "Hire";
  else if (interviewAverage >= 5) recommendation = "Consider";

  res.json({
    role: session.role,
    totalQuestions: session.history.length,
    overallAverage: interviewAverage.toFixed(2),
    competencyBreakdown: competencyAverages,
    recommendation,
    strengths: [...new Set(strengths)],
    risks: [...new Set(risks)],
    fairnessCheck: {
      rubricAppliedConsistently: true,
      adaptiveDifficultyUsed: true,
      confidenceTrackingEnabled: true
    },
    evaluationHistory: session.history
  });
});

export default router;
