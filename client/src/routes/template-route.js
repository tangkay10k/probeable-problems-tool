import axiosClient from "./utils/axiosClient.js";

export const getTestTemplate = async (language) => {
  if (!language) return;
  const res = await axiosClient.get(`/api/template/${language}/test`);
  return res.data;
};

export const getExecuteTemplate = async (language) => {
  if (!language) return;
  const res = await axiosClient.get(`/api/template/${language}/execute`);
  return res.data;
};

export const getBuggySolutionTemplate = async (language) => {
  if (!language) return;
  const res = await axiosClient.get(`/api/template/${language}/buggy_solution`);
  return res.data;
};
