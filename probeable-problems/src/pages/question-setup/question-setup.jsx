import Dropdown from "@/components/dropdown/dropdown.jsx";
import Instruction from "@/components/instruction/instruction";
import {
  CONSTRAINTS_INSTRUCTION,
  MODEL_SOLUTION_INSTRUCTION,
  TEST_CASES_INSTRUCTION,
} from "./data/instructions";
import styles from "./question-setup.module.css";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import { useState, useRef, useEffect } from "react";
import Button from "../../components/button/button";
import TextArea from "@/components/inputs/text-area.jsx";
import Terminal from "@/components/text-editor/terminal.jsx";
import { generateConstraints } from "@/routes/ai-route.js";
import { QUESTION_TYPES } from "@/pages/question-setup/data/question-types.js";

export default function QuestionSetup() {
  const [language, setLanguage] = useState("C");

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
          <Constraints problem={problem} />
        </div>
      </div>
      <div className={styles.outerContainer}>
        <div className={styles.innerContainer}>
          <TextEditor
            language={language}
            setLanguage={setLanguage}
            src={problem.testSuite}
            setSource={setTestSuite}
          />
          <Terminal />
          <div className={styles.buttonContainer}>
            <Button>Save</Button>
            <Button>Execute Test Suite</Button>
          </div>

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
  const [constraints, setConstraints] = useState(problem.constraints || "");

  useEffect(() => {
    setConstraints(problem.constraints);
  }, [problem]);

  const handleSave = () => {
    setProblem({ ...problem, constraints });
  };

  return (
    <>
      <Instruction
        heading={"1. Constraint Generation"}
        instruction={CONSTRAINTS_INSTRUCTION}
      />
      <TextArea
        rows={10}
        value={constraints}
        onChange={(e) => setConstraints(e.target.value)}
      />
      <div className={styles.buttonContainer}>
        <Button onClick={handleSave}>Save</Button>
        <Button>Generate Tests</Button>
      </div>
    </>
  );
}
