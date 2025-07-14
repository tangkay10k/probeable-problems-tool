import useWithLoading from "@/hooks/useWithLoading.js";
import { generateConstraints } from "@/routes/ai-route.js";
import { toast } from "react-toastify";
import { createProblem } from "@/routes/problem-route.js";
import styles from "@/pages/question-setup/question-setup.module.css";
import Instruction from "@/components/instruction/instruction.jsx";
import Dropdown from "@/components/dropdown/dropdown.jsx";
import { QUESTION_TYPES } from "@/pages/question-setup/data/question-types.js";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import Button from "@/components/button/button.jsx";
import { MODEL_SOLUTION_INSTRUCTION } from "@/pages/question-setup/data/instructions.js";

export default function ModelSolution({
  language,
  setLanguage,
  setSource,
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
    <div className={styles.modelSolutionContainer}>
      <Instruction
        heading="Question Creator"
        instruction={MODEL_SOLUTION_INSTRUCTION}
      />
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
    </div>
  );
}
