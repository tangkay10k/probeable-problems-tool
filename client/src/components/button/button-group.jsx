import styles from "./button.module.css";
import { useLogging } from "@/context/logging-context-provider.jsx";
import { Action, Component } from "@/constants/logConstants.js"

export default function ButtonGroup({
  labels = [],
  onClickHandlers = [],
  selectedIndex,
  onSelectedIndexChange,
  shinyIndex = null,
}) {
  const { addLog } = useLogging();
  const handleClick = (idx) => {
    const label = labels[idx] ?? `Button ${idx}`;

    addLog({
      component: Component.BUTTON,
      action: Action.CLICKED,
      name: `${label}`,
    });

    onSelectedIndexChange(idx);
    if (onClickHandlers[idx]) onClickHandlers[idx]();
  };

  return (
    <div className={styles.buttonGroup}>
      {labels.map((label, idx) => {
        const isSelected = idx === selectedIndex;
        const isShiny = idx === shinyIndex;

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
