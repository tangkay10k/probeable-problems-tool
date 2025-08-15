import styles from "./button.module.css";
import { SpinnerCircular } from "spinners-react";

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
      {disabled ? (
        <SpinnerCircular
          size={20}
          thickness={100}
          speed={100}
          color="#1E1E1E"
          secondaryColor="#3A3A3A"
        />
      ) : (
        children
      )}
    </button>
  );
}
