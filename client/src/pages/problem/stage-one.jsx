import React, { useState } from "react";
import StudentInstruction from "@/components/instruction/student-instruction.jsx";
import {
  STAGE_ONE,
  STAGE_ONE_CONCISE,
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
  { label: "Binary History", content: <OracleHistory /> },
];

export default function StageOne() {
  const [showOracle, setShowOracle] = useState(false);
  const [selected, setSelected] = useState(0);
  const [shiny, setShiny] = useState(null);
  const [resetOracle, setResetOracle] = useState(false);
  const [showOracleHelp, setShowOracleHelp] = useState(false);

  const handleOracleClick = () => {
    setShowOracle(true);
    setShiny(null);
  };

  const handleClientClick = () => {
    setShowOracle(false);
  };

  return (
    <div className={styles.containerWrapper}>
      <div className={styles.leftContainer}>
        <Tabs tabs={TABS} defaultIndex={1} />
      </div>

      <div className={styles.rightContainer}>
        <div className={styles.toggleButtonContainer}>
          <ButtonGroup
            selectedIndex={selected}
            onSelectedIndexChange={setSelected}
            shinyIndex={shiny}
            labels={["Client", "Binary"]}
            onClickHandlers={[handleClientClick, handleOracleClick]}
          />
          {showOracle && (
            <section className={styles.leftButtons}>
              <ButtonV2 onClick={() => setResetOracle((prev) => !prev)}>
                <RestartIcon size={18} />
              </ButtonV2>
              <ButtonV2 onClick={() => setShowOracleHelp(true)}>
                <InfoIcon size={18} />
              </ButtonV2>
            </section>
          )}
        </div>

        <div style={{ display: showOracle ? "block" : "none", height: "100%" }}>
          <Oracle
            llmGeneratedTestCaseCallback={setShiny}
            resetOracle={resetOracle}
          />
        </div>
        {!showOracle && <ChatApp />}
      </div>
      <Modal
        isOpen={showOracleHelp}
        setIsOpen={setShowOracleHelp}
        title={"What's the Binary?"}
      >
        You can play around with the inputs and click the **Run** button to see
        the expected output of the function(s)!
      </Modal>
    </div>
  );
}
