import React, { useEffect, useState } from "react";
import axios from "axios";

const AntreanDosen = () => {
  const [time, setTime] = useState(new Date());
  const [dosenList, setDosenList] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDosen = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/dosen/all");
        const data = response.data;

        // Tambahkan nomor urut berdasarkan indeks
        const dosenDenganUrutan = data.map((item, index) => ({
          alias: item.alias,
          nomorUrut: index + 1,
          hadir: item.status_kehadiran === "hadir",
        }));

        setDosenList(dosenDenganUrutan);
      } catch (error) {
        console.error("Gagal ambil dosen:", error);
      }
    };

    fetchDosen();
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString("id-ID", { hour12: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-sky-600 text-white flex flex-col px-6 py-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-10 px-2">
        <div className="w-1/3" />
        <div className="w-1/3 flex justify-center">
          <div className="bg-white text-indigo-900 px-6 py-2 rounded-full shadow-md text-xl font-bold tracking-wide">
            Antrean Dosen
          </div>
        </div>
        <div className="w-1/3 flex justify-end pr-4">
          <div className="bg-white/20 text-white font-mono text-lg px-4 py-1 rounded-lg border border-white/30 shadow-sm backdrop-blur-sm">
            {formatTime(time)}
          </div>
        </div>
      </div>

      {/* Grid Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-7xl mx-auto">
        {dosenList.map((dosen, index) => (
          <div
            key={index}
            className={`rounded-2xl p-6 shadow-lg transition-transform transform hover:scale-105 duration-300 ease-in-out border-2 ${
              dosen.hadir
                ? "bg-gradient-to-tr from-green-500 to-emerald-600 border-green-300"
                : "bg-gradient-to-tr from-red-500 to-rose-600 border-red-300"
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="text-4xl font-black mb-1 tracking-wide">
                {dosen.alias}
              </div>
              {dosen.hadir ? (
                <div className="text-lg mb-3 font-medium text-white/90">{`#${dosen.nomorUrut}`}</div>
              ) : (
                <div className="text-base italic text-white/80 mb-3">
                  Tidak Ada Antrean
                </div>
              )}
              <span
                className={`inline-block px-4 py-1 text-sm font-semibold rounded-full shadow-md ${
                  dosen.hadir
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/20 text-white border border-white/30"
                }`}
              >
                {dosen.hadir ? "Hadir" : "Tidak Hadir"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};  

export default AntreanDosen;
