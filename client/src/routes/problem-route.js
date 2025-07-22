import axios from "axios";

export const createProblem = async (problem) => {
  const res = await axios.post("/api/problems", problem);
  return res.data;
};

export const updateProblem = async (problem) => {
  const res = await axios.patch("/api/problems", problem);
  return res.data;
};

export const getAllProblems = async () => {
  const res = await axios.get("/api/problems");
  return res.data;
};

export const getProblem = async (problemId) => {
  const res = await axios.get(`/api/problems/${problemId}`);
  return res.data;
};

export const getTestSuiteForProblem = async (problemId) => {
  const res = await axios.get(
    `/api/problems/test-suite?problemId=${problemId}`,
  );
  return res.data;
};
