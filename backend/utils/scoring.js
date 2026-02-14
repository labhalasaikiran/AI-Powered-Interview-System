export function calculateDifficulty(avgScore) {
  if (avgScore >= 7.5) return "hard";
  if (avgScore <= 5) return "easy";
  return "medium";
}

export const calculateScores = (answer) => {
  return {
    technical: answer.length > 80 ? 7 : 4,
    problem_solving: answer.includes("because") ? 6 : 4,
    communication: answer.split(" ").length > 20 ? 7 : 5,
    system_thinking: answer.includes("architecture") ? 7 : 4
  };
};
