import styles from "./input.module.css";

export default function TextArea({ children, disabled = false, rows = 10 }) {
  return (
    <textarea className={styles.textArea} rows={rows} disabled={disabled}>
      {children}
    </textarea>
  );
}
