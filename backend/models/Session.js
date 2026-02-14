import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ["Software Engineer", "Data Scientist", "Product Manager", "DevOps Engineer", "Frontend Developer"]
  },
  experience: {
    type: String,
    required: true,
    enum: ["Fresher", "1-2 Years", "2-5 Years", "5+ Years"]
  },
  answers: [
    {
      questionNumber: Number,
      question: String,
      answer: String,
      scores: {
        technical: Number,
        communication: Number,
        problemSolving: Number,
        behavioural: Number
      },
      confidence: Number,
      calibrationVariance: Number,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  proctoring: {
    eyeMovementFlags: [
      {
        timestamp: Date,
        flagType: String, // "left", "right", "away", "closed"
        duration: Number
      }
    ],
    faceDetectionFlags: [
      {
        timestamp: Date,
        flagType: String, // "face_not_visible", "multiple_faces", "no_face"
        duration: Number
      }
    ],
    phoneDetectionFlags: [
      {
        timestamp: Date,
        confidence: Number
      }
    ],
    audioFlags: [
      {
        timestamp: Date,
        type: String // "background_noise", "no_audio", "interruption"
      }
    ],
    totalIntegrityScore: Number
  },
  status: {
    type: String,
    enum: ["ongoing", "completed", "abandoned", "failed_proctoring"],
    default: "ongoing"
  },
  integrityScore: Number,
  totalScore: Number,
  feedback: String,
  createdAt: { type: Date, default: Date.now },
  endedAt: Date
});

export default mongoose.model("Session", sessionSchema);
