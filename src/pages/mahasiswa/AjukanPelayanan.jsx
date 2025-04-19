import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Download, FileUp } from "lucide-react";

// Supabase Setup
const supabaseUrl = "https://btqlxdvroxtzzcikwsqg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0cWx4ZHZyb3h0enpjaWt3c3FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDkxMTU2MSwiZXhwIjoyMDYwNDg3NTYxfQ.xR6gP_mryGjY_NOoTcKSONevXl3B5qxeTHtjJScF6jE"; // Ganti dengan yang asli
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Dummy NIM
const dummyNIM = "1234567890";

const AjukanPelayanan = () => {
  const [layananList, setLayananList] = useState([]);
  const [selectedLayanan, setSelectedLayanan] = useState(null);
  const [berkas, setBerkas] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/layanan/jenis")
      .then((res) => res.json())
      .then((data) => {
        const activeLayanan = data.filter((item) => item.is_aktif);
        setLayananList(activeLayanan);
      })
      .catch(() => toast.error("Gagal mengambil data layanan."));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLayanan || !berkas) {
      toast.error("Mohon pilih layanan dan unggah berkas.");
      return;
    }

    setUploading(true);

    const fileExt = berkas.name.split(".").pop();
    const date = new Date();
    const tanggal = `${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}${date.getFullYear()}`;
    const originalName = berkas.name.replace(/\s+/g, "_");
    const fileName = `${originalName}_${dummyNIM}_${tanggal}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from("layanan-administrasi")
      .upload(filePath, berkas);

    setUploading(false);

    if (error) {
      toast.error("Gagal mengunggah berkas.");
      console.error(error);
    } else {
      toast.success("Layanan berhasil diajukan!");
      setSelectedLayanan(null);
      setBerkas(null);
    }
  };

  return (
    <div className="p-4 md:ml-64">
      <h1 className="text-2xl font-bold text-[#1277C9] mb-6">
        Ajukan Pelayanan Administrasi
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-4 space-y-6 max-w-xl w-full"
      >
        <div>
          <label className="block mb-2 font-medium text-sm">Pilih Layanan</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={selectedLayanan?.id || ""}
            onChange={(e) => {
              const layanan = layananList.find(
                (item) => item.id === parseInt(e.target.value)
              );
              setSelectedLayanan(layanan || null);
            }}
          >
            <option value="">-- Pilih Layanan --</option>
            {layananList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama_layanan}
              </option>
            ))}
          </select>
        </div>

        {selectedLayanan && (
          <>
            <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-700">
              <p><strong>Deskripsi Lampiran:</strong></p>
              <p>{selectedLayanan.deskripsi}</p>

              {selectedLayanan.url_file && (
                <a
                  href={selectedLayanan.url_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex mt-2 items-center gap-2 text-[#1277C9] hover:underline"
                >
                  <Download size={18} />
                  Unduh Template
                </a>
              )}
            </div>
          </>
        )}

        <div>
          <label className="block mb-2 font-medium text-sm">
            Unggah Berkas (PDF)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setBerkas(e.target.files[0])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <FileUp size={20} className="text-[#1277C9]" />
          </div>
          {berkas && (
            <p className="text-sm mt-2 text-gray-600">
              Nama file: <strong>{berkas.name}</strong>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="bg-[#1277C9] text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#0d5cb5] transition text-sm"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Mengunggah...
            </>
          ) : (
            <>Ajukan</>
          )}
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AjukanPelayanan;
