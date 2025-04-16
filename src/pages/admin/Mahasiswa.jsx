import React from "react";

const dummyMahasiswa = [
  {
    id: 1,
    nama: "Rizky Ramadhan",
    nim: "210123456",
    email: "rizky@student.ac.id",
    ttl: "Jakarta, 12 Mei 2001",
  },
  {
    id: 2,
    nama: "Salsabila Putri",
    nim: "210654321",
    email: "salsa@student.ac.id",
    ttl: "Bandung, 3 Maret 2002",
  },
  {
    id: 3,
    nama: "Ahmad Fauzi",
    nim: "210789012",
    email: "ahmad@student.ac.id",
    ttl: "Surabaya, 8 Agustus 2000",
  },
];

const AdminMahasiswa = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-600">Kelola Mahasiswa</h1>

      <div className="overflow-x-auto">
        <table className="w-full table-auto bg-white rounded-2xl shadow overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">NIM</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">TTL</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dummyMahasiswa.map((mhs) => (
              <tr key={mhs.id} className="border-t">
                <td className="px-4 py-2">{mhs.nama}</td>
                <td className="px-4 py-2">{mhs.nim}</td>
                <td className="px-4 py-2">{mhs.email}</td>
                <td className="px-4 py-2">{mhs.ttl}</td>
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

export default AdminMahasiswa;
