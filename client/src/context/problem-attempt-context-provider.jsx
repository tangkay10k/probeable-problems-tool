import { useCallback, useEffect, useRef, useState } from "react";
import ProblemAttemptContext from "./problem-attempt-context.js";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getProblemAttempt,
  saveProblemAttempt,
} from "@/routes/problem-attempt-route.js";
import { useUserProfile } from "@/context/user-context.jsx";
import { getUserProfileSilently } from "@/routes/person-route.js";
import {
  getExecuteTemplate,
  getSubmissionTemplate,
} from "@/routes/template-route.js";
import { getProblem } from "@/routes/problem-route.js";
import {
  saveProbesToLocalStorage,
  sha256Hex,
} from "@/context/context-utils.js";

import { SPLIT_STRING } from "@/constants/setup-constants";
import { handleTestSuiteExecution } from "@/pages/question-setup/utils/test-setup-utils.js";
import { Action, Component } from "@/constants/logConstants.js";

const STORAGE_NAMESPACE = "studentProblemData";

const ProblemAttemptProvider = ({ children }) => {
  const { problemId } = useParams();
  const { profile, setProfile } = useUserProfile();
  const [problemAttempt, setProblemAttempt] = useState(null);
  const [chatHistory, setChatHistory] = useState(null);
  const [executeOracleTemplate, setExecuteOracleTemplate] = useState("");
  const [executeSubmissionTemplate, setExecuteSubmissionTemplate] =
    useState("");
  const [isProblemReady, setIsProblemReady] = useState(false);
  const [problem, setProblem] = useState({});
  const navigate = useNavigate();

  // Local runner state (ephemeral)
  const [testResults, setTestResults] = useState([]); // [{ actual, expected, pass }, ...]
  const lastRunRef = useRef(null);

  // ===== LOCALSTORAGE (prompt/code/oracleExecutionHistory) =====
  const [userStorageKey, setUserStorageKey] = useState(STORAGE_NAMESPACE);
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
      setStudentDataMap({});
    }
  }, [userStorageKey]);

  const persistLocal = (nextMap) => {
    if (!userStorageKey) return;
    localStorage.setItem(userStorageKey, JSON.stringify(nextMap));
  };

  const saveLocalField = (field, value) => {
    if (!problemId) return;
    setStudentDataMap((prev) => {
      const prevEntry = { ...(prev[problemId] || {}) };
      const nextValue =
        typeof value === "function" ? value(prevEntry[field]) : value;
      const updatedEntry = { ...prevEntry, [field]: nextValue };
      const updatedMap = { ...prev, [problemId]: updatedEntry };
      persistLocal(updatedMap);
      return updatedMap;
    });
  };

  // Derive CURRENT local values for this problem
  const currentLocal =
    studentDataMap && problemId ? studentDataMap[problemId] || {} : {};
  const studentAgentPrompt = currentLocal.agentPrompt || "";
  const studentCodeSubmission = currentLocal.codeSubmission || "";
  const oracleExecutionHistory = currentLocal.oracleExecutionHistory || [];

  // If server already has prompt/code/oracleExecutionHistory and local is empty (first load), hydrate local once.
  useEffect(() => {
    if (!problemId || !problemAttempt) return;

    const hasLocal = !!studentDataMap?.[problemId];
    const serverPrompt = problemAttempt.agentPrompt ?? "";
    const serverCode = problemAttempt.codeSubmission ?? "";
    const serverOracleHist = problemAttempt.oracleExecutionHistory ?? [];

    if (!hasLocal) {
      const next = {
        ...(studentDataMap || {}),
        [problemId]: {
          agentPrompt: serverPrompt,
          codeSubmission: serverCode,
          oracleExecutionHistory: serverOracleHist,
        },
      };
      setStudentDataMap(next);
      persistLocal(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemAttempt, problemId, userStorageKey]);

  // ===== FETCH DATA =====
  useEffect(() => {
    if (!profile?.email || !problemId) return;

    getProblemAttempt(problemId, profile.email)
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

        getExecuteTemplate(lang)
          .then((t) => setExecuteOracleTemplate(t))
          .catch((err) => {
            console.error(err);
            toast.error("Failed to load oracle template.");
          });

        getSubmissionTemplate(lang)
          .then((t) => setExecuteSubmissionTemplate(t))
          .catch((err) => {
            console.error(err);
            toast.error("Failed to load submission template.");
          });
      })
      .catch((err) => {
        console.error(err);
        navigate("/problems");
        toast.error("Something went wrong fetching that problem...");
      });

    getProblem(problemId)
      .then((fetchedProblem) => {
        setProblem(fetchedProblem);
        saveProbesToLocalStorage(problemId, fetchedProblem.defaultProbe);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load problem.");
      });
  }, [problemId, profile?.email, navigate]);

  useEffect(() => {
    if (!problem?.id) return;
    const hasLocal = !!studentDataMap?.[problemId]?.codeSubmission;
    if (!hasLocal && problem?.editorDefaultComment) {
      saveLocalField("codeSubmission", problem.editorDefaultComment);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem?.id, problem?.editorDefaultComment]);

  // Derive readiness
  useEffect(() => {
    const ready =
      !!problemAttempt &&
      !!problem?.id &&
      !!executeOracleTemplate &&
      !!executeSubmissionTemplate &&
      !!chatHistory;
    setIsProblemReady(ready);
  }, [
    problemAttempt,
    problem?.id,
    executeOracleTemplate,
    executeSubmissionTemplate,
    chatHistory,
  ]);

  // ===== SERVER PATCH HELPER =====
  const patchAttempt = useCallback(
    async (patch, { notify = false, refresh = true } = {}) => {
      if (!problemAttempt) {
        toast.error("🚨 Problem metadata not loaded yet. Try again. 🚨");
        return null;
      }

      const prev = problemAttempt;
      const next =
        typeof patch === "function" ? patch(prev) : { ...prev, ...patch };

      // Optimistic UI
      setProblemAttempt(next);

      try {
        await saveProblemAttempt(next);

        if (refresh) {
          const fresh = await getProblemAttempt(problemId, profile.email);
          setProblemAttempt(fresh);
        }

        if (notify) toast.success("Your submission was saved successfully!");

        getUserProfileSilently(profile.email)
          .then((updatedProfile) => setProfile(updatedProfile))
          .catch((e) => console.error(e));

        return next;
      } catch (e) {
        console.error(e);
        setProblemAttempt(prev); // revert optimistic
        toast.error("🚨Failed to save your submission. Please try again.");
        return null;
      }
    },
    [problemAttempt, problemId, profile?.email, setProfile],
  );

  // ===== PUBLIC UPDATERS =====
  // LOCAL ONLY (autosave to localStorage; NOT to server)
  const updateStudentAgentPrompt = (newPrompt) =>
    saveLocalField("agentPrompt", newPrompt);

  const updateStudentCodeSubmission = (newCode) =>
    saveLocalField("codeSubmission", newCode);

  const updateOracleHistory = (newHistory) =>
    saveLocalField("oracleExecutionHistory", newHistory);

  // SERVER-BACKED
  const updateNumTestsPassed = (count) => patchAttempt({ testsPassed: count });

  /**
   * Save the current attempt to the server, pulling prompt/code/oracle history from LOCAL.
   */
  const saveStudentAttempt = async (notifyStudent = false) => {
    if (!problemAttempt) {
      toast.error("🚨 Problem metadata not loaded yet. Try again. 🚨");
      return;
    }

    // Fetch the latest attempt from the server to avoid stale client state
    let base = null;
    try {
      base = await getProblemAttempt(problemId, profile.email);
      setProblemAttempt(base); // keep local in sync with the fresh server copy
    } catch (e) {
      console.warn("Falling back to local problemAttempt while saving:", e);
      base = problemAttempt;
    }

    const merged = {
      ...base,
      // Locally stored
      agentPrompt: studentAgentPrompt,
      codeSubmission: studentCodeSubmission,
      oracleExecutionHistory,

      // Server truth
      testsPassed: problemAttempt.testsPassed ?? 0,
      failedAttempts: problemAttempt.failedAttempts ?? 0,
    };

    await patchAttempt(merged, { notify: notifyStudent });
  };

  /**
   * Clears LOCAL draft for this problem (does NOT write to server).
   */
  const deleteStudentAttempt = () => {
    if (!problemId) return;
    setStudentDataMap((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [problemId]: _omit, ...rest } = prev || {};
      persistLocal(rest);
      return rest;
    });
  };

  /**
   * Execute tests. Persists attempt to server.
   */
  const runTests = useCallback(
    async (addLog) => {
      if (!problem?.id || !executeSubmissionTemplate || !problemAttempt)
        return null;

      const updateResults = async (execution) => {
        const output = execution?.run?.output ?? "";
        const didCompile = execution?.compile?.code === 0;

        const compileErrorMsg = didCompile
          ? undefined
          : (execution?.compile?.output ?? output);

        const lines = output.split(SPLIT_STRING);
        const totalTests = problem?.testSuite?.length ?? 0;

        let passedCount = 0;
        const next = [];

        for (let i = 0; i < totalTests; i++) {
          const expected =
            problem?.testSuite?.[i]?.expectedStdOut?.trim?.() ?? "";
          const actual = didCompile
            ? (lines[i]?.trim?.() ?? "")
            : "[COMPILATION ERROR]";
          const pass = actual === expected;
          if (pass) passedCount += 1;
          next.push({ actual, expected, pass, compileError: compileErrorMsg });
          if (!pass) break;
        }

        setTestResults(next);

        // Server truth for attempts:
        const willIncrementFailed =
          didCompile &&
          passedCount !== totalTests &&
          problemAttempt.completed === false;

        const nextFailedAttempts = willIncrementFailed
          ? (problemAttempt.failedAttempts ?? 0) + 1
          : (problemAttempt.failedAttempts ?? 0);

        await patchAttempt(
          {
            ...problemAttempt,
            agentPrompt: studentAgentPrompt,
            codeSubmission: studentCodeSubmission,
            oracleExecutionHistory,
            testsPassed: passedCount,
            failedAttempts: nextFailedAttempts,
          },
          { notify: true },
        );

        addLog?.({
          component: Component.TESTS,
          action: Action.CHECK,
          input: `${studentCodeSubmission}`, // LOCAL draft used for the run
          output: `${passedCount}/${totalTests}`,
        });

        lastRunRef.current = { didCompile, passedCount, nextFailedAttempts };
        return didCompile;
      };

      await handleTestSuiteExecution(
        problem,
        studentCodeSubmission, // run against LOCAL draft
        executeSubmissionTemplate,
        updateResults,
      );

      return lastRunRef.current ?? null;
    },
    [
      problem?.id,
      problem?.testSuite,
      executeSubmissionTemplate,
      studentCodeSubmission, // LOCAL
      patchAttempt,
      problemAttempt,
    ],
  );

  return (
    <ProblemAttemptContext.Provider
      value={{
        problemAttempt,
        setProblemAttempt,

        chatHistory,
        setChatHistory,

        isProblemReady,
        executeTemplate: executeOracleTemplate,
        problem,

        // LOCAL (draft) fields + updaters
        studentAgentPrompt,
        updateStudentAgentPrompt,
        studentCodeSubmission,
        updateStudentCodeSubmission,
        oracleExecutionHistory,
        updateOracleHistory,

        // SERVER-backed fields/APIs
        updateNumTestsPassed,
        saveStudentAttempt,
        deleteStudentAttempt,

        // Test runner API (ephemeral UI)
        testResults,
        setTestResults,
        runTests,
      }}
    >
      {children}
    </ProblemAttemptContext.Provider>
  );
};

export default ProblemAttemptProvider;
