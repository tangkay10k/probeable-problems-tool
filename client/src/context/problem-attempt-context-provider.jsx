import { useEffect, useRef, useState } from "react";
import ProblemAttemptContext from "./problem-attempt-context.js";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useWithLoading from "@/hooks/useWithLoading.js";
import { getLatestProblemAttemptForStudent } from "@/routes/problem-attempt-route.js";

const STORAGE_KEY = "studentNotes";

const ProblemAttemptProvider = ({ children }) => {
  const { problemId } = useParams();
  const [problemAttempt, setProblemAttempt] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, withLoading] = useWithLoading();
  const navigate = useNavigate();
  const fetchedProblemIds = useRef(new Set());

  // load the entire notes map from localStorage once
  const [notesMap, setNotesMap] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  // derive just the current note
  const studentNotes = notesMap[problemId] || "";

  useEffect(() => {
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
  }, [problemId, navigate, withLoading]);

  const updateStudentNotes = (newNote) => {
    setNotesMap((prev) => {
      const updated = { ...prev, [problemId]: newNote };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteStudentNotes = () => {
    setNotesMap((prev) => {
      const { [problemId]: _, ...rest } = prev;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
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
        deleteStudentNotes,
      }}
    >
      {children}
    </ProblemAttemptContext.Provider>
  );
};

export default ProblemAttemptProvider;