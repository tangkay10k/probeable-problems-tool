import axios from "axios";

export const getTestTemplate = async (language) => {
  const res = await axios.get(`/api/testTemplate/${language.toUpperCase()}`);
  return res.data;
};
