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
import { getExecuteTemplate } from "@/routes/template-route.js";
import { getProblem } from "@/routes/problem-route.js";
import { toast } from "react-toastify";

export default function Oracle({ llmGeneratedTestCaseCallback = null }) {
  const { problemId } = useParams();
  const { chatHistory, problemAttempt } = useProblemAttemptContext();
  const [isLoading, withLoading] = useWithLoading();
  const [executionOutput, setExecutionOutput] = useState({});
  const [_, setOracle] = useState();
  const [inputVariables, setInputVariables] = useState();
  const [executeTemplate, setExecuteTemplate] = useState("");
  const [problem, setProblem] = useState({});

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

    withLoading(
      () => getExecuteTemplate(problemAttempt?.problemLanguage),
      (template) => setExecuteTemplate(template),
      (err) => toast.error(err),
    );

    withLoading(
      () => getProblem(problemId),
      (fetchedProblem) => {
        setProblem(fetchedProblem);
      },
      (err) => toast.error(err),
    );
  }, [problemId]);

  function handleLLMGeneratedTestCase(messageList) {
    if (!messageList) return;

    const latestMessage = messageList[messageList.length - 1];
    if ("user" === latestMessage.role) return;

    const responseSchema = JSON.parse(latestMessage.content);
    if (responseSchema.test_case) {
      setInputVariables(responseSchema.test_case);

      // Add shine effect on oracle button
      console.log("Setting shine...");
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
