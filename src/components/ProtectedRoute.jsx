import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  // Belum login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role tidak sesuai
  if (!allowedRoles.includes(user?.role)) {
    // Arahkan ke dashboard sesuai role-nya
    const redirectPath =
      user.role === "admin"
        ? "/admin/dashboard"
        : user.role === "dosen"
        ? "/dosen/dashboard"
        : "/mahasiswa/dashboard";

    return <Navigate to={redirectPath} replace />;
  }

  // Role cocok, izinkan akses
  return <Outlet />;
};

export default ProtectedRoute;
