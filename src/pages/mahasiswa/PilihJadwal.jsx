import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Modal Antrean Baru - Blur background, data dummy mahasiswa
const ModalAntrean = ({ isOpen, onClose, dosen, namaMahasiswa }) => {
  if (!isOpen) return null;

  // Dummy data mahasiswa antre
  const dummyAntrean = {
    "Dosen 1": ["Andi", "Budi", "Citra", "Dewi", namaMahasiswa],
    "Dosen 2": ["Rina", "Eko", namaMahasiswa, "Fajar", "Gita"],
  };

  const antrean = dummyAntrean[dosen] || [];
  const posisiSaya = antrean.indexOf(namaMahasiswa) + 1;
  const posisiSekarang = 2; // Simulasi: sekarang yang dipanggil urutan ke-2

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/10 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md relative">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-[#005AE6] mb-4 text-center">Detail Antrean Bimbingan</h2>
        
        <div className="mb-4">
          <p><strong>Dosen:</strong> {dosen}</p>
          <p><strong>Antrean Saat Ini:</strong> Urutan #{posisiSekarang}</p>
          <p>
            <strong>Posisi Anda:</strong>{" "}
            {posisiSaya > 0 ? `Urutan #${posisiSaya}` : "Belum masuk antrean"}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-2 text-[#005AE6]">Daftar Mahasiswa Dalam Antrean:</h3>
          <ul className="list-decimal list-inside text-gray-700 text-sm space-y-1">
            {antrean.map((nama, index) => (
              <li key={index} className={nama === namaMahasiswa ? "font-semibold text-[#005AE6]" : ""}>
                {nama}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs text-gray-400 mt-4 text-center">*Data ini hanya simulasi</div>
      </div>
    </div>
  );
};

const PilihJadwal = () => {
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const namaMahasiswa = "Nama Saya"; // nanti ambil dari context / props

  const dosenTerpilih = ["Dosen 1", "Dosen 2"];

  const dummyJadwal = [
    {
      dosen: "Dosen 1",
      jadwal: [
        { hari: "Senin", waktu: "08:00 - 10:00" },
        { hari: "Rabu", waktu: "13:00 - 15:00" },
      ],
    },
    {
      dosen: "Dosen 2",
      jadwal: [
        { hari: "Selasa", waktu: "09:00 - 11:00" },
        { hari: "Kamis", waktu: "14:00 - 16:00" },
      ],
    },
  ];

  const handleSelectJadwal = (dosen, jadwal) => {
    setSelectedJadwal({ dosen, jadwal });
    toast.success(`Jadwal dengan ${dosen} pada ${jadwal.hari} - ${jadwal.waktu} telah dipilih!`);
  };

  return (
    <div className="p-4 md:ml-10">
      <h1 className="text-2xl font-bold text-[#005AE6] mb-6">Pilih Jadwal Bimbingan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dosenTerpilih.length > 0 ? (
          dosenTerpilih.map((dosen, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-[#005AE6] mb-4">{dosen}</h2>
              <ul>
                {dummyJadwal
                  .filter((j) => j.dosen === dosen)
                  .map((dosenJadwal) =>
                    dosenJadwal.jadwal.map((jadwal, index) => (
                      <li key={index} className="mb-3">
                        <div className="flex justify-between items-center">
                          <span>{jadwal.hari} - {jadwal.waktu}</span>
                          <button
                            onClick={() => handleSelectJadwal(dosen, jadwal)}
                            className="bg-[#005AE6] text-white py-2 px-4 rounded hover:bg-[#004BB5] transition"
                          >
                            Pilih
                          </button>
                        </div>
                      </li>
                    ))
                  )}
              </ul>
            </div>
          ))
        ) : (
          <div className="text-center text-lg text-red-500">Anda belum memilih dosen pembimbing.</div>
        )}
      </div>

      {selectedJadwal && (
        <>
          <div className="mt-6 p-4 bg-[#e0f7fa] rounded-md text-[#00796b]">
            <h2 className="font-semibold">Jadwal Terpilih</h2>
            <p>Dosen: {selectedJadwal.dosen}</p>
            <p>Hari: {selectedJadwal.jadwal.hari}</p>
            <p>Waktu: {selectedJadwal.jadwal.waktu}</p>

            <button
              onClick={() => setShowModal(true)}
              className="mt-4 bg-[#005AE6] hover:bg-[#004bb5] text-white py-2 px-4 rounded transition"
            >
              Lihat Urutan Saya
            </button>
          </div>

          <ModalAntrean
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            dosen={selectedJadwal.dosen}
            namaMahasiswa={namaMahasiswa}
          />
        </>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PilihJadwal;
