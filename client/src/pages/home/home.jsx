import styles from "./home.module.css";
import ProblemList from "@/components/list/list.jsx";

export default function Home() {
  return (
    <div className={styles.homePageContainer}>
      <ProblemList />
    </div>
  );
}
