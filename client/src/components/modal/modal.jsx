import React, { Children, useRef, useEffect } from "react";
import styles from "./modal.module.css";
import useOnClickOutside from "@/hooks/useOnClickOutside.js";
import ReactMarkdown from "react-markdown";
import { useLogging } from "@/context/logging-context-provider.jsx";

export default function Modal({
  isOpen,
  setIsOpen,
  onClose,
  title,
  className,
  children,
}) {
  if (!isOpen) return null;
  const modalRef = useRef(null);
  const { addLog } = useLogging();

  useEffect(() => {
    if (isOpen) {
      addLog({
        component: "modal",
        action: "opened",
        name: `${title}`,
      });
    } 
  }, [isOpen, title]);

  useOnClickOutside(modalRef, () => setIsOpen(false));

  return (
    <div className={styles.container} onClick={onClose}>
      <div
        ref={modalRef}
        className={`${styles.modal} ${className ? className : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>{title}</h2>
        </div>
        <div className={styles.content}>
          {Children.map(children, (child) =>
            typeof child === "string" ? (
              <ReactMarkdown>{child}</ReactMarkdown>
            ) : (
              child
            ),
          )}
        </div>
      </div>
      <div className={styles.backdrop} />
    </div>
  );
}
