import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import DosenDashboard from "./pages/dosen/Dashboard";
import MahasiswaDashboard from "./pages/mahasiswa/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const AppRouter = () => (
  <Routes>
    {/* ✅ Redirect jika akses "/" */}
    <Route path="/" element={<Navigate to="/login" replace />} />

    {/* Login */}
    <Route path="/login" element={<Login />} />

    {/* Admin */}
    <Route
      path="/admin/*"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />

    {/* Dosen */}
    <Route
      path="/dosen/*"
      element={
        <ProtectedRoute allowedRoles={["dosen"]}>
          <DosenDashboard />
        </ProtectedRoute>
      }
    />

    {/* Mahasiswa */}
    <Route
      path="/mahasiswa/*"
      element={
        <ProtectedRoute allowedRoles={["mahasiswa"]}>
          <MahasiswaDashboard />
        </ProtectedRoute>
      }
    />

    {/* 404 */}
    <Route path="*" element={<div>404 - Halaman Tidak Ditemukan</div>} />
  </Routes>
);

export default AppRouter;
