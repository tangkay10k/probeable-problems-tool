import axios from "axios";

export const createOracle = async (oracle) => {
  const res = await axios.post("/api/oracle", oracle);
  return res.data;
};

export const getOracle = async (problemId) => {
  const res = await axios.get(`/api/oracle?problemId=${problemId}`);
  return res.data;
};
