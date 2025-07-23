import styles from "./nav.module.css";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <nav className={styles.navbar}>
      <section onClick={() => navigate("/")}>
        <img src={"/favicon.svg"} alt="Logo"></img>
        <h1>Probeable Problems</h1>
      </section>
    </nav>
  );
}