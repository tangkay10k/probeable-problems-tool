import styles from "./problemPage.module.css";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import React, { useState } from "react";
import SplitText from "@/components/text/split-text/split-text.jsx";
import BottomNav from "@/components/nav/bottom-nav.jsx";
import StageTwo from "@/pages/problem/stage-two.jsx";
import StageOne from "@/pages/problem/stage-one.jsx";

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
