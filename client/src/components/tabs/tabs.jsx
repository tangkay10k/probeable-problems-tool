import React, { memo, useState } from "react";
import styles from "./tab.module.css";

function Tabs({ tabs, defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <div className={styles.tabs}>
      <div className={styles.tabList}>
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            className={`${styles.tabButton} ${activeIndex === idx ? styles.activeTab : ""}`}
            onClick={() => setActiveIndex(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>{tabs[activeIndex].content}</div>
    </div>
  );
}

export default memo(Tabs);
