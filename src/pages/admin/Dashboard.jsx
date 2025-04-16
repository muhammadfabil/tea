import React from "react";

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-600">Dashboard Admin</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800">Jumlah Mahasiswa</h2>
          <p className="text-3xl font-bold text-blue-500">120</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800">Jumlah Dosen</h2>
          <p className="text-3xl font-bold text-blue-500">10</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800">Layanan Masuk</h2>
          <p className="text-3xl font-bold text-blue-500">45</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
