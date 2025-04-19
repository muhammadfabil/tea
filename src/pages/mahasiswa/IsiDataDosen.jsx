import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User, Save, Users, Pencil } from "lucide-react";

const IsiDataDosen = () => {
  const [daftarDosen, setDaftarDosen] = useState([]);
  const [formData, setFormData] = useState({
    dosenWali: "",
    pembimbing1: "",
    pembimbing2: "",
    pembimbingKP: "",
    penguji1: "",
    penguji2: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDosen = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/dosen/all");
        setDaftarDosen(response.data);
      } catch (err) {
        console.error("Gagal ambil dosen:", err);
        toast.error("Gagal memuat data dosen");
      }
    };

    fetchDosen();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.dosenWali || !formData.pembimbing1) {
        toast.error("Dosen Wali dan Pembimbing 1 wajib diisi!");
        return;
      }

      // Check for duplicate selections
      const selectedValues = Object.values(formData).filter(Boolean);
      if (new Set(selectedValues).size !== selectedValues.length) {
        toast.warning("Satu dosen tidak boleh memiliki lebih dari satu peran!");
        return;
      }

      // Save to localStorage
      localStorage.setItem("dataDosenMahasiswa", JSON.stringify(formData));
      
      // Show success toast
      toast.success("Data dosen berhasil disimpan!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      console.log("Data saved:", formData);
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan data");
      console.error("Save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 shadow-xl rounded-2xl mt-10">
      <div className="flex items-center gap-3 mb-6">
        <Users className="text-blue-600" />
        <h1 className="text-2xl font-bold text-blue-700">Isi Data Dosen</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dosen Wali */}
        <div>
          <label className="flex items-center gap-2 font-semibold text-gray-800 mb-1">
            <User className="w-5 h-5" />
            Dosen Wali <span className="text-red-500">*</span>
          </label>
          <select
            name="dosenWali"
            value={formData.dosenWali}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Dosen Wali</option>
            {daftarDosen.map((dosen) => (
              <option key={dosen.id} value={dosen.name}>
                {dosen.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pembimbing 1 */}
        <div>
          <label className="flex items-center gap-2 font-semibold text-gray-800 mb-1">
            <Pencil className="w-5 h-5" />
            Pembimbing 1 <span className="text-red-500">*</span>
          </label>
          <select
            name="pembimbing1"
            value={formData.pembimbing1}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Pembimbing 1</option>
            {daftarDosen.map((dosen) => (
              <option key={dosen.id} value={dosen.name}>
                {dosen.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pembimbing 2 */}
        <div>
          <label className="flex items-center gap-2 font-semibold text-gray-800 mb-1">
            <Pencil className="w-5 h-5" />
            Pembimbing 2
          </label>
          <select
            name="pembimbing2"
            value={formData.pembimbing2}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Pembimbing 2</option>
            {daftarDosen.map((dosen) => (
              <option key={dosen.id} value={dosen.name}>
                {dosen.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pembimbing KP */}
        <div>
          <label className="flex items-center gap-2 font-semibold text-gray-800 mb-1">
            <Pencil className="w-5 h-5" />
            Pembimbing KP
          </label>
          <select
            name="pembimbingKP"
            value={formData.pembimbingKP}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Pembimbing KP</option>
            {daftarDosen.map((dosen) => (
              <option key={dosen.id} value={dosen.name}>
                {dosen.name}
              </option>
            ))}
          </select>
        </div>

        {/* Penguji 1 */}
        <div>
          <label className="flex items-center gap-2 font-semibold text-gray-800 mb-1">
            <Pencil className="w-5 h-5" />
            Penguji 1
          </label>
          <select
            name="penguji1"
            value={formData.penguji1}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Penguji 1</option>
            {daftarDosen.map((dosen) => (
              <option key={dosen.id} value={dosen.name}>
                {dosen.name}
              </option>
            ))}
          </select>
        </div>

        {/* Penguji 2 */}
        <div>
          <label className="flex items-center gap-2 font-semibold text-gray-800 mb-1">
            <Pencil className="w-5 h-5" />
            Penguji 2
          </label>
          <select
            name="penguji2"
            value={formData.penguji2}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Penguji 2</option>
            {daftarDosen.map((dosen) => (
              <option key={dosen.id} value={dosen.name}>
                {dosen.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center gap-2 mt-6 px-5 py-2 rounded-lg transition duration-200 ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <Save className="w-5 h-5" />
          {isSubmitting ? "Menyimpan..." : "Simpan Data Dosen"}
        </button>
      </form>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default IsiDataDosen;