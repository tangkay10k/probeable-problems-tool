import styles from "./nav.module.css";
import Button from "@/components/button/button.jsx";

export default function BottomNav({ handleStageChange, stage }) {
  return (
    <div className={styles.bottomNavContainer}>
      <div className={styles.prevContainer}>
        {stage === 2 && <Button onClick={handleStageChange}>Prev</Button>}
      </div>

      <div className={styles.nextContainer}>
        {stage === 1 && <Button onClick={handleStageChange}>Next</Button>}
      </div>
    </div>
  );
}
