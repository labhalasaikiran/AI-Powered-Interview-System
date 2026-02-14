import dotenv from "dotenv";
import { Groq } from "groq-sdk";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Interview rubric definitions
const RUBRICS = {
  technical: {
    5: "Demonstrates advanced expertise, uses correct terminology, provides complete solutions",
    4: "Solid understanding with good technical depth and mostly correct solutions",
    3: "Adequate understanding with some technical gaps but generally on track",
    2: "Shows basic understanding but with significant gaps or errors",
    1: "Demonstrates limited understanding or major misconceptions"
  },
  problem_solving: {
    5: "Systematic approach, considers edge cases, breaks down complex problems elegantly",
    4: "Structured approach with good problem decomposition and mostly sound logic",
    3: "Reasonable approach with adequate problem breakdown",
    2: "Attempts structure but misses key aspects or has logical gaps",
    1: "Disorganized approach with little problem decomposition"
  },
  communication: {
    5: "Articulate, well-organized, explains reasoning clearly, easy to follow",
    4: "Clear communication with good structure and explanation",
    3: "Generally clear but could be more organized or detailed",
    2: "Somewhat unclear with gaps in explanation",
    1: "Difficult to understand or very disorganized"
  },
  system_thinking: {
    5: "Considers scalability, trade-offs, architecture - big picture thinker",
    4: "Thinks about implications and system-level considerations",
    3: "Some awareness of broader considerations",
    2: "Mostly focused on immediate problem, limited systems view",
    1: "No demonstrated system-level thinking"
  }
};

// Phase-specific questions
const PHASE_QUESTIONS = {
  intro: {
    1: "Tell me about yourself and your background in {role}.",
    2: "What interests you about this {role} position?"
  },
  calibration: {
    1: "Describe a project where you had to learn a new technology quickly. How did you approach it?",
    2: "Tell me about a time when you had to explain a technical concept to non-technical stakeholders."
  },
  technical: {
    1: "Design a system for {role_context}. Walk me through your approach.",
    2: "How would you handle {role_challenge} in your solution?",
    3: "Explain the trade-offs in your approach.",
    4: "What are the potential scalability issues and how would you address them?"
  },
  communication: {
    1: "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
    2: "Describe a situation where you had to influence others to adopt your idea."
  },
  wrapup: {
    1: "What questions do you have about this role or our team?",
    2: "Is there anything else you'd like us to know about your qualifications?"
  }
};

/**
 * Extract evidence snippets from answer
 */
function extractEvidenceSnippets(answer, scores) {
  const snippets = [];
  const answerLower = answer.toLowerCase();
  
  // Technical evidence
  if (scores.technical >= 4 && (answerLower.includes("architecture") || answerLower.includes("design") || answerLower.includes("algorithm"))) {
    const match = answer.match(/[^.!?]*(?:architecture|design|algorithm)[^.!?]*/i);
    if (match) snippets.push(`Technical: "${match[0].trim()}"`);
  }
  
  // Problem solving evidence
  if (scores.problem_solving >= 4 && (answerLower.includes("approach") || answerLower.includes("step") || answerLower.includes("because"))) {
    const match = answer.match(/[^.!?]*(?:approach|step|because)[^.!?]*/i);
    if (match) snippets.push(`Problem-solving: "${match[0].trim()}"`);
  }
  
  // Communication evidence
  if (scores.communication >= 4 && answer.length > 100) {
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length > 3) snippets.push(`Communication: Well-structured multi-sentence response`);
  }
  
  // System thinking evidence
  if (scores.system_thinking >= 4 && (answerLower.includes("scalable") || answerLower.includes("performance") || answerLower.includes("trade"))) {
    const match = answer.match(/[^.!?]*(?:scalable|performance|trade-off)[^.!?]*/i);
    if (match) snippets.push(`Systems: "${match[0].trim()}"`);
  }
  
  return snippets.length > 0 ? snippets : ["Adequate response for this stage"];
}

/**
 * Score answer using rubric-based evaluation via Groq
 */
