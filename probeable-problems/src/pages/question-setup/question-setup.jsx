import Dropdown from "@/components/dropdown/dropdown.jsx";
import Instruction from "@/components/instruction/instruction";
import {
  CONSTRAINTS_INSTRUCTION,
  MODEL_SOLUTION_INSTRUCTION,
  PROBLEM_STATEMENT_INSTRUCTION,
  TEST_CASES_INSTRUCTION,
} from "./data/instructions";
import styles from "./question-setup.module.css";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import { useState } from "react";
import Button from "../../components/button/button";
import TextArea from "@/components/inputs/text-area.jsx";
import Terminal from "@/components/text-editor/terminal.jsx";
import {
  generateConstraints,
  generateProblemStatement,
  generateTestSuite,
} from "@/routes/ai-route.js";
import { QUESTION_TYPES } from "@/pages/question-setup/data/question-types.js";
import { executeCodePistonDirect } from "@/routes/code-route.js";
import { createProblem, updateProblem } from "@/routes/problem-route.js";
import useWithLoading from "@/hooks/useWithLoading.js";
import { toast } from "react-toastify";

export default function QuestionSetup() {
  const [language, setLanguage] = useState("c");

  const setModelSolution = (modelSolution) => {
    setProblem({ ...problem, modelAnswer: modelSolution });
  };

  const setTestSuite = (testSuite) => {
    setProblem({ ...problem, testSuite: testSuite });
  };

  const [problem, setProblem] = useState({
    problemStatement: "",
    modelAnswer: "",
    constraints: "",
    testSuite: "",
    programLanguage: null,
    problemType: null,
    defaultProbe: null,
  });

  return (
    <div className={styles.pageContainer}>
      <div className={styles.outerContainer}>
        <div className={styles.innerContainer}>
          <ModelSolution
            language={language}
            setLanguage={setLanguage}
            setSource={setModelSolution}
            instruction={MODEL_SOLUTION_INSTRUCTION}
            problem={problem}
            setProblem={setProblem}
          />
          <Constraints problem={problem} setProblem={setProblem} />
        </div>
      </div>
      <div className={styles.outerContainer}>
        <div className={styles.innerContainer}>
          <TestSuite
            problem={problem}
            setProblem={setProblem}
            language={language}
            setLanguage={setLanguage}
            setTestSuite={setTestSuite}
          />
          <ProblemStatement problem={problem} setProblem={setProblem} />
        </div>
      </div>
    </div>
  );
}

function ModelSolution({
  language,
  setLanguage,
  setSource,
  instruction,
  setProblem,
  problem,
}) {
  const [isLoading, withLoading] = useWithLoading();
  const handleQuestionTypeSelect = (problemType) => {
    setProblem({ ...problem, problemType: problemType });
  };
  const handleConstraintsGeneration = () => {
    withLoading(
      () => generateConstraints(problem),
      (updatedProblem) => {
        setProblem(updatedProblem);
        toast.success("Constraints generated! please review them carefully 😊");
      },
      (err) => toast.error(err),
    );
  };

  const saveQuestion = () => {
    withLoading(
      () => createProblem(problem),
      (persisted) => {
        setProblem(persisted);
        toast.success("Model solution saved to database!");
      },
      (err) => toast.error(err),
    );
  };

  return (
    <>
      <Instruction heading="Question Creator" instruction={instruction} />
      <Dropdown
        label="Question Type:"
        options={QUESTION_TYPES}
        onSelect={handleQuestionTypeSelect}
      />
      <TextEditor
        language={language}
        setLanguage={setLanguage}
        src={problem.modelAnswer}
        setSource={setSource}
      />
      <div className={styles.buttonContainer}>
        <Button onClick={saveQuestion} disabled={isLoading}>
          Save
        </Button>
        <Button onClick={handleConstraintsGeneration} disabled={isLoading}>
          Generate Constraints
        </Button>
      </div>
    </>
  );
}

