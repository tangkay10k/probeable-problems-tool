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
  const [isLoading, setIsLoading] = useState(false);
  const handleQuestionTypeSelect = (problemType) => {
    setProblem({ ...problem, problemType: problemType });
  };
  const handleConstraintsGeneration = () => {
    setIsLoading(true);
    generateConstraints(problem)
      .then((updatedProblem) => {
        setProblem(updatedProblem);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const saveQuestion = () => {
    setIsLoading(true);
    createProblem(problem)
      .then((persisted) => {
        setProblem(persisted);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
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
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    setProblem({
      ...problem,
      constraints: e.target.value,
    });
  };

  const saveQuestion = () => {
    console.log(problem);
    setIsLoading(true);
    updateProblem(problem)
      .then((persisted) => {
        setProblem(persisted);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const handleTestSuiteGeneration = () => {
    setIsLoading(true);
    generateTestSuite(problem)
      .then((updatedProblem) => {
        setProblem(updatedProblem);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
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
  const [executionOutput, setExecutionOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const tests = [
    { code: 'int arr[] = {1, 2, 3, 4, 5};\nint result = CountBetween(arr, 5, 2, 4);', expectedReturn: 1, expectedStdOut: 's' },
    // { code: 'int arr[] = {1, 2, 3, 4, 5};\nint result = CountBetween(arr, 5, 4, 2);', expectedReturn: 1, expectedStdOut: '' },
    // { code: 'int arr[] = {1, 2, 3, 4, 5};\nint result = CountBetween(arr, 5, 3, 3);', expectedReturn: 0, expectedStdOut: '' },
    // { code: 'int arr[] = {2, 2, 4, 4};\nint result = CountBetween(arr, 4, 2, 4);', expectedReturn: 0, expectedStdOut: '' },
    // { code: 'int arr[] = {1, 2, 3};\nint result = CountBetween(arr, 0, 0, 10);', expectedReturn: 0, expectedStdOut: '' },
    // { code: 'int result = CountBetween(NULL, 0, 0, 10);', expectedReturn: 0, expectedStdOut: '' },
    // { code: 'int arr[] = {1, 2, 3};\nint result = CountBetween(arr, -3, 0, 10);', expectedReturn: 0, expectedStdOut: '' },
    // { code: 'int arr[] = {INT_MIN, -1, 0, 1, INT_MAX};\nint result = CountBetween(arr, 5, INT_MIN, INT_MAX);', expectedReturn: 3, expectedStdOut: '' },
    // { code: 'int arr[] = {50};\nint result = CountBetween(arr, 1, 0, 100);', expectedReturn: 1, expectedStdOut: '' },
  ];

  const parseTestOutput = (output) => {
    const lines = output.split('\n');
    console.log(lines)
    const results = [];
    let currentTest = null;
    let currentStdout = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('=== TEST ') && line.includes('START ===')) {
          console.log("BOB")
        const testNum = parseInt(line.match(/TEST (\d+)/)[1]);
        currentTest = { testNum, stdout: [], returnValue: null };
        currentStdout = [];
      } else if (line.startsWith('=== TEST ') && line.includes('END ===')) {
        console.log("James")
        if (currentTest) {
          console.log("James")
          // Process stdout to extract return value and user output
          const stdoutText = currentStdout.join('\n');
          
          // Extract actual return value
          const returnMatch = stdoutText.match(/ACTUAL_RETURN:(-?\d+)/);
          if (returnMatch) {
            currentTest.returnValue = parseInt(returnMatch[1]);
          }
          
          // Remove control lines from stdout to get user output
          const currentStdOut = stdoutText
            .replace(/ACTUAL_RETURN:-?\d+\n?/g, '')
            .replace(/TEST_RESULT:(PASS|FAIL)\n?/g, '')
            .trim();

          currentTest.stdout=currentStdOut;

          console.log(currentStdOut)

          results.push(currentTest);
          currentTest = null;
        }
      } else if (currentTest && line !== '') {
        console.log("Jim")
        currentStdout.push(line);
      }
    }
    
    return results;
  };

  const handleTestSuiteExecution = async () => {
    const response = await fetch('/test.txt');
    let testSuiteFromFile = await response.text();

    testSuiteFromFile = testSuiteFromFile.replace(
      '//VAR_IMPLEMENTATION',
      problem.modelAnswer
    );

    testSuiteFromFile = testSuiteFromFile.replace(
      '//VAR_NUM_TESTS',
      tests.length.toString()
    );

    // Generate tests that properly check return values and capture stdout
    const generatedTests = tests.map((test, i) => `
    void test_${i + 1}() {
        // Execute the test code
        ${test.code}
        
        // Print the actual return value for parsing
        printf("ACTUAL_RETURN:%d\\n", result);
    }
    `).join('\n');

    testSuiteFromFile = testSuiteFromFile.replace(
      '//VAR_TESTS',
      generatedTests
    );

    const switchTests = tests.map((_, i) => `
        case ${i}: test_${i + 1}(); break;
    `).join('\n');

    testSuiteFromFile = testSuiteFromFile.replace(
      '//VAR_SWITCH_TESTS',
      switchTests
    );

    setIsLoading(true);

    executeCodePistonDirect(language, testSuiteFromFile)
      .then((execution) => {
        console.log(execution);
        const output = execution.run.output;
        setExecutionOutput(output);
        
        const actualResults = parseTestOutput(output);

        console.log(actualResults)
        
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const saveQuestion = () => {
    setIsLoading(true);
    updateProblem(problem)
      .then((persisted) => {
        setProblem(persisted);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
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
  const [isLoading, setIsLoading] = useState(false);

  const handleProblemStatementGeneration = () => {
    setIsLoading(true);
    generateProblemStatement(problem)
      .then((updatedProblem) => {
        setProblem(updatedProblem);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const saveQuestion = () => {
    setIsLoading(true);
    updateProblem(problem)
      .then((persisted) => {
        setProblem(persisted);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
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
