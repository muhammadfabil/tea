import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { 
  FiUploadCloud, 
  FiFile, 
  FiXCircle, 
  FiDownload, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiSend,
  FiSearch,
  FiChevronDown,
  FiChevronUp
} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_FORMATS = {
  'application/pdf': [],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [], // .docx
  'application/zip': [],
};

const API = import.meta.env.VITE_API_BASE_URL;

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const filteredLayanan = layananList.filter((layanan) =>
    layanan.nama_layanan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch(`${API}/layanan/jenis`)
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
      formData.append("lampiran_tambahan", lampiran);
    }
  
    try {
      const token = JSON.parse(localStorage.getItem("auth"))?.token;
  
      const res = await fetch(`${API}/layanan/pengajuan/ajukan`, {
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
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white hover:border-blue-400 cursor-pointer flex justify-between items-center ${isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
              >
                <span className={selectedLayanan ? 'text-gray-800' : 'text-gray-500'}>
                  {selectedLayanan ? selectedLayanan.nama_layanan : '-- Pilih Layanan --'}
                </span>
                <div className="text-gray-500">
                  {isDropdownOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </div>
              </div>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Cari layanan..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto py-1">
                      {filteredLayanan.length > 0 ? (
                        filteredLayanan.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedLayanan(item);
                              setIsDropdownOpen(false);
                              setSearchQuery("");
                            }}
                            className={`px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer ${
                              selectedLayanan?.id === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                            }`}
                          >
                            <div className="font-medium">{item.nama_layanan}</div>
                            {item.deskripsi && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {item.deskripsi}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center italic">
                          Tidak ada layanan yang sesuai
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
