import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  role: String,
  answers: [
    {
      question: String,
      answer: String,
      scores: Object,
      confidence: Number,
      calibrationVariance: Number
    }
  ],
  integrityFlags: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Session", sessionSchema);
