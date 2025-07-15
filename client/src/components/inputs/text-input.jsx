import styles from "./input.module.css";

/**
 * @param type is the type of input
 * @param value is what is displayed in the input field
 * @param onChange is the function that handles state change of the input field
 * @param disabled is a boolean flag indicating if the input is currently disabled
 * @param placeholder is a prompt given to users about what the field is supposed to contain
 * @param onEnter is a callback function which when supplied will be triggered on enter key press
 *
 * */
export default function Input({
  type = "text",
  value = "",
  onChange,
  disabled = false,
  placeholder = "Default Placeholder",
  onEnter,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onEnter) {
      onEnter(e);
    }
  };

  return (
    <input
      type={type}
      className={styles.input}
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
    />
  );
}
