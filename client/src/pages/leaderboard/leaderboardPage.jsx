import styles from "./leaderboard.module.css";
import LeaderboardTable from "@/pages/leaderboard/components/leaderboard-table.jsx";
import useWithLoading from "@/hooks/useWithLoading.js";
import { getLeaderboard } from "@/routes/person-route.js";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ShinyText from "@/components/text/shiny-text/shiny-text.jsx";
import { ErrorBoundary } from "react-error-boundary";
import Particles from "@/components/particles/particles.jsx";
import { useUserProfile } from "@/context/user-context.jsx";

export default function LeaderBoardPage() {
  const [isLoading, withLoading] = useWithLoading();
  const [rankings, setRankings] = useState([]);
  const { profile } = useUserProfile();

  useEffect(() => {
    if (!profile) return;

    withLoading(
      () => getLeaderboard(profile.email),
      (ranking) => setRankings(ranking),
      () => toast.error("Failed to get leaderboard... 😅"),
    );
  }, [profile]);

  if (isLoading) {
    return (
      <div className={styles.leaderboardPageContainer}>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.leaderboardPageContainer}>
      <div className={styles.leaderboardTableContainer}>
        <ShinyText text={"See how you rank!"} className={styles.heading} />
        <LeaderboardTable rows={rankings} />
      </div>
      <div className={styles.background}>
        <ErrorBoundary fallbackRender={() => null}>
          <Particles
            particleColors={["#6366f1", "#818cf8"]} // ["#c59ce5", "#a715ff"]
            particleCount={500}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}
