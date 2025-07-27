import axiosClient from "./utils/axiosClient.js";

export const createOracle = async (oracle) => {
  const res = await axiosClient.post("/api/oracle", oracle);
  return res.data;
};

export const getOracle = async (problemId) => {
  const res = await axiosClient.get(`/api/oracle?problemId=${problemId}`);
  return res.data;
};
