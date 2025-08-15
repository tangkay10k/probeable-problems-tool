import styles from "./nav.module.css";
import ButtonV2 from "@/components/button/buttonV2.jsx";

export default function BottomNav({ handleStageChange, stage }) {
  return (
    <div className={styles.bottomNavContainer}>
      <div className={styles.prevContainer}>
        {stage === 2 && (
          <ButtonV2 onClick={handleStageChange}>Go back</ButtonV2>
        )}
      </div>

      <div className={styles.nextContainer}>
        {stage === 1 && (
          <ButtonV2 onClick={handleStageChange}>I'm ready to code!</ButtonV2>
        )}
      </div>
    </div>
  );
}
