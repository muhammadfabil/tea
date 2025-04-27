import React, { useEffect, useState } from "react";
import axios from "axios";

const DaftarMahasiswa = () => {
  const [data, setData] = useState([]);
  const [selectedRole, setSelectedRole] = useState("All");

  const roles = [
    "All",
    "Dosen Wali",
    "Dosen KP",
    "Dosen Pembimbing 1",
    "Dosen Pembimbing 2",
    "Dosen Penguji 1",
    "Dosen Penguji 2",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = JSON.parse(localStorage.getItem("auth"));
        const alias = auth?.user?.profile?.alias;
        if (!alias) return;

        const res = await axios.get(`http://127.0.0.1:8000/relation/dosen/${alias}`);
        setData(res.data["Daftar Mahasiswa"] || []);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      }
    };

    fetchData();
  }, []);

  const filteredData =
    selectedRole === "All"
      ? data
      : data.filter((mhs) => mhs.role === selectedRole);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Mahasiswa Bimbingan</h1>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border rounded-md px-3 py-2 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {filteredData.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full table-auto">
            <thead className="bg-[#1277C9] text-white">
              <tr>
                <th className="py-3 px-4 text-left">Nama</th>
                <th className="py-3 px-4 text-left">NIM</th>
                <th className="py-3 px-4 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((mhs, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{mhs.nama}</td>
                  <td className="py-3 px-4">{mhs.nim}</td>
                  <td className="py-3 px-4">{mhs.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">Tidak ada data.</div>
      )}
    </div>
  );
};

export default DaftarMahasiswa;
