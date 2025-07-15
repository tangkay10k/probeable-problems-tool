import styles from "./oracle.module.css";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import Button from "@/components/button/button.jsx";
import TextArea from "@/components/inputs/text-area.jsx";
import { useProblemContext } from "@/context/problem-attempt-context.js";
import { useEffect, useState } from "react";

export default function Oracle() {
  const { chatHistory, problemAttempt } = useProblemContext();
  const [oracleSrc, setOracleSrc] = useState();
  const [language, setLanguage] = useState("c");

  useEffect(() => {
    if (chatHistory) {
      handleLLMGeneratedTestCase(chatHistory.messages);
    }

    if (problemAttempt) {
      setLanguage(problemAttempt.programLanguage);
    }
  }, [problemAttempt, chatHistory]);

  function handleLLMGeneratedTestCase(messageList) {
    if (!messageList) return;

    const latestMessage = messageList[messageList.length - 1];
    if ("user" === latestMessage.role) return;

    const responseSchema = JSON.parse(latestMessage.content);
    if (responseSchema.test_case) {
      setOracleSrc(responseSchema.test_case);
    }
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
              language={language}
              showLanguageSelect={false}
              lineNumbers={false}
              isResizable={false}
              fixedHeight={50}
              fontSize={12}
              src={oracleSrc}
              setSource={setOracleSrc}
            />
          </div>

          <Button>Run</Button>
        </div>
        <TextArea
          placeholder={"Output: "}
          disabled={true}
          resizable={false}
          rows={3}
        ></TextArea>
      </div>
    </div>
  );
}
