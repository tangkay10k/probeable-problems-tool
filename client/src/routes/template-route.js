import axios from "axios";

export const getTestTemplate = async (language) => {
  if (!language) return;
  const res = await axios.get(`/api/template/${language}/test`);
  return res.data;
};

export const getExecuteTemplate = async (language) => {
  if (!language) return;
  const res = await axios.get(`/api/template/${language}/execute`);
  return res.data;
};
