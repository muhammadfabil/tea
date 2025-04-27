import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Download, FileUp, Loader2, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_FORMATS = {
  'application/pdf': [],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [], // .docx
  'application/zip': [],
};



const DropzoneField = ({ onDropAccepted, label, file, onRemove }) => {
  const handleDrop = (acceptedFiles, fileRejections) => {
    const file = acceptedFiles[0];

    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`Ukuran file tidak boleh lebih dari ${MAX_FILE_SIZE_MB}MB`);
        return;
      }
      onDropAccepted(file);
    }

    fileRejections.forEach((rej) => {
      toast.error(`Format tidak didukung: ${rej.file.name}`);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: ACCEPTED_FORMATS,
    multiple: false,
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-gray-600">
          <FileUp size={36} className="mb-2 text-[#1277C9]" />
          <p className="text-sm">
            {isDragActive
              ? "Lepaskan berkas di sini..."
              : `Tarik atau klik untuk unggah ${label} (.pdf, .docx, .zip, max ${MAX_FILE_SIZE_MB}MB)`}
          </p>
        </div>
      </div>

      {file && (
        <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg text-sm">
          <span>
             <strong>{file.name}</strong> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          </span>
          <button onClick={onRemove} className="text-red-500 hover:text-red-700" title="Hapus File">
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

const AjukanPelayanan = () => {
  const [layananList, setLayananList] = useState([]);
  const [selectedLayanan, setSelectedLayanan] = useState(null);
  const [berkas, setBerkas] = useState(null);
  const [lampiran, setLampiran] = useState(null);
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
      toast.error("Mohon pilih layanan dan unggah berkas utama.");
      return;
    }
  
    const stored = localStorage.getItem("auth");
    let nim = null;
  
    try {
      const parsed = JSON.parse(stored);
      nim = parsed?.user?.profile?.nim;
    } catch (error) {
      toast.error("Gagal membaca NIM dari localStorage.");
      return;
    }
  
    if (!nim) {
      toast.error("NIM tidak ditemukan. Silakan login ulang.");
      return;
    }
  
    setUploading(true);
  
    const formData = new FormData();
    formData.append("mahasiswa_nim", nim);
    formData.append("jenis_layanan_id", selectedLayanan.id);
    formData.append("berkas_utama", berkas);
  
    if (lampiran) {
      formData.append("lampiran_tambahan", lampiran); // jika hanya satu lampiran
      // Jika nanti ingin support banyak lampiran:
      // formData.append("lampiran_tambahan[]", lampiran);
    }
  
    try {
      const token = JSON.parse(localStorage.getItem("auth"))?.token;
  
      const res = await fetch("http://127.0.0.1:8000/layanan/pengajuan/ajukan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!res.ok) throw new Error("Gagal mengajukan layanan.");
  
      const data = await res.json();
      console.log("Berhasil:", data);
  
      toast.success("Layanan berhasil diajukan!");
      setSelectedLayanan(null);
      setBerkas(null);
      setLampiran(null);
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat mengirim pengajuan.");
    } finally {
      setUploading(false);
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
        )}

        <div>
          <label className="block mb-2 font-medium text-sm">Unggah Berkas Utama</label>
          <DropzoneField
            onDropAccepted={setBerkas}
            file={berkas}
            label="berkas utama"
            onRemove={() => setBerkas(null)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-sm mt-4">Unggah Lampiran </label>
          <DropzoneField
            onDropAccepted={setLampiran}
            file={lampiran}
            label="lampiran"
            onRemove={() => setLampiran(null)}
          />
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
