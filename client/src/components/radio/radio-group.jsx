import React, { useState } from "react";
import styles from "./radio-group.module.css";

/**
 * RadioGroup component
 *
 * Renders a collection of radio inputs with support for vertical or
 * horizontal orientation.  A defaultValue prop allows one radio to
 * be pre‑selected, and onChange is emitted whenever selection changes.
 *
 * Props:
 * - options: Array<{ label: string; value: string }> — the radio options.
 * - name: string — the radio name attribute.
 * - orientation?: 'vertical' | 'horizontal' — layout direction; default 'vertical'.
 * - defaultValue?: string — value to pre‑select.
 * - onChange?: (value: string) => void — callback when selection changes.
 */
const RadioGroup = ({
  options = [
    { label: "Strongly Disagree", value: "Strongly Disagree" },
    { label: "Disagree", value: "Disagree" },
    { label: "Neutral", value: "Neutral" },
    { label: "Agree", value: "Agree" },
    { label: "Strongly Agree", value: "Strongly Agree" },
  ],
  name,
  orientation = "horizontal",
  defaultValue = "Neutral",
  onChange,
  heading = "",
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  const handleChange = (event) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={styles.radioWrapper}>
      {heading && <h3>{heading}</h3>}
      <div
        className={[
          styles.radioGroup,
          orientation === "horizontal" ? styles.horizontal : styles.vertical,
        ].join(" ")}
        role="radiogroup"
      >
        {options.map((option) => (
          <label key={option.value} className={styles.radioOption}>
            <input
              className={styles.radioInput}
              type="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={handleChange}
            />
            <span className={styles.customRadio} aria-hidden="true" />
            <span className={styles.labelText}>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;
