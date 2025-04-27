import React, { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const KelolaAdmin = () => {
  const [adminList, setAdminList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [editId, setEditId] = useState(null);

  const token = JSON.parse(localStorage.getItem("auth"))?.token;

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchAdmin = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/admin/all", { headers });
      setAdminList(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data admin.");
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
      const url = editId
        ? `http://127.0.0.1:8000/admin/${editId}`
        : "http://127.0.0.1:8000/admin";
      const method = editId ? axios.put : axios.post;

      await method(url, formData, { headers });
      toast.success(editId ? "Admin diperbarui." : "Admin ditambahkan.");
      setModalOpen(false);
      setFormData({ name: "", email: "", password: "" });
      setEditId(null);
      fetchAdmin();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan data.");
    }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, email: item.email, password: "" });
    setEditId(item.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus admin ini?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/admin/${id}`, { headers });
        toast.success("Admin dihapus.");
        fetchAdmin();
      } catch (err) {
        console.error(err);
        toast.error("Gagal menghapus admin.");
      }
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#1277C9]">Kelola Admin</h1>
        <button
          onClick={() => {
            setModalOpen(true);
            setFormData({ name: "", email: "", password: "" });
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
              <th className="p-3">Nama</th>
              <th className="p-3">Email</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {adminList.map((item, i) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.email}</td>
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
              {editId ? "Edit Admin" : "Tambah Admin"}
            </h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Nama</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required={!editId}
                />
              </div>
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

export default KelolaAdmin;
