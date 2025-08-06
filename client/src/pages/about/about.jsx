import styles from "./about.module.css";
import SplitText from "@/components/text/split-text/split-text.jsx";
import ShinyText from "@/components/text/shiny-text/shiny-text.jsx";
import { Delayed } from "@/components/delay/delayed.jsx";
import Galaxy from "@/pages/about/galaxy.jsx";

export default function AboutPage() {
  return (
    <div className={styles.aboutPageContainer}>
      <div className={styles.aboutContent}>
        <SplitText text={"Probeable Problems"} />
        <Delayed delay={2000} className={styles.subheadingContainer}>
          <ShinyText
            text={"By Kay Tang & Hosea Ngyuen Tong-Ho"}
            className={styles.subheading}
          />
          <br />
          <p className={styles.aboutText}>
            Probeable Problems was built to deliver AI resistant problems and to
            help students develop their client elicitation and critical thinking
            skills.
          </p>
          <br />
          <p className={styles.aboutText}>
            By modelling the real world client elicitation stage of software
            development through deliberate ambiguity, we aim provide CS1
            students a sneak peek into what requirements elicitation looks like
          </p>
          <br />
          <p>✨Built with React, Node.JS, Java Spring & MongoDB ✨</p>
        </Delayed>
      </div>
      <div className={styles.background}>
        <Galaxy />
      </div>
    </div>
  );
}
