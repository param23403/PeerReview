import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const StudentProtectedRoute = () => {
  const { user, userData, loading } = useAuth();

  if (!user && !loading) {
    return <Navigate to="/" replace />;
  }
  if (user && !loading) {
    if (userData?.role === "professor") {
      return <Navigate to="/viewsprints" replace />;
    }
  }

  return <Outlet />;
};

export default StudentProtectedRoute;
