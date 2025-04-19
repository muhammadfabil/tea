import React from "react";
import { Routes, Route } from "react-router-dom";

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

const AppRouter = () => {
  return (
    <Routes>
      {/* Rute untuk halaman umum */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/antrean-dosen" element={<AntreanDosen />} />

      {/* Rute untuk Mahasiswa */}
      <Route path="/mahasiswa" element={<MahasiswaLayout />}>
        <Route path="dashboard" element={<DashboardMahasiswa />} />
        <Route path="isi-data-dosen" element={<IsiDataDosen />} />
        <Route path="ajukan-layanan" element={<AjukanPelayanan />} />
        <Route path="status-layanan" element={<StatusPelayanan />} />
        <Route path="pilih-jadwal" element={<PilihJadwal />} />
      </Route>

      {/* Rute untuk Dosen */}
      <Route path="/dosen" element={<DosenLayout />}>
        <Route path="dashboard" element={<DashboardDosen />} />
        <Route path="kelola-jadwal" element={<KelolaJadwal />} />
        <Route path="daftar-mahasiswa" element={<DaftarMahasiswa />} />
      </Route>

      {/* Rute untuk Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="mahasiswa" element={<AdminMahasiswa />} />
        <Route path="dosen" element={<AdminDosen />} />
        <Route path="pelayanan" element={<AdminPelayanan />} />
      </Route>

      {/* Rute fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
