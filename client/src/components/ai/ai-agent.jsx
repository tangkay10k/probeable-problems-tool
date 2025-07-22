import styles from "./ai.module.css";
import { IoChatbubbleEllipsesOutline as ChatIcon } from "react-icons/io5";
import Banner from "@/components/banner/banner.jsx";
import TextArea from "@/components/inputs/text-area.jsx";
import Button from "@/components/button/button.jsx";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import useWithLoading from "@/hooks/useWithLoading.js";
import { generateSolutionAttempt } from "@/routes/ai-route.js";

export default function AIAgent() {
  const {
    studentAgentPrompt,
    updateStudentAgentPrompt,
    updateStudentCodeSubmission,
  } = useProblemAttemptContext();
  const [isLoading, withLoading] = useWithLoading();

  const handleSubmit = () => {
    withLoading(
      () => generateSolutionAttempt({ prompt: studentAgentPrompt }),
      (response) => updateStudentCodeSubmission(response.source_code),
      console.error,
    );
  };

  const leftIcon = (
    <div className={styles.icon}>
      <ChatIcon size={35} />
    </div>
  );

  const rightIcon = (
    <>
      <div className={styles.status} />
      <div className={styles.clientAvatar}>
        <img src={"/client.svg"} alt={"Client"} />
      </div>
    </>
  );

  return (
    <div className={styles.agentContainer}>
      <Banner
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        header={"Cogs"}
        subtext={"online now"}
      />
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
