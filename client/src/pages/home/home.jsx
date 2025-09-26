import styles from "./home.module.css";
import ProblemList from "@/components/list/list.jsx";
import SplitText from "@/components/text/split-text/split-text.jsx";
import { useUserProfile } from "@/context/user-context.jsx";
import ShinyText from "@/components/text/shiny-text/shiny-text.jsx";
import { useEffect, useState } from "react";
import { getRandomSubheading } from "@/pages/home/home-utils.js";
import CircularIconButton from "@/components/button/circular-button.jsx";
import { MdOutlineCreate as CreateIcon } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import ModalV2 from "@/components/modal/non-logging-modal.jsx";

const WELCOME_TEXT_DURATION = 2;

export default function Home() {
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const isTeacher = profile.role === "TEACHER";
  const [showModal, setShowModal] = useState(false);

  return (
    <div className={styles.homePageContainer}>
      <WelcomeText />
      <ProblemList onCoinClick={() => setShowModal(true)} />
      <ModalV2
        isOpen={showModal}
        enableOutsideCancel={true}
        setIsOpen={setShowModal}
        title="What are Dennies?"
      >
        <div className={styles.coinModalContent}>
          <section>
            Earn Dennies with every problem you solve. Students with the highest
            number of Dennies get a high five from Paul 🖐 (and bragging rights
            😎). <br />
            <br />
            Check out the leaderboard to see how you stack up against your
            peers!
          </section>
          <img className={styles.dennies} src={"/coin.png"} alt={"Dennies"} />
        </div>
      </ModalV2>

      {isTeacher && (
        <div className={styles.stickyButtonContainerLeft}>
          <CircularIconButton
            icon={<CreateIcon size={20} />}
            onClick={() => navigate("/setup")}
          />
        </div>
      )}
    </div>
  );
}

function WelcomeText() {
  const { profile } = useUserProfile();
  const [showSubheading, setShowSubheading] = useState(false);

  useEffect(() => {
    const splitDuration = WELCOME_TEXT_DURATION * 1000; // duration in ms
    const timer = setTimeout(() => setShowSubheading(true), splitDuration);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.textContainer}>
      <SplitText
        className={styles.welcomeText}
        text={`Welcome, ${profile.name}`}
        duration={WELCOME_TEXT_DURATION}
      />
      <div
        className={
          showSubheading
            ? `${styles.shinyWrapper} ${styles.shinyWrapperVisible}`
            : styles.shinyWrapper
        }
      >
        <ShinyText text={getRandomSubheading()} disabled={false} speed={3} />
      </div>
    </div>
  );
}
