import styles from "./oracle.module.css";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import TextArea from "@/components/inputs/text-area.jsx";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { useEffect, useState, useRef } from "react";
import { executeOraclePistonDirect } from "@/routes/code-route.js";
import { useParams } from "react-router-dom";
import { DEFAULT_PROBES_KEY } from "@/context/context-utils.js";
import { handleBuggyProbeExecution } from "@/pages/question-setup/utils/buggy-solutions-setup-utils";
import { saveEquivalenceClass } from "@/routes/problem-attempt-route";
import { toast } from "react-toastify";
import { sleep } from "@/utils/utils.js";
import { MdOutlinePlayArrow as PlayIcon } from "react-icons/md";
import ButtonV2 from "@/components/button/buttonV2.jsx";
import { useLogging } from "@/context/logging-context-provider.jsx";

export default function Oracle({
  llmGeneratedTestCaseCallback = null,
  resetOracle = false,
  runCallback = null,
}) {
  const { problemId } = useParams();
  const {
    chatHistory,
    problemAttempt,
    executeTemplate,
    problem,
    updateOracleHistory,
    oracleExecutionHistory,
  } = useProblemAttemptContext();

  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState({});
  const [inputVariables, setInputVariables] = useState("");
  const { addLog } = useLogging();
  const typingTimerRef = useRef(null);
  const TYPING_DEBOUNCE_MS = 1500;

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
    addLog({
      component: "oracle",
      action: "reset",
    });

    const defaultProbeMap = localStorage.getItem(DEFAULT_PROBES_KEY);
    if (!defaultProbeMap) return;
    try {
      const obj = JSON.parse(defaultProbeMap);
      if (obj?.[problemId]) {
        setInputVariables(obj[problemId]);
      }
    } catch { }
  }, [resetOracle, problemId]);

  const handleLogTyping = (editor) => {
    editor.onDidType(() => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        const value = editor.getValue();
        addLog({
          component: "oracle",
          action: "typed",
          content: value,
        });
      }, TYPING_DEBOUNCE_MS);
    });
  };

  async function executeOracle() {
    setExecutionOutput({});
    setIsExecuting(true);
    runCallback?.();

    try {
      const oracleResult = await executeOraclePistonDirect(
        problemAttempt?.problemLanguage,
        executeTemplate?.template,
        inputVariables,
        problem?.modelAnswer,
      );

      if (oracleResult?.run?.stderr) {
        toast.error("Compile error, please check your input!");
        return;
      }

      setExecutionOutput(oracleResult);
      addToExecutionHistory(oracleResult);

      addLog({
        component: "oracle",
        action: "execute",
        input: inputVariables,
        output: oracleResult.run.output,
      });

      const buggyResult = await handleBuggyProbeExecution(
        problem,
        inputVariables,
      );

      await saveEquivalenceClass(
        problemAttempt.id,
        oracleResult?.run?.output,
        buggyResult,
      );
    } catch (err) {
      console.error(err);
    } finally {
      await sleep();
      setIsExecuting(false);
    }
  }

  function addToExecutionHistory(oracleResult) {
    const { run: { output, stderr } = {} } = oracleResult || {};
    if (output && (!stderr || stderr.length === 0)) {
      const newEntry = {
        testCase: inputVariables,
        expectedOutput: output,
        timestamp: Date.now(),
      };
      updateOracleHistory([newEntry, ...(oracleExecutionHistory || [])]);
    }
  }

  return (
    <div className={styles.oracleWrapper}>
      <div className={styles.editorWrapper}>
        <TextEditor
          language={problemAttempt?.problemLanguage}
          showLanguageSelect={false}
          lineNumbers={false}
          isResizable={false}
          fixedHeight={"100%"}
          src={inputVariables}
          setSource={setInputVariables}
          isLogging
          handleLogTyping={handleLogTyping}
        />
      </div>
      <div className={styles.outputContainer}>
        <div className={styles.outputHeader}>
          <h3>Output: </h3>
        </div>
        <TextArea
          placeholder="Click run to see output "
          disabled={true}
          resizable={false}
          value={
            executionOutput?.run?.output ??
            (executionOutput?.run?.stderr
              ? "COMPILE ERROR"
              : executionOutput?.run?.output)
          }
        />
        <ButtonV2 onClick={executeOracle} disabled={isExecuting}>
          <PlayIcon size={18} /> Run
        </ButtonV2>
      </div>
    </div>
  );
}
