import mongoose from "mongoose";

const interviewPrepSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  company: String,
  currentCompany: String,
  yearsOfExperience: Number,
  technologies: [String],
  additionalInfo: String,
  preferredLanguage: {
    type: String,
    default: "English"
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium"
  },
  interviewDuration: {
    type: Number,
    default: 45 // in minutes
  },
  numberOfQuestions: {
    type: Number,
    default: 3
  },
  systemRequirementsVerified: {
    type: Boolean,
    default: false
  },
  cameraAccess: Boolean,
  microphoneAccess: Boolean,
  createdAt: { type: Date, default: Date.now },
  sessionStartedAt: Date
});

export default mongoose.model("InterviewPrep", interviewPrepSchema);
