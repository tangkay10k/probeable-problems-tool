import { useEffect, useMemo, useRef, useState } from "react";
import StudentInstruction from "@/components/instruction/student-instruction.jsx";
import {
  STAGE_ONE_FULL,
  STAGE_ONE_ORACLE,
  STAGE_ONE_NATURAL_LANGUAGE,
  CLIENT_HELP,
  ORACLE_HELP,
} from "@/pages/problem/data/instructions.js";
import styles from "@/pages/problem/problemPage.module.css";
import Tabs from "@/components/tabs/tabs.jsx";
import ButtonGroup from "@/components/button/button-group.jsx";
import ButtonV2 from "@/components/button/buttonV2.jsx";
import {
  MdInfoOutline as InfoIcon,
  MdRestartAlt as RestartIcon,
} from "react-icons/md";
import Oracle from "@/components/oracle/oracle.jsx";
import ChatApp from "@/components/ai/chatapp.jsx";
import Modal from "@/components/modal/modal.jsx";
import OracleHistory from "@/components/oracle/oracle-history.jsx";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import {
  NATURAL_LANGUAGE,
  ORACLE as ORACLE_VARIANT,
  FULL,
} from "@/constants/problem-constants.js";
import { formatQuestionInstruction } from "@/utils/utils.js";

export default function StageOne() {
  const { problem } = useProblemAttemptContext();
  const variant = problem?.problemVariant;

  const showClient = variant === FULL || variant === NATURAL_LANGUAGE;
  const showRun = variant === FULL || variant === ORACLE_VARIANT;

  const instruction =
    variant === FULL
      ? STAGE_ONE_FULL
      : variant === ORACLE_VARIANT
        ? STAGE_ONE_ORACLE
        : STAGE_ONE_NATURAL_LANGUAGE;

  const TABS = useMemo(() => {
    const tabs = [
      {
        label: "Task",
        content: (
          <StudentInstruction
            instruction={formatQuestionInstruction(
              instruction,
              problem.problemStatement,
            )}
          />
        ),
      },
    ];
    if (showRun) {
      tabs.push({ label: "Run History", content: <OracleHistory /> });
    }
    return tabs;
  }, [showRun]);

  const panels = useMemo(() => {
    const arr = [];
    if (showClient) arr.push({ key: "client", label: "Client" });
    if (showRun) arr.push({ key: "run", label: "Run" });
    return arr;
  }, [showClient, showRun]);

  const defaultIndex = useMemo(() => {
    const clientIdx = panels.findIndex((p) => p.key === "client");
    return clientIdx !== -1 ? clientIdx : 0;
  }, [panels]);

  const [selected, setSelected] = useState(defaultIndex);
  const [shiny, setShiny] = useState(null);
  const [resetOracle, setResetOracle] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const tabsRef = useRef(null);

  useEffect(() => {
    if (selected >= panels.length) {
      setSelected(defaultIndex);
    }
  }, [panels.length, defaultIndex, selected]);

  const switchToTab = (index) => {
    tabsRef.current?.setIndex(index);
  };

  const currentPanel = panels[selected] ?? panels[0];
  const isRun = currentPanel?.key === "run";
  const isClient = currentPanel?.key === "client";

  const handlers = panels.map((_, idx) => () => {
    setSelected(idx);
    if (panels[idx].key === "run") setShiny(null);
  });

  return (
    <div className={styles.containerWrapper}>
      <div className={styles.leftContainer}>
        <Tabs ref={tabsRef} tabs={TABS} defaultIndex={0} />
      </div>

      <div className={styles.rightContainer}>
        <div className={styles.toggleButtonContainer}>
          {panels.length > 1 ? (
            <ButtonGroup
              selectedIndex={selected}
              onSelectedIndexChange={setSelected}
              shinyIndex={isRun && shiny !== null ? selected : null}
              labels={panels.map((p) => p.label)}
              onClickHandlers={handlers}
            />
          ) : (
            <span />
          )}

          <section className={styles.leftButtons}>
            {isRun && (
              <ButtonV2
                onClick={() => setResetOracle((prev) => !prev)}
                className={styles.resetBtn}
              >
                <RestartIcon />
              </ButtonV2>
            )}
            <ButtonV2
              onClick={() => setShowHelp(true)}
              className={styles.infoBtn}
            >
              <InfoIcon />
            </ButtonV2>
          </section>
        </div>

        <div style={{ display: isRun ? "block" : "none", height: "100%" }}>
          {showRun && (
            <Oracle
              llmGeneratedTestCaseCallback={setShiny}
              resetOracle={resetOracle}
              runCallback={() => switchToTab(1)}
            />
          )}
        </div>

        <div style={{ display: isClient ? "block" : "none", height: "100%" }}>
          {showClient && <ChatApp />}
        </div>
      </div>

      <Modal
        isOpen={showHelp}
        setIsOpen={setShowHelp}
        title={"What do I do here?"}
      >
        {isClient ? CLIENT_HELP : ORACLE_HELP}
      </Modal>
    </div>
  );
}
