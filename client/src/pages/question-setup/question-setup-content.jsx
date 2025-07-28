import ProblemStatement from "./components/problem-statement.jsx";
import TestSuite from "./components/test-suite.jsx";
import Constraints from "./components/constraints.jsx";
import ModelSolution from "./components/model-solution.jsx";
import styles from "./question-setup.module.css";
import OracleCreation from "@/pages/question-setup/components/oracle-creation.jsx";
import Button from "@/components/button/button.jsx";
import { toast } from "react-toastify";
import useWithLoading from "@/hooks/useWithLoading.js";
import { useProblemContext } from "@/context/problem-context-provider.jsx";
import { createProblem } from "@/routes/problem-route.js";

export default function QuestionSetupContent() {
  const [isLoading, withLoading] = useWithLoading();
  const { problem, oracle } = useProblemContext();
  const saveQuestion = () => {
    if (
      !problem.problemStatement ||
      !problem.modelAnswer ||
      !problem.constraints ||
      !problem.testSuite ||
      !oracle
    ) {
      toast.error("Please generate all aspects of the problem before saving.");
      return;
    }

    withLoading(
      () => createProblem(problem),
      () => {
        toast.success("Problem has been saved in database!");
        localStorage.removeItem("problemUnderCreation");
      },
      (err) => toast.error(err),
    );
  };
  return (
    <div className={styles.questionCreatorContainer}>
      <ModelSolution />
      <Constraints />
      <TestSuite />
      <ProblemStatement />
      <OracleCreation />
      <div className={styles.buttonContainer}>
        <Button onClick={saveQuestion} disabled={isLoading}>
          Save
        </Button>
      </div>
    </div>
  );
}