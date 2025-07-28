import styles from "./nav.module.css";
import Button from "@/components/button/button.jsx";
import { useNavigate } from "react-router-dom";
import ButtonV2 from "@/components/button/buttonV2.jsx";
import {
  MdHome as HomeIcon,
  MdInfoOutline as InfoIcon,
  MdRestartAlt as ResetIcon,
} from "react-icons/md";

export default function BottomNav({ handleStageChange, stage }) {
  const navigate = useNavigate();
  return (
    <div className={styles.bottomNavContainer}>
      <div className={styles.prevContainer}>
        {stage === 2 && <Button onClick={handleStageChange}>Prev</Button>}
      </div>

      <div className={styles.buttonGroupContainer}>
        <ButtonV2 onClick={() => console.log("TODO: ")}>
          <InfoIcon size={50} color={"white"} />
        </ButtonV2>

        <ButtonV2 onClick={() => navigate("/problems")}>
          <HomeIcon size={50} color={"white"} />
        </ButtonV2>

        <ButtonV2 onClick={() => console.log("TODO: ")}>
          <ResetIcon size={50} />
        </ButtonV2>
      </div>

      <div className={styles.nextContainer}>
        {stage === 1 && <Button onClick={handleStageChange}>Next</Button>}
      </div>
    </div>
  );
}