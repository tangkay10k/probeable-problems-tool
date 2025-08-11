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
    if (chatHistory) {
      handleLLMGeneratedTestCase(chatHistory.messages);
    }
  }, [problemAttempt, chatHistory]);

  useEffect(() => {
    const defaultProbeMap = localStorage.getItem(DEFAULT_PROBES_KEY);
    if (defaultProbeMap) {
      const obj = JSON.parse(defaultProbeMap);
      setInputVariables(obj[problemId]);
    }
  }, [resetOracle]);

  function handleLLMGeneratedTestCase(messageList) {
    if (!messageList) return;

    const latestMessage = messageList[messageList.length - 1];
    if ("user" === latestMessage.role) return;

    const responseSchema = latestMessage.content;
    if (responseSchema.test_case) {
      setInputVariables(responseSchema.test_case);

      // Add shine effect on oracle button
      llmGeneratedTestCaseCallback?.(1);
    }
  }

  function executeOracle() {
    setExecutionOutput({});
    withLoading(
      () =>
        executeOraclePistonDirect(
          problemAttempt?.problemLanguage,
          executeTemplate.template,
          inputVariables,
          problem.modelAnswer,
        ),
      (result) => {
        setExecutionOutput(result);

        const { run: { output, stderr } = {} } = result;
        if (output && stderr.length === 0) {
          const newEntry = {
            testCase: inputVariables,
            expectedOutput: output,
            timestamp: Date.now(),
          };

          updateOracleHistory([...oracleExecutionHistory, newEntry]);
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
          value={executionOutput?.run?.output || executionOutput?.run?.stderr}
        ></TextArea>

        <Button onClick={executeOracle} disabled={isLoading}>
          Run
        </Button>
      </div>
    </div>
  );
}
