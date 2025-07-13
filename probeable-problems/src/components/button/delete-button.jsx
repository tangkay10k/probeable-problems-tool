import styles from "./delete-button.module.css";

export default function DeleteButton({ onClick, children, disabled = false }) {
  return (
    <button className={styles.button} onClick={onClick} disabled={disabled}>
      <p>{children}</p>
    </button>
  );
}
