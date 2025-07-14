import useWithLoading from "@/hooks/useWithLoading.js";
import { useState } from "react";
import { createTestSuiteFromFile } from "@/pages/question-setup/test-setup-utils.js";
import { executeCodePistonDirect } from "@/routes/code-route.js";
import { toast } from "react-toastify";
import { updateProblem } from "@/routes/problem-route.js";
import styles from "@/pages/question-setup/question-setup.module.css";
import Instruction from "@/components/instruction/instruction.jsx";
import { TEST_CASES_INSTRUCTION } from "@/pages/question-setup/data/instructions.js";
import { TestSuiteList } from "@/components/text-editor/test-suite-list.jsx";
import Terminal from "@/components/text-editor/terminal.jsx";
import Button from "@/components/button/button.jsx";

export default function TestSuite({
  language,
  setLanguage,
  problem,
  setProblem,
  setTestSuite,
  testTemplate,
  setTestTemplate,
}) {
  // Print statement delimiter
  const SPLIT_STRING = "$_@_BBJ_SPL1T_@_$";
  const [isLoading, withLoading] = useWithLoading();
  const [results, setResults] = useState([]);
  const [terminalOutput, setTerminalOutput] = useState();

  const handleTestSuiteExecution = () => {
    const testSuiteFromFile = createTestSuiteFromFile(
      problem,
      testTemplate,
      SPLIT_STRING,
      language,
    );

    withLoading(
      () => executeCodePistonDirect(language, testSuiteFromFile),
      (execution) => updateResults(execution),
      (err) => toast.error(err),
    );
  };

  const updateResults = (execution) => {
    const output = execution.run.output;

    const lines = output.split(SPLIT_STRING);

    let passedCount = 0;

    const updatedResults = lines.map((line, i) => {
      const expected = problem?.testSuite[i]?.expectedStdOut ?? "";
      if (line === expected) passedCount += 1;
      return { actual: line, expected };
    });

    setResults(updatedResults);
    setTerminalOutput(
      `${passedCount}/${problem?.testSuite?.length} tests passed`,
    );
  };

  const saveQuestion = () => {
    withLoading(
      () => updateProblem(problem),
      (persisted) => {
        setProblem(persisted);
        toast.success("Problem has been updated in database!");
      },
      (err) => toast.error(err),
    );
  };

  return (
    <div className={styles.testSuiteContainer}>
      <Instruction
        heading="2. Test Suite Generation"
        instruction={TEST_CASES_INSTRUCTION}
      />

      <TestSuiteList
        tests={problem?.testSuite}
        setTests={setTestSuite}
        language={language}
        setLanguage={setLanguage}
        results={results}
        setResults={setResults}
        setTestTemplate={setTestTemplate}
      />

      <Terminal output={terminalOutput} />

      <div className={styles.buttonContainer}>
        <Button onClick={saveQuestion} disabled={isLoading}>
          Save
        </Button>
        <Button onClick={handleTestSuiteExecution} disabled={isLoading}>
          Execute Test Suite
        </Button>
      </div>
    </div>
  );
}
