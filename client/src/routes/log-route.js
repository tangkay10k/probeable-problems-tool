import axiosClient from "./utils/axiosClient.js";

export const logPastedContent = async (problemAttemptId, pastedContent) => {
  const res = await axiosClient.post(
    `/log/paste/${problemAttemptId}`,
    pastedContent,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return res.data;
};


export const logActivity = async (problemAttemptId, activities) => {
  const res = await axiosClient.post(
    `/log/activity/${problemAttemptId}`,
    activities,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return res.data;
};