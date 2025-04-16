import React from "react";

const daftarMahasiswa = [
  {
    nama: "Fajar Maulana",
    nim: "123456789",
    topik: "Optimasi Algoritma Genetika",
    tanggal: "2025-04-20",
    status: "Belum Hadir",
  },
  {
    nama: "Indah Lestari",
    nim: "987654321",
    topik: "Sistem Antrian Berbasis Web",
    tanggal: "2025-04-20",
    status: "Hadir",
  },
];

const DaftarMahasiswa = () => {
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Daftar Mahasiswa Bimbingan</h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-[#1277C9] text-white">
            <tr>
              <th className="py-3 px-4 text-left">Nama</th>
              <th className="py-3 px-4 text-left">NIM</th>
              <th className="py-3 px-4 text-left">Topik</th>
              <th className="py-3 px-4 text-left">Tanggal</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {daftarMahasiswa.map((mhs, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{mhs.nama}</td>
                <td className="py-3 px-4">{mhs.nim}</td>
                <td className="py-3 px-4">{mhs.topik}</td>
                <td className="py-3 px-4">{mhs.tanggal}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      mhs.status === "Hadir"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {mhs.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DaftarMahasiswa;
