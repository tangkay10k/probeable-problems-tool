import styles from "./terminal.module.css";

export default function Terminal({
  output = "Execution Output:",
  isEditable = false,
  onChange,
}) {
  return (
    <textarea
      className={styles.terminal}
      style={{ resize: isEditable ? "vertical" : "none" }}
      disabled={!isEditable}
      value={output}
      onChange={(e) => {
        onChange(e.target.value);
      }}
    ></textarea>
  );
}
