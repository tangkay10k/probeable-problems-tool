import { useEffect, useRef, useState } from "react";
import ProblemAttemptContext from "./problem-attempt-context.js";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useWithLoading from "@/hooks/useWithLoading.js";
import { getLatestProblemAttemptForStudent } from "@/routes/problem-attempt-route.js";
import { useUserProfile } from "@/context/user-context.jsx";

const STUDENT_DATA_KEY = "studentProblemData";

const ProblemAttemptProvider = ({ children }) => {
  const { problemId } = useParams();
  const { profile } = useUserProfile();
  const [problemAttempt, setProblemAttempt] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, withLoading] = useWithLoading();
  const navigate = useNavigate();
  const fetchedProblemIds = useRef(new Set());

  // Unified storage mapping: { [problemId]: { notes, agentPrompt, codeSubmission } }
  const [studentDataMap, setStudentDataMap] = useState(() => {
    const saved = localStorage.getItem(STUDENT_DATA_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const currentData = studentDataMap[problemId] || {};
  const studentNotes = currentData.notes || "";
  const studentAgentPrompt = currentData.agentPrompt || "";
  const studentCodeSubmission = currentData.codeSubmission || "";

  useEffect(() => {
    if (fetchedProblemIds.current.has(problemId)) return;
    fetchedProblemIds.current.add(problemId);

    withLoading(
      () => getLatestProblemAttemptForStudent(problemId, profile.email),
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
  }, [problemId, navigate, withLoading]);

  // Helper to save any field into the unified map
  const saveStudentData = (field, value) => {
    setStudentDataMap((prev) => {
      const updatedEntry = { ...(prev[problemId] || {}), [field]: value };
      const updatedMap = { ...prev, [problemId]: updatedEntry };
      localStorage.setItem(STUDENT_DATA_KEY, JSON.stringify(updatedMap));
      return updatedMap;
    });
  };

  const updateStudentNotes = (newNote) => saveStudentData("notes", newNote);
  const updateStudentAgentPrompt = (newPrompt) =>
    saveStudentData("agentPrompt", newPrompt);
  const updateStudentCodeSubmission = (newCode) =>
    saveStudentData("codeSubmission", newCode);

  /**
   * Deletes the entire stored data (notes, prompt, code) for this problem
   */
  const deleteStudentAttempt = () => {
    setStudentDataMap((prev) => {
      const { [problemId]: _, ...rest } = prev;
      localStorage.setItem(STUDENT_DATA_KEY, JSON.stringify(rest));
      return rest;
    });
  };

  return (
    <ProblemAttemptContext.Provider
      value={{
        problemAttempt,
        chatHistory,
        setChatHistory,
        isLoading,
        studentNotes,
        updateStudentNotes,
        studentAgentPrompt,
        updateStudentAgentPrompt,
        studentCodeSubmission,
        updateStudentCodeSubmission,
        deleteStudentAttempt,
      }}
    >
      {children}
    </ProblemAttemptContext.Provider>
  );
};

export default ProblemAttemptProvider;