function Constraints({ problem, setProblem }) {
  const [isLoading, withLoading] = useWithLoading();
  const handleChange = (e) => {
    setProblem({
      ...problem,
      constraints: e.target.value,
    });
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

  const handleTestSuiteGeneration = () => {
    withLoading(
      () => generateTestSuite(problem),
      (updatedProblem) => {
        setProblem(updatedProblem);
        toast.success(
          "Test suite has been generated! please review them carefully 😊",
        );
      },
      (err) => toast.error(err),
    );
  };

  return (
    <>
      <Instruction
        heading={"1. Constraint Generation"}
        instruction={CONSTRAINTS_INSTRUCTION}
      />
      <TextArea
        rows={10}
        value={problem.constraints || ""}
        onChange={handleChange}
      />
      <div className={styles.buttonContainer}>
        <Button onClick={saveQuestion} disabled={isLoading}>
          Save
        </Button>
        <Button onClick={handleTestSuiteGeneration} disabled={isLoading}>
          Generate Tests
        </Button>
      </div>
    </>
  );
}

function TestSuite({
  language,
  setLanguage,
  problem,
  setProblem,
  setTestSuite,
}) {
  const SPLIT_STRING = "$_@_BBJ_SPL1T_@_$"
  const [executionOutput, setExecutionOutput] = useState("");
  const [isLoading, withLoading] = useWithLoading();
  const [results, setResults] = useState([])

  const tests = [
    { code: 'int arr[] = {1, 2, 3, 4, 5};\nint result = CountBetween(arr, 5, 2, 4);\nprintf("%d", result);', expectedStdOut: '1' },
    { code: 'int arr[] = {1, 2, 3, 4, 5};\nint result = CountBetween(arr, 5, 4, 2);\nprintf("%d", result);', expectedStdOut: '1' },
    { code: 'int arr[] = {1, 2, 3, 4, 5};\nint result = CountBetween(arr, 5, 3, 3);\nprintf("%d", result);', expectedStdOut: '0' },
    { code: 'int arr[] = {2, 2, 4, 4};\nint result = CountBetween(arr, 4, 2, 4);\nprintf("%d", result);', expectedStdOut: '0' },
    { code: 'int arr[] = {1, 2, 3};\nint result = CountBetween(arr, 0, 0, 10);\nprintf("%d", result);', expectedStdOut: '0' },
    { code: 'int arr[] = {1, 2, 3};\nint result = CountBetween(arr, -3, 0, 10);\nprintf("%d", result);', expectedStdOut: '0' },
    { code: 'int arr[] = {INT_MIN, -1, 0, 1, INT_MAX};\nint result = CountBetween(arr, 5, INT_MIN, INT_MAX);\nprintf("%d", result);', expectedStdOut: '3' },
    { code: 'int arr[] = {50};\nint result = CountBetween(arr, 1, 0, 100);\nprintf("%d", result);', expectedStdOut: '1' },
  ];


  const handleTestSuiteExecution = async () => {
    const response = await fetch('/test.txt');

    const generatedTests = tests.map((test, i) => `
    void test_${i + 1}() {
        ${test.code}
    }
    `).join('\n');

    const switchTests = tests.map((_, i) => `
        case ${i}: test_${i + 1}(); break;
    `).join('\n');

    let testSuiteFromFile = await response.text();

    testSuiteFromFile = testSuiteFromFile.replace(
      '//VAR_IMPLEMENTATION',
      problem.modelAnswer
    ).replace(
      '//VAR_SPLIT',
      SPLIT_STRING
    ).replace(
      '//VAR_NUM_TESTS',
      tests.length.toString()
    ).replace(
      '//VAR_TESTS',
      generatedTests
    ).replace(
      '//VAR_SWITCH_TESTS',
      switchTests
    );

    withLoading(
      () => executeCodePistonDirect(language, testSuiteFromFile),
      (execution) => {
        const output = execution.run.output;
        const lines = output.split(SPLIT_STRING);
        console.log(lines)
        setExecutionOutput(output);
        setResults(lines);
      },
      (err) => toast.error(err),
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
    <>
      <TextEditor
        language={language}
        setLanguage={setLanguage}
        src={problem.testSuite}
        setSource={setTestSuite}
      />
      <Instruction
        heading="2. Test Suite Generation"
        instruction={TEST_CASES_INSTRUCTION}
      />
      <Terminal output={executionOutput} />
      <div className={styles.buttonContainer}>
        <Button onClick={saveQuestion} disabled={isLoading}>
          Save
        </Button>
        <Button onClick={handleTestSuiteExecution} disabled={isLoading}>
          Execute Test Suite
        </Button>
      </div>
    </>
  );
}

function ProblemStatement({ problem, setProblem }) {
  const [isLoading, withLoading] = useWithLoading();

  const handleProblemStatementGeneration = () => {
    withLoading(
      () => generateProblemStatement(problem),
      (updatedProblem) => setProblem(updatedProblem),
      (err) => toast.error(err),
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
    <>
      <Instruction
        heading={"3. Problem Statement Creation"}
        instruction={PROBLEM_STATEMENT_INSTRUCTION}
      />
      <TextArea
        rows={2}
        disabled={isLoading}
        value={problem.problemStatement}
      />
      <div className={styles.buttonContainer}>
        <Button onClick={saveQuestion} disabled={isLoading}>
          Save
        </Button>
        <Button onClick={handleProblemStatementGeneration} disabled={isLoading}>
          Generate Problem Statement
        </Button>
      </div>
    </>
  );
}
