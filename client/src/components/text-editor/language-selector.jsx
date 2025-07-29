import { useState, useRef } from "react";
import { LANGUAGE_VERSIONS, LANGUAGE_DISPLAY_NAMES } from "./data/constants.js";
import { useEffect } from "react";
import { getRuntimes } from "@/routes/code-route.js";
import { RxCaretDown } from "react-icons/rx";
import styles from "./text-editor.module.css";

export default function LanguageSelector({
  language,
  onLanguageSelect,
  disabled = false,
}) {
  useEffect(() => {
    getRuntimes()
      .then((arr) => {
        arr.forEach(({ language, version }) => {
          if (language in LANGUAGE_VERSIONS) {
            LANGUAGE_VERSIONS[language] = version;
          }
        });
      })
      .catch(console.error);
  }, []);
  const languages = Object.keys(LANGUAGE_VERSIONS);

  return (
    <LanguageDropDown
      label={language}
      options={languages}
      onSelect={onLanguageSelect}
      clickable={!disabled}
    />
  );
}

function LanguageDropDown({
  label = "C",
  options = [],
  onSelect,
  clickable = true,
}) {
  const [languageLabel, setLanguageLabel] = useState(label);
  const [open, setOpen] = useState(false);
  const containerRef = useRef();

  useEffect(() => {
    setLanguageLabel(LANGUAGE_DISPLAY_NAMES[label] || label);
  }, [label]);

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
    setLanguageLabel(LANGUAGE_DISPLAY_NAMES[option] || option);
    setOpen(false);
  };

  return (
    <div className={styles.dropdownContainer} ref={containerRef}>
      <button
        className={styles.toggleButton}
        onClick={handleToggle}
        disabled={!clickable}
      >
        <p>{languageLabel}</p>
        <div className={styles.arrow}>
          <RxCaretDown className={styles.caret} />
        </div>
      </button>

      {open && (
        <div className={styles.menu}>
          {options.map((opt, idx) => (
            <div
              key={idx}
              className={styles.menuItem}
              onClick={() => handleSelect(opt)}
            >
              <div className={styles.selected}>
                {checkSelected(languageLabel, opt) ? "✓" : ""}
              </div>
              <div>{LANGUAGE_DISPLAY_NAMES[opt]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function checkSelected(currentlySelected, option) {
  const selectedLowerCased = currentlySelected.toLowerCase();
  return selectedLowerCased === option;
}
