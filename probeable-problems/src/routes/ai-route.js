import axios from "axios";
export const generateConstraints = async (problem) => {
  const res = await axios.post("/api/ai/constraints", problem);
  return res.data;
};

export const generateTestSuite = async (problem) => {
  const res = await axios.post("/api/ai/test-suite", problem);
  return res.data;
};
