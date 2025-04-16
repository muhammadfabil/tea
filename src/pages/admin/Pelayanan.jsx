import React from "react";

const dummyPelayanan = [
  {
    id: 1,
    layanan: "Pengajuan Surat Keterangan Aktif Kuliah",
    deskripsi: "Surat untuk mahasiswa yang membutuhkan keterangan aktif kuliah.",
    status: "Diajukan",
  },
  {
    id: 2,
    layanan: "Pengajuan Surat Lulus",
    deskripsi: "Surat yang menyatakan mahasiswa telah lulus dari program studi.",
    status: "Diproses",
  },
  {
    id: 3,
    layanan: "Pengajuan Transkrip Nilai",
    deskripsi: "Pengajuan untuk mendapatkan transkrip nilai resmi.",
    status: "Selesai",
  },
];

const AdminPelayanan = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-600">Kelola Pelayanan Administrasi</h1>

      <div className="overflow-x-auto">
        <table className="w-full table-auto bg-white rounded-2xl shadow overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Layanan</th>
              <th className="px-4 py-3 text-left">Deskripsi</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dummyPelayanan.map((pelayanan) => (
              <tr key={pelayanan.id} className="border-t">
                <td className="px-4 py-2">{pelayanan.layanan}</td>
                <td className="px-4 py-2">{pelayanan.deskripsi}</td>
                <td className="px-4 py-2">{pelayanan.status}</td>
                <td className="px-4 py-2">
                  <button className="text-red-600 hover:underline text-sm">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPelayanan;
