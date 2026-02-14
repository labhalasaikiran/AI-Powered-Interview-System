import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  phase: String,
  text: String,
  difficulty: String,
  version: Number,
  approvedBy: String,
  lastUpdated: Date
});

export default mongoose.model("Question", questionSchema);
