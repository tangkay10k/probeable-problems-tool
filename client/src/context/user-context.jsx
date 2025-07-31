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
  const [_, setUser] = useState(null);
  const [loginRole, setLoginRole] = useState(null);
  const [profile, setProfileState] = useState(null);
  const [isLoading, setLoading] = useState(true);

  const setProfile = (profile) => {
    if (profile) {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(USER_PROFILE_KEY);
    }
    setProfileState(profile);
  };

  useEffect(() => {
    const saved = localStorage.getItem(USER_PROFILE_KEY);
    if (saved) setProfile(JSON.parse(saved));
    setLoading(false);
  }, []);

  useEffect(() => {
    staticLogOut = logOut;
  }, []);

  const login = useGoogleLogin({
    scope: "openid profile email",
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
    login();
  };

  const logOut = () => {
    googleLogout();
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
