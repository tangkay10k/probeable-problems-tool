import Instruction from "@/components/instruction/instruction.jsx";
import { ORACLE_INSTRUCTION } from "@/pages/question-setup/data/instructions.js";
import styles from "../question-setup.module.css";
import Button from "@/components/button/button.jsx";
import { toast } from "react-toastify";
import useWithLoading from "@/hooks/useWithLoading.js";
import { generateOracle } from "@/routes/ai-route.js";
import { useProblemContext } from "@/context/problem-context-provider.jsx";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import { executeOraclePistonDirect } from "@/routes/code-route.js";
import Terminal from "@/components/text-editor/terminal.jsx";
import { useState } from "react";

export default function OracleCreation() {
  const { problem, oracle, setOracle, executeTemplate } = useProblemContext();
  const [isLoading, withLoading] = useWithLoading();
  const [executionResult, setExecutionResult] = useState({});

  const handleOracleGeneration = () => {
    withLoading(
      () => generateOracle(problem),
      (problemWithOracle) => {
        console.log(problemWithOracle);
        setOracle(problemWithOracle.defaultProbe);
      },
      (err) => toast.error(err),
    );
  };

  const handleOracleExecution = () => {
    withLoading(
      () =>
        executeOraclePistonDirect(
          problem.programLanguage,
          executeTemplate.template,
          problem.defaultProbe,
          problem.modelAnswer,
        ),
      (executionResult) => {
        toast.success("Oracle executed successfully!");
        setExecutionResult(executionResult);
      },
      (err) => toast.error(`Oracle execution failed: ${err.message}`),
    );
  };

  return (
    <div className={styles.oracleCreationContainer}>
      <Instruction
        heading={"4. Oracle Creation"}
        instruction={ORACLE_INSTRUCTION}
      />
      <div>
        <TextEditor
          showLanguageSelect={false}
          language={problem.programLanguage}
          setSource={(newCode) => setOracle(newCode)}
          src={problem.defaultProbe}
          isResizable={true}
          minHeight={10}
        />
      </div>

      <div>
        <Terminal output={executionResult?.run?.output} isEditable={false} />
      </div>

      <div className={styles.buttonContainer}>
        <Button onClick={handleOracleGeneration} disabled={isLoading}>
          Generate Oracle
        </Button>
        <Button onClick={handleOracleExecution} disabled={isLoading}>
          Execute Oracle
        </Button>
      </div>
    </div>
  );
}
