import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import {
  User,
  Save,
  Users,
  Pencil,
  Trash,
  RefreshCcw,
  Check,
  UserPlus,
  BookUser,
  GraduationCap,
  Info,
  AlertCircle,
  X,
  Search,
  RotateCcw,
  FileSpreadsheet,
  ExternalLink
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const ROLE_MAPPING = {
  wali: ["Dosen Wali", 1],
  kp: ["Dosen KP", 1],
  pbb1: ["Dosen Pembimbing 1", 1],
  pbb2: ["Dosen Pembimbing 2", 1],
  pj1: ["Dosen Penguji 1", 1],
  pj2: ["Dosen Penguji 2", 1],
};

const roleColors = {
  wali: "bg-blue-50 text-blue-800 border-blue-200",
  kp: "bg-purple-50 text-purple-800 border-purple-200",
  pbb1: "bg-green-50 text-green-800 border-green-200",
  pbb2: "bg-emerald-50 text-emerald-800 border-emerald-200",
  pj1: "bg-amber-50 text-amber-800 border-amber-200",
  pj2: "bg-orange-50 text-orange-800 border-orange-200",
};

const IsiDataDosen = () => {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const nim = auth?.user?.profile?.nim;

  const [daftarDosen, setDaftarDosen] = useState([]);
  const [relations, setRelations] = useState([]);
  const [formData, setFormData] = useState({
    dosen_alias: "",
    role: "",
  });

  const API = import.meta.env.VITE_API_BASE_URL;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(null); // id relasi
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [infoVisible, setInfoVisible] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Tambahkan state untuk modal

  // Filter dosen berdasarkan input pencarian
  const filteredDosen = daftarDosen.filter(dosen => 
    dosen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dosen.alias.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchDosen();
    fetchRelations();
  }, []);

  const fetchDosen = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/dosen/all`);
      setDaftarDosen(res.data);
    } catch (err) {
      toast.error("Gagal memuat data dosen");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/relation/mahasiswa/${nim}`);
      setRelations(res.data);
    } catch (err) {
      toast.error("Gagal memuat relasi dosen");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.dosen_alias || !formData.role) {
      toast.warning("Pilih dosen dan peran terlebih dahulu!");
      return;
    }

    // Cek apakah peran sudah ada di relations
    const roleExists = relations.some(
      rel => rel.role === ROLE_MAPPING[formData.role][0] && rel.id !== isEditing
    );

    if (roleExists && !isEditing) {
      toast.warning("Peran ini sudah ditambahkan sebelumnya!");
      return;
    }

    // Perubahan payload untuk memastikan data dikirim dengan format yang benar
    const payload = {
      mahasiswa_nim: nim,
      dosen_alias: formData.dosen_alias,
      role: formData.role,
    };

    try {
      setLoading(true);
      if (isEditing) {
        await axios.put(
          `${API}/relation/${isEditing}`,
          payload
        );
        toast.success("Data dosen berhasil diperbarui");
      } else {
        await axios.post(`${API}/relation/`, payload);
        toast.success("Data dosen berhasil ditambahkan");
      }
      setFormData({ dosen_alias: "", role: "" });
      setIsEditing(null);
      setShowEditModal(false); // Tutup modal jika ada
      fetchRelations();
    } catch (err) {
      toast.error("Gagal menyimpan data");
      console.error("Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API}/relation/${id}`);
      toast.success("Relasi berhasil dihapus");
      setConfirmDelete(null);
      fetchRelations();
    } catch (err) {
      toast.error("Gagal menghapus relasi");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rel) => {
    // Temukan dosen alias dari data lengkap dosen
    const roleKey = getRoleKey(rel.role);
    
    setFormData({
      dosen_alias: rel.dosen_alias,
      role: roleKey
    });
    setIsEditing(rel.id);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({ dosen_alias: "", role: "" });
    setIsEditing(null);
    setShowEditModal(false); // Tutup modal edit
  };

  const getSelectedDosenName = () => {
    if (!formData.dosen_alias) return "";
    const dosen = daftarDosen.find(d => d.alias === formData.dosen_alias);
    return dosen ? dosen.name : "";
  };

  const getRoleKey = (roleName) => {
    return Object.keys(ROLE_MAPPING).find(
      (key) => ROLE_MAPPING[key][0] === roleName
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      {/* Panel Informasi */}
      {infoVisible && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 shadow-sm relative">
          <button 
            onClick={() => setInfoVisible(false)}
            className="absolute top-2 right-2 text-blue-500 hover:text-blue-700"
          >
            <X size={16} />
          </button>
          <div className="flex items-start gap-3">
            <Info className="text-blue-500 mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Informasi Pengisian Data Dosen</h3>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Data dosen diperlukan untuk keperluan akademik seperti bimbingan, KP, dan sidang</li>
                <li>Pastikan data yang diisi sesuai dengan ketentuan program studi</li>
                <li>Untuk perubahan dosen, silakan hubungi admin jika tombol edit tidak tersedia</li>
                <li>Anda dapat mengubah atau menghapus relasi dosen yang sudah ditambahkan</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <BookUser size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Pengisian Data Dosen</h1>
              <p className="text-sm text-gray-500">Kelola relasi dengan dosen pembimbing dan penguji</p>
            </div>
          </div>
          <button 
            onClick={() => setInfoVisible(!infoVisible)}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
          >
            <Info size={16} />
            Informasi
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4 text-gray-700 font-medium">
          <UserPlus size={18} />
          <h2 className="text-lg">{isEditing ? "Edit Relasi Dosen" : "Tambah Relasi Dosen"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block font-medium text-gray-700 text-sm">
                Nama Dosen
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari nama dosen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              
              <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto bg-white">
                {loading ? (
                  <div className="flex justify-center items-center py-4">
                    <RefreshCcw className="w-5 h-5 text-gray-400 animate-spin" />
                  </div>
                ) : filteredDosen.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredDosen.map((dosen) => (
                      <div 
                        key={dosen.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, dosen_alias: dosen.alias }));
                          setSearchQuery("");
                        }}
                        className={`px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition ${
                          formData.dosen_alias === dosen.alias ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {formData.dosen_alias === dosen.alias && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                          <User className={`w-4 h-4 ${formData.dosen_alias === dosen.alias ? 'text-blue-500' : 'text-gray-400'}`} />
                          <span className="font-medium">{dosen.name}</span>
                          <span className="text-xs text-gray-500">({dosen.alias})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Dosen tidak ditemukan
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 text-sm mb-1">
                  Pilih Peran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ROLE_MAPPING).map(([key, [label]]) => (
                    <div
                      key={key}
                      onClick={() => setFormData(prev => ({ ...prev, role: key }))}
                      className={`border p-2.5 rounded-lg cursor-pointer transition flex items-center gap-2
                        ${formData.role === key 
                          ? 'bg-blue-50 border-blue-300 text-blue-700' 
                          : 'hover:bg-gray-50 border-gray-200 text-gray-600'
                        }
                      `}
                    >
                      {formData.role === key ? (
                        <Check className="w-4 h-4 text-blue-500" />
                      ) : (
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {formData.dosen_alias && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">Dosen yang dipilih:</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{getSelectedDosenName()}</span>
                    <span className="text-xs text-gray-500">({formData.dosen_alias})</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !formData.dosen_alias || !formData.role}
              className={`flex-1 md:flex-none md:min-w-[180px] flex items-center justify-center gap-2 px-5 py-2.5 font-medium rounded-lg transition ${
                !formData.dosen_alias || !formData.role
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : isEditing ? (
                <RefreshCcw className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? "Update Relasi" : "Simpan Relasi"}
            </button>
            
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center justify-center gap-2 px-5 py-2.5 font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Relasi Dosen */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Users size={18} />
            <h2 className="text-lg">Daftar Relasi Dosen</h2>
          </div>
          
          <button 
            onClick={() => {
              fetchDosen();
              fetchRelations();
            }}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
          >
            <RefreshCcw size={14} />
            <span>Refresh</span>
          </button>
        </div>

        {loading && relations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCcw className="w-8 h-8 text-gray-300 animate-spin mb-4" />
            <p className="text-gray-500">Memuat data relasi...</p>
          </div>
        ) : relations.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relations.map((rel) => {
              const roleKey = getRoleKey(rel.role);
              // Cari informasi dosen dari daftarDosen berdasarkan alias
              const dosenInfo = daftarDosen.find(dosen => dosen.alias === rel.dosen_alias);
              
              return (
                <div
                  key={rel.id}
                  className="bg-white border rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className={`p-4 border-b ${roleColors[roleKey] || 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{rel.role}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(rel)}
                          className="p-1.5 rounded-md bg-white/80 hover:bg-white text-green-600 hover:text-green-700 border border-green-200 transition"
                          title="Edit relasi"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(rel.id)}
                          className="p-1.5 rounded-md bg-white/80 hover:bg-white text-red-600 hover:text-red-700 border border-red-200 transition"
                          title="Hapus relasi"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-gray-100 p-1.5 rounded-full">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        {/* Tampilkan nama dosen dari daftarDosen yang sudah di-fetch */}
                        <p className="text-sm font-medium">{dosenInfo ? dosenInfo.name : "Memuat Data..."}</p>
                        <p className="text-xs text-gray-500">{rel.dosen_alias}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-2">
                      <a
                        href={`mailto:${dosenInfo?.email || ""}`}
                        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                      >
                        <ExternalLink size={12} />
                        <span>Kontak Dosen</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-700 font-medium mb-1">Belum Ada Relasi Dosen</h3>
            <p className="text-gray-500 text-sm mb-4">Tambahkan relasi dosen menggunakan form di atas</p>
            <button 
              onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <UserPlus size={16} />
              Tambah Relasi Dosen
            </button>
          </div>
        )}
      </div>

      {/* Modal konfirmasi hapus */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Konfirmasi Hapus</h3>
            </div>
            <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus relasi dosen ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition flex items-center gap-2"
              >
                {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal edit relasi */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Edit Relasi Dosen</h3>
              </div>
              <button 
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition bg-gray-100 hover:bg-gray-200 rounded-full p-1.5"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block font-medium text-gray-700 text-sm mb-1">
                  Nama Dosen
                </label>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari nama dosen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                
                <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto bg-white">
                  {loading ? (
                    <div className="flex justify-center items-center py-4">
                      <RefreshCcw className="w-5 h-5 text-gray-400 animate-spin" />
                    </div>
                  ) : filteredDosen.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {filteredDosen.map((dosen) => (
                        <div 
                          key={dosen.id}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, dosen_alias: dosen.alias }));
                            setSearchQuery("");
                          }}
                          className={`px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition ${
                            formData.dosen_alias === dosen.alias ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {formData.dosen_alias === dosen.alias && (
                              <Check className="w-4 h-4 text-blue-500" />
                            )}
                            <User className={`w-4 h-4 ${formData.dosen_alias === dosen.alias ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className="font-medium">{dosen.name}</span>
                            <span className="text-xs text-gray-500">({dosen.alias})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Dosen tidak ditemukan
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 text-sm mb-1">
                  Pilih Peran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ROLE_MAPPING).map(([key, [label]]) => (
                    <div
                      key={key}
                      onClick={() => setFormData(prev => ({ ...prev, role: key }))}
                      className={`border p-2.5 rounded-lg cursor-pointer transition flex items-center gap-2
                        ${formData.role === key 
                          ? 'bg-blue-50 border-blue-300 text-blue-700' 
                          : 'hover:bg-gray-50 border-gray-200 text-gray-600'
                        }
                      `}
                    >
                      {formData.role === key ? (
                        <Check className="w-4 h-4 text-blue-500" />
                      ) : (
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {formData.dosen_alias && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">Dosen yang dipilih:</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{getSelectedDosenName()}</span>
                    <span className="text-xs text-gray-500">({formData.dosen_alias})</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.dosen_alias || !formData.role}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  !formData.dosen_alias || !formData.role
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default IsiDataDosen;
