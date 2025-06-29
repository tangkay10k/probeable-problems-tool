import Dropdown from "@/components/dropdown/dropdown.jsx";
import Instruction from "@/components/instruction/instruction";
import {
  CONSTRAINTS_INSTRUCTION,
  MODEL_SOLUTION_INSTRUCTION,
  TEST_CASES_INSTRUCTION,
} from "./data/instructions";
import styles from "./question-setup.module.css";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import { useEffect, useState } from "react";
import Button from "../../components/button/button";
import TextArea from "@/components/inputs/text-area.jsx";
import Terminal from "@/components/text-editor/terminal.jsx";
import { generateConstraints, generateTestSuite } from "@/routes/ai-route.js";
import { QUESTION_TYPES } from "@/pages/question-setup/data/question-types.js";

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
            testSuite={problem.testSuite}
            language={language}
            setLanguage={setLanguage}
            setTestSuite={setTestSuite}
          />

          <Instruction
            heading="2. Test Suite Generation"
            instruction={TEST_CASES_INSTRUCTION}
          />
          <TextArea rows={2} />
          <div className={styles.buttonContainer}>
            <Button>Save</Button>
            <Button>Generate Problem Statement</Button>
          </div>
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
  const [isGenerating, setIsGenerating] = useState(false);
  const handleQuestionTypeSelect = (problemType) => {
    setProblem({ ...problem, problemType: problemType });
  };
  const handleConstraintsGeneration = () => {
    setIsGenerating(true);
    generateConstraints(problem)
      .then((updatedProblem) => {
        setProblem(updatedProblem);
      })
      .catch(console.error)
      .finally(() => setIsGenerating(false));
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
        <Button>Save</Button>
        <Button onClick={handleConstraintsGeneration} disabled={isGenerating}>
          Generate Constraints
        </Button>
      </div>
    </>
  );
}

function Constraints({ problem, setProblem }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const handleChange = (e) => {
    setProblem({
      ...problem,
      constraints: e.target.value,
    });
  };

  const handleTestSuiteGeneration = () => {
    setIsGenerating(true);
    generateTestSuite(problem)
      .then((updatedProblem) => {
        setProblem(updatedProblem);
      })
      .catch(console.error)
      .finally(() => setIsGenerating(false));
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
        <Button>Save</Button>
        <Button onClick={handleTestSuiteGeneration} disabled={isGenerating}>
          Generate Tests
        </Button>
      </div>
    </>
  );
}

function TestSuite({ language, setLanguage, testSuite, setTestSuite }) {
  useEffect(() => {}, [testSuite]);

  return (
    <>
      <TextEditor
        language={language}
        setLanguage={setLanguage}
        src={testSuite}
        setSource={setTestSuite}
      />
      <Terminal />
      <div className={styles.buttonContainer}>
        <Button>Save</Button>
        <Button>Execute Test Suite</Button>
      </div>
    </>
  );
}
