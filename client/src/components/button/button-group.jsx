import styles from "./button.module.css";
import { useState } from "react";

export default function ButtonGroup({
  labels = [],
  onClickHandlers = [],
  shinyIndex = null,
  setShinyIndex = null,
}) {
  const [selectedButton, setSelectedButton] = useState(0);

  console.log("shine index:", shinyIndex);

  const handleClick = (idx) => {
    setSelectedButton(idx);
    setShinyIndex?.(null);
    if (onClickHandlers[idx]) onClickHandlers[idx]();
  };

  return (
    <div className={styles.buttonGroup}>
      {labels.map((label, idx) => {
        const isSelected = idx === selectedButton;
        const isShiny = idx === shinyIndex; // ← check

        return (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            className={[
              styles.groupButton,
              isSelected && styles.selected,
              isShiny && styles.shiny,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
