import styles from "./problemPage.module.css";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import React, { useState } from "react";
import SplitText from "@/components/text/split-text/split-text.jsx";
import BottomNav from "@/components/nav/bottom-nav.jsx";
import StageTwo from "@/pages/problem/stage-two.jsx";
import StageOne from "@/pages/problem/stage-one.jsx";
import Modal from "@/components/modal/modal.jsx";
import {
  STAGE_ONE_CONCISE_FULL,
  STAGE_ONE_CONCISE_NATURAL_LANGUAGE,
  STAGE_ONE_CONCISE_ORACLE,
  STAGE_TWO_CONCISE,
} from "@/pages/problem/data/instructions.js";
import ButtonV2 from "@/components/button/buttonV2.jsx";
import { useLogging } from "@/context/logging-context-provider.jsx";
import { Action, Component } from "@/constants/logConstants.js";
import {
  ORACLE as ORACLE_VARIANT,
  FULL,
} from "@/constants/problem-constants.js";
import { formatInstruction } from "@/utils/utils.js";
import ReactMarkdown from "react-markdown";

export default function ProblemContent() {
  const { addLog } = useLogging();
  const { isProblemReady } = useProblemAttemptContext();
  const [stage, setStage] = useState(1);
  const [tutorialStep, setTutorialStep] = useState(1); // which stage tutorial to show
  const [showTutorial, setShowTutorial] = useState(true);
  const { problem } = useProblemAttemptContext();

  const stageOneInstruction =
    problem.problemVariant === FULL
      ? STAGE_ONE_CONCISE_FULL
      : problem.problemVariant === ORACLE_VARIANT
        ? STAGE_ONE_CONCISE_ORACLE
        : STAGE_ONE_CONCISE_NATURAL_LANGUAGE;

  function handleStageChange() {
    if (stage === 1) {
      setStage(2);
      addLog({
        component: Component.BUTTON,
        action: Action.CLICKED,
        name: "I'm ready to code!",
      });
      if (tutorialStep === 1) {
        setTutorialStep(2);
        setShowTutorial(true);
      }
      return;
    }
    setStage(1);
    addLog({
      component: Component.BUTTON,
      action: Action.CLICKED,
      name: "Go back",
    });
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
      <Modal
        isOpen={showTutorial}
        setIsOpen={setShowTutorial}
        enableOutsideCancel={false}
        className={styles.instructionContainer}
      >
        <section>
          <img
            src={tutorialStep === 1 ? "/client-full.png" : "/cogs-full.png"}
            alt="Client"
            className={`${tutorialStep === 1 ? styles.clientPic : styles.cogsPic}`}
          />
          <ReactMarkdown>
            {tutorialStep === 1
              ? formatInstruction(stageOneInstruction, {
                  "//VAR_PROBLEM_STATEMENT": problem.problemStatement,
                })
              : STAGE_TWO_CONCISE.content}
          </ReactMarkdown>
        </section>

        <div className={styles.actions}>
          <ButtonV2 onClick={hideTutorial}>I Understand!</ButtonV2>
        </div>
      </Modal>
    </div>
  );
}
