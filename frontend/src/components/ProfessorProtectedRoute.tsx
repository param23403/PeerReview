import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const ProfessorProtectedRoute = () => {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (user) {
    if (userData?.role === "student") {
      return <Navigate to="/sprints" replace />;
    }
  }

  return <Outlet />;
};

export default ProfessorProtectedRoute;
