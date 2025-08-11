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

export const replaceWithOutputReponse = async (sessionId, output, testCase) => {
  const payload = {
    sessionId: sessionId,
    output,
    testCase,
  };

  const res = await axiosClient.post(
    `/api/problemAttempt/chat/outputResponse`,
    payload,
  );
  return res.data;
};

export const saveProblemAttempt = async (problemAttempt) => {
  const res = await axiosClient.post(`/api/problemAttempt`, problemAttempt);
  return res.data;
};
