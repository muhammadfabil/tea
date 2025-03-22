import { useState } from "react";

const AjukanAdministrasi = () => {
  const [selectedService, setSelectedService] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault(); // ✅ Mencegah reload halaman
    
    const loggedInUser = JSON.parse(sessionStorage.getItem("user")); // 🔥 Ambil data user yang login
    if (!loggedInUser) {
      alert("Anda harus login terlebih dahulu!");
      return;
    }
  
    if (!selectedService || !file) {
      alert("Harap pilih layanan dan unggah berkas.");
      return;
    }
  
    const newRequest = {
      id: Date.now(),
      namaMahasiswa: loggedInUser.nama, // ✅ Gunakan nama dari user login
      layanan: selectedService,
      fileName: file.name,  
      status: "Diajukan",
    };
  
    const existingRequests = JSON.parse(localStorage.getItem("administrasiRequests")) || [];
    const updatedRequests = [...existingRequests, newRequest];
  
    localStorage.setItem("administrasiRequests", JSON.stringify(updatedRequests));
    alert("Pengajuan berhasil!");
  
    // Reset form setelah pengajuan
    setSelectedService(""); 
    setFile(null);
  };
  
  
  

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Ajukan Pelayanan Administrasi</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dropdown layanan */}
        <select
          className="border p-2 w-full"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          <option value="">Pilih Layanan</option>
          {[
            "Form Perubahan KRS",
            "Form Perubahan Nilai Prodi",
            "Form Penampilan Mata Kuliah",
            "Form Penghapusan/Hide Mata Kuliah",
            "Form Permohonan Cuti Akademik",
            "Form Pengunduran Diri FTI",
            "Form Pengunduran Diri – Mahasiswa TPB",
            "Form Surat Rekomendasi Mahasiswa",
            "Form Permohonan Pengisian KRS",
            "Form Dispensasi Mahasiswa",
            "Form Rekomendasi Mahasiswa",
            "Form Peminjaman Alat Laboratorium (Dalam Fakultas)",
            "Form Izin Penelitian dan Penggunaan Alat Laboratorium Lintas Fakultas",
            "Form Izin Penelitian dan Penggunaan Laboratorium MM/TIK",
            "Surat Izin Kegiatan Senin-Jumat HIMA",
            "Surat Izin Kegiatan Sabtu & Minggu HIMA",
            "Surat Izin Peminjaman Ruang Kelas",
            "Surat Izin Kegiatan UKM Senin-Jumat",
            "Surat Izin Kegiatan Sabtu & Minggu UKM",
            "Format Teknis Lapangan Kegiatan Mahasiswa",
            "Layanan Perubahan KRS",
            "Layanan Pengisian KRS",
            "Layanan Penyembunyian Matakuliah",
            "Layanan Tampil Matakuliah",
          ].map((service, index) => (
            <option key={index} value={service}>
              {index + 1}. {service}
            </option>
          ))}
        </select>

        {/* Input unggah berkas */}
        <input
          type="file"
          className="border p-2 w-full"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* Tombol ajukan */}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Ajukan
        </button>
      </form>
    </div>
  );
};

export default AjukanAdministrasi;
