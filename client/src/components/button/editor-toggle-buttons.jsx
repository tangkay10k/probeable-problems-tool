import React from "react";
import styles from "./button.module.css";

export default function Toggle({
  on,
  onToggle,
  onLabel = "On",
  offLabel = "Off",
}) {
  const handleChange = () => onToggle(!on);

  return (
    <label className={styles.toggle}>
      <input
        type="checkbox"
        checked={on}
        onChange={handleChange}
        className={styles.checkbox}
      />
      <span className={styles.track} />
      <span className={styles.thumb}>{on ? onLabel : offLabel}</span>
    </label>
  );
}