export async function scoreAnswerWithRubric(role, question, answer, difficulty) {
  try {
    const prompt = `You are an expert technical interviewer evaluating a candidate's response.

Role: ${role}
Difficulty: ${difficulty}
Question: ${question}
Candidate's Answer: "${answer}"

Evaluate the response on a scale of 1-5 for each dimension (must be numbers only):
- Technical Knowledge (depth, correctness, terminology)
- Problem Solving (approach, logic, structure)
- Communication (clarity, organization, articulation)
- System Thinking (big picture, trade-offs, scalability)

**IMPORTANT: Respond with ONLY valid JSON, no markdown, no extra text:**
{
  "technical": <1-5>,
  "problem_solving": <1-5>,
  "communication": <1-5>,
  "system_thinking": <1-5>,
  "reasoning": "<one sentence summary>",
  "keyStrength": "<one strength observed>",
  "improvementArea": "<one area for improvement>"
}`;

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
      max_tokens: 300
    });

    let scoreData = {
      technical: 3,
      problem_solving: 3,
      communication: 3,
      system_thinking: 3,
      reasoning: "Unable to parse LLM response",
      keyStrength: "Participated in interview",
      improvementArea: "Continue building skills"
    };

    try {
      const responseText = response.choices[0].message.content.trim();
      // Remove markdown if present
      const jsonStr = responseText.replace(/```json\n?|\n?```/g, '').trim();
      scoreData = JSON.parse(jsonStr);
      
      // Ensure scores are valid
      Object.keys(scoreData).forEach(key => {
        if (['technical', 'problem_solving', 'communication', 'system_thinking'].includes(key)) {
          scoreData[key] = Math.max(1, Math.min(5, parseInt(scoreData[key]) || 3));
        }
      });
    } catch (parseErr) {
      console.warn("Failed to parse LLM response, using defaults:", parseErr.message);
    }

    return scoreData;
  } catch (error) {
    console.error("Groq API Error:", error.message);
    return {
      technical: 3,
      problem_solving: 3,
      communication: 3,
      system_thinking: 3,
      reasoning: "API error - default scoring applied",
      keyStrength: "Participated in interview",
      improvementArea: "Continue building skills"
    };
  }
}

/**
 * Generate next question based on phase and history
 */
export function generateNextQuestion(role, phase, questionCount, difficulty, previousAnswers = []) {
  const phaseQuestions = PHASE_QUESTIONS[phase] || PHASE_QUESTIONS.technical;
  
  // Select question based on count in phase
  const questionKey = Math.min(Object.keys(phaseQuestions).length, (questionCount % Object.keys(phaseQuestions).length) + 1);
  let question = phaseQuestions[questionKey];
  
  // Customize for role
  question = question
    .replace("{role}", role)
    .replace("{role_context}", `a system for the ${role} role`)
    .replace("{role_challenge}", `scaling challenges specific to ${role}`);

  return question;
}

/**
 * Generate interview response with AI evaluation
 * @param {string} role - Interview role
 * @param {string} answer - User's answer
 * @param {string} difficulty - Interview difficulty
 * @param {string} phase - Interview phase
 * @param {number} questionCount - Number of questions answered so far
 * @returns {Promise<Object>} Evaluation response
 */
export async function generateInterviewResponse(role, answer, difficulty, phase = "technical", questionCount = 1) {
  try {
    // Score the answer using Groq
    const lastQuestion = generateNextQuestion(role, phase, questionCount - 1, difficulty);
    const scores = await scoreAnswerWithRubric(role, lastQuestion, answer, difficulty);
    
    // Calculate average score
    const avgScore = (scores.technical + scores.problem_solving + scores.communication + scores.system_thinking) / 4;
    
    // Determine next difficulty
    let nextDifficulty = difficulty;
    if (avgScore >= 4.5) {
      nextDifficulty = "hard";
    } else if (avgScore <= 2.5) {
      nextDifficulty = "easy";
    }
    
    // Extract evidence snippets
    const evidenceSnippets = extractEvidenceSnippets(answer, scores);
    
    // Generate next question
    const nextQuestion = generateNextQuestion(role, phase, questionCount, nextDifficulty, [answer]);
    
    // Determine if moving to next phase
    let nextPhase = phase;
    const phases = ["intro", "calibration", "technical", "communication", "wrapup"];
    const phaseIndex = phases.indexOf(phase);
    
    if (questionCount >= 2 && phaseIndex < phases.length - 1) {
      nextPhase = phases[phaseIndex + 1];
    }

    // Determine recommendation
    let recommendation = "Strong response";
    let risks = [];
    if (avgScore < 2.5) {
      recommendation = "Consider clarifying your approach";
      risks.push("Limited depth in response");
    } else if (avgScore < 3.5) {
      recommendation = "Good start, but room to improve";
      risks.push("Could provide more detail");
    }

    return {
      next_question: nextQuestion,
      difficulty: nextDifficulty,
      phase: nextPhase,
      scores: {
        technical: scores.technical,
        problem_solving: scores.problem_solving,
        communication: scores.communication,
        system_thinking: scores.system_thinking
      },
      reasoning: scores.reasoning,
      evidence: evidenceSnippets,
      confidence: Math.min(0.95, 0.5 + (avgScore / 10)),
      strengths: [scores.keyStrength, "Good engagement"],
      risks: risks.length > 0 ? risks : [scores.improvementArea],
      recommendation: recommendation,
      averageScore: parseFloat(avgScore.toFixed(2))
    };

  } catch (error) {
    console.error("Interview Response Generation Error:", error.message);

    // Fallback response
    return {
      next_question: "Tell me more about your experience with this technology.",
      difficulty: difficulty,
      phase: phase,
      scores: {
        technical: 3,
        problem_solving: 3,
        communication: 3,
        system_thinking: 3
      },
      reasoning: "Fallback response due to temporary issue",
      evidence: ["Standard response"],
      confidence: 0.5,
      strengths: ["Participated in interview"],
      risks: ["Limited information to evaluate"],
      recommendation: "Continue to next question",
      averageScore: 3.0
    };
  }
}

