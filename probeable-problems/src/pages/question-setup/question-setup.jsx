import styles from "./question-setup.module.css";
import { useState, useEffect } from "react";
import { getTestTemplate } from "@/routes/test-template-route.js";
import useWithLoading from "@/hooks/useWithLoading.js";
import ProblemStatement from "@/pages/question-setup/components/problem-statement.jsx";
import TestSuite from "@/pages/question-setup/components/test-suite.jsx";
import Constraints from "@/pages/question-setup/components/constraints.jsx";
import ModelSolution from "@/pages/question-setup/components/model-solution.jsx";

export default function QuestionSetup() {
  const [_, withLoading] = useWithLoading();
  const setLanguage = (programLanguage) => {
    setProblem((prev) => ({ ...prev, programLanguage }));
  };

  const setModelSolution = (modelAnswer) => {
    setProblem((prev) => ({ ...prev, modelAnswer }));
  };

  const setTestSuite = (testSuite) => {
    setProblem((prev) => ({ ...prev, testSuite }));
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

  const [testTemplate, setTestTemplate] = useState("");

  useEffect(() => {
    withLoading(
      () => getTestTemplate(problem.programLanguage),
      (template) => setTestTemplate(template),
      (err) => console.log(`No template for ${problem.programLanguage}`, err),
    );
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.questionCreatorContainer}>
        <ModelSolution
          language={problem.programLanguage}
          setLanguage={setLanguage}
          setSource={setModelSolution}
          problem={problem}
          setProblem={setProblem}
          setTestTemplate={setTestTemplate}
        />

        <Constraints problem={problem} setProblem={setProblem} />

        <TestSuite
          problem={problem}
          setProblem={setProblem}
          language={problem.programLanguage}
          setLanguage={setLanguage}
          setTestSuite={setTestSuite}
          testTemplate={testTemplate}
          setTestTemplate={setTestTemplate}
        />

        <ProblemStatement problem={problem} setProblem={setProblem} />
      </div>
    </div>
  );
}
