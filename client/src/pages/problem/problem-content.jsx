import styles from "./problemPage.module.css";
import { STAGE_ONE } from "@/pages/problem/data/instructions.js";
import NotePad from "@/components/notes/notepad.jsx";
import ChatApp from "@/components/ai/chatapp.jsx";
import Oracle from "@/components/oracle/oracle.jsx";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { useState } from "react";
import ToggleButtons from "@/components/button/editor-toggle-buttons.jsx";
import SplitText from "@/components/text/split-text/split-text.jsx";
import StudentInstruction from "@/components/instruction/student-instruction.jsx";
import Tabs from "@/components/tabs/tabs.jsx";
import BottomNav from "@/components/nav/bottom-nav.jsx";
import StageTwo from "@/pages/problem/stage-two.jsx";
import ButtonGroup from "@/components/button/button-group.jsx";

export default function ProblemContent() {
  const { isLoading } = useProblemAttemptContext();
  const [stage, setStage] = useState(1);

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
        {stage === 1 ? <StageOne /> : <StageTwo />}
        <BottomNav handleStageChange={handleStageChange} stage={stage} />
      </div>
    </div>
  );
}

function StageOne() {
  const [showOracle, setShowOracle] = useState(false);
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
            labels={["Client", "Oracle"]}
            onClickHandlers={[
              () => setShowOracle(false),
              () => setShowOracle(true),
            ]}
          />
        </div>
        {showOracle ? <Oracle /> : <ChatApp />}
      </div>
    </div>
  );
}
