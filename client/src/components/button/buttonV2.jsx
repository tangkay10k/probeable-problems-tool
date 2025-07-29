import styles from "./button.module.css";

export default function ButtonV2({
  children,
  onClick,
  disabled,
  className,
  ...rest
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} ${styles.button}`}
      {...rest}
    >
      {children}
    </button>
  );
}
