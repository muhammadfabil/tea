import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Tampilkan spinner/loading screen jika auth masih loading
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Jika belum login, redirect ke login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Jika role tidak sesuai, redirect ke dashboard yang sesuai
  if (!allowedRoles.includes(user.role)) {
    const redirectPath =
      user.role === "admin"
        ? "/admin/dashboard"
        : user.role === "dosen"
        ? "/dosen/dashboard"
        : "/mahasiswa/dashboard";

    console.warn(`Access denied: role "${user.role}" tidak diizinkan. Mengarahkan ke ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  // Role cocok, izinkan akses ke rute
  return <Outlet />;
};

export default ProtectedRoute;
