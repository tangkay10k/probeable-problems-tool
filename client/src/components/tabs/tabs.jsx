import React, {
  memo,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "./tab.module.css";

const Tabs = forwardRef(function Tabs(
  { tabs, defaultIndex = 0, index: controlledIndex, onTabChange },
  ref,
) {
  const isControlled = controlledIndex !== undefined;

  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const activeIndex = isControlled ? controlledIndex : uncontrolledIndex;

  useImperativeHandle(
    ref,
    () => ({
      setIndex: (i) => {
        if (isControlled) {
          // Tell parent what we want; parent should update `index` prop
          onTabChange?.(i);
        } else {
          setUncontrolledIndex(i);
          onTabChange?.(i);
        }
      },
      getIndex: () => activeIndex,
    }),
    [isControlled, activeIndex, onTabChange],
  );

  const handleClick = (i) => {
    if (isControlled) {
      onTabChange?.(i);
    } else {
      setUncontrolledIndex(i);
      onTabChange?.(i);
    }
  };

  return (
    <div className={styles.tabs}>
      <div className={styles.tabList}>
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            className={`${styles.tabButton} ${activeIndex === idx ? styles.activeTab : ""}`}
            onClick={() => handleClick(idx)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>{tabs[activeIndex].content}</div>
    </div>
  );
});

export default memo(Tabs);
