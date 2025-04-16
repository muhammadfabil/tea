import React from "react";

const dummyDosen = [
  {
    id: 1,
    nama: "Dr. Bambang Wijaya",
    nip: "19801231 200501 1 002",
    email: "bambang@univ.ac.id",
    ttl: "Yogyakarta, 10 Januari 1980",
  },
  {
    id: 2,
    nama: "Prof. Siti Nurhaliza",
    nip: "19770515 200312 2 001",
    email: "siti@univ.ac.id",
    ttl: "Bandung, 15 Mei 1977",
  },
  {
    id: 3,
    nama: "Ir. Anton Subekti",
    nip: "19790220 201004 1 003",
    email: "anton@univ.ac.id",
    ttl: "Malang, 20 Februari 1979",
  },
];

const AdminDosen = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-600">Kelola Dosen</h1>

      <div className="overflow-x-auto">
        <table className="w-full table-auto bg-white rounded-2xl shadow overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">NIP</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">TTL</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dummyDosen.map((dosen) => (
              <tr key={dosen.id} className="border-t">
                <td className="px-4 py-2">{dosen.nama}</td>
                <td className="px-4 py-2">{dosen.nip}</td>
                <td className="px-4 py-2">{dosen.email}</td>
                <td className="px-4 py-2">{dosen.ttl}</td>
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

export default AdminDosen;
