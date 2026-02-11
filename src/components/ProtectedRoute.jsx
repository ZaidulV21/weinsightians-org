import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuth = true; // Replace with real auth check later

  return isAuth ? children : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;
