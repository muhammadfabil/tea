import React, { useEffect, useState } from "react";
import { FiPlus, FiEdit, FiTrash, FiX, FiUsers, FiMail, FiLock } from "react-icons/fi";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";

const KelolaAdmin = () => {
  const [adminList, setAdminList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { token } = useAuth();
  const API = import.meta.env.VITE_API_BASE_URL;

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchAdmin = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API}/admin/all`, { headers });
      setAdminList(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data admin.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const url = editId ? `${API}/admin/${editId}` : `${API}/admin/`;
      const method = editId ? axios.put : axios.post;

      await method(url, formData, { headers });
      toast.success(editId ? "Admin diperbarui." : "Admin ditambahkan.");
      setModalOpen(false);
      setFormData({ name: "", email: "", password: "" });
      setEditId(null);
      fetchAdmin();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, email: item.email, password: "" });
    setEditId(item.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`${API}/adminn/${id}`, { headers });
      toast.success("Admin berhasil dihapus.");
      fetchAdmin();
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus admin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Kelola Admin</h1>
            <p className="text-gray-600">Tambah, edit, atau hapus admin sistem</p>
          </div>
          <button
            onClick={() => {
              setModalOpen(true);
              setFormData({ name: "", email: "", password: "" });
              setEditId(null);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Tambah Admin
          </button>
        </div>
      </div>

      {isLoading && adminList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat data admin...</p>
        </div>
      ) : adminList.length === 0 ? (
        <div className="bg-gray-50 rounded-xl shadow-sm p-8 text-center border">
          <FiUsers className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Belum ada admin</h3>
          <p className="text-gray-500 mb-4">
            Belum ada admin yang terdaftar dalam sistem.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adminList.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {i + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded transition-colors"
                          title="Edit Admin"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded transition-colors"
                          title="Hapus Admin"
                        >
                          <FiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Admin */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-0 m-4 overflow-hidden">
            <div className="bg-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editId ? "Edit Admin" : "Tambah Admin"}
                </h2>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setEditId(null);
                  }}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUsers className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Masukkan nama admin"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Masukkan email admin"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {editId && <span className="text-gray-500 text-xs">(biarkan kosong jika tidak ingin mengubah)</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={editId ? "••••••••••••" : "Masukkan password"}
                      required={!editId}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditId(null);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 font-medium"
                  disabled={isLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 border border-transparent rounded-lg shadow-sm text-white hover:bg-blue-700 font-medium flex items-center transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Konfirmasi Hapus Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <FiTrash className="w-6 h-6" />
              <h3 className="text-lg font-medium">Konfirmasi Hapus</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus admin ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 font-medium"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2.5 bg-red-600 border border-transparent rounded-lg shadow-sm text-white hover:bg-red-700 font-medium flex items-center transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <FiTrash className="w-4 h-4 mr-2" />
                    Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaAdmin;
