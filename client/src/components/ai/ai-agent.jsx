import styles from "./ai.module.css";
import Banner from "@/components/banner/banner.jsx";
import TextArea from "@/components/inputs/text-area.jsx";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import useWithLoading from "@/hooks/useWithLoading.js";
import { generateSolutionAttempt } from "@/routes/ai-route.js";
import { toast } from "react-toastify";
import { MdBuild as BuildIcon, MdWarning as InfoIcon } from "react-icons/md";
import ButtonV2 from "@/components/button/buttonV2.jsx";
import { useLogging } from "@/context/logging-context-provider.jsx";
import { useEffect, useState } from "react";
import { Action, Component } from "@/constants/logConstants.js";
import ShinyText from "@/components/text/shiny-text/shiny-text.jsx";

export default function AIAgent({ editorRef, runCallback, editorDefaultSrc }) {
  const {
    problem,
    studentAgentPrompt,
    updateStudentAgentPrompt,
    updateStudentCodeSubmission,
    studentCodeSubmission,
  } = useProblemAttemptContext();
  const [isLoading, withLoading] = useWithLoading();
  const { addLog } = useLogging();
  const [resetWarning, setResetWarning] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (
      studentCodeSubmission.trim().length > 0 &&
      studentCodeSubmission !== editorDefaultSrc
    ) {
      setResetWarning(true);
      return;
    }
    setResetWarning(false);
  }, [studentCodeSubmission, editorDefaultSrc]);

  useEffect(() => {
    if (!studentAgentPrompt) return;

    const timeout = setTimeout(() => {
      addLog({
        component: Component.AI_AGENT,
        action: Action.TYPED,
        content: `${studentAgentPrompt}`,
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

    withLoading(
      () => generateSolutionAttempt({ prompt: studentAgentPrompt, programLanguage: problem.programLanguage, functionSignature: problem.functionSignature }),
      (response) => {
        updateStudentCodeSubmission(response.source_code);

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
          component: Component.AI_AGENT,
          action: Action.EXECUTE,
          input: `${studentAgentPrompt}`,
          output: `${response.source_code}`,
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
            "Cogs see 👀 Cogs do 🤖 \nPlease give me instructions on what to code!"
          }
          resizable={false}
          value={studentAgentPrompt}
          onChange={(e) => updateStudentAgentPrompt(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        ></TextArea>
        <div className={styles.buttonContainer}>
          <section style={{ opacity: resetWarning && isFocused ? "1" : "0" }}>
            <InfoIcon />
            <ShinyText text={"COGS WILL RESET THE EDITOR ON BUILD"} />
          </section>

          <ButtonV2 onClick={handleSubmit} disabled={isLoading}>
            <BuildIcon size={18} /> Build
          </ButtonV2>
        </div>
      </div>
    </div>
  );
}
