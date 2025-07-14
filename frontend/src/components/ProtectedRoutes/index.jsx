import { Navigate, Outlet } from "react-router";
import { useContext } from "react";
import UserContext from "../../context/UserContext";

function ProtectedRoutes() {
  const { user } = useContext(UserContext);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoutes;
