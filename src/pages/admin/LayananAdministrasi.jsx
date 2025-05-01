import React, { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Pencil, FileDown, X, Upload, AlertCircle, CheckCircle2, List, Grid } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createClient } from "@supabase/supabase-js";
import { useDropzone } from "react-dropzone";

// 🔑 Kredensial Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

const getToken = () => {
  const authData = localStorage.getItem("auth");
  return authData ? JSON.parse(authData).token : null;
};

const API = import.meta.env.VITE_API_BASE_URL;
const KelolaLayanan = () => {
  const [layanan, setLayanan] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama_layanan: "",
    deskripsi: "",
    is_aktif: true,
    file: null,
    url_file: null,
  });
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"

  const fetchLayanan = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API}/layanan/jenis`);
      setLayanan(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data layanan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLayanan();
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFormData((prev) => ({ ...prev, file: acceptedFiles[0] }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
  });

  useEffect(() => {
    if (fileRejections.length > 0) {
      toast.error("File tidak valid. Hanya PDF, DOC, atau DOCX yang diperbolehkan.");
    }
  }, [fileRejections]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // New function to handle toggle status directly from table
 // Updated handleToggleStatus function that sends complete payload
const handleToggleStatus = async (id, currentStatus, item) => {
  try {
    // Mark this specific item as toggling
    setLayanan(prevLayanan => 
      prevLayanan.map(layanan => 
        layanan.id === id ? { ...layanan, isToggling: true } : layanan
      )
    );
    
    const newStatus = !currentStatus;
    
    // Create a complete payload with all required fields from the existing item
    const payload = {
      nama_layanan: item.nama_layanan,
      deskripsi: item.deskripsi,
      is_aktif: newStatus,
      url_file: item.url_file
    };
    
    await axios.put(`${API}/layanan/jenis/${id}`, payload);
    
    // Update local state to reflect the change immediately
    setLayanan(prevLayanan => 
      prevLayanan.map(layanan => 
        layanan.id === id ? { ...layanan, is_aktif: newStatus, isToggling: false } : layanan
      )
    );
    
    toast.success(`Layanan berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
  } catch (err) {
    console.error(err);
    toast.error("Gagal mengubah status layanan");
    
    // Reset toggling state on error
    setLayanan(prevLayanan => 
      prevLayanan.map(layanan => 
        layanan.id === id ? { ...layanan, isToggling: false } : layanan
      )
    );
  }
};

  const toggleStatus = (name, checked) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      let url_file = formData.url_file; // Keep existing file URL by default

      // Upload new file if provided
      if (formData.file) {
        const ext = formData.file.name.split(".").pop();
        const fileName = `${formData.nama_layanan.replace(/\s+/g, "_")}_${Date.now()}.${ext}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from("layanan-administrasi")
          .upload(filePath, formData.file);

        if (error) throw error;

        const { data: fileURL } = supabase.storage
          .from("layanan-administrasi")
          .getPublicUrl(filePath);

        url_file = fileURL.publicUrl;
      }

      const payload = {
        nama_layanan: formData.nama_layanan,
        deskripsi: formData.deskripsi,
        is_aktif: formData.is_aktif,
        url_file: url_file,
      };

      if (editId) {
        await axios.put(`${API}/layanan/jenis/${editId}`, payload);
        toast.success("Layanan berhasil diperbarui");
      } else {
        await axios.post(`${API}/layanan/jenis`, payload, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        toast.success("Layanan berhasil ditambahkan");
      }

      setModalOpen(false);
      resetForm();
      fetchLayanan();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      nama_layanan: item.nama_layanan,
      deskripsi: item.deskripsi,
      is_aktif: item.is_aktif,
      file: null,
      url_file: item.url_file, // Store existing file URL
    });
    setEditId(item.id);
    setModalOpen(true);
  };

  const openDeleteModal = (id) => {
    setDeleteItemId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`${API}/layanan/jenis/${deleteItemId}`); // Fixed URL
      toast.success("Layanan berhasil dihapus");
      fetchLayanan();
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus layanan");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nama_layanan: "",
      deskripsi: "",
      is_aktif: true,
      file: null,
      url_file: null,
    });
    setEditId(null);
  };

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, file: null }));
  };

  const removeCurrentFile = () => {
    setFormData((prev) => ({ ...prev, url_file: null }));
  };

  const getFileNameFromUrl = (url) => {
    if (!url) return "";
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    return decodeURIComponent(fileName);
  };
  
  const filteredLayanan = layanan.filter(item => 
    item.nama_layanan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Kelola Layanan Administrasi</h1>
        <p className="text-slate-500">Mengelola daftar layanan administrasi yang tersedia untuk mahasiswa</p>
      </div>
      
      {/* Search, View Toggle, and Add Button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="text" 
            className="pl-10 pr-4 py-3 w-full bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all"
            placeholder="Cari layanan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex shadow-sm">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                viewMode === "table" 
                  ? "bg-blue-600 text-white" 
                  : "bg-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">Tabel</span>
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                viewMode === "card" 
                  ? "bg-blue-600 text-white" 
                  : "bg-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="text-sm font-medium">Card</span>
            </button>
          </div>
          
          <button
            onClick={() => {
              setModalOpen(true);
              resetForm();
            }}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed font-medium"
          >
            <Plus className="w-5 h-5" />
            Tambah Layanan
          </button>
        </div>
      </div>

      {/* Content View (Table or Cards) */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredLayanan.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">Belum ada data layanan</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Belum ada layanan administrasi yang tersedia. Klik tombol "Tambah Layanan" untuk menambahkan layanan baru.
            </p>
          </div>
        </div>
      ) : viewMode === "table" ? (
        // Table View
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">No</th>
                  <th className="px-6 py-4 font-medium">Nama Layanan</th>
                  <th className="px-6 py-4 font-medium">Deskripsi</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Template</th>
                  <th className="px-6 py-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLayanan.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 align-top text-slate-500 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 align-top">
                      <p className="font-medium text-slate-800">{item.nama_layanan}</p>
                    </td>
                    <td className="px-6 py-4 align-top text-slate-600 max-w-xs">
                      {item.deskripsi || <span className="text-slate-400 italic">Tidak ada deskripsi</span>}
                    </td>
                    <td className="px-6 py-4 align-top">
  <div className="flex items-center gap-2">
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
      item.is_aktif 
        ? "bg-emerald-100 text-emerald-700" 
        : "bg-slate-100 text-slate-700"
    }`}>
      {item.is_aktif ? "Aktif" : "Nonaktif"}
    </span>
    <div className="flex items-center">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={item.is_aktif}
          onChange={() => handleToggleStatus(item.id, item.is_aktif, item)}
          disabled={item.isToggling}
        />
        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        {item.isToggling && (
          <div className="absolute inset-0 bg-white bg-opacity-40 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </label>
    </div>
  </div>
</td>
                    <td className="px-6 py-4 align-top">
                      {item.url_file ? (
                        <a
                          href={item.url_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 flex items-center gap-1.5 hover:text-blue-800 transition-all text-sm font-medium"
                        >
                          <FileDown className="w-4 h-4" />
                          <span>Download</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm flex items-center gap-1.5">
                          <FileDown className="w-4 h-4" />
                          <span>Tidak ada</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-3">
                        {/* Toggle switch for active status */}
                        
                        
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Layanan"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(item.id)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Layanan"
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
      ) : (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLayanan.map((item, index) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden">
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-lg text-slate-800">{item.nama_layanan}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${item.is_aktif ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                    {item.is_aktif ? "Aktif" : "Nonaktif"}
                  </div>
                </div>
                
                <div className="text-sm text-slate-600 mb-6 flex-grow">
                  {item.deskripsi || <span className="text-slate-400 italic">Tidak ada deskripsi</span>}
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      {item.url_file ? (
                        <a
                          href={item.url_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 flex items-center gap-1.5 hover:text-blue-800 transition-all text-sm font-medium"
                        >
                          <FileDown className="w-4 h-4" />
                          <span>Download Template</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm flex items-center gap-1.5">
                          <FileDown className="w-4 h-4" />
                          <span>Tidak ada template</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-slate-600 hover:text-blue-600 transition-colors"
                        title="Edit Layanan"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(item.id)}
                        className="text-slate-600 hover:text-red-600 transition-colors"
                        title="Hapus Layanan"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {editId ? "Edit Layanan" : "Tambah Layanan Baru"}
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Layanan</label>
                <input
                  type="text"
                  name="nama_layanan"
                  value={formData.nama_layanan}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan nama layanan"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Deskripsi singkat tentang layanan ini"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Template Dokumen</label>
                
                {/* Current file display (if editing) */}
                {formData.url_file && !formData.file && (
                  <div className="mb-4 flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileDown className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 truncate max-w-xs">
                          {getFileNameFromUrl(formData.url_file)}
                        </p>
                        <p className="text-xs text-slate-500">File template saat ini</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCurrentFile}
                      className="text-slate-500 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                {/* New file selected */}
                {formData.file && (
                  <div className="mb-4 flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 truncate max-w-xs">
                          {formData.file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB · File baru
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-slate-500 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                {/* React Dropzone */}
                {(!formData.file && !formData.url_file) || (formData.url_file && !formData.file) ? (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center">
                      <div className={`p-4 rounded-full ${isDragActive ? "bg-blue-100" : "bg-slate-100"} mb-4`}>
                        <Upload className={`w-8 h-8 ${isDragActive ? "text-blue-600" : "text-slate-400"}`} />
                      </div>
                      {isDragActive ? (
                        <p className="text-blue-600 font-medium">Lepaskan file di sini...</p>
                      ) : (
                        <>
                          <p className="text-slate-700 font-medium">Tarik file ke sini atau klik untuk memilih</p>
                          <p className="text-sm text-slate-500 mt-2">PDF, DOC, atau DOCX (Maks. 10MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              
              {/* Toggle Switch */}
              <div className="flex items-center justify-between pt-4 pb-2">
                <label htmlFor="is_aktif" className="text-sm font-medium text-slate-700">
                  Status Layanan
                </label>
                <div className="flex items-center">
                  <span className={`mr-3 text-sm ${formData.is_aktif ? "text-slate-500" : "font-medium text-slate-700"}`}>
                    {formData.is_aktif ? "Aktif" : "Nonaktif"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="is_aktif"
                      name="is_aktif"
                      className="sr-only peer"
                      checked={formData.is_aktif}
                      onChange={handleInputChange}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-70 font-medium flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Layanan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md m-4">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Konfirmasi Hapus</h3>
              <p className="text-slate-600">
                Apakah Anda yakin ingin menghapus layanan ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all font-medium flex-1"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-70 font-medium flex-1 flex items-center justify-center gap-2"
              >
                {isLoading ? (
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

export default KelolaLayanan;