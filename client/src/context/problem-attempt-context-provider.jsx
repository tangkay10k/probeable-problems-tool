import { useEffect, useRef, useState } from "react";
import ProblemAttemptContext from "./problem-attempt-context.js";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useWithLoading from "@/hooks/useWithLoading.js";
import {
  getLatestProblemAttemptForStudent,
  saveProblemAttempt,
} from "@/routes/problem-attempt-route.js";
import { useUserProfile } from "@/context/user-context.jsx";
import { getUserProfileSilently } from "@/routes/person-route.js";
import { getExecuteTemplate } from "@/routes/template-route.js";
import { getProblem } from "@/routes/problem-route.js";

const STORAGE_NAMESPACE = "studentProblemData"; // base prefix

// hash helper so the email isn't visible in LS keys
async function sha256Hex(input) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const bytes = new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const ProblemAttemptProvider = ({ children }) => {
  const { problemId } = useParams();
  const { profile, setProfile } = useUserProfile();
  const [problemAttempt, setProblemAttempt] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [executeTemplate, setExecuteTemplate] = useState("");
  const [isLoading, withLoading] = useWithLoading();
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

  // Guard: don’t fetch until we know who the user is
  useEffect(() => {
    if (!profile?.email || !problemId) return;
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
  }, [problemId, profile?.email, navigate, withLoading]);

  useEffect(() => {
    withLoading(
      () => getExecuteTemplate(problemAttempt?.problemLanguage),
      (template) => {
        setExecuteTemplate(template)
      },
      (err) => toast.error(err),
    );

    withLoading(
      () => getProblem(problemId),
      (fetchedProblem) => {
        setProblem(fetchedProblem);
        saveProbesToLocalStorage(problemId, fetchedProblem.defaultProbe);
        setInputVariables(fetchedProblem.defaultProbe);
      },
      (err) => toast.error(err),
    );
  }, [problemId, problemAttempt?.problemLanguage]);


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
      const { [problemId]: _, ...rest } = prev;
      persist(rest);
      return rest;
    });
  };

  /*
   * We store notes, agent prompt locally, and only when we submit do we compile everything together to be submitted.
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

    withLoading(
      () => saveProblemAttempt(toSave),
      () => {
        toast.success("Your submission was saved successfully!");
        // clear score in case they update their code.
        updateStudentScore("");

        // Update profile showing that problem is completed.
        getUserProfileSilently(profile.email)
          .then((updatedProfile) => setProfile(updatedProfile))
          .catch(() => console.error);
      },
      () => toast.error("🚨You have already submitted your attempt!"),
    );
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
        updateStudentScore,
        updateOracleHistory,
        oracleExecutionHistory,
        saveStudentAttempt,
        executeTemplate,
        problem
      }}
    >
      {children}
    </ProblemAttemptContext.Provider>
  );
};

export default ProblemAttemptProvider;
