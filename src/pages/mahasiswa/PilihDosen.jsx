import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const daftarDosen = [
  "Dr. Andi Saputra",
  "Prof. Rina Wijaya",
  "Ir. Budi Hartono",
  "Dr. Siti Aminah"
];

const PilihDosen = () => {
  const [pembimbing1, setPembimbing1] = useState("");
  const [pembimbing2, setPembimbing2] = useState("");
  const [penguji1, setPenguji1] = useState("");
  const [penguji2, setPenguji2] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const allSelected = [pembimbing1, pembimbing2, penguji1, penguji2];
    const hasDuplicate = new Set(allSelected).size !== allSelected.length;

    if (hasDuplicate) {
        toast.error("Dosen tidak boleh sama. Harap pilih dosen yang berbeda.");
      return;
    }

    toast.success("Pilihan dosen berhasil disimpan!");
  };

  return (
    <div className="p-4 md:ml-64">
      <h1 className="text-2xl md:text-3xl font-bold text-[#005AE6] mb-6">
        Pilih Dosen Pembimbing & Penguji
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 max-w-xl">
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-700">Dosen Pembimbing 1</label>
          <select
            value={pembimbing1}
            onChange={(e) => setPembimbing1(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#005AE6]"
          >
            <option value="">-- Pilih Dosen --</option>
            {daftarDosen.map((dosen) => (
              <option key={dosen} value={dosen}>{dosen}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium text-gray-700">Dosen Pembimbing 2</label>
          <select
            value={pembimbing2}
            onChange={(e) => setPembimbing2(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#005AE6]"
          >
            <option value="">-- Pilih Dosen --</option>
            {daftarDosen.map((dosen) => (
              <option key={dosen} value={dosen}>{dosen}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium text-gray-700">Dosen Penguji 1</label>
          <select
            value={penguji1}
            onChange={(e) => setPenguji1(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#005AE6]"
          >
            <option value="">-- Pilih Dosen --</option>
            {daftarDosen.map((dosen) => (
              <option key={dosen} value={dosen}>{dosen}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium text-gray-700">Dosen Penguji 2</label>
          <select
            value={penguji2}
            onChange={(e) => setPenguji2(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#005AE6]"
          >
            <option value="">-- Pilih Dosen --</option>
            {daftarDosen.map((dosen) => (
              <option key={dosen} value={dosen}>{dosen}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-[#005AE6] text-white py-3 rounded hover:bg-[#0041b3] transition"
        >
          Simpan Pilihan
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PilihDosen;
