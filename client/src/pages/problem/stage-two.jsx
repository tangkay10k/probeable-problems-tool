import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useWithLoading from "@/hooks/useWithLoading.js";
import StudentInstruction from "@/components/instruction/student-instruction.jsx";
import { STAGE_TWO } from "@/pages/problem/data/instructions.js";
import NotePad from "@/components/notes/notepad.jsx";
import AIAgent from "@/components/ai/ai-agent.jsx";
import { getProblem } from "@/routes/problem-route.js";
import { getTestTemplate } from "@/routes/template-route.js";
import { toast } from "react-toastify";
import {
  handleTestSuiteExecution,
  SPLIT_STRING,
} from "@/pages/question-setup/utils/test-setup-utils.js";
import styles from "@/pages/problem/problemPage.module.css";
import Tabs from "@/components/tabs/tabs.jsx";
import ToggleButtons from "@/components/button/editor-toggle-buttons.jsx";
import ButtonV2 from "@/components/button/buttonV2.jsx";
import { VscDebugRestart } from "react-icons/vsc";
import Button from "@/components/button/button.jsx";
import { FaRegPaperPlane as PlaneIcon } from "react-icons/fa";
import { TestSuiteList } from "@/components/text-editor/test-suite-list.jsx";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";

export default function StageTwo() {
  const { problemAttempt, studentCodeSubmission, updateStudentCodeSubmission } =
    useProblemAttemptContext();
  const { problemId } = useParams();
  const [problem, setProblem] = useState([]);
  const [isLoading, withLoading] = useWithLoading();
  const [results, setResults] = useState([]);
  const [template, setTestTemplate] = useState("");
  const [showTestSuite, setShowTestSuite] = useState(false);
  const editorRef = useRef(null);

  const tabs = [
    {
      label: "Task",
      content: <StudentInstruction instruction={STAGE_TWO[0].content} />,
    },
    { label: "Notepad", content: <NotePad /> },
    { label: "Cogs", content: <AIAgent editorRef={editorRef} /> },
  ];

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
    if (studentCodeSubmission.length === 0 || studentCodeSubmission === "") {
      toast.error("Please write some code before submitting!");
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
      () => setShowTestSuite(true),
      console.error,
    );
  };

  return (
    <div className={styles.containerWrapper}>
      <div className={styles.leftContainer}>
        <Tabs tabs={tabs} defaultIndex={0} />
      </div>

      <div className={styles.rightContainer}>
        <div className={styles.buttonContainer}>
          <ToggleButtons
            on={showTestSuite}
            onToggle={setShowTestSuite}
            onLabel={"⚙ Tests"}
            offLabel={"🛠Code"}
          />
          <section className={styles.leftButtons}>
            <section className={styles.restartButton}>
              <ButtonV2
                onClick={() => updateStudentCodeSubmission("")}
                disabled={isLoading}
              >
                <VscDebugRestart size={18} />
              </ButtonV2>
            </section>

            <Button onClick={handleExecution} disabled={isLoading}>
              <PlaneIcon size={12} /> Submit!
            </Button>
          </section>
        </div>

        {showTestSuite ? (
          <div className={styles.testSuiteContainer}>
            <section className={styles.listWrapper}>
              <TestSuiteList
                tests={problem.testSuite}
                language={problem.programLanguage}
                isEditable={false}
                results={results}
                setResults={setResults}
              />
            </section>
          </div>
        ) : (
          <div className={styles.editorWrapper}>
            <TextEditor
              ref={editorRef}
              fixedHeight={"100%"}
              language={problemAttempt.problemLanguage}
              src={studentCodeSubmission}
              setSource={updateStudentCodeSubmission}
              disableLanguageSelect={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
