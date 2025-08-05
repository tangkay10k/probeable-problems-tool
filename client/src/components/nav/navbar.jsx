import styles from "./nav.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserProfile } from "@/context/user-context.jsx";
import { useEffect, useRef, useState } from "react";

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <nav className={styles.navbar}>
      <section onClick={() => navigate("/problems")}>
        <img className={styles.icon} src={"/favicon.png"} alt="Logo"></img>
        <div className={styles.heading}>
          <h1>Probeable Problems</h1>
          <p>Developing Critical Thinking</p>
        </div>
      </section>
      <Profile />
    </nav>
  );
}

function Profile() {
  const { profile, logOut } = useUserProfile();
  const [showMenu, setShowMenu] = useState(false);
  const profilePicture = profile?.userImage || "/default-avatar.jpg";
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Reset menu to closed when path changes
  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
