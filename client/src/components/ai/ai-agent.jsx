import styles from "./ai.module.css";
import Banner from "@/components/banner/banner.jsx";
import TextArea from "@/components/inputs/text-area.jsx";
import Button from "@/components/button/button.jsx";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import useWithLoading from "@/hooks/useWithLoading.js";
import { generateSolutionAttempt } from "@/routes/ai-route.js";
import { toast } from "react-toastify";

export default function AIAgent({ editorRef, runCallback }) {
  const {
    studentAgentPrompt,
    updateStudentAgentPrompt,
    updateStudentCodeSubmission,
  } = useProblemAttemptContext();
  const [isLoading, withLoading] = useWithLoading();

  const handleSubmit = () => {
    runCallback?.();

    if (studentAgentPrompt.trim().length === 0) {
      toast.error("Please give Cogs some instructions!");
      return;
    }

    updateStudentCodeSubmission(""); // clear

    withLoading(
      () => generateSolutionAttempt({ prompt: studentAgentPrompt }),
      (response) => {
        const lines = response.source_code.split("\n");
        let buffer = "";

        lines.forEach((line, idx) => {
          setTimeout(() => {
            buffer += line + "\n";
            updateStudentCodeSubmission(buffer);

            if (editorRef.current) {
              editorRef.current.highlightLine(idx + 1);
            }
          }, idx * 100); // 100ms per line
        });
      },
      console.error,
    );
  };

  const rightIcon = (
    <>
      <div className={styles.status} />
      <div className={styles.clientAvatar}>
        <img src={"/cogs.png"} alt={"Cogs"} />
      </div>
    </>
  );

  return (
    <div className={styles.agentContainer}>
      <Banner rightIcon={rightIcon} header={"Cogs"} subtext={"online now"} />
      <div className={styles.agentBody}>
        <TextArea
          placeholder={"Ask cogs to write code for you!"}
          resizable={false}
          value={studentAgentPrompt}
          onChange={(e) => updateStudentAgentPrompt(e.target.value)}
        ></TextArea>
        <div className={styles.buttonContainer}>
          <Button onClick={handleSubmit} disabled={isLoading}>
            Build!
          </Button>
        </div>
      </div>
    </div>
  );
}
