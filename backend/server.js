import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import interviewRoutes from "./routes/interview.js";
import scorecardRoutes from "./routes/scorecard.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/interview", interviewRoutes);
app.use("/api/scorecard", scorecardRoutes);

app.get("/", (req, res) => {
  res.send("AI Interview Backend Running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
