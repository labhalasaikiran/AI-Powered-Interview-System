import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  sessionId: String,
  averageScore: Number,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Audit", auditSchema);
