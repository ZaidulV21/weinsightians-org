import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../api/authApi";

const ProtectedRoute = ({ children }) => {
  const isAuth = isAuthenticated();

  return isAuth ? children : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
