import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuth = true; // TEMP: replace with real auth check later

  return isAuth ? children : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;
