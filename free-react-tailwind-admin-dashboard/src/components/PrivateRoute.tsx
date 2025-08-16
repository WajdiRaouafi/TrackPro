import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  // Ici, tu peux vérifier si l'utilisateur est authentifié
  // Par exemple, avec un token stocké dans localStorage
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}
