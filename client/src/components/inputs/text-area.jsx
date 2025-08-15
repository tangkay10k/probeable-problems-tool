import styles from "./input.module.css";

export default function TextArea({
  value = "",
  onChange,
  disabled = false,
  rows = 10,
  placeholder = "Default Placeholder",
  resizable = true,
  onEnter,
  ...props
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onEnter) {
      onEnter(e);
    }
  };

  return (
    <textarea
      className={styles.textArea}
      style={{ resize: resizable ? "vertical" : "none" }}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}
