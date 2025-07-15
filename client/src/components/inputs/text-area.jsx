import styles from "./input.module.css";

export default function TextArea({
  value = "",
  onChange,
  disabled = false,
  rows = 10,
  placeholder = "Default Placeholder",
  resizable = true,
  ...props
}) {
  return (
    <textarea
      className={styles.textArea}
      style={{ resize: resizable ? "vertical" : "none" }}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}
