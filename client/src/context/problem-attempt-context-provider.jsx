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
import useWithLoading from "@/hooks/useWithLoading.js";

const STORAGE_NAMESPACE = "studentProblemData";

const ProblemAttemptProvider = ({ children }) => {
  const { problemId } = useParams();
  const { profile, setProfile } = useUserProfile();
  const [problemAttempt, setProblemAttempt] = useState(null);
  const [chatHistory, setChatHistory] = useState(null);
  const [executeOracleTemplate, setExecuteOracleTemplate] = useState("");
  const [executeSubmissionTemplate, setSubmissionTemplate] = useState("");
  const [isProblemReady, setIsProblemReady] = useState(false);
  const [problem, setProblem] = useState({});
  const navigate = useNavigate();
  const fetchedProblemIds = useRef(new Set());

  // Derived per-user storage key (hashed)
  const [userStorageKey, setUserStorageKey] = useState(null);
  const [studentDataMap, setStudentDataMap] = useState({});

  // Local runner state
  const [testResults, setTestResults] = useState([]); // [{ actual, expected, pass }, ...]
  const [, withLoading] = useWithLoading();

  // A place to stash the *latest* run results so runTests can return them
  const lastRunRef = useRef(null);

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
  const studentAgentPrompt = currentData.agentPrompt || "";
  const studentCodeSubmission = currentData.codeSubmission || "";
  const testsPassed = currentData.testsPassed || 0;
  const oracleExecutionHistory = currentData.oracleExecutionHistory || [];
  const failedAttempts = currentData.failedAttempts || 0;

  // Fetch attempt + chat, then chain execute template once we know the language.
  // Fetch problem in parallel.
  useEffect(() => {
    if (!profile?.email || !problemId) return;
    if (fetchedProblemIds.current.has(problemId)) return;
    fetchedProblemIds.current.add(problemId);

    // Attempt + chat -> template
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
          .then((template) => setExecuteOracleTemplate(template))
          .catch((err) => {
            console.error(err);
            toast.error("Failed to load oracle template.");
          });

        return getSubmissionTemplate(lang)
          .then((template) => setSubmissionTemplate(template))
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

    // Problem
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
    if (
      problem?.id &&
      (!studentCodeSubmission || studentCodeSubmission.length === 0)
    ) {
      updateStudentCodeSubmission(problem?.editorDefaultComment);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem, studentCodeSubmission]);

  // Derive readiness (include both templates in deps)
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

  const persist = (nextMap) => {
    if (!userStorageKey) return;
    localStorage.setItem(userStorageKey, JSON.stringify(nextMap));
  };

  const saveStudentData = (field, value) => {
    if (!problemId) return;
    setStudentDataMap((prev) => {
      const prevEntry = { ...(prev[problemId] || {}) };
      const nextValue =
        typeof value === "function" ? value(prevEntry[field]) : value;
      const updatedEntry = { ...prevEntry, [field]: nextValue };
      const updatedMap = { ...prev, [problemId]: updatedEntry };
      persist(updatedMap);
      return updatedMap;
    });
  };

  const updateStudentAgentPrompt = (newPrompt) =>
    saveStudentData("agentPrompt", newPrompt);

  const updateStudentCodeSubmission = (newCode) =>
    saveStudentData("codeSubmission", newCode);

  const updateNumTestsPassed = (count) => saveStudentData("testsPassed", count);

  /* store [{testcase: X, output: Y, timestamp: Z}, ...]*/
  const updateOracleHistory = (newHistory) =>
    saveStudentData("oracleExecutionHistory", newHistory);

  // Functional updater to avoid stale increments
  const updateFailedAttempts = (next) =>
    saveStudentData("failedAttempts", (prevVal) => {
      const base = typeof prevVal === "number" ? prevVal : 0;
      return typeof next === "function" ? next(base) : next;
    });

  /**
   * Deletes the entire stored data (prompt, code, score) for THIS problem (for this user)
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

  /**
   * Save the current attempt. Accepts optional overrides to avoid stale reads.
   * Example:
   *   saveStudentAttempt(true, { testsPassed: 3, failedAttempts: 2 })
   */
  const saveStudentAttempt = (notifyStudent = false, overrides = {}) => {
    if (!problemAttempt) {
      toast.error("🚨 Problem metadata not loaded yet. Try again. 🚨");
      return;
    }
    const toSave = {
      ...problemAttempt,
      agentPrompt: overrides.agentPrompt ?? studentAgentPrompt,
      codeSubmission: overrides.codeSubmission ?? studentCodeSubmission,
      failedAttempts: overrides.failedAttempts ?? failedAttempts,
      testsPassed: overrides.testsPassed ?? testsPassed,
      oracleExecutionHistory:
        overrides.oracleExecutionHistory ?? oracleExecutionHistory,
    };

    saveProblemAttempt(toSave)
      .then(() => {
        getProblemAttempt(problemId, profile.email).then((attempt) =>
          setProblemAttempt(attempt),
        );
        if (notifyStudent) {
          toast.success("Your submission was saved successfully!");
        }

        return getUserProfileSilently(profile.email)
          .then((updatedProfile) => setProfile(updatedProfile))
          .catch((e) => {
            console.error(e);
            // non-fatal
          });
      })
      .catch(() => {
        toast.error("🚨Failed to save your submission. Please try again.");
      });
  };

  /**
   * Execute the student implementation against the problem's test suite.
   * Returns an object: { didCompile, passedCount, nextFailedAttempts }
   */
  const runTests = useCallback(
    async (addLog) => {
      if (!problem?.id || !executeSubmissionTemplate) return null;

      const updateResults = async (execution) => {
        const output = execution?.run?.output ?? "";
        const didCompile = execution?.compile?.code === 0;

        const lines = output.split(SPLIT_STRING);
        let passedCount = 0;
        const next = [];

        const totalTests = problem?.testSuite?.length ?? 0;

        for (let i = 0; i < totalTests; i++) {
          const expected = problem?.testSuite?.[i]?.expectedStdOut ?? "";
          const actual = didCompile ? (lines[i] ?? "") : "[COMPILATION ERROR]";
          const pass = actual === expected;
          if (pass) passedCount += 1;
          next.push({ actual, expected, pass });
          if (!pass) break; // stop at first mismatch
        }

        setTestResults(next);
        updateNumTestsPassed(passedCount);

        // Compute next failedAttempts locally and persist with functional update
        const willIncrementFailed = didCompile && passedCount !== totalTests;
        const nextFailedAttempts = willIncrementFailed
          ? failedAttempts + 1
          : failedAttempts;

        if (willIncrementFailed) {
          // Functional increment avoids lost updates
          updateFailedAttempts((v) => (typeof v === "number" ? v + 1 : 1));
        }

        const numTestsPassed = `${passedCount}/${totalTests}`;
        addLog?.({
          component: Component.TESTS,
          action: Action.EXECUTE,
          input: `${studentCodeSubmission}`,
          output: numTestsPassed,
        });

        // Stash authoritative results to return from runTests()
        lastRunRef.current = { didCompile, passedCount, nextFailedAttempts };

        // Preserve existing contract if handleTestSuiteExecution expects a boolean return
        return didCompile;
      };

      // Await the suite execution; then return what updateResults stashed
      await handleTestSuiteExecution(
        problem,
        studentCodeSubmission,
        executeSubmissionTemplate,
        updateResults,
      );

      return lastRunRef.current ?? null;
    },
    [
      problem?.id,
      problem?.testSuite,
      executeSubmissionTemplate,
      studentCodeSubmission,
      updateNumTestsPassed,
      failedAttempts,
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
        studentAgentPrompt,
        updateStudentAgentPrompt,
        studentCodeSubmission,
        updateStudentCodeSubmission,
        deleteStudentAttempt,
        updateNumTestsPassed,
        updateOracleHistory,
        oracleExecutionHistory,
        saveStudentAttempt,
        executeTemplate: executeOracleTemplate,
        problem,

        // Test runner API
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
