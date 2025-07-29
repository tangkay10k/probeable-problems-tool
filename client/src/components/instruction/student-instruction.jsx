import styles from "./instruction.module.css";

export default function StudentInstruction({
  instruction = "INSERT INSTRUCTION STRING",
}) {
  return (
    <div className={styles.studentInstructionContainer}>
      <p>{instruction}</p>
    </div>
  );
}
