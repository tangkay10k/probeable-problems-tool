import styles from "./oracle.module.css";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import Button from "@/components/button/button.jsx";
import TextArea from "@/components/inputs/text-area.jsx";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { useEffect, useState } from "react";
import { executeOraclePistonDirect } from "@/routes/code-route.js";
import useWithLoading from "@/hooks/useWithLoading.js";
import { useParams } from "react-router-dom";
import { DEFAULT_PROBES_KEY } from "@/context/context-utils.js";
import { handleBuggyProbeExecution } from "@/pages/question-setup/utils/buggy-solutions-setup-utils";
import { sendEquivalenceClass } from "@/routes/problem-attempt-route";

export default function Oracle({
  llmGeneratedTestCaseCallback = null,
  resetOracle = false,
}) {
  const { problemId } = useParams();
  const {
    chatHistory,
    problemAttempt,
    updateOracleHistory,
    oracleExecutionHistory,
    executeTemplate,
    problem,
  } = useProblemAttemptContext();
  const [isLoading, withLoading] = useWithLoading();
  const [executionOutput, setExecutionOutput] = useState({});
  const [inputVariables, setInputVariables] = useState("");

  useEffect(() => {
    if (!chatHistory?.messages?.length) return;
    const latestMessage = chatHistory.messages[chatHistory.messages.length - 1];
    if (latestMessage?.role === "user") return;

    const responseSchema = latestMessage?.content;
    if (responseSchema?.test_case) {
      setInputVariables(responseSchema.test_case);
      llmGeneratedTestCaseCallback?.(1);
    }
  }, [problemAttempt, chatHistory, llmGeneratedTestCaseCallback]);

  useEffect(() => {
    const defaultProbeMap = localStorage.getItem(DEFAULT_PROBES_KEY);
    if (!defaultProbeMap) return;
    try {
      const obj = JSON.parse(defaultProbeMap);
      if (obj?.[problemId]) {
        setInputVariables(obj[problemId]);
      }
    } catch {}
  }, [resetOracle, problemId]);

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function executeOracle() {
    setExecutionOutput({});

    let oracleResult = null;

    await withLoading(
      () =>
        executeOraclePistonDirect(
          problemAttempt?.problemLanguage,
          executeTemplate?.template,
          inputVariables,
          problem?.modelAnswer,
        ),
      (result) => {
        oracleResult = result;
        setExecutionOutput(result);

        const { run: { output, stderr } = {} } = result || {};
        if (output && (!stderr || stderr.length === 0)) {
          const newEntry = {
            testCase: inputVariables,
            expectedOutput: output,
            timestamp: Date.now(),
          };
          updateOracleHistory([...(oracleExecutionHistory || []), newEntry]);
        }
      },
      console.error,
    );

    await delay(1000);

    await withLoading(
      () => handleBuggyProbeExecution(problem, inputVariables),
      (buggyResult) => {
        if (!oracleResult?.run?.stderr) {
          sendEquivalenceClass(
            problemAttempt.id,
            oracleResult?.run?.output,
            buggyResult,
          );
        }
      },
      console.error,
    );
  }

  return (
    <div className={styles.oracleWrapper}>
      <div className={styles.editorWrapper}>
        <TextEditor
          language={problemAttempt?.problemLanguage}
          showLanguageSelect={false}
          lineNumbers={false}
          isResizable={false}
          fixedHeight={350}
          fontSize={13}
          src={inputVariables}
          setSource={setInputVariables}
        />
      </div>
      <div className={styles.outputContainer}>
        <TextArea
          placeholder={"Output: "}
          disabled={true}
          resizable={false}
          value={
            executionOutput?.run?.output || executionOutput?.run?.stderr || ""
          }
        />
        <Button onClick={executeOracle} disabled={isLoading}>
          Run
        </Button>
      </div>
    </div>
  );
}
