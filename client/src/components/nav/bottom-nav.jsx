import styles from "./nav.module.css";
import Button from "@/components/button/button.jsx";
import { useNavigate } from "react-router-dom";
import ButtonV2 from "@/components/button/buttonV2.jsx";

export default function BottomNav({ stage, handleStageChange }) {
  const navigate = useNavigate();
  return (
    <div className={styles.bottomNavContainer}>
      <div className={styles.homeButtonContainer}>
        <ButtonV2 onClick={() => navigate("/")}>
          <img src={"/favicon.svg"} alt={"Probeable Problems Logo"}></img>
        </ButtonV2>
        <div className={styles.resetButtonContainer}>
          <ButtonV2 onClick={() => console.log("TODO: ")}>Reset</ButtonV2>
        </div>
      </div>

      <div
        className={stage === 1 ? styles.nextContainer : styles.prevContainer}
      >
        <Button onClick={handleStageChange}>
          {stage === 1 ? "Next" : "Prev"}
        </Button>
      </div>
    </div>
  );
}