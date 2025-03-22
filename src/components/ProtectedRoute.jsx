import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  console.log("🔍 Cek User di ProtectedRoute setelah reload:", user); // 🔍 Debugging

  if (user === undefined) {
    console.log("⏳ Masih memeriksa user...");
    return null; // Hindari render halaman kosong saat masih memeriksa session
  }

  if (!user) {
    console.log("❌ User tidak ditemukan, redirect ke login!");
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    console.log("⛔ Role tidak diizinkan, redirect ke login!");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
