import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiFileText, FiCheck, FiClock, FiInfo, FiCalendar, 
  FiMessageSquare, FiFile, FiWifi, FiWifiOff, FiRefreshCw, FiSearch,
  FiFilter, FiChevronRight, FiAlertCircle, FiDownload, FiClipboard,
  FiX, FiCheckCircle, FiExternalLink, FiActivity, FiCornerDownRight
} from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext

const StatusPelayanan = () => {
  const { token } = useAuth(); // Get token directly from AuthContext
  const [pengajuanList, setPengajuanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mahasiswaNama, setMahasiswaNama] = useState({});
  const socketRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [jenisLayanan, setJenisLayanan] = useState({});
  const modalRef = useRef(null);

  const API = import.meta.env.VITE_API_BASE_URL;

  // Add this function in your StatusPelayanan.jsx file
  const formatDate = (dateString) => {
    if (!dateString) return "-"; // Return a placeholder if the date is not provided
    const options = { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit" 
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Function to update service status in real-time
  const updateLayananStatus = useCallback((data) => {
    // Make sure all expected fields are available
    const { id, status, catatan_admin, jadwal_pengambilan, timestamp_diproses, timestamp_selesai } = data;
    
    if (!id || !status) {
      console.log("Received incomplete data:", data);
      return;
    }
    
    console.log("Processing status update for layanan ID:", id, "New status:", status);
    
    // Update the list of pengajuan
    setPengajuanList(prevList => {
      // Check if this pengajuan exists in our list
      const pengajuanExists = prevList.some(p => p.id === id);
      
      if (!pengajuanExists) {
        console.log("Pengajuan not found in current list, may need to refresh");
        // Consider fetching fresh data here
        return prevList;
      }
      
      const updatedList = prevList.map(pengajuan => {
        if (pengajuan.id === id) {
          console.log("Updating pengajuan in list:", pengajuan.id);
          
          // Show notification about status change
          toast.info(`Status pengajuan ${jenisLayanan[pengajuan.jenis_layanan_id] || `Layanan #${pengajuan.jenis_layanan_id}`} berubah menjadi: ${status}`);
          
          // Return updated pengajuan with new timestamp fields
          return {
            ...pengajuan,
            status,
            catatan_admin: catatan_admin !== undefined ? catatan_admin : pengajuan.catatan_admin,
            jadwal_pengambilan: jadwal_pengambilan !== undefined ? jadwal_pengambilan : pengajuan.jadwal_pengambilan,
            timestamp_diproses: timestamp_diproses !== undefined ? timestamp_diproses : pengajuan.timestamp_diproses,
            timestamp_selesai: timestamp_selesai !== undefined ? timestamp_selesai : pengajuan.timestamp_selesai
          };
        }
        return pengajuan;
      });
      
      return updatedList;
    });
    
    // Update selected pengajuan if it's currently open in modal
    if (selectedPengajuan && selectedPengajuan.id === id) {
      console.log("Updating selected pengajuan in modal");
      setSelectedPengajuan(prev => ({
        ...prev,
        status,
        catatan_admin: catatan_admin !== undefined ? catatan_admin : prev.catatan_admin,
        jadwal_pengambilan: jadwal_pengambilan !== undefined ? jadwal_pengambilan : prev.jadwal_pengambilan,
        timestamp_diproses: timestamp_diproses !== undefined ? timestamp_diproses : prev.timestamp_diproses,
        timestamp_selesai: timestamp_selesai !== undefined ? timestamp_selesai : prev.timestamp_selesai
      }));
    }
  }, [selectedPengajuan, jenisLayanan]);
  
  // Setup WebSocket with token from AuthContext
  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth"));
    const nim = authData?.user?.profile?.nim;

    if (!token || !nim) {
      setSocketConnected(false);
      return;
    }

    // Tutup koneksi WebSocket lama jika ada
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    // Inisialisasi koneksi WebSocket baru dengan token yang diperbarui
    socketRef.current = new WebSocket(`${API.replace(/^https?/, 'wss')}/ws?token=${token}`);

    // Event listener untuk koneksi berhasil
    socketRef.current.addEventListener("open", () => {
      console.log("✅ WebSocket connected");
      setSocketConnected(true);
    });

    // Event listener untuk pesan WebSocket
    socketRef.current.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        // Tangani pesan WebSocket
        if (data.id && data.status && data.mahasiswa_nim === nim) {
          updateLayananStatus(data);
        } else if (data.event === "update_layanan" && data.mahasiswa_nim === nim) {
          updateLayananStatus(data);
        } else {
          console.log("Pesan WebSocket tidak dikenali:", data);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    });

    // Event listener untuk koneksi terputus
    socketRef.current.addEventListener("close", (event) => {
      console.log("❌ WebSocket connection closed:", event.code, event.reason);
      setSocketConnected(false);

      // Coba sambungkan kembali setelah 5 detik
      setTimeout(() => {
        if (socketRef.current?.readyState === WebSocket.CLOSED) {
          console.log("🔄 Attempting to reconnect WebSocket...");
          socketRef.current = null;
        }
      }, 5000);
    });

    // Event listener untuk error
    socketRef.current.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      setSocketConnected(false);
    });

    // Cleanup saat komponen di-unmount atau token berubah
    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounting");
        socketRef.current = null;
      }
    };
  }, [token, updateLayananStatus]); // Tambahkan token ke dependency array

  useEffect(() => {
    fetchPengajuanData();
  }, [token]); // Added token to dependency array

  useEffect(() => {
  return () => {
    toast.dismiss(); // Clear all toasts when the component unmounts
  };
}, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const getAuthData = () => {
    const authData = JSON.parse(localStorage.getItem("auth"));
    return {
      nim: authData?.user?.profile?.nim,
      name: authData?.user?.profile?.name
    };
  };

  const fetchMahasiswaName = async (nim) => {
    try {
      const response = await axios.get(`${API}/mahasiswa/${nim}`, {
        headers: { Authorization: `Bearer ${token}` }, // Use token from AuthContext
      });
      return response.data.nama;
    } catch (error) {
      console.error(`Error fetching data for NIM ${nim}:`, error);
      return "Unknown";
    }
  };

  const fetchPengajuanData = async () => {
    try {
      setLoading(true);
      const { nim } = getAuthData();
      
      if (!nim) {
        toast.error("Data mahasiswa tidak ditemukan");
        setLoading(false);
        return;
      }

      // Fetch jenis layanan untuk mendapatkan nama layanan berdasarkan ID
      const jenisLayananResponse = await axios.get(`${API}/layanan/jenis`, {
        headers: { Authorization: `Bearer ${token}` }, // Use token from AuthContext
      });
      
      // Convert jenis layanan array to object with id as key
      const jenisLayananObject = {};
      if (Array.isArray(jenisLayananResponse.data)) {
        jenisLayananResponse.data.forEach(jenis => {
          jenisLayananObject[jenis.id] = jenis.nama_layanan;
        });
      }
      setJenisLayanan(jenisLayananObject);

      // Fetch pengajuan data
      const response = await axios.get(`${API}/layanan/pengajuan/${nim}`, {
        headers: { Authorization: `Bearer ${token}` }, // Use token from AuthContext
      });
      
      setPengajuanList(response.data);
      
      // Pre-populate current user's name
      const { name } = getAuthData();
      const namesMap = { [nim]: name };
      
      // Fetch other mahasiswa names if needed
      for (const item of response.data) {
        if (!namesMap[item.mahasiswa_nim] && item.mahasiswa_nim !== nim) {
          const nama = await fetchMahasiswaName(item.mahasiswa_nim);
          namesMap[item.mahasiswa_nim] = nama;
        }
      }
      
      setMahasiswaNama(namesMap);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pengajuan data:", error);
      toast.error("Gagal memuat data pengajuan");
      setLoading(false);
    }
  };

  const handleDetailClick = (pengajuan) => {
    setSelectedPengajuan(pengajuan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPengajuan(null), 200); // Wait for animation
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPengajuanData();
    setRefreshing(false);
    toast.success("Data berhasil diperbarui");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("ID disalin ke clipboard");
  };

  // Filter and sort functions
  const filteredPengajuanList = pengajuanList
    .filter(pengajuan => {
      // Status filter
      if (statusFilter !== "all" && pengajuan.status !== statusFilter) {
        return false;
      }
      
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const jenisLayananName = (jenisLayanan[pengajuan.jenis_layanan_id] || `Layanan #${pengajuan.jenis_layanan_id}`).toLowerCase();
      const statusLower = pengajuan.status.toLowerCase();
      const idLower = pengajuan.id.toString().toLowerCase();
      
      return (
        jenisLayananName.includes(searchLower) ||
        statusLower.includes(searchLower) ||
        idLower.includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Sort by most recent submission date
      const dateA = new Date(a.lampiran?.[0]?.uploaded_at || a.created_at || 0);
      const dateB = new Date(b.lampiran?.[0]?.uploaded_at || b.created_at || 0);
      return dateB - dateA; // Descending order (newest first)
    });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Menunggu":
        return (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
            Menunggu
          </span>
        );
      case "Diproses":
        return (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            Diproses
          </span>
        );
      case "Selesai":
        return (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
            Selesai
          </span>
        );
      case "Tolak":
        return (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-800">
            Ditolak
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
            Tidak Diketahui
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header with connection status and title */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Status Pengajuan Layanan
              </h1>
              <p className="text-gray-500 mt-1">
                Monitor dan kelola pengajuan layanan administrasi Anda
              </p>
            </div>
            
            <div className="flex items-center">
              <motion.div 
                animate={{ 
                  scale: socketConnected ? [1, 1.05, 1] : 1,
                  transition: { repeat: socketConnected ? Infinity : 0, duration: 2 }
                }}
                className={`flex items-center ${socketConnected ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-50'} 
                  border rounded-full py-1.5 px-3 shadow-sm mr-3`}
              >
                {socketConnected ? (
                  <>
                    <FiWifi size={16} className="mr-1.5" />
                    <span className="text-xs font-medium">Realtime aktif</span>
                  </>
                ) : (
                  <>
                    <FiWifiOff size={16} className="mr-1.5" />
                    <span className="text-xs font-medium">Menghubungkan...</span>
                  </>
                )}
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className={`p-2 rounded-lg flex items-center justify-center text-blue-700 bg-blue-50 border border-blue-200 
                  hover:bg-blue-100 transition shadow-sm ${refreshing ? 'opacity-70' : ''}`}
                title="Refresh data"
              >
                <FiRefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Search and filter controls */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan jenis layanan atau ID..."
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="Menunggu">Menunggu</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Tolak">Ditolak</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FiChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-700 font-medium">Memuat data pengajuan...</p>
            <p className="text-gray-500 text-sm mt-2">Mohon tunggu sebentar</p>
          </motion.div>
        ) : filteredPengajuanList.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPengajuanList.map((pengajuan, idx) => (
              <motion.div
                key={pengajuan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: idx * 0.04 }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 5px 10px -5px rgba(0, 0, 0, 0.05)"
                }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group"
              >
                {/* Status indicator on top */}
                <div className={`h-1.5 w-full ${
                  pengajuan.status === "Menunggu" ? "bg-amber-400" :
                  pengajuan.status === "Diproses" ? "bg-blue-500" :
                  pengajuan.status === "Selesai" ? "bg-emerald-500" :
                  pengajuan.status === "Tolak" ? "bg-rose-500" : "bg-gray-300"
                }`}></div>
                
                <div className="p-5">
                  <div className="mb-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">
                        {jenisLayanan[pengajuan.jenis_layanan_id] || `Layanan #${pengajuan.jenis_layanan_id}`}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <span className="truncate max-w-[150px]">{mahasiswaNama[pengajuan.mahasiswa_nim] || pengajuan.mahasiswa_nim}</span>
                      </p>
                      <div className="flex items-center mt-1.5">
                      </div>
                    </div>
                    {getStatusBadge(pengajuan.status)}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1.5">
                      <FiFileText className="w-4 h-4" />
                      <span>Lampiran: {pengajuan.lampiran?.length || 0}</span>
                    </div>
                    
                    {pengajuan.lampiran && pengajuan.lampiran.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-1.5 text-blue-600 text-sm bg-blue-50 p-2 rounded-lg border border-blue-100">
                          <FiFile className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {pengajuan.lampiran[0].nama_dokumen.length > 25 
                              ? pengajuan.lampiran[0].nama_dokumen.substring(0, 25) + "..." 
                              : pengajuan.lampiran[0].nama_dokumen}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timeline indicator */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                          pengajuan.status === "Selesai" ? "bg-emerald-400" : 
                          pengajuan.status === "Tolak" ? "bg-rose-400" : 
                          pengajuan.status === "Menunggu" ? "bg-amber-400" : "bg-blue-400"
                        } opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${
                          pengajuan.status === "Selesai" ? "bg-emerald-500" : 
                          pengajuan.status === "Tolak" ? "bg-rose-500" : 
                          pengajuan.status === "Menunggu" ? "bg-amber-500" : "bg-blue-500"
                        }`}></span>
                      </span>
                      <span>
                        Update terakhir: {
                          pengajuan.status === "Selesai" && pengajuan.timestamp_selesai
                            ? formatDate(pengajuan.timestamp_selesai)
                            : pengajuan.status === "Diproses" && pengajuan.timestamp_diproses
                              ? formatDate(pengajuan.timestamp_diproses)
                              : formatDate(pengajuan.updated_at || pengajuan.lampiran?.[0]?.uploaded_at)
                        }
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDetailClick(pengajuan)}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 
                      font-medium py-2.5 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2
                      group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200"
                  >
                    <FiInfo className="w-4 h-4" />
                    Lihat Detail
                    <FiChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </div>
              </motion.div>
            ))}

          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="bg-gray-100 inline-flex items-center justify-center w-20 h-20 rounded-full mb-6">
              <FiFileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Tidak ada pengajuan ditemukan</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all" 
                ? "Tidak ada pengajuan yang cocok dengan filter saat ini." 
                : "Anda belum memiliki pengajuan layanan saat ini."}
            </p>
            {(searchTerm || statusFilter !== "all") ? (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-medium inline-flex items-center gap-2 hover:bg-blue-100 transition border border-blue-200"
              >
                <FiRefreshCw size={16} />
                Reset Filter
              </motion.button>
            ) : (
              <a href="/mahasiswa/ajukan-layanan" className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium inline-flex items-center gap-2 hover:bg-blue-700 transition shadow-sm">
                <FiFileText size={16} />
                Ajukan Pelayanan Baru
              </a>
            )}
          </motion.div>
        )}

        {/* Enhanced Modal Detail Pengajuan with Animation */}
        <AnimatePresence>
          {isModalOpen && selectedPengajuan && (
            <motion.div 
              className="fixed inset-0 bg-none bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                ref={modalRef}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                {/* Header with status indicator */}
                <div className="relative">
                  <div className={`absolute top-0 left-0 right-0 h-2 ${
                    selectedPengajuan.status === "Menunggu" ? "bg-amber-400" :
                    selectedPengajuan.status === "Diproses" ? "bg-blue-500" :
                    selectedPengajuan.status === "Selesai" ? "bg-emerald-500" :
                    selectedPengajuan.status === "Tolak" ? "bg-rose-500" : "bg-gray-300"
                  } rounded-t-xl`}></div>
                  <div className="p-6 border-b flex justify-between items-center mt-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {jenisLayanan[selectedPengajuan.jenis_layanan_id] || `Layanan #${selectedPengajuan.jenis_layanan_id}`}
                      </h3>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Detail Pengajuan</span>
                        <div 
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full cursor-pointer flex items-center gap-1"
                          onClick={() => copyToClipboard(`#${selectedPengajuan.id}`)}
                          title="Salin ID Layanan"
                        >
                          <FiClipboard size={10} />
                          #{selectedPengajuan.id}
                        </div>
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 transition bg-gray-100 hover:bg-gray-200 rounded-full p-2"
                    >
                      <FiX className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Badge status menonjol di bagian atas */}
                  <div className="mb-6 flex justify-center">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className={`py-2 px-6 rounded-full text-sm font-semibold inline-flex items-center gap-2 
                        ${selectedPengajuan.status === "Menunggu" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                          selectedPengajuan.status === "Diproses" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                          selectedPengajuan.status === "Selesai" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                          selectedPengajuan.status === "Tolak" ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                    >
                      {selectedPengajuan.status === "Menunggu" && <FiClock className="w-4 h-4" />}
                      {selectedPengajuan.status === "Diproses" && <FiActivity className="w-4 h-4" />}
                      {selectedPengajuan.status === "Selesai" && <FiCheckCircle className="w-4 h-4" />}
                      {selectedPengajuan.status === "Tolak" && <FiAlertCircle className="w-4 h-4" />}
                      {selectedPengajuan.status}
                    </motion.div>
                  </div>
                  
                  {/* Grid Detail */}
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Jenis Layanan</h4>
                        <p className="text-gray-900 font-medium">
                          {jenisLayanan[selectedPengajuan.jenis_layanan_id] || `Layanan #${selectedPengajuan.jenis_layanan_id}`}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Tanggal Pengajuan</h4>
                        <p className="text-gray-900 font-medium">{formatDate(selectedPengajuan.lampiran?.[0]?.uploaded_at || new Date())}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors md:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Pemohon</h4>
                        <p className="text-gray-900 font-medium">{mahasiswaNama[selectedPengajuan.mahasiswa_nim] || selectedPengajuan.mahasiswa_nim}</p>
                      </div>
                    </div>
                    
                    {/* Timeline progress */}
                    <div className="border-t pt-5">
                      <div className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                        <FiActivity className="w-4 h-4 text-blue-500" />
                        Timeline Pengajuan
                      </div>
                      <div className="relative pl-6 border-l-2 border-gray-200 mb-4">
                        {/* Pengajuan Diterima Step */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-blue-500 bg-white"></div>
                        <div className="mb-6">
                          <p className="text-sm font-medium">Pengajuan Diterima</p>
                          <p className="text-xs text-gray-500">{formatDate(selectedPengajuan.created_at || selectedPengajuan.lampiran?.[0]?.uploaded_at)}</p>
                        </div>
                        
                        {/* Sedang Diproses Step */}
                        {(selectedPengajuan.status === "Diproses" || 
                          selectedPengajuan.status === "Selesai" || 
                          selectedPengajuan.status === "Tolak") && (
                          <>
                            <div className="absolute -left-[9px] top-[72px] w-4 h-4 rounded-full border-2 border-blue-500 bg-white"></div>
                            <div className="mb-6">
                              <p className="text-sm font-medium">Sedang Diproses</p>
                              <p className="text-xs text-gray-500">
                                {selectedPengajuan.timestamp_diproses 
                                  ? formatDate(selectedPengajuan.timestamp_diproses) 
                                  : "Pengajuan sedang ditinjau oleh admin"}
                              </p>
                            </div>
                          </>
                        )}
                        
                        {/* Selesai Step */}
                        {(selectedPengajuan.status === "Selesai") && (
                          <>
                            <div className="absolute -left-[9px] top-[144px] w-4 h-4 rounded-full border-2 border-emerald-500 bg-white"></div>
                            <div className="mb-6">
                              <p className="text-sm font-medium text-emerald-700">Pengajuan Selesai</p>
                              <p className="text-xs text-gray-500">
                                {selectedPengajuan.timestamp_selesai 
                                  ? formatDate(selectedPengajuan.timestamp_selesai) 
                                  : formatDate(selectedPengajuan.updated_at)}
                              </p>
                            </div>
                          </>
                        )}
                        
                        {/* Ditolak Step - Specialized UI */}
                        {(selectedPengajuan.status === "Tolak") && (
                          <>
                            <div className="absolute -left-[9px] top-[144px] w-4 h-4 rounded-full border-2 border-rose-500 bg-white"></div>
                            <div className="mb-6">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-rose-700">Pengajuan Ditolak</p>
                                <span className="ml-2 text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                                  Periksa Catatan Admin
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {selectedPengajuan.timestamp_selesai 
                                  ? formatDate(selectedPengajuan.timestamp_selesai) 
                                  : formatDate(selectedPengajuan.updated_at)}
                              </p>
                              {selectedPengajuan.catatan_admin && (
                                <div className="mt-2 bg-rose-50 p-2 rounded border border-rose-200 text-xs text-rose-700">
                                  <div className="flex items-start">
                                    <FiAlertCircle className="w-3 h-3 mt-0.5 mr-1.5 flex-shrink-0" />
                                    <p>{selectedPengajuan.catatan_admin}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                        
                        {/* If there's a jadwal_pengambilan, show it as final step for Selesai status */}
                        {selectedPengajuan.status === "Selesai" && selectedPengajuan.jadwal_pengambilan && (
                          <>
                            <div className="absolute -left-[9px] top-[216px] w-4 h-4 rounded-full border-2 border-emerald-500 bg-white"></div>
                            <div className="mb-6">
                              <p className="text-sm font-medium text-emerald-700">Jadwal Pengambilan</p>
                              <p className="text-xs text-gray-500">{formatDate(selectedPengajuan.jadwal_pengambilan)}</p>
                              <div className="mt-2 bg-emerald-50 p-2 rounded border border-emerald-200 text-xs text-emerald-700">
                                <div className="flex items-start">
                                  <FiCalendar className="w-3 h-3 mt-0.5 mr-1.5 flex-shrink-0" />
                                  <p>Silakan ambil dokumen sesuai jadwal yang ditentukan</p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Catatan admin section */}
                    <div className="border-t pt-4">
                      <div className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <FiMessageSquare className="w-4 h-4 text-blue-500" />
                        Catatan Admin
                      </div>
                      <div className={`p-4 rounded-lg border ${
                        selectedPengajuan.catatan_admin ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'
                      }`}>
                        {selectedPengajuan.catatan_admin ? (
                          <p className={`${selectedPengajuan.catatan_admin ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                            {selectedPengajuan.catatan_admin || "Belum ada catatan dari admin"}
                          </p>
                        ) : (
                          <div className="flex items-center">
                            <FiInfo className="text-gray-400 mr-2 flex-shrink-0" />
                            <p className="text-gray-400 italic">Belum ada catatan dari admin</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Jadwal pengambilan section */}
                    {selectedPengajuan.jadwal_pengambilan && (
                      <div className="border-t pt-4">
                        <div className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <FiCalendar className="w-4 h-4 text-blue-500" />
                          Jadwal Pengambilan
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-700 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{formatDate(selectedPengajuan.jadwal_pengambilan)}</p>
                            <p className="text-xs mt-1">Silakan ambil dokumen sesuai jadwal yang ditentukan</p>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const event = new Date(selectedPengajuan.jadwal_pengambilan);
                              const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
                              const formattedDate = event.toLocaleDateString('id-ID', options);
                              
                              navigator.clipboard.writeText(`Pengambilan ${jenisLayanan[selectedPengajuan.jenis_layanan_id] || `Layanan #${selectedPengajuan.jenis_layanan_id}`}: ${formattedDate}`);
                              toast.success("Jadwal disalin ke clipboard");
                            }}
                            className="text-blue-700 hover:text-blue-800 flex items-center gap-1 text-sm bg-white py-1.5 px-3 rounded-md border border-blue-200 shadow-sm hover:shadow-md transition-all"
                          >
                            <FiClipboard className="w-3 h-3" />
                            Salin Jadwal
                          </motion.button>
                        </div>
                      </div>
                    )}
                    
                    {/* Lampiran section */}
                    <div className="border-t pt-4">
                      <div className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <FiFileText className="w-4 h-4 text-blue-500" />
                        Lampiran
                      </div>
                      {selectedPengajuan.lampiran && selectedPengajuan.lampiran.length > 0 ? (
                        <div className="space-y-3">
                          {selectedPengajuan.lampiran.map((doc, index) => (
                            <motion.div 
                              key={doc.id || index} 
                              whileHover={{ 
                                scale: 1.01, 
                                transition: { duration: 0.2 } 
                              }}
                              className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                                  <FiFileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{index === 0 ? "File Utama" : `Lampiran ${index}`}</p>
                                  <p className="text-xs text-gray-500 truncate max-w-xs">{doc.nama_dokumen}</p>
                                </div>
                              </div>
                              <motion.a 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href={doc.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white border border-blue-200 hover:bg-blue-100 text-blue-700 hover:text-blue-800 text-sm font-medium py-1.5 px-3 rounded-md transition flex items-center gap-2 shadow-sm"
                              >
                                <FiDownload className="w-4 h-4" />
                                Unduh
                              </motion.a>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                            <FiFileText className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-sm">Tidak ada lampiran tersedia</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-5 border-t bg-gray-50 flex justify-between items-center">
                  <a
                    href="/mahasiswa/ajukan-layanan"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1.5 hover:underline"
                  >
                    <FiCornerDownRight size={14} />
                    Ajukan Layanan Baru
                  </a>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeModal}
                    className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium py-2 px-6 rounded-lg transition shadow-sm"
                  >
                    Tutup
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default StatusPelayanan;