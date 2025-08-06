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
  const [profile, _setProfile] = useState(null);
  const [isLoading, setLoading] = useState(true);

  const setProfile = (profileData) => {
    if (profileData) {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profileData));
    } else {
      localStorage.removeItem(USER_PROFILE_KEY);
    }
    _setProfile(profileData);
  };

  useEffect(() => {
    const saved = localStorage.getItem(USER_PROFILE_KEY);
    if (saved) _setProfile(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = useGoogleLogin({
    scope: "openid profile email",
    prompt: "select_account",
    onSuccess: async (tokenResponse) => {
      setUser(tokenResponse);
      setProfile(null);
      try {
        const googleUser = await getGoogleUser(tokenResponse);
        const person = await loginUser(googleUser, loginRole);
        setProfile(person);
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
    login();
  };

  const logOut = () => {
    googleLogout();

    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    setProfile(null);
    setUser(null);
    setLoginRole(null);
    logoutUser();
    navigate("/");
  };

  // Expose static logout for external calls
  staticLogOut = logOut;

  return (
    <UserContext.Provider
      value={{ profile, setProfile, loginAs, logOut, isLoading }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUserProfile = () => useContext(UserContext);
