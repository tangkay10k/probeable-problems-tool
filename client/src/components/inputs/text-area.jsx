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
    // Don't interfere with IME composition (e.g., Chinese/Japanese input)
    if (e.isComposing) return;

    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      }

      if (onEnter) {
        e.preventDefault();
        onEnter(e);
      }
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
