import { useState, useEffect } from "react";
import ProblemAttemptContext from "./problem-attempt-context.js";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useWithLoading from "@/hooks/useWithLoading.js";
import { getLatestProblemAttemptForStudent } from "@/routes/problem-attempt-route.js";

const ProblemAttemptProvider = ({ children }) => {
  const { problemId } = useParams();
  const [problemAttempt, setProblemAttempt] = useState(null);
  const [isLoading, withLoading] = useWithLoading();
  const navigate = useNavigate();

  useEffect(() => {
    withLoading(
      () =>
        getLatestProblemAttemptForStudent(
          problemId,
          "ktan185@aucklanduni.ac.nz", // TODO: Replace with authenticated email
        ),
      (attempt) => setProblemAttempt(attempt),
      () => {
        navigate("/");
        toast.error("Something went wrong fetching that problem...");
      },
    );
  }, []);

  return (
    <ProblemAttemptContext.Provider value={{ problemAttempt, isLoading }}>
      {children}
    </ProblemAttemptContext.Provider>
  );
};

export default ProblemAttemptProvider;
