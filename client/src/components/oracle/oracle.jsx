import styles from "./oracle.module.css";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import Button from "@/components/button/button.jsx";
import TextArea from "@/components/inputs/text-area.jsx";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { useEffect, useState } from "react";
import { executeOraclePistonDirect } from "@/routes/code-route.js";
import useWithLoading from "@/hooks/useWithLoading.js";
import { getOracle } from "@/routes/oracle-route.js";
import { useParams } from "react-router-dom";

export default function Oracle() {
  const { problemId } = useParams();
  const { chatHistory, problemAttempt } = useProblemAttemptContext();
  const [isLoading, withLoading] = useWithLoading();
  const [executionOutput, setExecutionOutput] = useState({});
  const [oracle, setOracle] = useState();
  const [inputVariables, setInputVariables] = useState();

  useEffect(() => {
    if (chatHistory) {
      handleLLMGeneratedTestCase(chatHistory.messages);
    }
  }, [problemAttempt, chatHistory]);

  useEffect(() => {
    withLoading(
      () => getOracle(problemId),
      (oracle) => {
        setOracle(oracle);
        setInputVariables(oracle?.defaultProbes);
      },
      console.error,
    );
  }, []);

  function handleLLMGeneratedTestCase(messageList) {
    if (!messageList) return;

    const latestMessage = messageList[messageList.length - 1];
    if ("user" === latestMessage.role) return;

    const responseSchema = JSON.parse(latestMessage.content);
    if (responseSchema.test_case) {
      setInputVariables(responseSchema.test_case);
    }
  }

  function executeOracle() {
    setExecutionOutput({});
    withLoading(
      () =>
        executeOraclePistonDirect(
          problemAttempt?.problemLanguage,
          oracle.sourceCode,
          inputVariables,
        ),
      (result) => setExecutionOutput(result),
      console.error,
    );
  }

  return (
    <div className={styles.oracleWrapper}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <img src={"/oracle.svg"} alt={"Oracle"} />
        </div>
        <h3>Mysterious Code Box</h3>
      </div>
      <div className={styles.oracle}>
        <div className={styles.editorContainer}>
          <div className={styles.editorWrapper}>
            <TextEditor
              language={problemAttempt?.problemLanguage}
              showLanguageSelect={false}
              lineNumbers={false}
              isResizable={false}
              fixedHeight={50}
              fontSize={12}
              src={inputVariables}
              setSource={setInputVariables}
            />
          </div>

          <Button onClick={executeOracle} disabled={isLoading}>
            Run
          </Button>
        </div>
        <TextArea
          placeholder={"Output: "}
          disabled={true}
          resizable={false}
          rows={2}
          value={executionOutput?.run?.output || executionOutput?.run?.stderr}
        ></TextArea>
      </div>
    </div>
  );
}
