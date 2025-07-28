import styles from "./notes.module.css";
import TextArea from "@/components/inputs/text-area.jsx";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";

export default function NotePad() {
  const { studentNotes, updateStudentNotes } = useProblemAttemptContext();

  const leftIcon = <div className={styles.circle} />;

  return (
    <div className={styles.notePad}>
      <TextArea
        rows={0}
        resizable={false}
        value={studentNotes}
        onChange={(e) => updateStudentNotes(e.target.value)}
        placeholder={"Write your notes from interacting with the client here!"}
      />
    </div>
  );
}