/**
 * Generate comprehensive report for interview
 * @param {Array} answers - Array of answer evaluations
 * @param {Object} proctoringData - Proctoring violations and metrics
 * @returns {Promise<Object>} Complete report
 */
export async function generateReport(answers, proctoringData) {
  try {
    // Calculate overall metrics (convert 1-5 scale to 0-100)
    const avgTechnical = (answers.reduce((sum, a) => sum + (a.scores?.technical || 3), 0) / answers.length) * 20;
    const avgCommunication = (answers.reduce((sum, a) => sum + (a.scores?.communication || 3), 0) / answers.length) * 20;
    const avgProblemSolving = (answers.reduce((sum, a) => sum + (a.scores?.problem_solving || 3), 0) / answers.length) * 20;
    const avgSystemThinking = (answers.reduce((sum, a) => sum + (a.scores?.system_thinking || 3), 0) / answers.length) * 20;

    const overallScore = (avgTechnical + avgCommunication + avgProblemSolving + avgSystemThinking) / 4;

    // Aggregate strengths and risks
    const allStrengths = [...new Set(answers.flatMap(a => a.strengths || []))];
    const allRisks = [...new Set(answers.flatMap(a => a.risks || []))];
    
    // Aggregate evidence
    const allEvidence = answers.flatMap((a, idx) => 
      (a.evidence || []).map(e => `Q${idx + 1}: ${e}`)
    );

    // Determine recommendation
    let recommendation = "STRONG HIRE";
    let hireDecision = "RECOMMEND";
    
    if (overallScore < 40) {
      recommendation = "DO NOT HIRE";
      hireDecision = "REJECT";
    } else if (overallScore < 50) {
      recommendation = "RECONSIDER";
      hireDecision = "BORDERLINE";
    } else if (overallScore < 65) {
      recommendation = "POTENTIAL HIRE - Requires calibration";
      hireDecision = "CONSIDER";
    } else if (overallScore < 80) {
      recommendation = "GOOD HIRE";
      hireDecision = "RECOMMEND";
    }

    // Generate follow-up questions for next round (if needed)
    const followUpQuestions = [];
    if (overallScore >= 50 && overallScore < 70) {
      if (avgTechnical < 60) followUpQuestions.push("Deep dive into specific technical domain");
      if (avgSystemThinking < 60) followUpQuestions.push("Discuss architecture and scalability decisions");
      if (avgCommunication < 60) followUpQuestions.push("Present a technical solution to stakeholders");
    }

    return {
      overall_score: Math.round(overallScore),
      technical: Math.round(avgTechnical),
      communication: Math.round(avgCommunication),
      problem_solving: Math.round(avgProblemSolving),
      system_thinking: Math.round(avgSystemThinking),
      integrity_score: proctoringData?.integrityScore || 85,
      recommendation: recommendation,
      hire_decision: hireDecision,
      top_strengths: allStrengths.slice(0, 3),
      improvement_areas: allRisks.slice(0, 3),
      evidence_snippets: allEvidence,
      follow_up_questions: followUpQuestions,
      interview_summary: `Candidate demonstrated ${overallScore >= 70 ? "strong" : "moderate"} technical skills with ${overallScore >= 70 ? "excellent" : "adequate"} communication.`,
      fairness_note: "This evaluation uses consistent rubric-based scoring applied to all candidates regardless of background.",
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("Report generation error:", error);
    throw error;
  }
}
