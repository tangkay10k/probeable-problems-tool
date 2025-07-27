import { createContext, useContext, useEffect, useState } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { getGoogleUser } from "@/routes/google-route.js";
import { getUser } from "@/routes/person-route.js";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);     
  const [loginRole, setLoginRole] = useState(null);  
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("user_profile");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setUser(codeResponse);
    },
    onError: (error) => console.log("Login Failed:", error),
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
    <UserContext.Provider value={{ profile, loginAs, logOut }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
