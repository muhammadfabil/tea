import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";


// Halaman Umum
import Login from "../pages/common/Login";
import NotFound from "../pages/common/NotFound";
import LandingPage from "../pages/common/LandingPage";
import AntreanDosen from "../pages/common/AntreanDosen";

// Layout Mahasiswa
import MahasiswaLayout from "../layouts/MahasiswaLayout";

// Halaman Mahasiswa
import DashboardMahasiswa from "../pages/mahasiswa/DashboardMahasiswa";
import AjukanPelayanan from "../pages/mahasiswa/AjukanPelayanan";
import StatusPelayanan from "../pages/mahasiswa/StatusPelayanan";
import PilihJadwal from "../pages/mahasiswa/PilihJadwal";

// Layout Dosen
import DosenLayout from "../layouts/DosenLayout";

// Halaman Dosen
import DashboardDosen from "../pages/dosen/DashboardDosen";
import KelolaJadwal from "../pages/dosen/KelolaJadwal";
import DaftarMahasiswa from "../pages/dosen/DaftarMahasiswa";

// Layout Admin
import AdminLayout from "../layouts/AdminLayout";

// Halaman Admin
import AdminDashboard from "../pages/admin/Dashboard";
import AdminMahasiswa from "../pages/admin/Mahasiswa";
import AdminDosen from "../pages/admin/Dosen"; // ← perbaikan path, tadi typo "./.pages"
import AdminPelayanan from "../pages/admin/Pelayanan";
import IsiDataDosen from "../pages/mahasiswa/IsiDataDosen";
import LayananAdmin from "../pages/admin/LayananAdministrasi";
import RegisterMahasiswa from "../pages/common/Register";
import ListAdmin from "../pages/admin/ListAdmin";
import News from "../pages/common/News";
import NewsAdmin from "../pages/admin/NewsAdmin";
import ProfileMahasiswa from "../pages/mahasiswa/Profile";

import ResetPassPage from "../pages/common/ResetPassPage";
import ResetPassRequest from "../pages/common/ResetPassRequest";



const AppRouter = () => {
  return (
    <Routes>
  {/* 🌐 Halaman Umum */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<RegisterMahasiswa />} />
  <Route path="/antrean-dosen" element={<AntreanDosen />} />
  <Route path="/reset-pass" element={<ResetPassRequest />} />  {/* Fixed the element syntax */}
  <Route path="/reset-password" element={<ResetPassPage />} />  {/* Fixed the element syntax */}
 

  {/* 🎓 Rute Mahasiswa (Hanya untuk mahasiswa) */}
  <Route element={<ProtectedRoute allowedRoles={["mahasiswa"]} />}>
    <Route path="/mahasiswa" element={<MahasiswaLayout />}>
      <Route path="dashboard" element={<DashboardMahasiswa />} />
      <Route path="isi-data-dosen" element={<IsiDataDosen />} />
      <Route path="ajukan-layanan" element={<AjukanPelayanan />} />
      <Route path="status-layanan" element={<StatusPelayanan />} />
      <Route path="pilih-jadwal" element={<PilihJadwal />} />
      <Route path="news" element={<News />} />
      <Route path="profile" element={<ProfileMahasiswa />} />  {/* Fixed the Profile route */}
     
    </Route>
  </Route>

  {/* 👨‍🏫 Rute Dosen (Hanya untuk dosen) */}
  <Route element={<ProtectedRoute allowedRoles={["dosen"]} />}>
    <Route path="/dosen" element={<DosenLayout />}>
      <Route path="dashboard" element={<DashboardDosen />} />
      <Route path="kelola-jadwal" element={<KelolaJadwal />} />
      <Route path="daftar-mahasiswa" element={<DaftarMahasiswa />} />
    </Route>
  </Route>

  {/* 🛠️ Rute Admin (Hanya untuk admin) */}
  <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
    <Route path="/admin" element={<AdminLayout />}>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="mahasiswa" element={<AdminMahasiswa />} />
      <Route path="dosen" element={<AdminDosen />} />
      <Route path="pelayanan" element={<AdminPelayanan />} />
      <Route path="manajemen-pelayanan" element={<LayananAdmin />} />
      <Route path="list-admin" element={<ListAdmin/>} />
      <Route path="news" element={<NewsAdmin />} />
    </Route>
  </Route>

  {/* 🔚 Rute fallback */}
  <Route path="*" element={<NotFound />} />
</Routes>

  );
};

export default AppRouter;
