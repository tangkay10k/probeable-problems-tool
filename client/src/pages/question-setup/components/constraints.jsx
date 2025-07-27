import useWithLoading from "@/hooks/useWithLoading.js";
import { toast } from "react-toastify";
import { generateTestSuite } from "@/routes/ai-route.js";
import styles from "@/pages/question-setup/question-setup.module.css";
import Instruction from "@/components/instruction/instruction.jsx";
import { CONSTRAINTS_INSTRUCTION } from "@/pages/question-setup/data/instructions.js";
import TextArea from "@/components/inputs/text-area.jsx";
import Button from "@/components/button/button.jsx";
import { useProblemContext } from "@/context/problem-context-provider.jsx";

export default function Constraints() {
  const { problem, setProblem } = useProblemContext();
  const [isLoading, withLoading] = useWithLoading();

  const handleChange = (e) => {
    setProblem({ ...problem, constraints: e.target.value });
  };

  const handleTestSuiteGeneration = () => {
    withLoading(
      () => generateTestSuite(problem),
      (updatedProblem) => {
        setProblem(updatedProblem);
        toast.success(
          "Test suite has been generated! Please review them carefully 😊",
        );
      },
      (err) => toast.error(err),
    );
  };

  return (
    <div className={styles.constraintsContainer}>
      <Instruction
        heading="1. Constraint Generation"
        instruction={CONSTRAINTS_INSTRUCTION}
      />
      <TextArea
        rows={10}
        resizable={true}
        value={problem.constraints || ""}
        onChange={handleChange}
        placeholder="Problem Constraints: "
      />
      <div className={styles.buttonContainer}>
        <Button onClick={handleTestSuiteGeneration} disabled={isLoading}>
          Generate Tests
        </Button>
      </div>
    </div>
  );
}