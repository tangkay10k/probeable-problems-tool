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
import { CodeAndOutput } from "@/components/text-editor/code-and-output";
import { useState, useEffect } from "react";
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
  const setModelSolution = (modelSolution) => {
    setProblem({ ...problem, modelAnswer: modelSolution });
  };

  const setTestSuite = (testSuite) => {
    setProblem({ ...problem, testSuite });
  };

  const setLanguage = (programLanguage) => {
    setProblem({ ...problem, programLanguage });
  };


  const [problem, setProblem] = useState({
    problemStatement: "",
    modelAnswer: "",
    constraints: "",
    testSuite: [],
    programLanguage: "c",
    problemType: null,
    defaultProbe: null,
  });

  return (
    <div className={styles.pageContainer}>
      <div className={styles.outerContainer}>
        <div className={styles.innerContainer}>
          <ModelSolution
            language={problem.programLanguage}
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
            language={problem.programLanguage}
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
  //Unique Variable To Split Print Statements In The Output
  const SPLIT_STRING = "$_@_BBJ_SPL1T_@_$"
  const [isLoading, withLoading] = useWithLoading();
  const [results, setResults] = useState([])
  const [terminalOutput, setTerminalOutput] = useState("");


  const handleTestSuiteExecution = async () => {
    let testSuiteFromFile
    switch (language) {
      case 'c':
        testSuiteFromFile = await inputCVariables();
        break;
      case 'java':
        //TODO
        break;
      default:
        //TODO
        break;
    }

    withLoading(
      () => executeCodePistonDirect(language, testSuiteFromFile),
      (execution) => updateResults(execution),
      (err) => toast.error(err),
    );
  };

  const inputCVariables = async () => {
    const response = await fetch('/test.txt');
    const generatedTests = problem?.testSuite?.map((test, i) => `
    void test_${i + 1}() {
        ${test.code}
    }
    `).join('\n');

    const switchTests = problem?.testSuite?.map((_, i) => `
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
      problem?.testSuite?.length.toString()
    ).replace(
      '//VAR_TESTS',
      generatedTests
    ).replace(
      '//VAR_SWITCH_TESTS',
      switchTests
    );
    return testSuiteFromFile;
  }

  const updateResults = (execution) => {
    const output = execution.run.output;
    console.log(execution)
    const lines = output.split(SPLIT_STRING);

    let passedCount = 0;

    const updatedResults = lines.map((line, i) => {
      const expected = problem?.testSuite[i]?.expectedStdOut ?? '';
      if (line === expected) passedCount += 1;
      return { actual: line, expected };
    });

    setResults(updatedResults);
    setTerminalOutput(`${passedCount}/${problem?.testSuite?.length} tests passed`);
  }

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
      <CodeAndOutput tests={problem?.testSuite} setTests={setTestSuite} language={language} setLanguage={setLanguage} results={results} setResults={setResults} />
      <Instruction
        heading="2. Test Suite Generation"
        instruction={TEST_CASES_INSTRUCTION}
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
