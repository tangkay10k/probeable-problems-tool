import axios from "axios";
export const createOracle = async (oracle) => {
  const res = await axios.post("/api/oracle", oracle);
  return res.data;
};