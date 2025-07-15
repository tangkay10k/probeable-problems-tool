import ProblemStatement from "./components/problem-statement.jsx";
import TestSuite from "./components/test-suite.jsx";
import Constraints from "./components/constraints.jsx";
import ModelSolution from "./components/model-solution.jsx";
import styles from "./question-setup.module.css";

export default function QuestionSetupContent() {
  return (
    <div className={styles.questionCreatorContainer}>
      <ModelSolution />
      <Constraints />
      <TestSuite />
      <ProblemStatement />
    </div>
  );
}
