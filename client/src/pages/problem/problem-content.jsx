import styles from "./problemPage.module.css";
import Accordion from "@/components/accordian/accordion.jsx";
import { STAGE_ONE, STAGE_TWO } from "@/pages/problem/data/instructions.js";
import NotePad from "@/components/notes/notepad.jsx";
import ChatApp from "@/components/ai/chatapp.jsx";
import Oracle from "@/components/oracle/oracle.jsx";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import Button from "@/components/button/button.jsx";
import { useState } from "react";
import AIAgent from "@/components/ai/ai-agent.jsx";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";

export default function ProblemContent() {
  const { isLoading } = useProblemAttemptContext();
  const [stage, setStage] = useState(1);

  function handleStageChange() {
    stage === 1 ? setStage(2) : setStage(1);
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        Loading<span className={styles.dots}></span>
      </div>
    );
  }

  return (
    <div className={styles.problemPageContainer}>
      {stage === 1 ? <StageOne /> : <StageTwo />}

      <div
        className={stage === 1 ? styles.nextContainer : styles.prevContainer}
      >
        <Button onClick={handleStageChange}>
          {stage === 1 ? "Next" : "Prev"}
        </Button>
        {stage === 2 && <Button>Submit!</Button>}
      </div>
    </div>
  );
}

function StageOne() {
  return (
    <div className={styles.containerWrapper}>
      <div className={styles.innerContainer}>
        <Accordion items={STAGE_ONE} initialTabOpen={0} />
        <NotePad />
      </div>

      <div className={styles.innerContainer}>
        <ChatApp />
        <Oracle />
      </div>
    </div>
  );
}

function StageTwo() {
  const { problemAttempt } = useProblemAttemptContext();

  return (
    <div className={styles.containerWrapper}>
      <div className={styles.innerContainer}>
        <Accordion items={STAGE_TWO} initialTabOpen={0} />
        <NotePad />
        <AIAgent />
      </div>

      <div className={styles.innerContainer}>
        <div className={styles.textEditorContainer}>
          <TextEditor
            language={problemAttempt.problemLanguage}
            showLanguageSelect={false}
            fixedHeight={600}
          />
        </div>
      </div>
    </div>
  );
}