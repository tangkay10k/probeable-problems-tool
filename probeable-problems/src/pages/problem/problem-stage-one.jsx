import styles from "./problemPage.module.css";
import Button from "@/components/button/button.jsx";
import Accordion from "@/components/accordian/accordion.jsx";
import { STAGE_ONE } from "@/pages/problem/data/instructions.js";
import NotePad from "@/components/notes/notepad.jsx";
import ChatApp from "@/components/chatbox/chatapp.jsx";
import Oracle from "@/components/oracle/oracle.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useWithLoading from "@/hooks/useWithLoading.js";
import { getLatestProblemAttemptForStudent } from "@/routes/problem-attempt-route.js";
import { toast } from "react-toastify";

export default function ProblemStageOne() {
  const { problemId } = useParams();
  const [isLoading, withLoading] = useWithLoading();
  const [problemAttempt, setProblemAttempt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    withLoading(
      () =>
        getLatestProblemAttemptForStudent(
          problemId,
          "ktan185@aucklanduni.ac.nz", // TODO: auth
        ),
      (problemAttempt) => setProblemAttempt(problemAttempt),
      () => {
        navigate("/");
        toast.error("Something went wrong fetching that problem...");
      },
    );
  }, []);

  console.log(problemAttempt);

  if (isLoading) {
    return <div className={styles.problemPageContainer}>Loading...</div>;
  }

  return (
    <div className={styles.problemPageContainer}>
      <div className={styles.containerWrapper}>
        <div className={styles.innerContainer}>
          <Accordion items={STAGE_ONE} initialTabOpen={0} />
          <NotePad />
        </div>

        <div className={styles.innerContainer}>
          <ChatApp messageList={problemAttempt?.messageList} />
          <Oracle />
        </div>
      </div>

      <div className={styles.btnContainer}>
        <Button>Next</Button>
      </div>
    </div>
  );
}
