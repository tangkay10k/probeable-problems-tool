import styles from "./notes.module.css";
import TextArea from "@/components/inputs/text-area.jsx";
import { useState } from "react";
export default function NotePad({ initialNotes = "" }) {
  const [notes, setNotes] = useState(initialNotes);

  return (
    <div className={styles.notePad}>
      <div className={styles.header}>
        <div className={styles.circle} />
        <h2>Notes</h2>
      </div>
      <div className={styles.textAreaContainer}>
        <TextArea
          rows={0}
          resizable={false}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            "Write your notes from interacting with the client here!"
          }
        />
      </div>
    </div>
  );
}
