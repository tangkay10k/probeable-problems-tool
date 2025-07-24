import axios from "axios";

export const getTestTemplate = async (language) => {
  const res = await axios.get(`/api/template/${language.toUpperCase()}/test`);
  return res.data;
};

export const getExecuteTemplate = async (language) => {
  const res = await axios.get(`/api/template/${language.toUpperCase()}/execute`);
  return res.data;
};
