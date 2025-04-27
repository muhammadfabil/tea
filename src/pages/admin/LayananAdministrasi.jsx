import React, { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Pencil, FileDown, X, Upload } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createClient } from "@supabase/supabase-js";
import { useDropzone } from "react-dropzone";

// 🔑 Kredensial Supabase
const supabase = createClient(
  "https://btqlxdvroxtzzcikwsqg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0cWx4ZHZyb3h0enpjaWt3c3FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDkxMTU2MSwiZXhwIjoyMDYwNDg3NTYxfQ.xR6gP_mryGjY_NOoTcKSONevXl3B5qxeTHtjJScF6jE"
);

const getToken = () => {
  const authData = localStorage.getItem("auth");
  return authData ? JSON.parse(authData).token : null;
};

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

  const fetchLayanan = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/layanan/jenis");
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
        await axios.put(`http://127.0.0.1:8000/layanan/jenis/${editId}`, payload);
        toast.success("Layanan berhasil diperbarui");
      } else {
        await axios.post("http://127.0.0.1:8000/layanan/jenis", payload, {
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

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus layanan ini?")) {
      try {
        setIsLoading(true);
        await axios.delete(`http://127.0.0.1:8000/layanan/jenis/${id}`);
        toast.success("Layanan berhasil dihapus");
        fetchLayanan();
      } catch (err) {
        console.error(err);
        toast.error("Gagal menghapus layanan");
      } finally {
        setIsLoading(false);
      }
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Layanan Administrasi</h1>
        <button
          onClick={() => {
            setModalOpen(true);
            resetForm();
          }}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
        >
          <Plus className="w-5 h-5" />
          Tambah Layanan
        </button>
      </div>

      {/* Table - Fixed display issues */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">No</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Layanan</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Template</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : layanan.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-gray-500">
                    Belum ada data layanan
                  </td>
                </tr>
              ) : (
                layanan.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.nama_layanan}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div className="max-w-md break-words">{item.deskripsi}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {item.is_aktif ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {item.url_file ? (
                        <a
                          href={item.url_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 flex items-center gap-1.5 hover:text-blue-800 transition-colors"
                        >
                          <FileDown className="w-4 h-4" />
                          <span className="underline">Download</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">Tidak ada file</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-none bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editId ? "Edit Layanan" : "Tambah Layanan"}
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Layanan</label>
                <input
                  type="text"
                  name="nama_layanan"
                  value={formData.nama_layanan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template (PDF/DOCX)</label>
                
                {/* Current file display (if editing) */}
                {formData.url_file && !formData.file && (
                  <div className="mb-3 flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2">
                      <FileDown className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-700 truncate max-w-xs">
                        {getFileNameFromUrl(formData.url_file)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCurrentFile}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                {/* New file selected */}
                {formData.file && (
                  <div className="mb-3 flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2">
                      <FileDown className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700 truncate max-w-xs">
                        {formData.file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                {/* React Dropzone */}
                {(!formData.file && !formData.url_file) || (formData.url_file && !formData.file) ? (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center">
                      <Upload className="w-10 h-10 text-gray-400 mb-2" />
                      {isDragActive ? (
                        <p className="text-blue-500">Lepaskan file di sini...</p>
                      ) : (
                        <>
                          <p className="text-gray-600">Tarik file ke sini atau klik untuk memilih</p>
                          <p className="text-xs text-gray-500 mt-1">PDF, DOC, atau DOCX (Maks. 10MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="is_aktif"
                  name="is_aktif"
                  checked={formData.is_aktif}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_aktif" className="ml-2 block text-sm text-gray-700">
                  Aktifkan layanan ini
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaLayanan;