import axiosClient from "./utils/axiosClient.js";
export const getLatestProblemAttemptForStudent = async (
  problemId,
  studentEmail,
) => {
  const res = await axiosClient.get(
    `/api/problemAttempt?problemId=${problemId}&studentEmail=${studentEmail}`,
  );
  return res.data;
};

export const submitUserMessage = async (sessionId, message) => {
  const payload = {
    sessionId: sessionId,
    chatMessage: {
      content: message,
    },
  };

  const res = await axiosClient.post(`/api/problemAttempt/chat`, payload);
  return res.data;
};
