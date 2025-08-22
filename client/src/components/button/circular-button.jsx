import styles from "./button.module.css";

export default function CircularIconButton({
  icon,
  isLoading,
  onClick,
  className,
}) {
  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={`${styles.circularButton} ${className ? className : ""}`}
    >
      {icon}
    </button>
  );
}
