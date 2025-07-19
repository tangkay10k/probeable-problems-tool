import styles from "./banner.module.css";

export default function Banner({
  header = "Header",
  subtext = "",
  leftIcon = null,
  rightIcon = null,
}) {
  return (
    <div className={styles.header}>
      {leftIcon}
      <div className={styles.headerText}>
        <h2>{header}</h2>
        <p>{subtext}</p>
      </div>
      {rightIcon}
    </div>
  );
}