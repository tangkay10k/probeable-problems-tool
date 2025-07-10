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
