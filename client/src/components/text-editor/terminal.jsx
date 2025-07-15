import styles from "./terminal.module.css";

export default function Terminal({ output = "Execution Output:" }) {
  return <div className={styles.terminal}>{output}</div>;
}
