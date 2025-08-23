import styles from "./nav.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserProfile } from "@/context/user-context.jsx";
import { useEffect, useRef, useState } from "react";
import CircularIconButton from "@/components/button/circular-button.jsx";
import {
  MdInfoOutline as InfoIcon,
  MdOutlineHome as HomeIcon,
} from "react-icons/md";
import useOnClickOutside from "@/hooks/useOnClickOutside.js";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginScreen = location.pathname === "/";

  return (
    <nav className={styles.navbar}>
      <section
        onClick={() => navigate("/problems")}
        className={styles.leftSection}
      >
        <img className={styles.icon} src={"/favicon.png"} alt="Logo" />
        <div className={styles.heading}>
          <h1>Probeable Problems</h1>
          <p>Developing Critical Thinking</p>
        </div>
      </section>
      {!isLoginScreen ? (
        <section>
          <CircularIconButton
            className={styles.homeBtn}
            onClick={() => navigate("/problems")}
            icon={<HomeIcon />}
          />
          <span>{`</>`}</span>
          <CircularIconButton
            className={styles.infoBtn}
            onClick={() => navigate("/about")}
            icon={<InfoIcon />}
          />
          <span>{`</>`}</span>
          <Profile />
        </section>
      ) : null}
    </nav>
  );
}

function Profile() {
  const { profile, logOut } = useUserProfile();
  const [showMenu, setShowMenu] = useState(false);
  const profilePicture = profile?.userImage || "/default-avatar.jpg";
  const menuRef = useRef(null);
  const location = useLocation();
  useOnClickOutside(menuRef, () => setShowMenu(false));

  // Reset menu to closed when path changes
  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  if (!profile) return null;

  return (
    <div className={styles.profileContainer} ref={menuRef}>
      <div className={styles.profileWrapper}>
        <div className={styles.profile} onClick={() => setShowMenu(true)}>
          <img src={profilePicture} alt="user" referrerPolicy="no-referrer" />
        </div>

        {showMenu && (
          <div className={styles.menu}>
            <button onClick={() => logOut()}>Log out</button>
          </div>
        )}
      </div>
    </div>
  );
}
