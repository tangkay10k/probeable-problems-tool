import React, { useRef } from "react";
import styles from "./modal.module.css";
import useOnClickOutside from "@/hooks/useOnClickOutside.js";

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
        <div className={styles.content}>{children}</div>
      </div>
      <div className={styles.backdrop} />
    </div>
  );
}
