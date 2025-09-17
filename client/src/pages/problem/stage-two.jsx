import { useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { useUserProfile } from "@/context/user-context.jsx";
import { useLogging } from "@/context/logging-context-provider.jsx";

import StudentInstruction from "@/components/instruction/student-instruction.jsx";
import {
  PENALTY_WARNING,
  STAGE_TWO,
} from "@/pages/problem/data/instructions.js";
import AIAgent from "@/components/ai/ai-agent.jsx";
import Tabs from "@/components/tabs/tabs.jsx";
import styles from "@/pages/problem/problemPage.module.css";
import { toast } from "react-toastify";
import { formatInstruction, sleep } from "@/utils/utils.js";
import { Action, Component } from "@/constants/logConstants.js";

import TopToolbar from "./ui/top-tool-bar.jsx";
import EditorPanel from "./ui/editor-panel.jsx";
import TestSuitePanel from "./ui/test-suite-panel.jsx";
import Modal from "@/components/modal/modal.jsx";
import ButtonV2 from "@/components/button/buttonV2.jsx";

export default function StageTwo() {
  const { problemId } = useParams();
  const { profile } = useUserProfile();
  const { addLog } = useLogging();

  const {
    problemAttempt,
    studentCodeSubmission,
    updateStudentCodeSubmission,
    saveStudentAttempt,
    runTests,
    testResults,
    setResults,
    problem,
  } = useProblemAttemptContext();

  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef(null);

  const [selected, setSelected] = useState(0); // [0=Code, 1=Tests]
  const [showTestSuite, setShowTestSuite] = useState(false);
  const [showRunConfirmation, setShowRunConfirmation] = useState(false);
  const defaultComment =
    problem.editorDefaultComment || "// Write your code here";

  const handleAgentBuildRequest = () => {
    setSelected(0);
    setShowTestSuite(false);
  };
  const tabs = [
    {
      label: "Task",
      content: <StudentInstruction instruction={STAGE_TWO.content} />,
    },
    {
      label: "Cogs",
      content: (
        <AIAgent editorRef={editorRef} runCallback={handleAgentBuildRequest} />
      ),
    },
  ];

  const showEditor = () => {
    setSelected(0);
    setShowTestSuite(false);
  };

  const confirmRun = () => {
    showEditor();
    const src = (studentCodeSubmission ?? "").trim();
    if (!src || src === defaultComment) {
      toast.error("Please write some code before running!");
      return;
    }

    setShowRunConfirmation(true);
  };

  const handleExecution = async () => {
    setShowRunConfirmation(false);
    setIsLoading(true);

    try {
      const result = await runTests(addLog);
      const didCompile = !!result?.didCompile;

      setShowTestSuite(true);
      setSelected(1);

      addLog({
        component: Component.TESTS,
        action: Action.CHECK,
        name: "runTests",
        output: didCompile ? "compiled" : "failed to compile",
      });

      await sleep();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  const handleReset = () => {
    addLog({ component: Component.CODE_EDITOR, action: Action.RESET });
    updateStudentCodeSubmission(defaultComment);
    showEditor();
  };

  const handleCancel = () => {
    addLog({
      component: Component.MODAL,
      name: "Check",
      action: Action.CANCEL,
    });
    setShowRunConfirmation(false);
  };

  return (
    <div className={styles.containerWrapper}>
      <div className={styles.leftContainer}>
        <Tabs tabs={tabs} defaultIndex={1} />
      </div>

      <div className={styles.rightContainer}>
        <TopToolbar
          selectedIndex={selected}
          onSelectIndex={setSelected}
          onToggleCode={() => setShowTestSuite(false)}
          onToggleTests={() => setShowTestSuite(true)}
          isLoading={isLoading}
          onReset={handleReset}
          onRun={confirmRun}
        />

        {showTestSuite ? (
          <TestSuitePanel
            tests={problem?.testSuite}
            language={problem?.programLanguage}
            results={testResults}
            setResults={setResults}
          />
        ) : (
          <EditorPanel
            ref={editorRef}
            language={problemAttempt?.problemLanguage}
            src={studentCodeSubmission}
            setSource={updateStudentCodeSubmission}
          />
        )}
      </div>
      <Modal
        title={"Have you met all your client's requirements?"}
        isOpen={showRunConfirmation}
        onClose={() => setShowRunConfirmation(false)}
        className={styles.runConfirmationModal}
      >
        <p>
          Each unsuccessful run will incur a <b>1 point penalty</b> on your
          final score for <b>this problem</b> unless you receive a compilation
          error. <br />
          <br />
          Your current penalty is: [
          <b
            className={`${problemAttempt.failedAttempts !== 0 ? styles.penalty : ""}`}
          >
            {problemAttempt.failedAttempts}
          </b>
          ] {`${problemAttempt.failedAttempts === 1 ? "point" : "points"}`}
          <br />
          <i className={styles.footnote}>Penalties are capped at 15 points.</i>
        </p>
        <b>Your highest score will be kept.</b>
        <section className={styles.modalBtns}>
          <ButtonV2 onClick={handleCancel}>Cancel</ButtonV2>
          <ButtonV2 onClick={handleExecution}>Check</ButtonV2>
        </section>
      </Modal>
    </div>
  );
}
