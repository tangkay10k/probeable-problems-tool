import axios from "axios";

export const generateConstraints = async (problem) => {
  const res = await axios.post("/api/ai/constraints", problem);
  return res.data;
};

export const generateTestSuite = async (problem) => {
  const res = await axios.post("/api/ai/test-suite", problem);
  return res.data;
};

export const generateProblemStatement = async (problem) => {
  const res = await axios.post("/api/ai/problem-statement", problem);
  return res.data;
};

export const generateOracle = async (problem) => {
  const res = await axios.post("/api/ai/oracle", problem);
  return res.data;
};

export const generateSolutionAttempt = async (prompt) => {
  const res = await axios.post("/api/ai/solution-attempt", prompt);
  return res.data;
};