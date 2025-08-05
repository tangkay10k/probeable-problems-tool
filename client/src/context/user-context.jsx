import { createContext, useContext, useEffect, useState } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { getGoogleUser } from "@/routes/google-route.js";

import { loginUser } from "@/routes/person-route.js";
import { USER_PROFILE_KEY } from "@/constants/personConstants.js";
import { logoutUser } from "@/routes/person-route";
import { useNavigate } from "react-router-dom";

let staticLogOut = () => {};
export const getStaticLogOut = () => staticLogOut;

const UserContext = createContext();

export function UserProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loginRole, setLoginRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setLoading] = useState(true);

  // on mount: restore profile
  useEffect(() => {
    const saved = localStorage.getItem(USER_PROFILE_KEY);
    if (saved) setProfile(JSON.parse(saved));
    setLoading(false);
  }, []);

  // login hook: specify prompt to force account selection
  const login = useGoogleLogin({
    scope: "openid profile email",
    prompt: "select_account", // always ask which account to use:contentReference[oaicite:6]{index=6}
    // you can also add select_account: true here:contentReference[oaicite:7]{index=7}
    onSuccess: async (tokenResponse) => {
      setUser(tokenResponse);
      setProfile(null);
      try {
        const googleUser = await getGoogleUser(tokenResponse);
        const person = await loginUser(googleUser, loginRole);
        setProfile(person);
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(person));
        navigate("/problems");
      } catch (err) {
        console.error("Login or profile fetch failed:", err);
        logOut();
      }
    },
    onError: (err) => {
      console.error("Login Failed:", err);
      navigate("/");
    },
  });

  const loginAs = (role) => {
    setLoginRole(role);
    setProfile(null);
    login(); // triggers Google OAuth with forced account selection
  };

  const logOut = () => {
    googleLogout(); // revoke client session
    // disable auto-selection cookie to avoid auto‑login on next attempt:contentReference[oaicite:8]{index=8}
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    localStorage.removeItem(USER_PROFILE_KEY);
    setUser(null);
    setLoginRole(null);
    setProfile(null);
    logoutUser();
    navigate("/");
  };

  return (
    <UserContext.Provider
      value={{ profile, setProfile, loginAs, logOut, isLoading }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUserProfile = () => useContext(UserContext);
