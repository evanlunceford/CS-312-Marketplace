import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

// Wrap routes that need a signed-in user: <Route element={<ProtectedRoute />}> ...child routes... </Route>
export default function ProtectedRoute() {
  const { currentUser } = useAuth();
  if (currentUser === undefined) return <p>Loading...</p>;
  if (currentUser === null) return <Navigate to="/signin" replace />;
  return <Outlet />;
}
