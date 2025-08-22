import { useUserProfile } from "@/context/user-context.jsx";
import styles from "./login.module.css";
import Particles from "@/components/particles/particles.jsx";
import { useNavigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

export default function Login() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  if (profile) {
    navigate("/problems");
  }

  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.content}>
        <h1>Develop Critical Thinking Through</h1>
        <h1>Probeable Problems</h1>
        <br />
        <LoginButtons />
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

function LoginButtons() {
  const { loginAs } = useUserProfile();
  return (
    <div className={styles.buttonContainer}>
      <button
        className={styles.studentButton}
        onClick={() => loginAs("STUDENT")}
      >
        Login as Student
      </button>
      <br />
      <button
        className={styles.teacherButton}
        onClick={() => loginAs("TEACHER")}
      >
        Login as Teacher
      </button>
    </div>
  );
}
