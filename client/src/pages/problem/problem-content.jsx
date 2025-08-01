import styles from "./problemPage.module.css";
import { STAGE_ONE } from "@/pages/problem/data/instructions.js";
import NotePad from "@/components/notes/notepad.jsx";
import ChatApp from "@/components/ai/chatapp.jsx";
import Oracle from "@/components/oracle/oracle.jsx";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { useState, useEffect } from "react";
import SplitText from "@/components/text/split-text/split-text.jsx";
import StudentInstruction from "@/components/instruction/student-instruction.jsx";
import Tabs from "@/components/tabs/tabs.jsx";
import BottomNav from "@/components/nav/bottom-nav.jsx";
import StageTwo from "@/pages/problem/stage-two.jsx";
import ButtonGroup from "@/components/button/button-group.jsx";
import {logPastedContent} from "@/routes/log-route.js";

export default function ProblemContent() {
  const { isLoading, problemAttempt } = useProblemAttemptContext();
  const [stage, setStage] = useState(1);

  useEffect(() => {
    const handlePaste = (e) => {
      logPastedContent(problemAttempt.id, e.clipboardData.getData("text"))
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [problemAttempt]);

  function handleStageChange() {
    stage === 1 ? setStage(2) : setStage(1);
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <SplitText text={"Loading..."} />
      </div>
    );
  }

  return (
    <div className={styles.problemPageContainer}>
      <div className={styles.content}>
        <div style={{ display: stage === 1 ? "flex" : "none" }}>
          <StageOne />
        </div>
        <div style={{ display: stage === 2 ? "flex" : "none" }}>
          <StageTwo />
        </div>
        <BottomNav handleStageChange={handleStageChange} stage={stage} />
      </div>
    </div>
  );
}

function StageOne() {
  const [showOracle, setShowOracle] = useState(false);
  const [selected, setSelected] = useState(0);
  const [shiny, setShiny] = useState(null);

  const handleButtonClick = () => {
    setShowOracle((prev) => !prev);
    setShiny(null);
  };

  const tabs = [
    {
      label: "Task",
      content: <StudentInstruction instruction={STAGE_ONE[0].content} />,
    },
    { label: "Notepad", content: <NotePad /> },
  ];

  return (
    <div className={styles.containerWrapper}>
      <div className={styles.leftContainer}>
        <Tabs tabs={tabs} defaultIndex={0} />
      </div>

      <div className={styles.rightContainer}>
        <div className={styles.toggleButtonContainer}>
          <ButtonGroup
            selectedIndex={selected}
            onSelectedIndexChange={setSelected}
            shinyIndex={shiny}
            labels={["Client", "Oracle"]}
            onClickHandlers={[handleButtonClick, handleButtonClick]}
          />
        </div>
        <div style={{ display: showOracle ? "block" : "none", height: "100%" }}>
          <Oracle llmGeneratedTestCaseCallback={setShiny} />
        </div>
        {!showOracle && <ChatApp />}
      </div>
    </div>
  );
}
