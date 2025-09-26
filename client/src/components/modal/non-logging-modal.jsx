import { Children, useRef, useEffect } from "react";
import styles from "./modal.module.css";
import useOnClickOutside from "@/hooks/useOnClickOutside.js";
import ReactMarkdown from "react-markdown";

export default function ModalV2({
  isOpen,
  setIsOpen,
  onClose,
  title = "",
  className,
  enableOutsideCancel = true,
  children,
}) {
  const modalRef = useRef(null);

  if (enableOutsideCancel) {
    useOnClickOutside(modalRef, () => setIsOpen(false));
  }

  if (!isOpen) return null;

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
