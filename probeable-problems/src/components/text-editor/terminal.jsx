import styles from "./terminal.module.css";

export default function Terminal({ output }) {
  return <div className={styles.terminal}>{output}</div>;
}
