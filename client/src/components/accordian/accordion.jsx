import { useState, useRef, useEffect } from "react";
import styles from "./accordian.module.css";

function AccordionItem({ title, content, isOpen, onClick }) {
  const bodyRef = useRef(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    if (isOpen) {
      // expand to its full scrollHeight
      el.style.maxHeight = el.scrollHeight + "px";
    } else {
      // collapse it
      el.style.maxHeight = "0px";
    }
  }, [isOpen]);

  return (
    <div className={styles.item}>
      <button
        className={styles.header}
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <h3>{title}</h3>
        <span className={styles.icon}>{isOpen ? "–" : "+"}</span>
      </button>
      <div ref={bodyRef} className={styles.body}>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}

export default function Accordion({ items = [], initialTabOpen = null }) {
  const [openIndex, setOpenIndex] = useState(initialTabOpen);

  return (
    <div className={styles.accordion}>
      {items.map((it, i) => (
        <AccordionItem
          key={i}
          title={it.title}
          content={it.content}
          isOpen={openIndex === i}
          onClick={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}
