import Instruction from "@/components/instruction/instruction.jsx";
import {ORACLE_INSTRUCTION} from "@/pages/question-setup/data/instructions.js";
import styles from "../question-setup.module.css"
import Button from "@/components/button/button.jsx";
import {toast} from "react-toastify";
import useWithLoading from "@/hooks/useWithLoading.js";
import {createOracle} from "@/routes/oracle-route.js";
import {generateOracle} from "@/routes/ai-route.js";
import {useProblemContext} from "@/context/problem-context-provider.jsx";
import {TextEditor} from "@/components/text-editor/text-editor.jsx";
import {executeOraclePistonDirect} from "@/routes/code-route.js";
import Terminal from "@/components/text-editor/terminal.jsx";
import {useState} from "react";


export default function OracleCreation() {
  const {problem, oracle, setOracle, setOracleField} = useProblemContext()
  const [isLoading, withLoading] = useWithLoading();
  const [executionResult, setExecutionResult] = useState({});

  const saveQuestion = () => {
    withLoading(
      () => createOracle(oracle),
      (persistedOracle) => {
        setOracle(persistedOracle);
        toast.success("Problem has been updated in database!");
      },
      (err) => toast.error(err),
    );
  };

  const handleOracleGeneration = () => {
    withLoading(
      () => generateOracle(problem),
      (oracle) => setOracle(oracle),
      (err) => toast.error(err),
    );
  }

  const handleOracleExecution = () => {
    withLoading(
      () => executeOraclePistonDirect(problem.programLanguage, oracle.sourceCode, oracle.defaultProbes),
      (executionResult) => {
        toast.success("Oracle executed successfully!");
        setExecutionResult(executionResult)
      },
      (err) => toast.error(`Oracle execution failed: ${err.message}`),
    )
  }

  return (
    <div className={styles.oracleCreationContainer}>
      <Instruction
        heading={"4. Oracle Creation"}
        instruction={ORACLE_INSTRUCTION}
      />
      <p><i>What the student sees on problem load: </i></p>
      <div className={styles.oracleTextEditorContainer}>
        <TextEditor
          showLanguageSelect={false}
          language={problem.programLanguage}
          setSource={(newCode) => setOracleField("defaultProbes", newCode)}
          src={oracle.defaultProbes}
          isResizable={true}
          minHeight={10}
        />
      </div>

      <p><i>What is executed in the background:</i></p>
      <div className={styles.oracleTextEditorContainer}>
        <TextEditor
          showLanguageSelect={false}
          language={problem.programLanguage}
          setSource={(newCode) => setOracleField("sourceCode", newCode)}
          src={oracle.sourceCode}
          isResizable={true}
        />
      </div>

      <div>
        <Terminal output={executionResult?.run?.output} isEditable={false}/>
      </div>


      <div className={styles.buttonContainer}>
        <Button onClick={saveQuestion} disabled={isLoading}>
          Save
        </Button>
        <Button onClick={handleOracleGeneration} disabled={isLoading}>
          Generate Oracle
        </Button>
        <Button onClick={handleOracleExecution} disabled={isLoading}>
          Execute Oracle
        </Button>
      </div>

    </div>
  )
}
