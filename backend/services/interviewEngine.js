import { calculateScores } from "../utils/scoring.js";
import { simulateCalibration } from "./calibrationService.js";
import { checkDrift } from "./driftService.js";

export const processAnswer = async (session, question, answer) => {

  const scores = calculateScores(answer);

  const calibrationVariance = simulateCalibration(scores.technical);

  const confidence = Math.random() * (0.95 - 0.7) + 0.7;

  session.answers.push({
    question,
    answer,
    scores,
    confidence,
    calibrationVariance
  });

  const avg =
    (scores.technical +
      scores.problem_solving +
      scores.communication +
      scores.system_thinking) / 4;

  await checkDrift(session._id, avg);

  return { scores, confidence, calibrationVariance };
};
