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
