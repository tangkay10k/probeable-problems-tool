import styles from "./input.module.css";

export default function TextArea({
  value = "",
  onChange,
  disabled = false,
  rows = 10,
}) {
  return (
    <textarea
      className={styles.textArea}
      rows={rows}
      disabled={disabled}
      value={value}
      onChange={onChange}
    />
  );
}
