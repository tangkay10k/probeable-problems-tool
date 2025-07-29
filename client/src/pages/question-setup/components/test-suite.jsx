import useWithLoading from "@/hooks/useWithLoading.js";
import {
  handleTestSuiteExecution,
  SPLIT_STRING,
} from "@/pages/question-setup/utils/test-setup-utils.js";
import { toast } from "react-toastify";
import styles from "@/pages/question-setup/question-setup.module.css";
import Instruction from "@/components/instruction/instruction.jsx";
import { TEST_CASES_INSTRUCTION } from "@/pages/question-setup/data/instructions.js";
import { TestSuiteList } from "@/components/text-editor/test-suite-list.jsx";
import Terminal from "@/components/text-editor/terminal.jsx";
import Button from "@/components/button/button.jsx";
import { useProblemContext } from "@/context/problem-context-provider.jsx";
import { useState } from "react";

export default function TestSuite() {
  const { problem, setProblem, testTemplate, setLanguage, setTestSuite } =
    useProblemContext();

  const [isLoading, withLoading] = useWithLoading();
  const [results, setResults] = useState([]);
  const [terminalOutput, setTerminalOutput] = useState();

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

  const handleExecution = () => {
    if (problem.modelAnswer.length === 0 || problem.testSuite.length === 0) {
      toast.error(
        "Please provide a model solution and at least one test case before executing the test suite.",
      );
      return;
    }

    withLoading(
      () =>
        handleTestSuiteExecution(
          problem,
          problem.modelAnswer,
          testTemplate,
          updateResults,
        ),
      () => toast.success("Test suite executed successfully!"),
      console.error,
    );
  };

  return (
    <div className={styles.testSuiteContainer}>
      <Instruction
        heading="2. Test Suite Generation"
        instruction={TEST_CASES_INSTRUCTION}
      />

      <TestSuiteList
        tests={problem.testSuite}
        setTests={setTestSuite}
        language={problem.programLanguage}
        setLanguage={setLanguage}
        results={results}
        setResults={setResults}
      />
      <div>
        <Terminal output={terminalOutput} />
      </div>

      <div className={styles.buttonContainer}>
        <Button onClick={handleExecution} disabled={isLoading}>
          Execute Test Suite
        </Button>
      </div>
    </div>
  );
}
