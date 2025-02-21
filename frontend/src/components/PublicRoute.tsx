import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const PublicRoute = () => {
  const { user, userData, loading } = useAuth();

  if (user &&   !loading) {
    if (userData?.role === "student") {
      return <Navigate to="/sprints" replace />;
    } else if (userData?.role === "professor") {
      return <Navigate to="/viewsprints" replace />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;
