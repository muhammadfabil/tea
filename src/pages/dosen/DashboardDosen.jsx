import React from "react";

const DashboardDosen = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-[#005AE6] mb-6">Selamat Datang, Dosen</h2>

      {/* Statistik Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <h3 className="font-semibold text-lg mb-2">Jadwal Bimbingan</h3>
          <p className="text-2xl">10</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <h3 className="font-semibold text-lg mb-2">Mahasiswa Terdaftar</h3>
          <p className="text-2xl">5</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <h3 className="font-semibold text-lg mb-2">Antrian Bimbingan</h3>
          <p className="text-2xl">3</p>
        </div>
      </div>

      {/* Quick Links / Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-xl font-semibold text-[#005AE6] mb-4">Kelola Jadwal</h3>
          <button className="bg-[#005AE6] text-white py-2 px-4 rounded hover:bg-[#e0e0e0] transition">Lihat Jadwal</button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-xl font-semibold text-[#005AE6] mb-4">Daftar Mahasiswa</h3>
          <button className="bg-[#005AE6] text-white py-2 px-4 rounded hover:bg-[#e0e0e0] transition">Lihat Mahasiswa</button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-xl font-semibold text-[#005AE6] mb-4">Status Bimbingan</h3>
          <button className="bg-[#005AE6] text-white py-2 px-4 rounded hover:bg-[#e0e0e0] transition">Lihat Status</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardDosen;
