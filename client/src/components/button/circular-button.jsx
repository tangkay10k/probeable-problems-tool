import styles from "./button.module.css";

export default function CircularIconButton({ icon, isLoading, onClick }) {
  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={styles.circularButton}
    >
      {icon}
    </button>
  );
}