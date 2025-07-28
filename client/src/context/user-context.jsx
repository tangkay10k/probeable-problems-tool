import { createContext, useContext, useEffect, useState } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { getGoogleUser } from "@/routes/google-route.js";
import { getUser } from "@/routes/person-route.js";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();
const USER_PROFILE_KEY = "user_profile";

export function UserProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loginRole, setLoginRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(USER_PROFILE_KEY);
    if (saved) setProfile(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = useGoogleLogin({
    scope: "openid profile email",
    onSuccess: async (tokenResponse) => {
      setUser(tokenResponse);
      setProfile(null);

      try {
        const googleUser = await getGoogleUser(tokenResponse);
        const person = await getUser(googleUser, loginRole);
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
    navigate("/");
  };

  return (
    <UserContext.Provider value={{ profile, loginAs, logOut, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserProfile = () => useContext(UserContext);