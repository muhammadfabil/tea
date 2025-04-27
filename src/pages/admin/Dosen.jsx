import React, { useEffect, useState } from "react";
import axios from "axios";
import { PlusCircle, RefreshCcw, X, Edit2 } from "lucide-react"; // Correct import for Lucide React
import { toast } from "react-toastify"; // React Toastify

const AdminDosen = () => {
  const [dosenList, setDosenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDosen, setEditDosen] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newDosen, setNewDosen] = useState({
    nomor_induk: "",
    name: "",
    alias: "",
    email: "",
    password: "",
    status_kehadiran: "hadir",
    ketersediaan_bimbingan: true,
  });

  const getToken = () => {
    const authData = localStorage.getItem("auth");
    return authData ? JSON.parse(authData).token : null;
  };

  const fetchDosen = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/dosen/all", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setDosenList(response.data);
    } catch (error) {
      console.error("Gagal mengambil data dosen:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus dosen ini?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/dosen/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setDosenList((prev) => prev.filter((d) => d.id !== id));
      toast.success("Dosen berhasil dihapus");
    } catch (error) {
      console.error("Gagal menghapus dosen:", error);
      toast.error("Gagal menghapus dosen");
    }
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/dosen/${editDosen.alias}`,
        {
          ...editDosen,
          ketersediaan_bimbingan: Boolean(editDosen.ketersediaan_bimbingan),
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setShowEditModal(false);
      setEditDosen(null);
      fetchDosen();
      toast.success("Dosen berhasil diupdate");
    } catch (error) {
      console.error("Gagal update dosen:", error);
      toast.error("Gagal update dosen");
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/dosen",
        newDosen,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      console.log("Dosen berhasil ditambahkan:", response.data);
      setShowCreateModal(false);
      fetchDosen();
      toast.success("Dosen berhasil ditambahkan");
    } catch (error) {
      console.error("Gagal menambahkan dosen:", error);
      toast.error("Gagal menambahkan dosen");
    }
  };

  useEffect(() => {
    fetchDosen();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-800">Kelola Dosen</h1>

      {loading ? (
        <div className="text-gray-500">Memuat data dosen...</div>
      ) : (
        <>
          <div className="flex justify-between">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <PlusCircle size={16} /> Tambah Dosen
            </button>
            <button
              onClick={fetchDosen}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <RefreshCcw size={16} /> Refresh Data
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl shadow-md border mt-6">
            <table className="w-full table-auto text-sm text-left text-gray-700">
              <thead className="bg-blue-700 text-white uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Nama</th>
                  <th className="px-6 py-3">NIP</th>
                  <th className="px-6 py-3">Alias</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Kehadiran</th>
                  <th className="px-6 py-3">Bimbingan</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dosenList.map((dosen) => (
                  <tr key={dosen.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{dosen.name}</td>
                    <td className="px-6 py-4">{dosen.nomor_induk}</td>
                    <td className="px-6 py-4 font-medium">{dosen.alias}</td>
                    <td className="px-6 py-4">{dosen.email}</td>
                    <td className="px-6 py-4 capitalize">{dosen.status_kehadiran}</td>
                    <td className="px-6 py-4">
                      {dosen.ketersediaan_bimbingan ? (
                        <span className="text-green-600 font-medium">Tersedia</span>
                      ) : (
                        <span className="text-red-600 font-medium">Tidak</span>
                      )}
                    </td>
                    <td className="px-6 py-4 space-x-2 text-center">
                      <button
                        onClick={() => {
                          setEditDosen(dosen);
                          setShowEditModal(true);
                        }}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-full text-xs"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(dosen.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {dosenList.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-6 text-center text-gray-400">
                      Tidak ada data dosen.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Create Dosen */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-none bg-opacity-30 flex items-center justify-center z-50 backdrop-blur">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-700">Tambah Dosen</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Nama"
                value={newDosen.name}
                onChange={(e) => setNewDosen({ ...newDosen, name: e.target.value })}
              />
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Email"
                value={newDosen.email}
                onChange={(e) => setNewDosen({ ...newDosen, email: e.target.value })}
              />
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Alias"
                value={newDosen.alias}
                onChange={(e) => setNewDosen({ ...newDosen, alias: e.target.value })}
              />
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Password"
                value={newDosen.password}
                onChange={(e) => setNewDosen({ ...newDosen, password: e.target.value })}
              />
              <select
                value={newDosen.status_kehadiran}
                onChange={(e) => setNewDosen({ ...newDosen, status_kehadiran: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="hadir">Hadir</option>
                <option value="tidak hadir">Tidak Hadir</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newDosen.ketersediaan_bimbingan}
                  onChange={(e) =>
                    setNewDosen({ ...newDosen, ketersediaan_bimbingan: e.target.checked })
                  }
                />
                <label>Bimbingan Tersedia</label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleCreateSubmit}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Dosen */}
      {showEditModal && editDosen && (
        <div className="fixed inset-0 bg-none bg-opacity-30 flex items-center justify-center z-50 backdrop-blur">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-700">Edit Dosen</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Nama"
                value={editDosen.name}
                onChange={(e) => setEditDosen({ ...editDosen, name: e.target.value })}
              />
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Email"
                value={editDosen.email}
                onChange={(e) => setEditDosen({ ...editDosen, email: e.target.value })}
              />
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Alias"
                value={editDosen.alias}
                onChange={(e) => setEditDosen({ ...editDosen, alias: e.target.value })}
              />
              <select
                value={editDosen.status_kehadiran}
                onChange={(e) => setEditDosen({ ...editDosen, status_kehadiran: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="hadir">Hadir</option>
                <option value="tidak hadir">Tidak Hadir</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editDosen.ketersediaan_bimbingan}
                  onChange={(e) =>
                    setEditDosen({ ...editDosen, ketersediaan_bimbingan: e.target.checked })
                  }
                />
                <label>Bimbingan Tersedia</label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleEditSubmit}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDosen;
