import React, { Children, useRef } from "react";
import styles from "./modal.module.css";
import useOnClickOutside from "@/hooks/useOnClickOutside.js";
import ReactMarkdown from "react-markdown";

export default function Modal({ isOpen, setIsOpen, onClose, title, children }) {
  if (!isOpen) return null;
  const modalRef = useRef(null);
  useOnClickOutside(modalRef, () => setIsOpen(false));

  return (
    <div className={styles.container} onClick={onClose}>
      <div
        ref={modalRef}
        className={styles.modal}
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
