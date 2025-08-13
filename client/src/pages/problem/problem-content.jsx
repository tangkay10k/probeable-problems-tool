import styles from "./problemPage.module.css";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import React, { useState } from "react";
import SplitText from "@/components/text/split-text/split-text.jsx";
import BottomNav from "@/components/nav/bottom-nav.jsx";
import StageTwo from "@/pages/problem/stage-two.jsx";
import StageOne from "@/pages/problem/stage-one.jsx";
import Modal from "@/components/modal/modal.jsx";
import {
  STAGE_ONE_CONCISE,
  STAGE_TWO_CONCISE,
} from "@/pages/problem/data/instructions.js";
import ButtonV2 from "@/components/button/buttonV2.jsx";

export default function ProblemContent() {
  const { isProblemReady } = useProblemAttemptContext();
  const [stage, setStage] = useState(1);
  const [tutorialStep, setTutorialStep] = useState(1); // which stage tutorial to show
  const [showTutorial, setShowTutorial] = useState(true);

  function handleStageChange() {
    if (stage === 1) {
      setStage(2);

      if (tutorialStep === 1) {
        setTutorialStep(2);
        setShowTutorial(true);
      }
      return;
    }
    setStage(1);
  }

  const hideTutorial = () => {
    setShowTutorial(false);
  };

  if (!isProblemReady) {
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
      <Modal isOpen={showTutorial} setIsOpen={setShowTutorial} title={"Task: "}>
        {tutorialStep === 1
          ? STAGE_ONE_CONCISE.content
          : STAGE_TWO_CONCISE.content}
        <ButtonV2 onClick={hideTutorial}>I Understand!</ButtonV2>
      </Modal>
    </div>
  );
}
