import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { 
  FiEye, FiEdit2, FiX, FiFileText, FiCalendar, FiUser, 
  FiTag, FiClock, FiDownload, FiWifi, FiWifiOff, FiFilter,
  FiCheck, FiAlertCircle, FiClock as FiClockCircle, FiRefreshCw,
  FiCheckCircle, FiXCircle, FiInbox, FiChevronLeft, FiChevronRight,
  FiSearch, FiList, FiArchive
} from "react-icons/fi";

const STATUS_OPTIONS = ["Menunggu", "Diproses", "Selesai", "Tolak"];

const STATUS_COLORS = {
  Menunggu: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Diproses: "bg-blue-100 text-blue-800 border-blue-200",
  Selesai: "bg-green-100 text-green-800 border-green-200",
  Tolak: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_ICONS = {
  Menunggu: <FiClockCircle className="mr-1" />,
  Diproses: <FiRefreshCw className="mr-1" />,
  Selesai: <FiCheckCircle className="mr-1" />,
  Tolak: <FiXCircle className="mr-1" />,
};

const API = import.meta.env.VITE_API_BASE_URL;

const AdminPelayanan = () => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [jenisLayananMap, setJenisLayananMap] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [mahasiswaNames, setMahasiswaNames] = useState({});
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("aktif");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("aktif"); // "aktif" or "histori"
  const itemsPerPage = 20;

  const fetchMahasiswaName = async (nim) => {
    try {
      const response = await axios.get(`${API}/mahasiswa/${nim}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.nama;
    } catch (error) {
      console.error(`Error fetching data for NIM ${nim}:`, error);
      return "Unknown";
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pengajuanRes, jenisRes] = await Promise.all([
        axios.get(`${API}/layanan/pengajuan/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/layanan/jenis`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const jenisMap = {};
      jenisRes.data.forEach((jenis) => {
        jenisMap[jenis.id] = jenis.nama_layanan;
      });

      setJenisLayananMap(jenisMap);
      
      const pengajuanData = pengajuanRes.data;
      setData(pengajuanData);
      
      const uniqueNims = [...new Set(pengajuanData.map(item => item.mahasiswa_nim))];
      const namesMap = {};
      
      await Promise.all(
        uniqueNims.map(async (nim) => {
          const name = await fetchMahasiswaName(nim);
          namesMap[nim] = name;
        })
      );
      
      setMahasiswaNames(namesMap);
      toast.success("Data berhasil dimuat");
    } catch (error) {
      toast.error("Gagal mengambil data");
    } finally {
      setIsLoading(false);
    }
  };

  // WebSocket setup
  useEffect(() => {
    if (!token) return;

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    socketRef.current = new WebSocket(`${API.replace(/^https?/, 'wss')}/ws?token=${token}`);

    socketRef.current.onopen = () => {
      console.log("✅ WebSocket connected");
      setSocketConnected(true);
    };

    socketRef.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.event === "new_pengajuan") {
          toast.info("Pengajuan baru diterima");
          await fetchData();
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socketRef.current.onclose = () => {
      console.log("❌ WebSocket disconnected");
      setSocketConnected(false);

      setTimeout(() => {
        if (socketRef.current?.readyState === WebSocket.CLOSED) {
          console.log("🔄 Attempting to reconnect WebSocket...");
          socketRef.current = null;
        }
      }, 5000);
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setSocketConnected(false);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [token]);

  useEffect(() => {
    fetchData();

    return () => {
      toast.dismiss();
    };
  }, [token]);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditModalOpen(true);
    if (detailModalOpen) {
      setDetailModalOpen(false);
    }
  };

  const handleViewDetail = (item) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const { id, status, catatan_admin } = selectedItem;
      
      // Jika status Diproses atau Tolak, jadwal pengambilan tidak disertakan
      const isPickupNeeded = status !== "Diproses" && status !== "Tolak";
      
      // Validasi tanggal pengambilan jika diperlukan
      if (isPickupNeeded && selectedItem.jadwal_pengambilan) {
        if (new Date(selectedItem.jadwal_pengambilan) < new Date()) {
          toast.error("Tanggal pengambilan tidak boleh di masa lalu");
          return;
        }
      }
      
      // Buat payload berdasarkan status
      const payload = {
        status,
        catatan_admin
      };
      
      // Tambahkan jadwal_pengambilan ke payload hanya jika diperlukan
      if (isPickupNeeded && selectedItem.jadwal_pengambilan) {
        payload.jadwal_pengambilan = selectedItem.jadwal_pengambilan;
      } else if (!isPickupNeeded) {
        // Jika status Diproses atau Tolak, kosongkan jadwal pengambilan
        payload.jadwal_pengambilan = null;
      }

      await axios.put(`${API}/layanan/pengajuan/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Pengajuan berhasil diperbarui");
      setEditModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Gagal menyimpan perubahan");
    }
  };

  const handleViewPdf = (fileUrl) => {
    const fileExtension = fileUrl.split('?')[0].split('.').pop().toLowerCase();
    
    if (fileExtension === 'pdf') {
      setSelectedPdf(fileUrl);
      setPdfModalOpen(true);
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (extension === 'pdf') {
      return <FiFileText className="text-red-500" />;
    } else if (['doc', 'docx'].includes(extension)) {
      return <FiFileText className="text-blue-500" />;
    } else if (['xls', 'xlsx'].includes(extension)) {
      return <FiFileText className="text-green-500" />;
    } else {
      return <FiFileText className="text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "-";
    try {
      const date = new Date(timestamp);
      return format(date, "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "-";
    }
  };

  const getSubmissionDate = (item) => {
    if (item.lampiran && item.lampiran.length > 0 && item.lampiran[0].uploaded_at) {
      return item.lampiran[0].uploaded_at;
    }
    return null;
  };
  
  const needsPickupDate = (status) => {
    return status !== "Diproses" && status !== "Tolak";
  };

  // Separate active items from history (completed/rejected)
  const activeItems = data.filter(item => item.status === "Menunggu" || item.status === "Diproses");
  const historyItems = data.filter(item => item.status === "Selesai" || item.status === "Tolak");

  // Filter data based on view mode, selected filter and search term
  const filteredData = (viewMode === "aktif" ? activeItems : historyItems).filter(item => {
    const matchesFilter = 
      activeFilter === "aktif" || 
      activeFilter === "histori" || 
      activeFilter === item.status.toLowerCase();
    
    const mahasiswaName = mahasiswaNames[item.mahasiswa_nim]?.toLowerCase() || "";
    const layananName = jenisLayananMap[item.jenis_layanan_id]?.toLowerCase() || "";
    const nim = item.mahasiswa_nim?.toLowerCase() || "";
    
    const matchesSearch = 
      searchTerm === "" || 
      mahasiswaName.includes(searchTerm.toLowerCase()) ||
      layananName.includes(searchTerm.toLowerCase()) ||
      nim.includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Sort data differently based on view mode
  const sortedData = [...filteredData].sort((a, b) => {
    if (viewMode === "aktif") {
      // Priority by status for active items
      if (a.status === "Menunggu" && b.status !== "Menunggu") return -1;
      if (a.status !== "Menunggu" && b.status === "Menunggu") return 1;
    }
    
    // Then by date (newest first)
    const dateA = getSubmissionDate(a) ? new Date(getSubmissionDate(a)) : new Date(0);
    const dateB = getSubmissionDate(b) ? new Date(getSubmissionDate(b)) : new Date(0);
    return dateB - dateA;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchTerm, viewMode]);

  const countByStatus = {
    menunggu: data.filter(item => item.status === "Menunggu").length,
    diproses: data.filter(item => item.status === "Diproses").length,
    selesai: data.filter(item => item.status === "Selesai").length,
    tolak: data.filter(item => item.status === "Tolak").length,
    aktif: activeItems.length,
    histori: historyItems.length
  };

  // Get indicator color based on submission recency (within 24 hours)
  const getRecentIndicator = (timestamp) => {
    if (!timestamp) return false;
    const submissionDate = new Date(timestamp);
    const now = new Date();
    const hoursAgo = (now - submissionDate) / (1000 * 60 * 60);
    return hoursAgo < 24;
  };

  return (
    <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Pengajuan Layanan</h1>
        <div className={`flex items-center ${socketConnected ? "text-green-600" : "text-gray-400"}`}>
          {socketConnected ? (
            <>
              <FiWifi size={16} className="mr-1" />
              <span className="text-xs">Realtime aktif</span>
            </>
          ) : (
            <>
              <FiWifiOff size={16} className="mr-1" />
              <span className="text-xs">Menghubungkan...</span>
            </>
          )}
        </div>
      </div>

      {/* View Mode Switcher and Search */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode("aktif")}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg border ${
                viewMode === "aktif"
                  ? "bg-indigo-600 text-white border-indigo-700"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FiList className="mr-2" />
              Pengajuan Aktif ({countByStatus.aktif})
            </button>
            <button
              onClick={() => setViewMode("histori")}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg border ${
                viewMode === "histori"
                  ? "bg-indigo-600 text-white border-indigo-700"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FiArchive className="mr-2" />
              Histori Pengajuan ({countByStatus.histori})
            </button>
          </div>
          
          <div className="relative flex-grow md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Cari mahasiswa, jenis layanan atau NIM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {viewMode === "aktif" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter("aktif")}
              className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-full border ${
                activeFilter === "aktif"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FiInbox className="mr-1.5" />
              Semua ({countByStatus.aktif})
            </button>
            <button
              onClick={() => setActiveFilter("menunggu")}
              className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-full border ${
                activeFilter === "menunggu"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FiClockCircle className="mr-1.5" />
              Menunggu ({countByStatus.menunggu})
            </button>
            <button
              onClick={() => setActiveFilter("diproses")}
              className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-full border ${
                activeFilter === "diproses"
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FiRefreshCw className="mr-1.5" />
              Diproses ({countByStatus.diproses})
            </button>
          </div>
        )}
        
        {viewMode === "histori" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter("histori")}
              className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-full border ${
                activeFilter === "histori"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FiInbox className="mr-1.5" />
              Semua ({countByStatus.histori})
            </button>
            <button
              onClick={() => setActiveFilter("selesai")}
              className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-full border ${
                activeFilter === "selesai"
                  ? "bg-green-50 text-green-700 border-green-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FiCheckCircle className="mr-1.5" />
              Selesai ({countByStatus.selesai})
            </button>
            <button
              onClick={() => setActiveFilter("tolak")}
              className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-full border ${
                activeFilter === "tolak"
                  ? "bg-red-50 text-red-700 border-red-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FiXCircle className="mr-1.5" />
              Ditolak ({countByStatus.tolak})
            </button>
          </div>
        )}
      </div>

      {/* Table View - More compact for many entries */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pengajuan...</p>
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <div className="flex justify-center">
            <FiInbox size={40} className="text-gray-400" />
          </div>
          <p className="mt-4 text-gray-600">Tidak ada pengajuan yang ditemukan</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis Layanan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mahasiswa
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu Pengajuan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jadwal Pengambilan
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((item) => {
                  const isRecent = getRecentIndicator(getSubmissionDate(item));
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-gray-50 ${isRecent ? "bg-indigo-50/30" : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[item.status]}`}>
                          {STATUS_ICONS[item.status]}
                          {item.status}
                        </span>
                        {isRecent && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                            Baru
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {jenisLayananMap[item.jenis_layanan_id]}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {mahasiswaNames[item.mahasiswa_nim] || "Loading..."}
                        </div>
                        <div className="text-xs text-gray-500">{item.mahasiswa_nim}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {getSubmissionDate(item) ? formatTimestamp(getSubmissionDate(item)) : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.jadwal_pengambilan ? (
                          <div className="flex items-center text-sm text-gray-700">
                            <FiCalendar className="text-gray-400 mr-1.5" size={14} />
                            <span>{format(new Date(item.jadwal_pengambilan), "dd MMM yyyy • HH:mm")}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleViewDetail(item)} 
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            title="Lihat Detail"
                          >
                            <FiEye size={18} />
                          </button>
                          <button 
                            onClick={() => handleEdit(item)} 
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit Pengajuan"
                          >
                            <FiEdit2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> dari <span className="font-medium">{sortedData.length}</span> pengajuan
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                        currentPage === 1 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <FiChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      if (pageNumber > 0 && pageNumber <= totalPages) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                        currentPage === totalPages 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <FiChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal - Kept the same but with updated icons */}
      {detailModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-screen overflow-y-auto relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Detail Pengajuan</h2>
              <button 
                onClick={() => setDetailModalOpen(false)} 
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FiUser size={18} className="text-gray-500 mr-2" />
                    <h3 className="text-sm font-medium text-gray-600">Identitas</h3>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">
                    {mahasiswaNames[selectedItem.mahasiswa_nim] || "Loading..."}
                  </p>
                  <p className="text-sm text-gray-600">NIM: {selectedItem.mahasiswa_nim}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FiTag size={18} className="text-gray-500 mr-2" />
                    <h3 className="text-sm font-medium text-gray-600">Layanan</h3>
                  </div>
                  <p className="text-sm text-gray-800">{jenisLayananMap[selectedItem.jenis_layanan_id]}</p>
                  <p className="text-sm text-gray-600">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${STATUS_COLORS[selectedItem.status]}`}>
                      {STATUS_ICONS[selectedItem.status]}
                      {selectedItem.status}
                    </span>
                  </p>
                </div>
                
                {getSubmissionDate(selectedItem) && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FiClock size={18} className="text-gray-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-600">Waktu Pengajuan</h3>
                    </div>
                    <p className="text-sm text-gray-800">
                      {format(new Date(getSubmissionDate(selectedItem)), "dd MMMM yyyy")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(getSubmissionDate(selectedItem)), "HH:mm")} WIB
                    </p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedItem.jadwal_pengambilan && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FiCalendar size={18} className="text-gray-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-600">Jadwal Pengambilan</h3>
                    </div>
                    <p className="text-sm text-gray-800">
                      {format(new Date(selectedItem.jadwal_pengambilan), "dd MMMM yyyy")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(selectedItem.jadwal_pengambilan), "HH:mm")} WIB
                    </p>
                  </div>
                )}
                
                {selectedItem.catatan_admin && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FiFileText size={18} className="text-gray-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-600">Catatan Admin</h3>
                    </div>
                    <p className="text-sm text-gray-800">{selectedItem.catatan_admin}</p>
                  </div>
                )}
              </div>
              
              {selectedItem.lampiran && selectedItem.lampiran.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-3">Dokumen Lampiran</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedItem.lampiran.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          {getFileIcon(doc.nama_dokumen)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-800">{doc.nama_dokumen}</p>
                            <p className="text-xs text-gray-500">
                              {formatTimestamp(doc.uploaded_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewPdf(doc.file_url)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center"
                          >
                            <FiEye size={16} className="mr-1" />
                            Lihat
                          </button>
                          <a 
                            href={doc.file_url} 
                            download={doc.nama_dokumen}
                            className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center"
                          >
                            <FiDownload size={16} className="mr-1" />
                            Unduh
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-4 border-t flex justify-end">
              <button
                onClick={() => handleEdit(selectedItem)}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FiEdit2 size={16} className="mr-2" />
                Edit Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Keeping functionality the same with updated styling */}
      {editModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative overflow-hidden">
            <div className="bg-blue-600 text-white p-6">
              <h2 className="text-xl font-semibold">Edit Pengajuan</h2>
              <p className="text-blue-100 text-sm mt-1">
                {jenisLayananMap[selectedItem.jenis_layanan_id]} - {mahasiswaNames[selectedItem.mahasiswa_nim]}
              </p>
            </div>
            
            <button 
              onClick={() => setEditModalOpen(false)} 
              className="absolute top-4 right-4 text-white hover:text-blue-200 transition-colors"
            >
              <FiX size={20} />
            </button>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
                  <div className="relative">
                    <select
                      value={selectedItem.status}
                      onChange={(e) => setSelectedItem({ ...selectedItem, status: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Catatan Admin</label>
                  <textarea
                    value={selectedItem.catatan_admin || ""}
                    onChange={(e) => setSelectedItem({ ...selectedItem, catatan_admin: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Tambahkan catatan untuk mahasiswa..."
                  />
                </div>

                {needsPickupDate(selectedItem.status) && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Jadwal Pengambilan</label>
                    <input
                      type="datetime-local"
                      value={selectedItem.jadwal_pengambilan?.slice(0, 16) || ""}
                      onChange={(e) => setSelectedItem({ ...selectedItem, jadwal_pengambilan: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => setEditModalOpen(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors shadow-sm"
              >
                Batal
              </button>
              <button 
                onClick={handleSave} 
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal - Kept the same with updated icons */}
      {pdfModalOpen && selectedPdf && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-5xl h-5/6 flex flex-col relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Preview Dokumen</h2>
              <button 
                onClick={() => setPdfModalOpen(false)} 
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="flex-1 bg-gray-200 rounded-md overflow-hidden">
              <iframe 
                src={selectedPdf} 
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <a 
                href={selectedPdf} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
              >
                Buka di Tab Baru
              </a>
              <a 
                href={selectedPdf} 
                download
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <FiDownload size={16} className="mr-1" />
                Unduh
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPelayanan;