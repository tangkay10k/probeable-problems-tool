import { useRef, useState } from "react";
import StudentInstruction from "@/components/instruction/student-instruction.jsx";
import {
  CLIENT_HELP,
  ORACLE_HELP,
  STAGE_ONE,
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

const TABS = [
  {
    label: "Task",
    content: <StudentInstruction instruction={STAGE_ONE.content} />,
  },
  { label: "Run History", content: <OracleHistory /> },
];

export default function StageOne() {
  const [showOracle, setShowOracle] = useState(false);
  const [selected, setSelected] = useState(0);
  const [shiny, setShiny] = useState(null);
  const [resetOracle, setResetOracle] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const tabsRef = useRef(null);

  const switchToTab = (index) => {
    tabsRef.current?.setIndex(index);
  };

  const handleOracleClick = () => {
    setShowOracle(true);
    setSelected(1);
    setShiny(null);
  };

  const handleClientClick = () => {
    setShowOracle(false);
    setSelected(0);
  };

  return (
    <div className={styles.containerWrapper}>
      <div className={styles.leftContainer}>
        <Tabs ref={tabsRef} tabs={TABS} defaultIndex={1} />
      </div>

      <div className={styles.rightContainer}>
        <div className={styles.toggleButtonContainer}>
          <ButtonGroup
            selectedIndex={selected}
            onSelectedIndexChange={setSelected}
            shinyIndex={shiny}
            labels={["Client", "Run"]}
            onClickHandlers={[handleClientClick, handleOracleClick]}
          />

          <section className={styles.leftButtons}>
            {showOracle && (
              <ButtonV2
                onClick={() => setResetOracle((prev) => !prev)}
                className={styles.resetBtn}
              >
                <RestartIcon size={18} />
              </ButtonV2>
            )}
            <ButtonV2 onClick={() => setShowHelp(true)}>
              <InfoIcon size={18} />
            </ButtonV2>
          </section>
        </div>

        <div style={{ display: showOracle ? "block" : "none", height: "100%" }}>
          <Oracle
            llmGeneratedTestCaseCallback={setShiny}
            resetOracle={resetOracle}
            runCallback={() => switchToTab(1)}
          />
        </div>
        {!showOracle && <ChatApp />}
      </div>
      <Modal
        isOpen={showHelp}
        setIsOpen={setShowHelp}
        title={"What do I do here?"}
      >
        {selected === 0 ? CLIENT_HELP : ORACLE_HELP}
      </Modal>
    </div>
  );
}
