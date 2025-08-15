import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useWithLoading from "@/hooks/useWithLoading.js";
import StudentInstruction from "@/components/instruction/student-instruction.jsx";
import { STAGE_TWO } from "@/pages/problem/data/instructions.js";
import { SPLIT_STRING } from "@/constants/setup-constants";
import AIAgent from "@/components/ai/ai-agent.jsx";
import { getProblem } from "@/routes/problem-route.js";
import { getTestTemplate } from "@/routes/template-route.js";
import { toast } from "react-toastify";
import { handleTestSuiteExecution } from "@/pages/question-setup/utils/test-setup-utils.js";
import styles from "@/pages/problem/problemPage.module.css";
import Tabs from "@/components/tabs/tabs.jsx";
import ButtonV2 from "@/components/button/buttonV2.jsx";
import {
  MdRestartAlt as RestartIcon,
  MdOutlinePlayArrow as PlayIcon,
} from "react-icons/md";
import { IoMdPaperPlane as PlaneIcon } from "react-icons/io";
import { TestSuiteList } from "@/components/text-editor/test-suite-list.jsx";
import { LoggingTextEditor } from "@/components/text-editor/logging-text-editor.jsx";
import ButtonGroup from "@/components/button/button-group.jsx";
import { useUserProfile } from "@/context/user-context.jsx";
import { FaCircleCheck as CompletedIcon } from "react-icons/fa6";
import Modal from "@/components/modal/modal.jsx";
import { sleep } from "@/utils/utils.js";
import { useLogging } from "@/context/logging-context-provider.jsx";
import { Action, Component } from "@/constants/logConstants.js"

