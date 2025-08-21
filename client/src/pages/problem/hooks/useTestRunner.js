import { useCallback } from "react";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { useLogging } from "@/context/logging-context-provider.jsx";

/**
 * Backwards-compatible wrapper so existing call sites can keep using:
 *   const { results, setResults, run } = useTestRunner({ addLog });
 * `problem` and `template` props are now ignored (provider owns them).
 */
export default function useTestRunner() {
  const { runTests, testResults, setTestResults } = useProblemAttemptContext();
  const { addLog } = useLogging();

  const run = useCallback(
    async (implementation) => runTests(implementation, addLog),
    [runTests, addLog],
  );

  return {
    testResults,
    setTestResults,
    run,
  };
}
