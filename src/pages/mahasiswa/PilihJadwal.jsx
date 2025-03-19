import { useState, useEffect } from "react";

const daftarJadwal = [
  { id: 1, dosen: "Dr. Budi Santoso", waktu: "Senin, 09:00 - 10:00" },
  { id: 2, dosen: "Dr. Budi Santoso", waktu: "Rabu, 13:00 - 14:00" },
  { id: 3, dosen: "Prof. Siti Aminah", waktu: "Selasa, 10:00 - 11:00" },
  { id: 4, dosen: "Prof. Siti Aminah", waktu: "Jumat, 14:00 - 15:00" },
  { id: 5, dosen: "Dr. Ahmad Fauzi", waktu: "Senin, 15:00 - 16:00" },
  { id: 6, dosen: "Dr. Ahmad Fauzi", waktu: "Kamis, 08:00 - 09:00" },
  { id: 7, dosen: "Dr. Rina Kartika", waktu: "Rabu, 10:00 - 11:00" },
  { id: 8, dosen: "Dr. Rina Kartika", waktu: "Kamis, 13:00 - 14:00" },
];

const PilihJadwal = () => {
  const [jadwalTerpilih, setJadwalTerpilih] = useState([]);
  const [jadwalTersedia, setJadwalTersedia] = useState([]);
  const [selectedJadwal, setSelectedJadwal] = useState("");

  // Ambil data dosen yang sudah dipilih dari localStorage
  useEffect(() => {
    const savedDosen = JSON.parse(localStorage.getItem("dosenTerpilih")) || [];
    if (savedDosen.length === 2) {
      const filteredJadwal = daftarJadwal.filter((j) =>
        savedDosen.includes(j.dosen)
      );
      setJadwalTersedia(filteredJadwal);
    }

    // Ambil jadwal yang sudah dipilih sebelumnya
    const savedJadwal = JSON.parse(localStorage.getItem("jadwalBimbingan")) || [];
    setJadwalTerpilih(savedJadwal);
  }, []);

  const handlePilihJadwal = () => {
    if (!selectedJadwal) {
      alert("Silakan pilih jadwal bimbingan!");
      return;
    }

    const confirm = window.confirm(
      `Konfirmasi Pilihan Jadwal:\n${selectedJadwal}\nLanjutkan?`
    );

    if (confirm) {
      const newJadwal = [...jadwalTerpilih, selectedJadwal];
      setJadwalTerpilih(newJadwal);
      localStorage.setItem("jadwalBimbingan", JSON.stringify(newJadwal));
      alert("Jadwal bimbingan berhasil dipilih!");
    }
  };

  const handleHapusJadwal = (jadwal) => {
    const confirm = window.confirm(`Apakah Anda yakin ingin menghapus jadwal ini?\n${jadwal}`);
    if (confirm) {
      const updatedJadwal = jadwalTerpilih.filter((item) => item !== jadwal);
      setJadwalTerpilih(updatedJadwal);
      localStorage.setItem("jadwalBimbingan", JSON.stringify(updatedJadwal));
      alert("Jadwal berhasil dihapus!");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Pilih Jadwal Bimbingan</h2>

      {jadwalTersedia.length === 0 ? (
        <p className="text-gray-500">Silakan pilih dosen pembimbing terlebih dahulu.</p>
      ) : (
        <div className="space-y-4">
          {/* Dropdown Pilih Jadwal */}
          <div>
            <label className="block text-sm font-medium">Pilih Jadwal:</label>
            <select
              className="border p-2 w-full"
              value={selectedJadwal}
              onChange={(e) => setSelectedJadwal(e.target.value)}
            >
              <option value="">Pilih Jadwal</option>
              {jadwalTersedia.map((jadwal) => (
                <option key={jadwal.id} value={`${jadwal.dosen} - ${jadwal.waktu}`}>
                  {jadwal.dosen} - {jadwal.waktu}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Konfirmasi */}
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handlePilihJadwal}
          >
            Konfirmasi Jadwal
          </button>

          {/* Tabel Jadwal yang Sudah Dipilih */}
          {jadwalTerpilih.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">Jadwal yang Dipilih</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">No</th>
                    <th className="border border-gray-300 px-4 py-2">Jadwal</th>
                    <th className="border border-gray-300 px-4 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {jadwalTerpilih.map((jadwal, index) => (
                    <tr key={index} className="text-center">
                      <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">{jadwal}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded"
                          onClick={() => handleHapusJadwal(jadwal)}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PilihJadwal;
