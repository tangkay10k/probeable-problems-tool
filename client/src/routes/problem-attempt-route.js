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

export const submitUserMessage = async (
  sessionId,
  problemAttemptId,
  message,
) => {
  const payload = {
    sessionId: sessionId,
    problemAttemptId: problemAttemptId,
    chatMessage: {
      content: message,
    },
  };

  const res = await axiosClient.post(`/api/problemAttempt/chat`, payload);
  return res.data;
};

export const replaceWithOutputResponse = async (
  sessionId,
  question,
  output,
  testCase,
) => {
  const payload = {
    sessionId: sessionId,
    questionAsked: question,
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

export const saveEquivalenceClass = async (
  problemAttemptId,
  result,
  buggyOutputs,
) => {
  await axiosClient.post(
    `/api/problemAttempt/${problemAttemptId}/equivalenceClass`,
    {
      result,
      buggyOutputs,
    },
  );
};

export const updateFailedAttempts = async (problemAttemptId) => {
  const res = await axiosClient.put(
    `/api/problemAttempt/${problemAttemptId}/failedAttempts`,
  );
  return res.data;
};
