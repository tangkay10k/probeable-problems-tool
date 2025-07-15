import axios from "axios";
export const getLatestProblemAttemptForStudent = async (
  problemId,
  studentEmail,
) => {
  const res = await axios.get(
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

  const res = await axios.post(`/api/problemAttempt/chat`, payload);
  return res.data;
};
