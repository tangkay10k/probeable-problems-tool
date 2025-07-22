import styles from "./problemPage.module.css";
import Accordion from "@/components/accordian/accordion.jsx";
import { STAGE_ONE, STAGE_TWO } from "@/pages/problem/data/instructions.js";
import NotePad from "@/components/notes/notepad.jsx";
import ChatApp from "@/components/ai/chatapp.jsx";
import Oracle from "@/components/oracle/oracle.jsx";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import Button from "@/components/button/button.jsx";
import { useEffect, useState } from "react";
import AIAgent from "@/components/ai/ai-agent.jsx";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import useWithLoading from "@/hooks/useWithLoading.js";
import { getProblem } from "@/routes/problem-route.js";
import { toast } from "react-toastify";
import { TestSuiteList } from "@/components/text-editor/test-suite-list.jsx";
import {
  handleTestSuiteExecution,
  SPLIT_STRING,
} from "@/pages/question-setup/utils/test-setup-utils.js";
import { getTestTemplate } from "@/routes/test-template-route.js";
import { useParams } from "react-router-dom";

export default function ProblemContent() {
  const { isLoading } = useProblemAttemptContext();
  const [stage, setStage] = useState(1);

  function handleStageChange() {
    stage === 1 ? setStage(2) : setStage(1);
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        Loading<span className={styles.dots}></span>
      </div>
    );
  }

  return (
    <div className={styles.problemPageContainer}>
      {stage === 1 ? <StageOne /> : <StageTwo />}

      <div
        className={stage === 1 ? styles.nextContainer : styles.prevContainer}
      >
        <Button onClick={handleStageChange}>
          {stage === 1 ? "Next" : "Prev"}
        </Button>
      </div>
    </div>
  );
}

function StageOne() {
  return (
    <div className={styles.containerWrapper}>
      <div className={styles.innerContainer}>
        <Accordion items={STAGE_ONE} initialTabOpen={0} />
        <NotePad />
      </div>

      <div className={styles.innerContainer}>
        <ChatApp />
        <Oracle />
      </div>
    </div>
  );
}

function StageTwo() {
  const { problemAttempt, studentCodeSubmission, updateStudentCodeSubmission } =
    useProblemAttemptContext();
  const { problemId } = useParams();
  const [problem, setProblem] = useState([]);
  const [isLoading, withLoading] = useWithLoading();
  const [results, setResults] = useState([]);
  const [template, setTestTemplate] = useState("");
  const [showTestSuite, setShowTestSuite] = useState(false);

  useEffect(() => {
    withLoading(
      () => getProblem(problemId),
      (fetchedProblem) => {
        setProblem(fetchedProblem);

        withLoading(
          () => getTestTemplate(fetchedProblem.programLanguage),
          (template) => setTestTemplate(template),
          (err) => toast.error(err),
        );
      },
      (err) => toast.error(err),
    );
  }, [problemId]);

  const updateResults = (execution) => {
    const output = execution.run.output;
    const lines = output.split(SPLIT_STRING);

    const updatedResults = lines.map((line, i) => {
      const expected = problem[i]?.expectedStdOut ?? "";
      return { actual: line, expected };
    });

    setResults(updatedResults);
  };

  const handleExecution = () => {
    setShowTestSuite(true);
    withLoading(
      () => handleTestSuiteExecution(problem, template, updateResults),
      () => toast.success("Test suite executed successfully!"),
      console.error,
    );
  };

  return (
    <div className={styles.containerWrapper}>
      <div className={styles.innerContainer}>
        <Accordion items={STAGE_TWO} initialTabOpen={0} />
        <NotePad />
        <AIAgent />
      </div>

      <div className={styles.innerContainer}>
        {showTestSuite ? (
          isLoading ? (
            <h1>LOADING</h1>
          ) : (
            <div className={styles.testSuiteContainer}>
              <TestSuiteList
                tests={problem.testSuite}
                language={problem.programLanguage}
                isEditable={false}
                results={results}
                setResults={setResults}
              />
            </div>
          )
        ) : (
          <>
            <div className={styles.textEditorContainer}>
              <TextEditor
                fixedHeight={"100%"}
                language={problemAttempt.problemLanguage}
                showLanguageSelect={false}
                src={studentCodeSubmission}
                setSource={updateStudentCodeSubmission}
              />
            </div>

            <div className={styles.buttonContainer}>
              <Button onClick={handleExecution} disabled={isLoading}>
                Submit!
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
