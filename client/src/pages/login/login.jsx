import { useUser } from "@/context/user-context.jsx";

export default function Login() {
  const { profile, loginAs, logOut } = useUser();

  return (
    <div>
      <h2>React Google Login</h2>
      <br />
      {profile ? (
        <div>
          <img src={profile.picture} alt="user" />
          <h3>User Logged in</h3>
          <p>Name: {profile.name}</p>
          <p>Email: {profile.email}</p>
          <button onClick={logOut}>Log out</button>
        </div>
      ) : (
        <>
          <button onClick={() => loginAs("STUDENT")}>Login as Student</button>
          <br />
          <button onClick={() => loginAs("TEACHER")}>Login as Teacher</button>
        </>
      )}
    </div>
  );
}
