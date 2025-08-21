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
        <AIAgent
          editorRef={editorRef}
          runCallback={handleAgentBuildRequest}
          editorDefaultSrc={problem.defaultEditorSrc}
        />
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
    if (!src || src === problem.defaultEditorSrc) {
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

      // Optional UI log
      addLog({
        component: Component.TESTS,
        action: Action.SUBMIT,
        name: "runTests",
        output: didCompile ? "compiled" : "failed to compile", // TODO: fix this
      });

      const saveSilently = Boolean(didCompile);
      saveStudentAttempt(saveSilently);

      await sleep();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  const handleReset = () => {
    addLog({ component: Component.CODE_EDITOR, action: Action.RESET });
    updateStudentCodeSubmission(problem.defaultEditorSrc);
    showEditor();
  };

  const hasCompleted = profile?.problemsCompleted?.includes(problemId);

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
          hasCompleted={hasCompleted}
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
      >
        {formatInstruction(PENALTY_WARNING, {
          "//VAR_PENALTY": `${problemAttempt?.failedAttempts ?? 0}`,
          "//VAR_PLURAL": problemAttempt?.failedAttempts === 1 ? "" : "s",
        })}
        <section className={styles.modalBtns}>
          <ButtonV2 onClick={() => setShowRunConfirmation(false)}>
            Cancel
          </ButtonV2>
          <ButtonV2 onClick={handleExecution}>Run</ButtonV2>
        </section>
      </Modal>
    </div>
  );
}
