import React, { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, FileDown } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createClient } from "@supabase/supabase-js";

// 🔑 Ganti kredensial Supabase
const supabase = createClient(
  "https://btqlxdvroxtzzcikwsqg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0cWx4ZHZyb3h0enpjaWt3c3FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDkxMTU2MSwiZXhwIjoyMDYwNDg3NTYxfQ.xR6gP_mryGjY_NOoTcKSONevXl3B5qxeTHtjJScF6jE"
);

const KelolaLayanan = () => {
  const [layanan, setLayanan] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama_layanan: "",
    deskripsi: "",
    is_aktif: true,
    file: null,
  });
  const [editId, setEditId] = useState(null);

  const fetchLayanan = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/layanan/jenis");
      setLayanan(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data layanan.");
    }
  };

  useEffect(() => {
    fetchLayanan();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let url_file = null;

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
        url_file: url_file || null,
      };

      if (editId) {
        await axios.put(`http://127.0.0.1:8000/layanan/jenis/${editId}`, payload);
        toast.success("Layanan diperbarui.");
      } else {
        await axios.post("http://127.0.0.1:8000/layanan/jenis", payload);
        toast.success("Layanan ditambahkan.");
      }

      setModalOpen(false);
      setFormData({ nama_layanan: "", deskripsi: "", is_aktif: true, file: null });
      setEditId(null);
      fetchLayanan();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan data.");
    }
  };

  const handleEdit = (item) => {
    setFormData({ ...item, file: null });
    setEditId(item.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus layanan ini?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/layanan/jenis/${id}`);
        toast.success("Layanan dihapus.");
        fetchLayanan();
      } catch (err) {
        console.error(err);
        toast.error("Gagal menghapus layanan.");
      }
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#1277C9]">Kelola Layanan Administrasi</h1>
        <button
          onClick={() => {
            setModalOpen(true);
            setFormData({ nama_layanan: "", deskripsi: "", is_aktif: true, file: null });
            setEditId(null);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Tambah
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50 text-left text-gray-600">
            <tr>
              <th className="p-3">No</th>
              <th className="p-3">Layanan</th>
              <th className="p-3">Deskripsi</th>
              <th className="p-3">Status</th>
              <th className="p-3">Template</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {layanan.map((item, i) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{item.nama_layanan}</td>
                <td className="p-3">{item.deskripsi}</td>
                <td className="p-3">
                  {item.is_aktif ? (
                    <span className="text-green-600 font-semibold">Aktif</span>
                  ) : (
                    <span className="text-red-500 font-semibold">Nonaktif</span>
                  )}
                </td>
                <td className="p-3">
                  {item.url_file && (
                    <a
                      href={item.url_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      <FileDown className="w-4 h-4" />
                      Download
                    </a>
                  )}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold text-blue-600 mb-4">
              {editId ? "Edit Layanan" : "Tambah Layanan"}
            </h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Nama Layanan</label>
                <input
                  type="text"
                  name="nama_layanan"
                  value={formData.nama_layanan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Template (PDF/DOCX)</label>
                <input
                  type="file"
                  name="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <label className="inline-flex items-center mt-1 gap-2">
                <input
                  type="checkbox"
                  name="is_aktif"
                  checked={formData.is_aktif}
                  onChange={handleInputChange}
                />
                Aktifkan layanan ini
              </label>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditId(null);
                  }}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Simpan
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
