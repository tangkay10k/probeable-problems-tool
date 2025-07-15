import styles from "./instruction.module.css";

export default function Instruction({ heading, instruction }) {
  return (
    <div className={styles.instructionWrapper}>
      <div className={styles.heading}>
        <h1>{heading}</h1>
        <hr className={styles.hr} />
      </div>

      <div className={styles.instructionContainer}>
        <p>{instruction}</p>
      </div>
    </div>
  );
}
