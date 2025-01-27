import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const PublicRoute = () => {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    if (userData?.role === "student") {
      return <Navigate to="/sprints" replace />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;
