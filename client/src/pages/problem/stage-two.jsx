import { useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { useUserProfile } from "@/context/user-context.jsx";
import { useLogging } from "@/context/logging-context-provider.jsx";

import useWithLoading from "@/hooks/useWithLoading.js";
import useProblemData from "./hooks/useProblemData.js";
import useTestRunner from "./hooks/useTestRunner.js";

import StudentInstruction from "@/components/instruction/student-instruction.jsx";
import { STAGE_TWO } from "@/pages/problem/data/instructions.js";
import AIAgent from "@/components/ai/ai-agent.jsx";
import Tabs from "@/components/tabs/tabs.jsx";
import styles from "@/pages/problem/problemPage.module.css";
import { toast } from "react-toastify";
import { sleep } from "@/utils/utils.js";
import { Action, Component } from "@/constants/logConstants.js";

import TopToolbar from "./ui/top-tool-bar.jsx";
import EditorPanel from "./ui/editor-panel.jsx";
import TestSuitePanel from "./ui/test-suite-panel.jsx";
import SubmitConfirmModal from "./ui/confirmation-modal.jsx";

export default function StageTwo() {
  const { problemId } = useParams();
  const { profile } = useUserProfile();
  const { addLog } = useLogging();

  const {
    problemAttempt,
    studentCodeSubmission,
    updateStudentCodeSubmission,
    saveStudentAttempt,
    updateStudentScore,
  } = useProblemAttemptContext();

  const [isLoading, withLoading] = useWithLoading();
  const editorRef = useRef(null);

  const [selected, setSelected] = useState(0); // [0=Code, 1=Tests]
  const [showTestSuite, setShowTestSuite] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { problem, template, defaultEditorSrc } = useProblemData(problemId);

  const { results, setResults, numPassed, run } = useTestRunner({
    problem,
    template,
    addLog,
    updateStudentScore,
  });

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
          editorDefaultSrc={defaultEditorSrc}
        />
      ),
    },
  ];

  const showEditor = () => {
    setSelected(0);
    setShowTestSuite(false);
  };

  const handleExecution = async () => {
    showEditor();
    const src = (studentCodeSubmission ?? "").trim();
    if (!src || src === defaultEditorSrc) {
      toast.error("Please write some code before running!");
      return;
    }

    await withLoading(
      () => run(studentCodeSubmission),
      () => {
        setShowTestSuite(true);
        setSelected(1);
      },
      console.error,
    );
    await sleep();
  };

  const handleReset = () => {
    addLog({ component: Component.CODE_EDITOR, action: Action.RESET });
    updateStudentCodeSubmission(defaultEditorSrc);
    showEditor();
  };

  const handleSubmission = () => {
    saveStudentAttempt();
    setShowConfirmation(false);
    addLog({
      component: Component.BUTTON,
      action: Action.SUBMIT,
      content: `${numPassed}/${problem?.testSuite?.length ?? 0}`,
    });
  };

  const confirmSubmissionIfFailedElseSubmit = () => {
    if (numPassed !== (problem?.testSuite?.length ?? 0)) {
      setShowConfirmation(true);
    } else {
      handleSubmission();
    }
  };

  const hasCompleted = profile?.problemsCompleted?.includes(problemId);
  const scoreText = problemAttempt?.score;

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
          scoreText={scoreText}
          onReset={handleReset}
          onRun={handleExecution}
          onSubmit={confirmSubmissionIfFailedElseSubmit}
        />

        {showTestSuite ? (
          <TestSuitePanel
            tests={problem?.testSuite}
            language={problem?.programLanguage}
            results={results}
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

      <SubmitConfirmModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleSubmission}
        numPassed={numPassed}
        total={problem?.testSuite?.length ?? 0}
      />
    </div>
  );
}
