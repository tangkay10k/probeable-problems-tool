import { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import {getGoogleUser} from "@/routes/google-route.js";
import {getUser} from "@/routes/person-route.js";

export default function Login() {
    const [user, setUser] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loginRole, setLoginRole] = useState(null);

    const loginAs = (role) => {
        setLoginRole(role);
        login();
    };


    const login = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => console.log('Login Failed:', error)
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const googleUser = await getGoogleUser(user);
                const person = await getUser(googleUser, loginRole)
                setProfile(person);
            } catch (err) {
                console.error(err);
                logOut()
            }
        };

        if (user&&loginRole) {
            fetchProfile();
        }
    }, [user]);

    const logOut = () => {
        googleLogout();
        setProfile(null);
        setUser(null);
        setLoginRole(null);
    };

    return (
        <div>
            <h2>React Google Login</h2>
            <br />
            <br />
            {profile ? (
                <div>
                    <img src={profile.picture} alt="user image" />
                    <h3>User Logged in</h3>
                    <p>Name: {profile.name}</p>
                    <p>Email Address: {profile.email}</p>
                    <br />
                    <br />
                    <button onClick={logOut}>Log out</button>
                </div>
            ) : (
                <>
                    <button onClick={() => loginAs("STUDENT")}>Login With Google as Student</button>
                    <br />
                    <button onClick={() => loginAs("TEACHER")}>Login With Google as Teacher</button>
                </>
            )}
        </div>
    );
}
