import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useEffect } from "react";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate()

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login")
    }
  }, [user])

  return <Outlet />;
};

export default ProtectedRoute;
