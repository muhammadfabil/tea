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

const IsiDataDosen = () => {
  const auth = JSON.parse(localStorage.getItem("auth"));
const nim = auth?.user?.profile?.nim;


  const [daftarDosen, setDaftarDosen] = useState([]);
  const [relations, setRelations] = useState([]);
  const [formData, setFormData] = useState({
    dosen_alias: "",
    role: "",
  });

  const [isEditing, setIsEditing] = useState(null); // id relasi
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDosen();
    fetchRelations();
  }, []);

  const fetchDosen = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/dosen/all");
      setDaftarDosen(res.data);
    } catch (err) {
      toast.error("Gagal memuat data dosen");
    }
  };

  const fetchRelations = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/relation/mahasiswa/${nim}`);
      setRelations(res.data);
    } catch (err) {
      toast.error("Gagal memuat relasi dosen");
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

    const payload = {
      mahasiswa_nim: nim,
      dosen_alias: formData.dosen_alias,
      role: formData.role,
    };

    try {
      setLoading(true);
      if (isEditing) {
        await axios.put(
          `http://127.0.0.1:8000/relation/${isEditing}`,
          payload
        );
        toast.success("Data dosen berhasil diperbarui");
      } else {
        await axios.post("http://127.0.0.1:8000/relation/", payload);
        toast.success("Data dosen berhasil ditambahkan");
      }
      setFormData({ dosen_alias: "", role: "" });
      setIsEditing(null);
      fetchRelations();
    } catch (err) {
      toast.error("Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus relasi ini?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/relation/${id}`);
      toast.success("Relasi berhasil dihapus");
      fetchRelations();
    } catch (err) {
      toast.error("Gagal menghapus relasi");
    }
  };

  const handleEdit = (rel) => {
    setFormData({
      dosen_alias: rel.dosen_alias,
      role: Object.keys(ROLE_MAPPING).find(
        (key) => ROLE_MAPPING[key][0] === rel.role
      ),
    });
    setIsEditing(rel.id);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-xl mt-8">
      <div className="flex items-center gap-3 mb-6">
        <Users className="text-blue-600" />
        <h1 className="text-2xl font-bold text-blue-700">Isi Data Dosen</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 mb-10">
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            <User className="inline w-4 h-4 mr-2" />
            Pilih Dosen
          </label>
          <select
            name="dosen_alias"
            value={formData.dosen_alias}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Pilih Dosen --</option>
            {daftarDosen.map((d) => (
              <option key={d.id} value={d.alias}>
                {d.name} ({d.alias})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            <Pencil className="inline w-4 h-4 mr-2" />
            Pilih Peran
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Pilih Peran --</option>
            {Object.entries(ROLE_MAPPING).map(([key, [label]]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`col-span-2 mt-4 flex items-center justify-center gap-2 px-5 py-2 font-semibold rounded-lg transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isEditing ? <RefreshCcw className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {isEditing ? "Update Relasi" : "Simpan Relasi"}
        </button>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {relations.map((rel) => (
          <div
            key={rel.id}
            className="border p-4 rounded-xl shadow hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-blue-700 text-lg mb-2">
              {rel.role}
            </h3>
            <p className="text-gray-700 mb-4">{rel.dosen_alias}</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleEdit(rel)}
                className="text-green-600 hover:text-green-800"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(rel.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ToastContainer />
    </div>
  );
};

export default IsiDataDosen;
