import axiosClient from "./utils/axiosClient.js";

export const logPastedContent = async (problemAttemptId, pastedContent) => {
  const res = await axiosClient.post(
    `${__LOG_URL__}/log/paste/${problemAttemptId}`,
    pastedContent,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return res.data;
};

export const logActivity = async (problemAttemptId, activities, email) => {
  const res = await axiosClient.post(
    `${__LOG_URL__}/log/activity/${problemAttemptId}`,
    {
      activities,
      email,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return res.data;
};
