import { useState, useEffect } from "react";

const daftarDosen = [
  { id: 1, nama: "Dr. Budi Santoso", nip: "19790101 123456 1 001" },
  { id: 2, nama: "Prof. Siti Aminah", nip: "19800202 654321 2 002" },
  { id: 3, nama: "Dr. Ahmad Fauzi", nip: "19810303 789456 3 003" },
  { id: 4, nama: "Dr. Rina Kartika", nip: "19820404 321987 4 004" },
];

const PilihDosen = () => {
  const [dosen1, setDosen1] = useState("");
  const [dosen2, setDosen2] = useState("");

  // Load data dari localStorage saat pertama kali masuk halaman
  useEffect(() => {
    const savedDosen = JSON.parse(localStorage.getItem("dosenTerpilih"));
    if (savedDosen) {
      setDosen1(savedDosen[0] || "");
      setDosen2(savedDosen[1] || "");
    }
  }, []);

  const handleSubmit = () => {
    if (!dosen1 || !dosen2) {
      alert("Silakan pilih dua dosen pembimbing!");
      return;
    }

    if (dosen1 === dosen2) {
      alert("Dosen 1 dan Dosen 2 tidak boleh sama!");
      return;
    }

    const confirm = window.confirm(
      `Konfirmasi Pilihan Dosen:\n- ${dosen1}\n- ${dosen2}\nLanjutkan?`
    );

    if (confirm) {
      localStorage.setItem("dosenTerpilih", JSON.stringify([dosen1, dosen2]));
      alert("Dosen pembimbing berhasil dipilih!");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Pilih Dosen Pembimbing</h2>

      <div className="space-y-4">
        {/* Dropdown Dosen 1 */}
        <div>
          <label className="block text-sm font-medium">Dosen 1:</label>
          <select
            className="border p-2 w-full"
            value={dosen1}
            onChange={(e) => setDosen1(e.target.value)}
          >
            <option value="">Pilih Dosen</option>
            {daftarDosen.map((dosen) => (
              <option key={dosen.id} value={dosen.nama}>
                {dosen.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Dosen 2 */}
        <div>
          <label className="block text-sm font-medium">Dosen 2:</label>
          <select
            className="border p-2 w-full"
            value={dosen2}
            onChange={(e) => setDosen2(e.target.value)}
          >
            <option value="">Pilih Dosen</option>
            {daftarDosen.map((dosen) => (
              <option key={dosen.id} value={dosen.nama}>
                {dosen.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Tombol Konfirmasi */}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          Konfirmasi Pilihan
        </button>
      </div>
    </div>
  );
};

export default PilihDosen;
