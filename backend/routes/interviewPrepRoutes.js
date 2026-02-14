import express from "express";
import InterviewPrep from "../models/InterviewPrep.js";
import { verifyToken } from "./authRoutes.js";

const router = express.Router();

// Save interview preparation details
router.post("/prepare", verifyToken, async (req, res) => {
  try {
    const {
      role,
      experience,
      company,
      currentCompany,
      yearsOfExperience,
      technologies,
      additionalInfo,
      difficulty,
      numberOfQuestions,
      preferredLanguage
    } = req.body;

    const interviewPrep = new InterviewPrep({
      userId: req.userId,
      role,
      experience,
      company,
      currentCompany,
      yearsOfExperience,
      technologies,
      additionalInfo,
      difficulty,
      numberOfQuestions,
      preferredLanguage
    });

    await interviewPrep.save();

    res.status(201).json({
      message: "Interview preparation saved",
      prepId: interviewPrep._id,
      data: interviewPrep
    });
  } catch (error) {
    console.error("Interview prep error:", error);
    res.status(500).json({ message: "Error saving interview preparation" });
  }
});

// Verify system requirements (camera, microphone access)
router.post("/verify-system", verifyToken, async (req, res) => {
  try {
    const { cameraAccess, microphoneAccess, prepId } = req.body;

    const interviewPrep = await InterviewPrep.findById(prepId);
    if (!interviewPrep || interviewPrep.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    interviewPrep.cameraAccess = cameraAccess;
    interviewPrep.microphoneAccess = microphoneAccess;
    interviewPrep.systemRequirementsVerified = cameraAccess && microphoneAccess;

    await interviewPrep.save();

    res.json({
      message: "System requirements verified",
      verified: interviewPrep.systemRequirementsVerified
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying system" });
  }
});

// Get interview roles (for dropdown)
router.get("/roles", (req, res) => {
  const roles = [
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "DevOps Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Machine Learning Engineer"
  ];
  res.json(roles);
});

// Get experience levels
router.get("/experience-levels", (req, res) => {
  const levels = ["Fresher", "1-2 Years", "2-5 Years", "5+ Years"];
  res.json(levels);
});

// Get difficulty levels
router.get("/difficulty-levels", (req, res) => {
  const levels = ["Easy", "Medium", "Hard"];
  res.json(levels);
});

export default router;
