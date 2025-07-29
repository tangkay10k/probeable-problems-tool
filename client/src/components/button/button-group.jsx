import styles from "./button.module.css";
import { useState } from "react";

export default function ButtonGroup({ labels = [], onClickHandlers = [] }) {
  const [selectedButton, setSelectedButton] = useState(0);

  const handleClick = (idx) => {
    setSelectedButton(idx);
    if (onClickHandlers[idx]) onClickHandlers[idx]();
  };

  return (
    <div className={styles.buttonGroup}>
      {labels.map((label, idx) => (
        <button
          key={idx}
          className={`
            ${styles.groupButton} 
            ${idx === selectedButton ? styles.selected : ""}
          `}
          onClick={() => handleClick(idx)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
