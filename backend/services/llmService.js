// // import { GoogleGenAI } from "@google/genai";
// // import dotenv from "dotenv";

// // dotenv.config();

// // // Initialize new SDK
// // const ai = new GoogleGenAI({
// //   apiKey: process.env.GEMINI_API_KEY,
// // });

// // export async function generateInterviewResponse(role, answer, difficulty) {
// //   const prompt = `
// // You are an AI technical interviewer.

// // Return ONLY raw JSON.
// // Do NOT add explanations.
// // Do NOT use markdown.

// // Format:
// // {
// //   "next_question": "",
// //   "difficulty": "",
// //   "scores": {
// //     "technical": 0,
// //     "problem_solving": 0,
// //     "communication": 0,
// //     "system_thinking": 0
// //   },
// //   "reasoning": "",
// //   "evidence": "",
// //   "confidence": 0.0
// // }

// // Role: ${role}
// // Difficulty: ${difficulty}
// // Candidate Answer: ${answer}
// // `;

// //   const response = await ai.models.generateContent({
// //     model: "gemini-2.5-flash",
// //     contents: prompt,
// //   });

// //   let text = response.text;

// //   console.log("RAW RESPONSE:", text);

// //   const jsonMatch = text.match(/\{[\s\S]*\}/);

// //   if (!jsonMatch) {
// //     throw new Error("No JSON found in AI response");
// //   }

// //   return JSON.parse(jsonMatch[0]);
// // }

// import dotenv from "dotenv";

// dotenv.config();

// export async function generateInterviewResponse(role, answer, difficulty) {
//   const prompt = `
// You are an AI technical interviewer.

// Return ONLY raw JSON.
// Do NOT add explanations.
// Do NOT use markdown.

// Format:
// {
//   "next_question": "",
//   "difficulty": "",
//   "scores": {
//     "technical": 0,
//     "problem_solving": 0,
//     "communication": 0,
//     "system_thinking": 0
//   },
//   "reasoning": "",
//   "evidence": "",
//   "confidence": 0.0
// }

// Role: ${role}
// Difficulty: ${difficulty}
// Candidate Answer: ${answer}
// `;

//   const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
//       "Content-Type": "application/json",
//       "HTTP-Referer": "http://localhost:3000", // required
//       "X-Title": "AI Interview App" // required
//     },
//     body: JSON.stringify({
//       model: "openai/gpt-4o-mini", // cheap + fast
//       messages: [
//         {
//           role: "user",
//           content: prompt
//         }
//       ],
//       temperature: 0.7
//     })
//   });

//   const data = await response.json();

//   const text = data.choices?.[0]?.message?.content;

//   console.log("RAW RESPONSE:", text);

//   const jsonMatch = text.match(/\{[\s\S]*\}/);

//   if (!jsonMatch) {
//     throw new Error("No JSON found in AI response");
//   }

//   return JSON.parse(jsonMatch[0]);
// }

import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateInterviewResponse(role, answer, difficulty, phase) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `
You are an AI interviewer.

Return ONLY valid JSON:
{
  "next_question":"",
  "difficulty":"",
  "scores":{
    "technical":0,
    "problem_solving":0,
    "communication":0,
    "system_thinking":0
  },
  "reasoning":"",
  "evidence":"",
  "confidence":0.0,
  "strengths":[],
  "risks":[],
  "recommendation":""
}

Role: ${role}
Difficulty: ${difficulty}
Phase: ${phase}
Answer: ${answer}
`
        }
      ],
      temperature: 0.7
    });

    const text = completion.choices[0]?.message?.content;

    console.log("GROQ RAW:", text);

    if (!text) throw new Error("No response from Groq");

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");

    return JSON.parse(match[0]);

  } catch (error) {
    console.error("GROQ ERROR:", error.message);

    // Fallback for hackathon stability
    return {
      next_question: "Explain REST principles in detail.",
      difficulty: "medium",
      scores: {
        technical: 5,
        problem_solving: 5,
        communication: 5,
        system_thinking: 5
      },
      reasoning: "Fallback evaluation due to API issue.",
      evidence: "API unavailable.",
      confidence: 0.5,
      strengths: [],
      risks: [],
      recommendation: "Consider"
    };
  }
}
