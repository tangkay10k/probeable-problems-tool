import { Navigate, Outlet } from "react-router-dom";
import { useUserProfile } from "@/context/user-context.jsx";

const PrivateRoutes = () => {
  const { profile, isLoading } = useUserProfile();

  if (isLoading) {
    return null;
  }

  return profile ? <Outlet /> : <Navigate to="/" />;
};
export default PrivateRoutes;