import { useEffect, useRef, useState } from "react";
import ProblemAttemptContext from "./problem-attempt-context.js";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getLatestProblemAttemptForStudent,
  saveProblemAttempt,
} from "@/routes/problem-attempt-route.js";
import { useUserProfile } from "@/context/user-context.jsx";
import { getUserProfileSilently } from "@/routes/person-route.js";
import { getExecuteTemplate } from "@/routes/template-route.js";
import { getProblem } from "@/routes/problem-route.js";
import {
  saveProbesToLocalStorage,
  sha256Hex,
} from "@/context/context-utils.js";

const STORAGE_NAMESPACE = "studentProblemData";

const ProblemAttemptProvider = ({ children }) => {
  const { problemId } = useParams();
  const { profile, setProfile } = useUserProfile();
  const [problemAttempt, setProblemAttempt] = useState(null);
  const [chatHistory, setChatHistory] = useState(null);
  const [executeTemplate, setExecuteTemplate] = useState("");
  const [isProblemReady, setIsProblemReady] = useState(false);
  const [problem, setProblem] = useState({});
  const navigate = useNavigate();
  const fetchedProblemIds = useRef(new Set());

  // Derived per-user storage key (hashed)
  const [userStorageKey, setUserStorageKey] = useState(null);

  // Per-user map: { [problemId]: { notes, agentPrompt, codeSubmission, score, oracleExecutionHistory } }
  const [studentDataMap, setStudentDataMap] = useState({});

  // Compute hashed storage key when profile email is available
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const email = profile?.email?.trim().toLowerCase();
      if (!email) {
        setUserStorageKey(null);
        setStudentDataMap({});
        return;
      }
      const hash = await sha256Hex(email);
      if (!cancelled) setUserStorageKey(`${STORAGE_NAMESPACE}:${hash}`);
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.email]);

  // Load per-user map from localStorage once we have the key
  useEffect(() => {
    if (!userStorageKey) return;
    const saved = localStorage.getItem(userStorageKey);
    try {
      setStudentDataMap(saved ? JSON.parse(saved) : {});
    } catch {
      // corrupt JSON? reset for safety
      setStudentDataMap({});
    }
  }, [userStorageKey]);

  const currentData =
    studentDataMap && problemId ? studentDataMap[problemId] || {} : {};
  const studentNotes = currentData.notes || "";
  const studentAgentPrompt = currentData.agentPrompt || "";
  const studentCodeSubmission = currentData.codeSubmission || "";
  const score = currentData.score || "";
  const oracleExecutionHistory = currentData.oracleExecutionHistory || [];

  // Fetch attempt + chat, then chain execute template once we know the language.
  // Fetch problem in parallel.
  useEffect(() => {
    if (!profile?.email || !problemId) return;
    if (fetchedProblemIds.current.has(problemId)) return;
    fetchedProblemIds.current.add(problemId);

    // Attempt + chat -> template
    getLatestProblemAttemptForStudent(problemId, profile.email)
      .then((attempt) => {
        setProblemAttempt(attempt);
        setChatHistory({
          sessionId: attempt.chatHistoryId,
          messages: attempt.messageList,
        });

        const lang = attempt.problemLanguage ?? attempt.programLanguage;
        if (!lang) {
          toast.error("Could not determine problem language for template.");
          return;
        }

        return getExecuteTemplate(lang)
          .then((template) => setExecuteTemplate(template))
          .catch((err) => {
            console.error(err);
            toast.error("Failed to load execute template.");
          });
      })
      .catch((err) => {
        console.error(err);
        navigate("/");
        toast.error("Something went wrong fetching that problem...");
      });

    // Problem
    getProblem(problemId)
      .then((fetchedProblem) => {
        setProblem(fetchedProblem);
        saveProbesToLocalStorage(problemId, fetchedProblem.defaultProbe);

        if (studentCodeSubmission.length === 0) {
          updateStudentCodeSubmission(fetchedProblem?.editorDefaultComment);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load problem details.");
      });
  }, [problemId, profile?.email, navigate]);

  // Derive readiness
  useEffect(() => {
    const ready =
      !!problemAttempt &&
      !!problem?.id &&
      !!executeTemplate &&
      !!chatHistory?.sessionId &&
      Array.isArray(chatHistory?.messages) &&
      chatHistory.messages.length > 0;

    setIsProblemReady(ready);
  }, [
    problemAttempt,
    problem?.id,
    executeTemplate,
    chatHistory?.sessionId,
    chatHistory?.messages?.length,
  ]);

  // Helper to write back to per-user storage
  const persist = (nextMap) => {
    if (!userStorageKey) return; // if not ready, don't persist yet
    localStorage.setItem(userStorageKey, JSON.stringify(nextMap));
  };

  const saveStudentData = (field, value) => {
    if (!problemId) return;
    setStudentDataMap((prev) => {
      const updatedEntry = { ...(prev[problemId] || {}), [field]: value };
      const updatedMap = { ...prev, [problemId]: updatedEntry };
      persist(updatedMap);
      return updatedMap;
    });
  };

  const updateStudentNotes = (newNote) => saveStudentData("notes", newNote);
  const updateStudentAgentPrompt = (newPrompt) =>
    saveStudentData("agentPrompt", newPrompt);
  const updateStudentCodeSubmission = (newCode) =>
    saveStudentData("codeSubmission", newCode);
  const updateStudentScore = (newScore) => saveStudentData("score", newScore);

  /* store [{testcase: X, output: Y, timestamp: Z}, ...]*/
  const updateOracleHistory = (newHistory) =>
    saveStudentData("oracleExecutionHistory", newHistory);

  /**
   * Deletes the entire stored data (notes, prompt, code, score) for THIS problem (for this user)
   */
  const deleteStudentAttempt = () => {
    if (!problemId) return;
    setStudentDataMap((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [problemId]: _omit, ...rest } = prev;
      persist(rest);
      return rest;
    });
  };

  /*
   * Compile and submit attempt
   */
  const saveStudentAttempt = () => {
    if (!score || String(score).length === 0) {
      toast.error("🚨 Please run your code before submitting! 🚨");
      return;
    }
    if (!studentCodeSubmission || studentCodeSubmission.length === 0) {
      toast.error("🚨 Write some code before submitting! 🚨");
      return;
    }
    if (!problemAttempt) {
      toast.error("🚨 Problem metadata not loaded yet. Try again. 🚨");
      return;
    }

    const toSave = {
      ...problemAttempt,
      notesTaken: studentNotes,
      agentPrompt: studentAgentPrompt,
      codeSubmission: studentCodeSubmission,
      score: score,
      oracleExecutionHistory: oracleExecutionHistory,
    };

    saveProblemAttempt(toSave)
      .then(() => {
        toast.success("Your submission was saved successfully!");
        // clear score in case they update their code.
        updateStudentScore("");

        return getUserProfileSilently(profile.email)
          .then((updatedProfile) => setProfile(updatedProfile))
          .catch((e) => {
            console.error(e);
            // non-fatal
          });
      })
      .catch(() => {
        toast.error("🚨You have already submitted your attempt!");
      });
  };

  return (
    <ProblemAttemptContext.Provider
      value={{
        problemAttempt,
        chatHistory,
        setChatHistory,
        isProblemReady,
        studentNotes,
        updateStudentNotes,
        studentAgentPrompt,
        updateStudentAgentPrompt,
        studentCodeSubmission,
        updateStudentCodeSubmission,
        deleteStudentAttempt,
        updateStudentScore,
        updateOracleHistory,
        oracleExecutionHistory,
        saveStudentAttempt,
        executeTemplate,
        problem,
      }}
    >
      {children}
    </ProblemAttemptContext.Provider>
  );
};

export default ProblemAttemptProvider;
