import express from "express";
import PDFDocument from "pdfkit";

const router = express.Router();

router.post("/download", (req, res) => {
  const report = req.body;

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=scorecard.pdf");

  doc.pipe(res);

  doc.fontSize(20).text("Interview Evaluation Report", { underline: true });
  doc.moveDown();

  doc.fontSize(14).text(`Recommendation: ${report.recommendation}`);
  doc.text(`Confidence: ${(report.confidence * 100).toFixed(0)}%`);
  doc.moveDown();

  doc.text("Scores:");
  doc.text(`Technical: ${report.scores.technical}`);
  doc.text(`Problem Solving: ${report.scores.problem_solving}`);
  doc.text(`Communication: ${report.scores.communication}`);
  doc.text(`System Thinking: ${report.scores.system_thinking}`);
  doc.moveDown();

  doc.text("Strengths:");
  report.strengths.forEach(s => doc.text(`• ${s}`));
  doc.moveDown();

  doc.text("Risks:");
  report.risks.forEach(r => doc.text(`• ${r}`));
  doc.moveDown();

  doc.text("Fairness Note:");
  doc.text(report.fairness_note);

  doc.end();
});

export default router;
