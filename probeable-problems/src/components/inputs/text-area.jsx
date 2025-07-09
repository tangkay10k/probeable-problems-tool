import styles from "./input.module.css";

export default function TextArea({
  value = "",
  onChange,
  disabled = false,
  rows = 10,
  placeholder = "Default Placeholder",
}) {
  return (
    <textarea
      className={styles.textArea}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      value={value}
      onChange={onChange}
    />
  );
}
