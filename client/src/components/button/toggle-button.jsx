import styles from "./toggle-button.module.css";

export default function ToggleButton({
  checked,
  onChange,
  label = "",
  leftText = "Hidden",
  rightText = "Visible",
}) {
  return (
    <label className={styles.switchLabel}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className={styles.slider}></span>
      <span className={styles.toggleText}>
        {checked ? rightText : leftText}
      </span>
    </label>
  );
}