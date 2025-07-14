import useWithLoading from "@/hooks/useWithLoading.js";
import { generateProblemStatement } from "@/routes/ai-route.js";
import { toast } from "react-toastify";
import { updateProblem } from "@/routes/problem-route.js";
import styles from "@/pages/question-setup/question-setup.module.css";
import Instruction from "@/components/instruction/instruction.jsx";
import { PROBLEM_STATEMENT_INSTRUCTION } from "@/pages/question-setup/data/instructions.js";
import TextArea from "@/components/inputs/text-area.jsx";
import Button from "@/components/button/button.jsx";

export default function ProblemStatement({ problem, setProblem }) {
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
    <div className={styles.problemStatementContainer}>
      <Instruction
        heading={"3. Problem Statement Creation"}
        instruction={PROBLEM_STATEMENT_INSTRUCTION}
      />
      <TextArea
        rows={1}
        disabled={isLoading}
        placeholder={"What the client initially prompts the student with: "}
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
    </div>
  );
}
