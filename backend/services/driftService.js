import Audit from "../models/Audit.js";

export const checkDrift = async (sessionId, avgScore) => {
  await Audit.create({
    sessionId,
    averageScore: avgScore
  });
};
