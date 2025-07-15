import React, { useState, useRef, useEffect } from "react";
import styles from "./dropdown.module.css";
import { RxCaretDown } from "react-icons/rx";

export default function Dropdown({
  label = "Select",
  options = [],
  onSelect,
  placeholder = "Default Placeholder",
}) {
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(placeholder);
  const containerRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => setOpen((prev) => !prev);
  const handleSelect = (option) => {
    onSelect?.(option);
    setSelectedLabel(option);
    setOpen(false);
  };

  return (
    <div className={styles.dropdownContainer} ref={containerRef}>
      <button className={styles.toggleButton} onClick={handleToggle}>
        <p>{label}</p>
        <span className={styles.arrow}>
          <RxCaretDown />
        </span>
      </button>

      {open && (
        <div className={styles.menu}>
          {options.map((opt, idx) => (
            <div
              key={idx}
              className={styles.menuItem}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
      <p>{selectedLabel}</p>
    </div>
  );
}
