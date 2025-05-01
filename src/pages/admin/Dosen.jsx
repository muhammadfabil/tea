import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Pencil, RefreshCw, X, AlertCircle, CheckCircle2, Search } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    status_kehadiran: true,
    keterangan: "HADIR",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteDosenInfo, setDeleteDosenInfo] = useState(null);

  const getToken = () => {
    const authData = localStorage.getItem("auth");
    return authData ? JSON.parse(authData).token : null;
  };

  const fetchDosen = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://13.236.194.123/dosen/all", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setDosenList(response.data);
    } catch (error) {
      console.error("Gagal mengambil data dosen:", error);
      toast.error("Gagal mengambil data dosen");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (dosen) => {
    setDeleteItemId(dosen.id);
    setDeleteDosenInfo(dosen);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`https://13.236.194.123/dosen/${deleteItemId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setDosenList((prev) => prev.filter((d) => d.id !== deleteItemId));
      toast.success("Dosen berhasil dihapus");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Gagal menghapus dosen:", error);
      toast.error("Gagal menghapus dosen");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(
        `https://13.236.194.123/dosen/${editDosen.alias}`,
        {
          ...editDosen,
          status_kehadiran: Boolean(editDosen.status_kehadiran),
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setShowEditModal(false);
      setEditDosen(null);
      fetchDosen();
      toast.success("Dosen berhasil diperbarui");
    } catch (error) {
      console.error("Gagal update dosen:", error);
      toast.error("Gagal update dosen");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(
        "https://13.236.194.123/dosen",
        newDosen,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setShowCreateModal(false);
      resetForm();
      fetchDosen();
      toast.success("Dosen berhasil ditambahkan");
    } catch (error) {
      console.error("Gagal menambahkan dosen:", error);
      toast.error("Gagal menambahkan dosen");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewDosen({
      nomor_induk: "",
      name: "",
      alias: "",
      email: "",
      password: "",
      status_kehadiran: true,
      keterangan: "HADIR",
    });
  };

  const toggleStatus = async (dosen) => {
    try {
      // Mark this specific item as toggling status
      setDosenList(prevList => 
        prevList.map(item => 
          item.id === dosen.id ? { ...item, isTogglingStatus: true } : item
        )
      );
      
      // Toggle the boolean status
      const newStatus = !dosen.status_kehadiran;
      
      // Create payload with all required fields
      const payload = {
        ...dosen,
        status_kehadiran: newStatus
      };
      
      await axios.put(`https://13.236.194.123/dosen/${dosen.alias}`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      
      // Update local state to reflect the change
      setDosenList(prevList => 
        prevList.map(item => 
          item.id === dosen.id ? { ...item, status_kehadiran: newStatus, isTogglingStatus: false } : item
        )
      );
      
      toast.success(`Status kehadiran berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (error) {
      console.error("Gagal mengubah status kehadiran:", error);
      toast.error("Gagal mengubah status kehadiran");
      
      // Reset toggling state on error
      setDosenList(prevList => 
        prevList.map(item => 
          item.id === dosen.id ? { ...item, isTogglingStatus: false } : item
        )
      );
    }
  };

  useEffect(() => {
    fetchDosen();
  }, []);

  const filteredDosen = dosenList.filter(dosen => 
    dosen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dosen.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dosen.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dosen.nomor_induk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Kelola Dosen</h1>
        <p className="text-slate-500">Mengelola data dosen aktif dan status kehadiran</p>
      </div>
      
      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <input 
            type="text" 
            className="pl-10 pr-4 py-3 w-full bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all"
            placeholder="Cari dosen berdasarkan nama, NIP, alias..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDosen}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-slate-200 text-slate-700 px-5 py-3 rounded-xl hover:bg-slate-300 transition-all shadow-sm font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
          
          <button
            onClick={() => {
              setShowCreateModal(true);
              resetForm();
            }}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed font-medium"
          >
            <Plus className="w-5 h-5" />
            Tambah Dosen
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && dosenList.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredDosen.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">Belum ada data dosen</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {searchTerm ? "Tidak ada hasil yang cocok dengan pencarian Anda." : "Belum ada dosen yang terdaftar. Klik tombol \"Tambah Dosen\" untuk menambahkan dosen baru."}
            </p>
          </div>
        </div>
      ) : (
        // Table View
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">No</th>
                  <th className="px-6 py-4 font-medium">Nama</th>
                  <th className="px-6 py-4 font-medium">NIP</th>
                  <th className="px-6 py-4 font-medium">Alias</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Keterangan</th>
                  <th className="px-6 py-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDosen.map((dosen, index) => (
                  <tr key={dosen.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 align-top text-slate-500 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 align-top">
                      <p className="font-medium text-slate-800">{dosen.name}</p>
                    </td>
                    <td className="px-6 py-4 align-top text-slate-600">
                      {dosen.nomor_induk || <span className="text-slate-400 italic">-</span>}
                    </td>
                    <td className="px-6 py-4 align-top font-medium text-slate-700">{dosen.alias}</td>
                    <td className="px-6 py-4 align-top text-slate-600">{dosen.email}</td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          dosen.status_kehadiran 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {dosen.status_kehadiran ? "Hadir" : "Tidak Hadir"}
                        </span>
                        <div className="flex items-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={dosen.status_kehadiran}
                              onChange={() => toggleStatus(dosen)}
                              disabled={dosen.isTogglingStatus}
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            {dosen.isTogglingStatus && (
                              <div className="absolute inset-0 bg-white bg-opacity-40 flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {dosen.keterangan || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditDosen(dosen);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Dosen"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(dosen)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Dosen"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-none bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Tambah Dosen Baru</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={newDosen.name}
                    onChange={(e) => setNewDosen({ ...newDosen, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Induk Pegawai (NIP)</label>
                  <input
                    type="text"
                    value={newDosen.nomor_induk}
                    onChange={(e) => setNewDosen({ ...newDosen, nomor_induk: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan NIP"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Alias / Username</label>
                  <input
                    type="text"
                    value={newDosen.alias}
                    onChange={(e) => setNewDosen({ ...newDosen, alias: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Alias untuk login"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newDosen.email}
                    onChange={(e) => setNewDosen({ ...newDosen, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan email"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={newDosen.password}
                  onChange={(e) => setNewDosen({ ...newDosen, password: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan password"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status Kehadiran</label>
                  <div className="flex items-center h-12">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={newDosen.status_kehadiran}
                        onChange={(e) => setNewDosen({ ...newDosen, status_kehadiran: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-slate-700">
                        {newDosen.status_kehadiran ? "Hadir" : "Tidak Hadir"}
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Keterangan</label>
                  <input
                    type="text"
                    value={newDosen.keterangan}
                    onChange={(e) => setNewDosen({ ...newDosen, keterangan: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan keterangan (opsional)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-70 font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Dosen"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editDosen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-none bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Edit Dosen</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditDosen(null);
                }}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={editDosen.name}
                    onChange={(e) => setEditDosen({ ...editDosen, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Induk Pegawai (NIP)</label>
                  <input
                    type="text"
                    value={editDosen.nomor_induk}
                    onChange={(e) => setEditDosen({ ...editDosen, nomor_induk: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan NIP"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Alias / Username</label>
                  <input
                    type="text"
                    value={editDosen.alias}
                    onChange={(e) => setEditDosen({ ...editDosen, alias: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Alias untuk login"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editDosen.email}
                    onChange={(e) => setEditDosen({ ...editDosen, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan email"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status Kehadiran</label>
                  <div className="flex items-center h-12">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={editDosen.status_kehadiran}
                        onChange={(e) => setEditDosen({ ...editDosen, status_kehadiran: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-slate-700">
                        {editDosen.status_kehadiran ? "Hadir" : "Tidak Hadir"}
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Keterangan</label>
                  <input
                    type="text"
                    value={editDosen.keterangan}
                    onChange={(e) => setEditDosen({ ...editDosen, keterangan: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan keterangan (opsional)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditDosen(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-70 font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deleteDosenInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-none bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md m-4">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Konfirmasi Hapus</h3>
              <div className="text-slate-600 space-y-2">
                <p>Apakah Anda yakin ingin menghapus dosen ini?</p>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="font-medium text-slate-800">{deleteDosenInfo.name}</p>
                  <p className="text-sm text-slate-500">UUID: {deleteDosenInfo.id}</p>
                </div>
                <p className="text-sm text-red-600 mt-2">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteDosenInfo(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all font-medium flex-1"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-70 font-medium flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDosen;