import React from "react";

const DashboardMahasiswa = () => {
  return (
    <div className="p-4 md:ml-10">
      <h1 className="text-2xl md:text-3xl font-bold text-[#005AE6] mb-6">
        Selamat Datang, Mahasiswa!
      </h1>

      {/* Card Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-[#005AE6]">
          <h2 className="text-sm text-gray-500">Jumlah Layanan</h2>
          <p className="text-2xl font-bold text-[#005AE6]">25</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-[#005AE6]">
          <h2 className="text-sm text-gray-500">Dosen Pembimbing</h2>
          <p className="text-2xl font-bold text-[#005AE6]">2</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-[#005AE6]">
          <h2 className="text-sm text-gray-500">Status Layanan</h2>
          <p className="text-2xl font-bold text-[#005AE6]">3 Diproses</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardMahasiswa;
