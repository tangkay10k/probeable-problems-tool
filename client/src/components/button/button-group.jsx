import styles from "./button.module.css";

export default function ButtonGroup({
  labels = [],
  onClickHandlers = [],
  selectedIndex,
  onSelectedIndexChange,
  shinyIndex = null,
}) {
  const handleClick = (idx) => {
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
