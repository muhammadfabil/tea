import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const layananList = [
  "1. Surat Aktif Kuliah", "2. Surat Cuti Kuliah", "3. Surat Keterangan Lulus", "4. Legalisir Ijazah",
  "5. Legalisir Transkrip", "6. Pindah Kampus", "7. Permohonan Magang", "8. Surat Rekomendasi Beasiswa",
  "9. Pengajuan Yudisium", "10. Surat Dispensasi", "11. Pengajuan Pembimbing Skripsi",
  "12. Pengajuan Pembimbing KP", "13. Revisi Transkrip", "14. Keterangan Tidak Menerima Beasiswa",
  "15. Surat Pengantar Penelitian", "16. Permohonan Ujian Skripsi", "17. Perpanjangan Studi",
  "18. Izin Penelitian", "19. Permohonan Sidang KP", "20. Penyerahan Revisi Skripsi",
  "21. Pendaftaran Wisuda", "22. Permohonan Surat Bebas Lab", "23. Permohonan Surat Bebas Pustaka",
  "24. Surat Keterangan Alumni", "25. Permohonan Surat Bebas UKT"
];

const AjukanPelayanan = () => {
  const [layanan, setLayanan] = useState("");
  const [berkas, setBerkas] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!layanan || !berkas) {
      toast.error("Mohon pilih layanan dan unggah berkas.");
      return;
    }

    toast.success("Layanan berhasil diajukan!");
    // Reset form
    setLayanan("");
    setBerkas(null);
  };

  return (
    <div className="p-4 md:ml-64">
      <h1 className="text-2xl font-bold text-[#005AE6] mb-6">Ajukan Pelayanan Administrasi</h1>

      <form onSubmit={handleSubmit} className="grid gap-6 max-w-xl">
        {/* Dropdown */}
        <div>
          <label className="block mb-2 font-medium">Pilih Layanan</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={layanan}
            onChange={(e) => setLayanan(e.target.value)}
          >
            <option value="">-- Pilih Layanan --</option>
            {layananList.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>
        </div>

        {/* Upload file */}
        <div>
          <label className="block mb-2 font-medium">Unggah Berkas (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setBerkas(e.target.files[0])}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          className="bg-[#005AE6] text-white py-3 rounded hover:bg-[#0041b3] transition"
        >
          Ajukan
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AjukanPelayanan;