export default function StageTwo() {
  const {
    problemAttempt,
    studentCodeSubmission,
    updateStudentCodeSubmission,
    saveStudentAttempt,
    updateStudentScore,
  } = useProblemAttemptContext();
  const { problemId } = useParams();
  const { profile } = useUserProfile();
  const [problem, setProblem] = useState([]);
  const [isLoading, withLoading] = useWithLoading();
  const [results, setResults] = useState([]);
  const [template, setTestTemplate] = useState("");
  const [showTestSuite, setShowTestSuite] = useState(false);
  const editorRef = useRef(null);
  const [selected, setSelected] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [numTestsPassed, setNumTestsPassed] = useState(0);
  const { addLog } = useLogging();

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

  useEffect(() => {
    getProblem(problemId)
      .then((fetchedProblem) => {
        setProblem(fetchedProblem);
        getTestTemplate(fetchedProblem.programLanguage)
          .then((template) => setTestTemplate(template))
          .catch((err) => toast.error(err));
      })
      .catch((err) => toast.error(err));
  }, [problemId]);

  const updateResults = (execution, implementation) => {
    const output = execution.run.output;
    const lines = output.split(SPLIT_STRING);
    let passedCount = 0;
    const updatedResults = [];

    for (let i = 0; i < lines.length; i++) {
      const expected = problem?.testSuite[i]?.expectedStdOut ?? "";
      const actual =
        execution.compile.code === 0 ? lines[i] : "[COMPILATION ERROR]";

      if (actual === expected) {
        passedCount += 1;
        updatedResults.push({ actual, expected });
      } else {
        updatedResults.push({ actual, expected });
        break; // stop processing further lines on first mismatch
      }
    }
    setResults(updatedResults);

    const numberOfTestCasesPassed = `${passedCount}/${problem?.testSuite?.length}`;
    updateStudentScore(numberOfTestCasesPassed);
    setNumTestsPassed(passedCount);

    addLog({
      component: Component.TESTS,
      action: Action.EXECUTE,
      input: `${implementation}`,
      output: `${passedCount}/${problem?.testSuite?.length}`,
    });
  };

  const handleExecution = async () => {
    showEditor();
    if (
      studentCodeSubmission.length === 0 ||
      studentCodeSubmission.trim() === ""
    ) {
      toast.error("Please write some code before running!");
      return;
    }

    withLoading(
      () =>
        handleTestSuiteExecution(
          problem,
          studentCodeSubmission,
          template,
          updateResults,
        ),
      () => {
        setShowTestSuite(true);
        setSelected(1);
      },
      console.error,
    );
    await sleep();
  };

  const confirmSubmissionIfFailedElseSubmit = () => {
    if (numTestsPassed !== problem?.testSuite?.length) {
      setShowConfirmation(true);
      return;
    }
    handleSubmission();
  };

  const handleSubmission = () => {
    saveStudentAttempt();
    setShowConfirmation(false);
    addLog({
      component: Component.BUTTON,
      action: Action.SUBMIT,
      content: `${numTestsPassed}/${problem?.testSuite?.length}`,
    });
  };

  const handleReset = () => {
    addLog({
      component: Component.CODE_EDITOR,
      action: Action.RESET,
    });
    updateStudentCodeSubmission(problem.editorDefaultComment);
    showEditor();
  };

  function showEditor() {
    setSelected(0);
    setShowTestSuite(false);
  }

  return (
    <div className={styles.containerWrapper}>
      <div className={styles.leftContainer}>
        <Tabs tabs={tabs} defaultIndex={1} />
      </div>

      <div className={styles.rightContainer}>
        <div className={styles.toggleButtonContainer}>
          <ButtonGroup
            selectedIndex={selected}
            onSelectedIndexChange={setSelected}
            labels={["Code", "Tests"]}
            onClickHandlers={[
              () => setShowTestSuite(false),
              () => setShowTestSuite(true),
            ]}
          />

          <section className={styles.leftButtons}>
            <section>
              {/*O(N) Here but we don't have that many problems -> O(1)*/}
              {profile?.problemsCompleted?.includes(problemId) && (
                <>
                  <p>{problemAttempt?.score}</p>
                  <span>
                    <CompletedIcon />
                  </span>
                </>
              )}

              <ButtonV2
                onClick={handleReset}
                disabled={isLoading}
                className={styles.resetBtn}
              >
                <RestartIcon size={18} />
              </ButtonV2>
              <ButtonV2
                onClick={handleExecution}
                disabled={isLoading}
                className={styles.runBtn}
              >
                <PlayIcon size={18} /> Run
              </ButtonV2>
            </section>

            <ButtonV2
              onClick={confirmSubmissionIfFailedElseSubmit}
              disabled={isLoading}
            >
              <PlaneIcon size={15} /> Submit!
            </ButtonV2>
          </section>
        </div>

        {showTestSuite ? (
          <div className={styles.testSuiteContainer}>
            <section className={styles.listWrapper}>
              {results.length > 0 ? (
                <>
                  <TestSuiteList
                    tests={problem.testSuite}
                    language={problem.programLanguage}
                    isEditable={false}
                    results={results}
                    setResults={setResults}
                  />
                  <div className={styles.gradient} />
                </>
              ) : (
                <div className={styles.testSuiteEmpty}>
                  Please run your code first!
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className={styles.editorWrapper}>
            <LoggingTextEditor
              ref={editorRef}
              language={problemAttempt?.problemLanguage}
              src={studentCodeSubmission}
              setSource={updateStudentCodeSubmission}
            />
          </div>
        )}
      </div>
      <Modal
        title={"Are you sure you want to submit?"}
        isOpen={showConfirmation}
        setIsOpen={setShowConfirmation}
        className={styles.confirmModal}
      >
        <p
          className={
            numTestsPassed === problem?.testSuite?.length
              ? styles.success
              : styles.error
          }
        >
          You have passed{" "}
          <b>
            {numTestsPassed} / {problem?.testSuite?.length}
          </b>{" "}
          test cases. <br />
        </p>
        <p>YOU WILL NOT BE ABLE TO RESUBMIT!</p>
        <br />
        <section className={styles.modalBtns}>
          <ButtonV2 onClick={() => setShowConfirmation(false)}>No</ButtonV2>
          <ButtonV2 onClick={handleSubmission}>Yes</ButtonV2>
        </section>
      </Modal>
    </div>
  );
}
