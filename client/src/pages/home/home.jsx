import styles from "./home.module.css";
import ProblemList from "@/components/list/list.jsx";
import SplitText from "@/components/text/split-text/split-text.jsx";
import { useUserProfile } from "@/context/user-context.jsx";
import ShinyText from "@/components/text/shiny-text/shiny-text.jsx";
import { useEffect, useState } from "react";
import { getRandomSubheading } from "@/pages/home/home-utils.js";
import CircularIconButton from "@/components/button/circular-button.jsx";
import { RiSurveyLine as SurveyIcon } from "react-icons/ri";
import { MdInfoOutline as InfoIcon } from "react-icons/md";

const WELCOME_TEXT_DURATION = 2;

export default function Home() {
  const { profile } = useUserProfile();
  const [showSubheading, setShowSubheading] = useState(false);

  useEffect(() => {
    const splitDuration = WELCOME_TEXT_DURATION * 1000; // duration in ms
    const timer = setTimeout(() => setShowSubheading(true), splitDuration);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.homePageContainer}>
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

      <ProblemList />

      <div className={styles.stickyButtonContainer}>
        <CircularIconButton icon={<SurveyIcon size={20} />} />
        <CircularIconButton icon={<InfoIcon size={20} />} />
      </div>
    </div>
  );
}