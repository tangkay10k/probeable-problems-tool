import styles from "./button.module.css";
import { SpinnerCircular } from "spinners-react";

export default function Button({ onClick, children, disabled = false }) {
  return (
    <button className={styles.button} onClick={onClick} disabled={disabled}>
      {children}
      {disabled && (
        <SpinnerCircular
          size={20}
          thickness={100}
          speed={100}
          color="#1E1E1E"
          secondaryColor="#3A3A3A"
        />
      )}
    </button>
  );
}
