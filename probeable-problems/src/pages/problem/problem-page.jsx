import styles from "./problemPage.module.css";
import Button from "@/components/button/button.jsx";
import Accordion from "@/components/accordian/accordion.jsx";
import { STAGE_ONE } from "@/pages/problem/data/instructions.js";
import NotePad from "@/components/notes/notepad.jsx";
import ChatApp from "@/components/chatbox/chatapp.jsx";

export default function ProblemPage() {
  return (
    <div className={styles.problemPageContainer}>
      <div className={styles.containerWrapper}>
        <div className={styles.innerContainer}>
          <Accordion items={STAGE_ONE} initialTabOpen={0} />
          <NotePad />
        </div>

        <div className={styles.innerContainer}>
          <ChatApp />
        </div>
      </div>

      <div className={styles.btnContainer}>
        <Button>Next</Button>
      </div>
    </div>
  );
}
