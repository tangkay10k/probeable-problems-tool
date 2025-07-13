import { useState, useEffect, useRef } from "react";
import ProblemAttemptContext from "./problem-attempt-context.js";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useWithLoading from "@/hooks/useWithLoading.js";
import { getLatestProblemAttemptForStudent } from "@/routes/problem-attempt-route.js";

const ProblemAttemptProvider = ({ children }) => {
  const { problemId } = useParams();
  const [problemAttempt, setProblemAttempt] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, withLoading] = useWithLoading();
  const navigate = useNavigate();
  const fetchedProblemIds = useRef(new Set());

  useEffect(() => {
    // Stop react re-render to fetch same problemAttempt twice.
    if (fetchedProblemIds.current.has(problemId)) return;
    fetchedProblemIds.current.add(problemId);

    withLoading(
      () =>
        getLatestProblemAttemptForStudent(
          problemId,
          "ktan185@aucklanduni.ac.nz", // TODO: Replace with authenticated email
        ),
      (attempt) => {
        setProblemAttempt(attempt);
        setChatHistory({
          sessionId: attempt.chatHistoryId,
          messages: attempt.messageList,
        });
      },
      () => {
        navigate("/");
        toast.error("Something went wrong fetching that problem...");
      },
    );
  }, []);

  return (
    <ProblemAttemptContext.Provider
      value={{
        problemAttempt,
        chatHistory,
        setChatHistory,
        isLoading,
      }}
    >
      {children}
    </ProblemAttemptContext.Provider>
  );
};

export default ProblemAttemptProvider;
