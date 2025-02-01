import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const StudentProtectedRoute = () => {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (user) {
    if (userData?.role === "professor") {
      return <Navigate to="/teams" replace />;
    }
  }

  return <Outlet />;
};

export default StudentProtectedRoute;
