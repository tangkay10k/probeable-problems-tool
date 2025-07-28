import useWithLoading from "@/hooks/useWithLoading.js";
import { toast } from "react-toastify";
import styles from "@/pages/question-setup/question-setup.module.css";
import Instruction from "@/components/instruction/instruction.jsx";
import Dropdown from "@/components/dropdown/dropdown.jsx";
import { QUESTION_TYPES } from "@/pages/question-setup/data/question-types.js";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import Button from "@/components/button/button.jsx";
import { MODEL_SOLUTION_INSTRUCTION } from "@/pages/question-setup/data/instructions.js";
import { useProblemContext } from "@/context/problem-context-provider.jsx";
import { generateConstraints } from "@/routes/ai-route.js";

export default function ModelSolution() {
  const { problem, setProblem, setLanguage, setModelSolution } =
    useProblemContext();

  const [isLoading, withLoading] = useWithLoading();

  const handleQuestionTypeSelect = (problemType) => {
    if (problemType === "OOP") {
      alert(
        "OOP question type is not supported yet. Please select another type.",
      );
    }

    setProblem({ ...problem, problemType });
  };

  const handleConstraintsGeneration = () => {
    if (problem.modelAnswer.length === 0) {
      toast.error(
        "Please provide a model solution before generating constraints.",
      );
      return;
    }

    withLoading(
      () => generateConstraints(problem),
      (updatedProblem) => {
        setProblem(updatedProblem);
        toast.success("Constraints generated! Please review them 😊");
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
        placeholder={problem?.problemType || "Please select a question type"}
      />
      <TextEditor
        isResizable={true}
        language={problem.programLanguage}
        setLanguage={setLanguage}
        src={problem.modelAnswer}
        setSource={setModelSolution}
      />
      <div className={styles.buttonContainer}>
        <Button onClick={handleConstraintsGeneration} disabled={isLoading}>
          Generate Constraints
        </Button>
      </div>
    </div>
  );
}