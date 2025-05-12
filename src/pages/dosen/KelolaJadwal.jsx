import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Save,
  Eye,
  CheckCircle,
  ExternalLink,
  BarChart,
  Check,
  Play,
  Download,
  Maximize,
  Minimize,
  Wifi,
  WifiOff
} from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext

const KelolaWaktuBimbingan = () => {
  const { user, token } = useAuth(); // Ambil user dan token dari AuthContext
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [jadwalList, setJadwalList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [processingAntrian, setProcessingAntrian] = useState(false);
  const [processingAntrianId, setProcessingAntrianId] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const socketRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  const initialFormData = {
    jumlah_antrian: 0,
    tanggal: new Date().toISOString().split("T")[0],
    waktu_mulai: "",
    waktu_selesai: "",
    lokasi: "",
    keterangan: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleUpdateAntrianStatus = async (antrianId) => {
    setProcessingAntrian(true);
    setProcessingAntrianId(antrianId);

    try {
      const endpoint = `${API}/antrian/f/${antrianId}`;
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // Get the current status of the antrian being processed
        const currentAntrian = selectedJadwal.antrian_bimbingan.find(a => a.id_antrian === antrianId);
        const currentStatus = currentAntrian.status_antrian;
        
        // Update only the specific antrian that was changed without affecting others
        if (responseData.updated_antrian) {
          const updatedAntrian = responseData.updated_antrian;
          
          // Update the specific antrian in both jadwalList and selectedJadwal states
          setJadwalList((prevList) =>
            prevList.map((jadwal) => {
              if (jadwal.bimbingan_id === selectedJadwal.bimbingan_id) {
                return {
                  ...jadwal,
                  antrian_bimbingan: jadwal.antrian_bimbingan.map(antrian => 
                    antrian.id_antrian === antrianId ? 
                    {
                      ...antrian,
                      status_antrian: updatedAntrian.status,
                    } : antrian
                  )
                };
              }
              return jadwal;
            })
          );
          
          // Also update the selected jadwal to reflect the changes immediately
          setSelectedJadwal(prev => ({
            ...prev,
            antrian_bimbingan: prev.antrian_bimbingan.map(antrian => 
              antrian.id_antrian === antrianId ? 
              {
                ...antrian,
                status_antrian: updatedAntrian.status,
              } : antrian
            )
          }));

          // Show appropriate toast messages based on the status change
          if (currentStatus === "Menunggu") {
            toast.success(`Mahasiswa ${currentAntrian.mahasiswa_nim} sedang dalam bimbingan`);
          } else if (currentStatus === "Dalam Bimbingan") {
            toast.success(`Sesi bimbingan dengan mahasiswa ${currentAntrian.mahasiswa_nim} telah selesai`);
          }
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Gagal mengubah status antrian");
      }
    } catch (error) {
      console.error("Error saat mengubah status antrian:", error);
      toast.error("Terjadi kesalahan saat mengubah status antrian");
    } finally {
      setProcessingAntrian(false);
      setProcessingAntrianId(null);
    }
  };

  // Fungsi untuk memperbarui state berdasarkan data dari WebSocket
  const updateAntrianStatus = useCallback((data) => {
    const { waktu_id, queue } = data;

    if (!waktu_id || !queue || !queue.length) return;

    setJadwalList((prevList) => {
      const updatedList = [...prevList];
      const jadwalIndex = updatedList.findIndex((jadwal) => jadwal.bimbingan_id === waktu_id);

      if (jadwalIndex !== -1) {
        updatedList[jadwalIndex].antrian_bimbingan = queue.map((q) => ({
          id_antrian: q.id_antrian,
          mahasiswa_nim: q.nim,
          status_antrian: q.status,
        }));
      }

      return updatedList;
    });

    if (selectedJadwal && selectedJadwal.bimbingan_id === waktu_id) {
      setSelectedJadwal((prevJadwal) => ({
        ...prevJadwal,
        antrian_bimbingan: queue.map((q) => ({
          id_antrian: q.id_antrian,
          mahasiswa_nim: q.nim,
          status_antrian: q.status,
        })),
      }));
    }
  }, [selectedJadwal]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!token) return;

    // Tutup WebSocket lama jika ada
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    // Inisialisasi WebSocket baru dengan token yang diperbarui
    socketRef.current = new WebSocket(`${API.replace("https", "wss")}/ws?token=${token}`);

    socketRef.current.addEventListener("open", () => {
      console.log("✅ WebSocket connected");
      setSocketConnected(true);
    });

    socketRef.current.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        
        switch (data.event) {
          case "update_antrian":
            updateAntrianStatus(data);
            handleStudentJoinedQueue(data);
            break;
          case "new_antrian":
            fetchJadwalBimbingan();
            toast.info(`Mahasiswa baru telah mengambil antrian pada jadwal #${data.waktu_id}`);
            break;
          default:
            console.log("Received unknown event:", data.event);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    });

    socketRef.current.addEventListener("close", () => {
      console.log("❌ WebSocket connection closed");
      setSocketConnected(false);
    });

    socketRef.current.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      setSocketConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [token]);

  const fetchJadwalBimbingan = async () => {
    try {
      const response = await fetch(`${API}/waktu_bimbingan/dosen/${user?.profile?.alias}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJadwalList(data);
      } else {
        console.error("Gagal mengambil jadwal bimbingan:", response.statusText);
        toast.error("Gagal mengambil jadwal bimbingan.");
      }
    } catch (error) {
      console.error("Error saat mengambil jadwal bimbingan:", error);
      toast.error("Terjadi kesalahan saat mengambil jadwal bimbingan.");
    }
  };

  useEffect(() => {
    fetchJadwalBimbingan();
    return () => {
    toast.dismiss();
  };
  }, [user, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const now = new Date();
    const selectedDateTime = new Date(`${formData.tanggal}T${formData.waktu_mulai}`);

    if (selectedDateTime < now) {
      toast.error("Jadwal tidak boleh di masa lalu");
      setLoading(false);
      return;
    }

    const payload = {
      dosen_inisial: user.profile.alias,
      jumlah_antrian: parseInt(formData.jumlah_antrian),
      tanggal: formData.tanggal,
      waktu_mulai: formData.waktu_mulai,
      waktu_selesai: formData.waktu_selesai,
      lokasi: formData.lokasi,
      keterangan: formData.keterangan,
    };

    try {
      const response = await fetch(`${API}/waktu_bimbingan/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Jadwal bimbingan berhasil ditambahkan!");
        setJadwalList([...jadwalList, result]);
        setFormData(initialFormData);
        toast.success("Jadwal bimbingan berhasil ditambahkan!");
        setIsModalOpen(false);
      } else {
        setMessage(`Error: ${result.detail || "Terjadi kesalahan saat menyimpan."}`);
        toast.error(result.detail || "Terjadi kesalahan saat menyimpan.");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API}/waktu_bimbingan/${selectedJadwal.bimbingan_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedList = jadwalList.map(jadwal => 
          jadwal.bimbingan_id === selectedJadwal.bimbingan_id ? result : jadwal
        );
        setJadwalList(updatedList);
        toast.success("Jadwal bimbingan berhasil diperbarui!");
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "Gagal memperbarui jadwal bimbingan");
      }
    } catch (error) {
      console.error("Error saat memperbarui jadwal:", error);
      toast.error("Terjadi kesalahan saat memperbarui jadwal");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/waktu_bimbingan/${selectedJadwal.bimbingan_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedList = jadwalList.filter(
          jadwal => jadwal.bimbingan_id !== selectedJadwal.bimbingan_id
        );
        setJadwalList(updatedList);
        toast.success("Jadwal bimbingan berhasil dihapus!");
        setIsModalOpen(false);
        setIsDetailModalOpen(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "Gagal menghapus jadwal bimbingan");
      }
    } catch (error) {
      console.error("Error saat menghapus jadwal:", error);
      toast.error("Terjadi kesalahan saat menghapus jadwal");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (jadwal) => {
    setSelectedJadwal(jadwal);
    setIsDetailModalOpen(true);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedJadwal(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (jadwal) => {
    setIsEditMode(true);
    setSelectedJadwal(jadwal);
    setFormData({
      jumlah_antrian: jadwal.jumlah_antrian,
      tanggal: jadwal.tanggal,
      waktu_mulai: jadwal.waktu_mulai.slice(0, 5),
      waktu_selesai: jadwal.waktu_selesai.slice(0, 5),
      lokasi: jadwal.lokasi,
      keterangan: jadwal.keterangan || "",
    });
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const handlePreviewFile = (fileUrl, fileName) => {
    setPreviewFile({ url: fileUrl, name: fileName });
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
    setIsPreviewFullscreen(false);
  };

  const toggleFullscreenPreview = () => {
    setIsPreviewFullscreen(!isPreviewFullscreen);
  };

  const renderFilePreview = (fileUrl, fileName) => {
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    if (fileExtension === 'pdf') {
      return (
        <iframe 
          src={`${fileUrl}#toolbar=0&navpanes=0`} 
          className="w-full h-full border-0"
          title={fileName}
        />
      );
    }
    
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileExtension)) {
      return (
        <iframe 
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`} 
          className="w-full h-full border-0"
          title={fileName}
        />
      );
    }
    
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension)) {
      return (
        <img 
          src={fileUrl} 
          alt={fileName} 
          className="max-w-full max-h-full object-contain mx-auto"
        />
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileText size={64} className="text-gray-400 mb-4" />
        <p className="text-gray-600 mb-6 text-center">
          File ini tidak dapat ditampilkan secara langsung.
          <br />
          Silakan unduh untuk melihat isinya.
        </p>
        <a 
          href={fileUrl} 
          download={fileName}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download size={16} />
          Unduh File
        </a>
      </div>
    );
  };

  const renderStatusBadge = (status) => {
    let bgColor, textColor, icon;
    
    switch(status) {
      case "Dalam Bimbingan":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        icon = <Play className="mr-1 text-blue-600" size={14} />;
        break;
      case "Selesai":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        icon = <CheckCircle className="mr-1 text-green-600" size={14} />;
        break;
      case "Menunggu":
      default:
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        icon = <Clock className="mr-1 text-yellow-600" size={14} />;
        break;
    }
    
    return (
      <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
        {icon}
        {status}
      </span>
    );
  };

  const handleStudentJoinedQueue = useCallback((data) => {
    const { waktu_id, queue } = data;
    
    if (!waktu_id || !queue || !queue.length) return;
    
    const newStudent = queue.find(q => q.status === "Menunggu");
    
    if (newStudent) {
      toast.info(
        <div>
          <strong>Mahasiswa baru di antrian!</strong>
          <p className="text-sm mt-1">NIM: {newStudent.nim}</p>
          <p className="text-sm">Jadwal ID: {waktu_id}</p>
        </div>,
        { autoClose: 5000 }
      );
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Kelola Jadwal Bimbingan</h1>
        <div className="flex items-center gap-4">
          <div className={`flex items-center ${socketConnected ? 'text-green-600' : 'text-gray-400'}`}>
            {socketConnected ? (
              <>
                <Wifi size={16} className="mr-1" />
                <span className="text-xs">Realtime aktif</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="mr-1" />
                <span className="text-xs">Menghubungkan...</span>
              </>
            )}
          </div>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300 text-white px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2"
          >
            <Plus size={18} /> Tambah Jadwal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jadwalList.length > 0 ? (
          jadwalList.map((jadwal, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-200 hover:border-blue-300 transition-colors duration-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md"
            >
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="text-blue-600" size={18} />
                  <h2 className="text-lg font-semibold text-gray-800">
                    {formatDate(jadwal.tanggal)}
                  </h2>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="text-gray-500" size={16} />
                    <span className="text-gray-700">
                      {jadwal.waktu_mulai.slice(0, 5)} - {jadwal.waktu_selesai.slice(0, 5)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="text-gray-500" size={16} />
                    <span className="text-gray-700">
                      <span className="font-medium text-blue-600">{jadwal.antrian_bimbingan?.length || 0}</span>/{jadwal.jumlah_antrian} Mahasiswa
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="text-gray-500" size={16} />
                    <span className="text-gray-700">{jadwal.lokasi}</span>
                  </div>
                  
                  {jadwal.keterangan && (
                    <div className="flex items-start gap-2">
                      <FileText className="text-gray-500 mt-1" size={16} />
                      <span className="text-gray-700 line-clamp-1">{jadwal.keterangan}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleViewDetail(jadwal)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors duration-300 py-2 px-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Eye size={16} /> Detail
                  </button>
                  <button
                    onClick={() => openEditModal(jadwal)}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors duration-300 py-2 px-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                </div>
                
                {jadwal.antrian_bimbingan && jadwal.antrian_bimbingan.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Status Antrian:</p>
                    <div className="flex flex-wrap gap-1">
                      {jadwal.antrian_bimbingan.filter(antrian => antrian.status_antrian === "Menunggu").length > 0 && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                          <Clock size={10} className="mr-1" />
                          {jadwal.antrian_bimbingan.filter(antrian => antrian.status_antrian === "Menunggu").length} Menunggu
                        </span>
                      )}
                      
                      {jadwal.antrian_bimbingan.filter(antrian => antrian.status_antrian === "Dalam Bimbingan").length > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                          <Play size={10} className="mr-1" />
                          {jadwal.antrian_bimbingan.filter(antrian => antrian.status_antrian === "Dalam Bimbingan").length} Proses
                        </span>
                      )}
                      
                      {jadwal.antrian_bimbingan.filter(antrian => antrian.status_antrian === "Selesai").length > 0 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                          <CheckCircle size={10} className="mr-1" />
                          {jadwal.antrian_bimbingan.filter(antrian => antrian.status_antrian === "Selesai").length} Selesai
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-gray-50 rounded-lg p-8 text-center">
            <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 mb-4">Belum ada jadwal bimbingan yang ditambahkan</p>
            <button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300 text-white px-4 py-2 rounded-lg shadow inline-flex items-center gap-2"
            >
              <Plus size={18} /> Tambah Jadwal Sekarang
            </button>
          </div>
        )}
      </div>

      {isDetailModalOpen && selectedJadwal && (
        <div className="fixed inset-0 bg-none bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 relative animate-fadeIn overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Detail Jadwal Bimbingan
                </h2>
                <p className="text-blue-600 font-medium">ID: {selectedJadwal.bimbingan_id}</p>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tanggal</h3>
                  <div className="flex items-center mt-1">
                    <Calendar className="text-blue-500 mr-2" size={18} />
                    <p className="text-lg font-medium">{formatDate(selectedJadwal.tanggal)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Waktu</h3>
                  <div className="flex items-center mt-1">
                    <Clock className="text-blue-500 mr-2" size={18} />
                    <p className="text-lg font-medium">
                      {selectedJadwal.waktu_mulai.slice(0, 5)} - {selectedJadwal.waktu_selesai.slice(0, 5)} WIB
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Lokasi</h3>
                  <div className="flex items-center mt-1">
                    <MapPin className="text-blue-500 mr-2" size={18} />
                    <p className="text-lg font-medium">{selectedJadwal.lokasi}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status Kuota</h3>
                  <div className="flex items-center mt-1">
                    <Users className="text-blue-500 mr-2" size={18} />
                    <p className="text-lg font-medium">
                      {selectedJadwal.antrian_bimbingan?.length || 0} dari {selectedJadwal.jumlah_antrian} slot
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${((selectedJadwal.antrian_bimbingan?.length || 0) / selectedJadwal.jumlah_antrian) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status Jadwal</h3>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedJadwal.is_active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      <CheckCircle className={`mr-1 ${selectedJadwal.is_active ? "text-green-600" : "text-red-600"}`} size={14} />
                      {selectedJadwal.is_active ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </div>
                </div>
                
                {selectedJadwal.keterangan && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Keterangan</h3>
                    <div className="flex items-start mt-1">
                      <FileText className="text-blue-500 mr-2 mt-0.5" size={18} />
                      <p className="text-gray-700">{selectedJadwal.keterangan}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <Users className="mr-2 text-blue-600" size={20} />
                  Daftar Antrian Mahasiswa
                </h3>
                
                <div className={`flex items-center ${socketConnected ? 'text-green-600' : 'text-gray-400'}`}>
                  {socketConnected ? (
                    <>
                      <Wifi size={16} className="mr-1" />
                      <span className="text-xs">Realtime aktif</span>
                    </>
                  ) : (
                    <>
                      <WifiOff size={16} className="mr-1" />
                      <span className="text-xs">Menghubungkan...</span>
                    </>
                  )}
                </div>
              </div>
              
              {selectedJadwal.antrian_bimbingan && selectedJadwal.antrian_bimbingan.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedJadwal.antrian_bimbingan.map((antrian, index) => (
                        <tr key={antrian.id_antrian} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{antrian.position || index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{antrian.mahasiswa_nim}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(antrian.status_antrian)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {antrian.files ? (
                              <div className="flex items-center gap-2">
                                <a 
                                  href={antrian.files.file_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                  <FileText size={14} className="mr-1" />
                                  {antrian.files.filename.length > 20 
                                    ? antrian.files.filename.substring(0, 20) + '...' 
                                    : antrian.files.filename
                                  }
                                  <ExternalLink size={12} className="ml-1" />
                                </a>
                                <button
                                  onClick={() => handlePreviewFile(antrian.files.file_url, antrian.files.filename)}
                                  className="text-blue-600 hover:text-blue-800 ml-2 p-1 rounded hover:bg-blue-50"
                                  title="Lihat file"
                                >
                                  <Eye size={16} /> Lihat
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Tidak ada file</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {antrian.status_antrian === "Menunggu" && (
                                <button 
                                  className="px-3 py-1 rounded text-white bg-blue-600 hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={processingAntrian}
                                  onClick={() => handleUpdateAntrianStatus(antrian.id_antrian)}
                                >
                                  {processingAntrian && processingAntrianId === antrian.id_antrian ? (
                                    "Proses..."
                                  ) : (
                                    <>
                                      <Play size={14} className="mr-1" /> Mulai
                                    </>
                                  )}
                                </button>
                              )}
                              
                              {antrian.status_antrian === "Dalam Bimbingan" && (
                                <button 
                                  className="px-3 py-1 rounded text-white bg-green-600 hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={processingAntrian}
                                  onClick={() => handleUpdateAntrianStatus(antrian.id_antrian)}
                                >
                                  {processingAntrian && processingAntrianId === antrian.id_antrian ? (
                                    "Proses..."
                                  ) : (
                                    <>
                                      <Check size={14} className="mr-1" /> Selesai
                                    </>
                                  )}
                                </button>
                              )}
                              
                              {antrian.status_antrian === "Selesai" && (
                                <span className="px-3 py-1 rounded text-gray-500 bg-gray-100 flex items-center opacity-70 cursor-not-allowed">
                                  <CheckCircle size={14} className="mr-1" /> Selesai
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <BarChart className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500">Belum ada mahasiswa yang mendaftar</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    openEditModal(selectedJadwal);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Edit3 size={16} /> Edit Jadwal
                </button>
                
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="border border-gray-300 hover:bg-gray-100 transition-colors duration-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <X size={16} /> Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-none bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative animate-fadeIn">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {isEditMode ? "Edit Jadwal Bimbingan" : "Tambah Jadwal Bimbingan"}
            </h2>
            
            <form onSubmit={isEditMode ? handleUpdate : handleSubmit}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Mulai</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="text-gray-400" size={16} />
                    </div>
                    <input
                      type="time"
                      name="waktu_mulai"
                      value={formData.waktu_mulai}
                      onChange={handleChange}
                      min={formData.tanggal === new Date().toISOString().split("T")[0] ? new Date().toISOString().slice(11, 16) : undefined}
                      className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Selesai</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="text-gray-400" size={16} />
                    </div>
                    <input
                      type="time"
                      name="waktu_selesai"
                      value={formData.waktu_selesai}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Antrian</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="number"
                    name="jumlah_antrian"
                    value={formData.jumlah_antrian}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="text"
                    name="lokasi"
                    value={formData.lokasi}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan lokasi bimbingan"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText className="text-gray-400" size={16} />
                  </div>
                  <textarea
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan keterangan tambahan (opsional)"
                    rows={3}
                  />
                </div>
              </div>

              <div className={`flex ${isEditMode ? 'justify-between' : 'justify-end'} items-center`}>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 transition-colors duration-300 text-white px-4 py-2.5 rounded-lg flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                )}
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="border border-gray-300 hover:bg-gray-100 transition-colors duration-300 text-gray-700 px-4 py-2.5 rounded-lg flex items-center gap-2"
                  >
                    <X size={16} /> Batal
                  </button>
                  
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300 text-white px-4 py-2.5 rounded-lg flex items-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>Menyimpan...</>
                    ) : ( 
                      <>
                        <Save size={16} /> Simpan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewFile && (
        <div className={`fixed inset-0 bg-none backdrop-blur-sm bg-opacity-75 flex items-center justify-center z-[60] ${isPreviewFullscreen ? 'p-0' : 'p-8'}`}>
          <div className={`bg-white rounded-lg shadow-2xl relative animate-fadeIn ${isPreviewFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl max-h-[90vh]'}`}>
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 truncate max-w-[80%]">
                <FileText className="inline mr-2 text-blue-600" size={20} />
                {previewFile.name}
              </h3>
              <div className="flex items-center gap-2">
                <a 
                  href={previewFile.url} 
                  download={previewFile.name}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                  title="Unduh file"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download size={20} />
                </a>
                <button 
                  onClick={toggleFullscreenPreview}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                  title={isPreviewFullscreen ? "Keluar layar penuh" : "Layar penuh"}
                >
                  {isPreviewFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
                <button 
                  onClick={handleClosePreview}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                  title="Tutup"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className={`${isPreviewFullscreen ? 'h-[calc(100%-64px)]' : 'h-[70vh]'} overflow-auto bg-gray-100`}>
              {renderFilePreview(previewFile.url, previewFile.name)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaWaktuBimbingan;