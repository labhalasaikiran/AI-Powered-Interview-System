import express from "express";
import Session from "../models/Session.js";
import Question from "../models/Question.js";
import { processAnswer } from "../services/interviewEngine.js";

const router = express.Router();

router.post("/start", async (req, res) => {
  const session = await Session.create({
    role: req.body.role,
    integrityFlags: 0
  });

  const question = await Question.findOne({ phase: "intro" });

  res.json({ sessionId: session._id, question: question.text });
});

router.post("/next", async (req, res) => {
  const { sessionId, answer, phase } = req.body;

  const session = await Session.findById(sessionId);

  const question = await Question.findOne({ phase });

  const result = await processAnswer(session, question.text, answer);

  await session.save();

  res.json({
    nextQuestion: "Next structured question...",
    ...result
  });
});

export default router;
