import styles from "./instruction.module.css";
import ReactMarkdown from "react-markdown";

export default function StudentInstruction({
  instruction = "INSERT INSTRUCTION STRING",
}) {
  return (
    <div className={styles.studentInstructionContainer}>
      <ReactMarkdown>{instruction}</ReactMarkdown>
    </div>
  );
}
