import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { 
  FiUploadCloud, 
  FiFile, 
  FiXCircle, 
  FiDownload, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiSend
} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

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
    <div className="space-y-3">
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg px-4 py-8 text-center cursor-pointer transition ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <motion.div 
          className="flex flex-col items-center justify-center text-gray-600"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ y: isDragActive ? [0, -8, 0] : 0 }}
            transition={{ repeat: isDragActive ? Infinity : 0, duration: 1.5 }}
          >
            <FiUploadCloud size={42} className="mb-3 text-blue-500" />
          </motion.div>
          <p className="text-sm font-medium">
            {isDragActive
              ? "Lepaskan berkas di sini..."
              : `Tarik atau klik untuk unggah ${label}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Format yang didukung: .pdf, .docx, .zip (maks. {MAX_FILE_SIZE_MB}MB)
          </p>
        </motion.div>
      </motion.div>

      {file && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg text-sm border border-blue-100"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <FiFile className="text-blue-500" size={18} />
            <span>
              <strong className="text-blue-700">{file.name}</strong>
              <span className="text-gray-500 ml-1">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </span>
          </span>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRemove} 
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50" 
            title="Hapus File"
          >
            <FiXCircle size={20} />
          </motion.button>
        </motion.div>
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
    fetch("https://13.236.194.123/layanan/jenis")
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
  
      const res = await fetch("https://13.236.194.123/layanan/pengajuan/ajukan", {
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
    <div className="p-6 md:ml-64 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-blue-500 mb-2">
          Ajukan Pelayanan Administrasi
        </h1>
        <p className="text-gray-500 mb-6">Lengkapi form berikut untuk mengajukan pelayanan administrasi</p>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-6 space-y-6 max-w-xl w-full border border-gray-100"
        >
          <div>
            <label className="block mb-2 font-medium text-gray-700">Pilih Layanan</label>
            <div className="relative">
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm appearance-none bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {selectedLayanan && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-gray-700"
            >
              <div className="flex items-start gap-3">
                <FiAlertTriangle className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="font-semibold text-blue-800 mb-1">Deskripsi Lampiran:</p>
                  <p>{selectedLayanan.deskripsi}</p>

                  {selectedLayanan.url_file && (
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      href={selectedLayanan.url_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex mt-3 items-center gap-2 text-blue-500 hover:text-blue-700 bg-white py-2 px-3 rounded-md shadow-sm hover:shadow transition-all border border-blue-100"
                    >
                      <FiDownload size={18} />
                      Unduh Template
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <div>
            <label className="block mb-2 font-medium text-gray-700">Unggah Berkas Utama <span className="text-red-500">*</span></label>
            <DropzoneField
              onDropAccepted={setBerkas}
              file={berkas}
              label="berkas utama"
              onRemove={() => setBerkas(null)}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">Unggah Lampiran (opsional)</label>
            <DropzoneField
              onDropAccepted={setLampiran}
              file={lampiran}
              label="lampiran tambahan"
              onRemove={() => setLampiran(null)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={uploading}
            className="w-full bg-[#1277C9] text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#0d5cb5] transition-all text-sm font-medium shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <AiOutlineLoading3Quarters className="animate-spin" size={20} />
                Sedang Mengunggah...
              </>
            ) : (
              <>
                <FiSend size={18} />
                Ajukan Pelayanan
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AjukanPelayanan;
