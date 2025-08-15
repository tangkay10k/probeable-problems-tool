import styles from "./ai.module.css";
import Banner from "@/components/banner/banner.jsx";
import TextArea from "@/components/inputs/text-area.jsx";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import useWithLoading from "@/hooks/useWithLoading.js";
import { generateSolutionAttempt } from "@/routes/ai-route.js";
import { toast } from "react-toastify";
import { MdBuild as BuildIcon } from "react-icons/md";
import ButtonV2 from "@/components/button/buttonV2.jsx";
import { useLogging } from "@/context/logging-context-provider.jsx";
import { useEffect } from "react";

export default function AIAgent({ editorRef, runCallback }) {
  const {
    studentAgentPrompt,
    updateStudentAgentPrompt,
    updateStudentCodeSubmission,
  } = useProblemAttemptContext();
  const [isLoading, withLoading] = useWithLoading();
  const { addLog } = useLogging();

  useEffect(() => {
    if (!studentAgentPrompt) return;

    const timeout = setTimeout(() => {
      addLog({
        component: "ai-agent",
        action: "typed",
        content: `${studentAgentPrompt}`,
        timestamp: new Date().toISOString(),
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [studentAgentPrompt, addLog]);

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

        addLog({
          component: "ai-agent",
          action: "execute",
          input: `${studentAgentPrompt}`,
          output: `${response.source_code}`,
          timestamp: new Date().toISOString(),
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
          placeholder={
            "Hello, I write exactly as what I'm told 😊 Please give me instructions on what to code!"
          }
          resizable={false}
          value={studentAgentPrompt}
          onChange={(e) => updateStudentAgentPrompt(e.target.value)}
        ></TextArea>
        <div className={styles.buttonContainer}>
          <ButtonV2 onClick={handleSubmit} disabled={isLoading}>
            <BuildIcon size={18} /> Build
          </ButtonV2>
        </div>
      </div>
    </div>
  );
}
