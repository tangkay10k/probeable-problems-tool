import { useCallback, useState } from "react";
import { SPLIT_STRING } from "@/constants/setup-constants";
import { handleTestSuiteExecution } from "@/pages/question-setup/utils/test-setup-utils.js";
import { Action, Component } from "@/constants/logConstants.js";

export default function useTestRunner({
  problem,
  template,
  addLog,
  updateStudentScore,
}) {
  const [results, setResults] = useState([]);
  const [numPassed, setNumPassed] = useState(0);

  const run = useCallback(
    async (implementation) => {
      if (!problem || !template) return null;

      const updateResults = (execution) => {
        const output = execution.run.output ?? "";
        const lines = output.split(SPLIT_STRING);
        let passedCount = 0;
        const next = [];

        for (let i = 0; i < lines.length; i++) {
          const expected = problem?.testSuite?.[i]?.expectedStdOut ?? "";
          const actual =
            execution.compile.code === 0 ? lines[i] : "[COMPILATION ERROR]";
          const pass = actual === expected;
          if (pass) passedCount += 1;
          next.push({ actual, expected, pass });
          if (!pass) break; // stop at first mismatch
        }

        setResults(next);
        setNumPassed(passedCount);
        const score = `${passedCount}/${problem?.testSuite?.length ?? 0}`;
        updateStudentScore(score);

        addLog({
          component: Component.TESTS,
          action: Action.EXECUTE,
          input: `${implementation}`,
          output: score,
        });
      };

      return handleTestSuiteExecution(
        problem,
        implementation,
        template,
        updateResults,
      );
    },
    [problem, template, addLog, updateStudentScore],
  );

  return { results, setResults, numPassed, run };
}
