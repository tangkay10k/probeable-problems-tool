import axiosClient from "./utils/axiosClient.js";

export const createProblem = async (problem) => {
  const res = await axiosClient.post("/api/problems", problem);
  return res.data;
};

export const updateProblem = async (problem) => {
  const res = await axiosClient.patch("/api/problems", problem);
  return res.data;
};

export const getAllProblems = async () => {
  const res = await axiosClient.get("/api/problems");
  return res.data;
};

export const getProblem = async (problemId) => {
  const res = await axiosClient.get(`/api/problems/${problemId}`);
  return res.data;
};

export const getTestSuiteForProblem = async (problemId) => {
  const res = await axiosClient.get(
    `/api/problems/test-suite?problemId=${problemId}`,
  );
  return res.data;
};
