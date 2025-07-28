import { createContext, useContext, useEffect, useState } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { getGoogleUser } from "@/routes/google-route.js";
import { getUser } from "@/routes/person-route.js";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export function UserProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loginRole, setLoginRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setUser(codeResponse);
      navigate("/problems");
    },
    onError: (error) => {
      console.log("Login Failed:", error);
      navigate("/");
    },
  });

  const loginAs = (role) => {
    setLoginRole(role);
    login();
  };

  const logOut = () => {
    googleLogout();
    localStorage.removeItem("user_profile");
    setUser(null);
    setLoginRole(null);
    setProfile(null);
    navigate("/");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const googleUser = await getGoogleUser(user);
        const person = await getUser(googleUser, loginRole);
        setProfile(person);
        localStorage.setItem("user_profile", JSON.stringify(person));
      } catch (err) {
        console.error(err);
        logOut();
      }
    };

    if (user && loginRole && !profile) {
      fetchProfile();
    }
  }, [user, loginRole]);

  return (
    <UserContext.Provider value={{ profile, loginAs, logOut, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserProfile = () => useContext(UserContext);