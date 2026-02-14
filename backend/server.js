import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import interviewPrepRoutes from "./routes/interviewPrepRoutes.js";
import interviewRoutes from "./routes/interview.js";
import scorecardRoutes from "./routes/scorecard.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ai-interview")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/interview-prep", interviewPrepRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/scorecard", scorecardRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "AI Interview Backend Running",
    endpoints: {
      auth: "/api/auth",
      interviewPreparation: "/api/interview-prep",
      interview: "/api/interview",
      scorecard: "/api/scorecard"
    }
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
