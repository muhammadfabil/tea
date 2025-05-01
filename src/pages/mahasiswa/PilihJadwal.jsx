import React, { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  Calendar, Clock, MapPin, FileText, Users, X, Upload, Check, AlertCircle, 
  Wifi, WifiOff, Eye, CheckCircle, Play, Download, Bell, ChevronRight, FileCheck
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";

const JadwalBimbinganMahasiswa = () => {
  const { token } = useAuth(); // Get token directly from AuthContext
  const [jadwalByDosen, setJadwalByDosen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [namaMahasiswa, setNamaMahasiswa] = useState('');
  const [nimMahasiswa, setNimMahasiswa] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAntrianDetail, setSelectedAntrianDetail] = useState(null);
  const [processingAntrian, setProcessingAntrian] = useState(false);
  const [processingAntrianId, setProcessingAntrianId] = useState(null);
  
  // State untuk modal konfirmasi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [selectedDosenInfo, setSelectedDosenInfo] = useState(null);

  // Update the updateAntrianStatus function to also update the selectedAntrianDetail
  const updateAntrianStatus = useCallback((data) => {
    const { inisial, waktu_id, queue } = data;
    
    if (!waktu_id || !queue || !queue.length) return;
    
    setJadwalByDosen(prevState => {
      const newState = [...prevState];
      
      // Find the dosen schedule that matches the inisial
      const dosenIndex = newState.findIndex(dosen => dosen.dosenAlias === inisial);
      
      if (dosenIndex !== -1) {
        // Find the jadwal that matches the waktu_id
        const jadwalIndex = newState[dosenIndex].jadwalList.findIndex(
          jadwal => jadwal.bimbingan_id === waktu_id
        );
        
        if (jadwalIndex !== -1) {
          // Update the status of each antrian based on the queue data
          if (newState[dosenIndex].jadwalList[jadwalIndex].antrian_bimbingan) {
            newState[dosenIndex].jadwalList[jadwalIndex].antrian_bimbingan = 
              newState[dosenIndex].jadwalList[jadwalIndex].antrian_bimbingan.map(antrian => {
                // Find matching antrian in the queue
                const queueItem = queue.find(q => q.id_antrian === antrian.id_antrian);
                
                if (queueItem) {
                  return {
                    ...antrian,
                    status_antrian: queueItem.status
                  };
                }
                return antrian;
              });
              
            // Also update selectedAntrianDetail if it matches the updated antrian
            if (selectedAntrianDetail && selectedAntrianDetail.jadwal.bimbingan_id === waktu_id) {
              const updatedAntrian = queue.find(q => q.id_antrian === selectedAntrianDetail.id_antrian);
              if (updatedAntrian) {
                setSelectedAntrianDetail(prev => ({
                  ...prev,
                  status_antrian: updatedAntrian.status
                }));
              }
            }
          }
        }
      }
      
      return newState;
    });
  }, [selectedAntrianDetail]);

  // Setup WebSocket connection - FIXED
  useEffect(() => {
    if (!nimMahasiswa) return;
    if (!token) return;
    
    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    // Create WebSocket connection with current token from AuthContext
    socketRef.current = new WebSocket(`wss://d1raf3a33gcfqd.cloudfront.net/ws?token=${token}`);

    // Connection opened
    socketRef.current.addEventListener("open", () => {
      console.log("✅ WebSocket connected");
      setSocketConnected(true);
    });

    // Listen for messages
    socketRef.current.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.event) {
          case "update_antrian":
            updateAntrianStatus(data);
            break;

          case "create_waktu_bimbingan":
            setJadwalByDosen((prevState) => {
              const updatedState = [...prevState];

              // Cari dosen berdasarkan 
              const dosenIndex = updatedState.findIndex(
                (dosen) => dosen.dosenAlias === data.inisial
              );

              if (dosenIndex !== -1) {
                // Periksa apakah jadwal sudah ada berdasarkan bimbingan_id
                const jadwalExists = updatedState[dosenIndex].jadwalList.some(
                  (jadwal) => jadwal.bimbingan_id === data.waktu_id
                );

                if (!jadwalExists) {
                  // Tambahkan jadwal baru jika belum ada
                  updatedState[dosenIndex].jadwalList.push({
                    bimbingan_id: data.waktu_id,
                    tanggal: data.tanggal,
                    waktu_mulai: data.waktu_mulai,
                    waktu_selesai: data.waktu_selesai,
                    jumlah_antrian: data.jumlah_antrian,
                    lokasi: data.lokasi,
                    keterangan: data.keterangan,
                    antrian_bimbingan: [], // Initialize with an empty queue
                  });
                }
              } else {
                // Tambahkan dosen baru jika belum ada
                updatedState.push({
                  dosenAlias: data.inisial,
                  dosenRole: "Dosen Pembimbing", // Default role, adjust if needed
                  jadwalList: [
                    {
                      bimbingan_id: data.waktu_id,
                      tanggal: data.tanggal,
                      waktu_mulai: data.waktu_mulai,
                      waktu_selesai: data.waktu_selesai,
                      jumlah_antrian: data.jumlah_antrian,
                      lokasi: data.lokasi,
                      keterangan: data.keterangan,
                      antrian_bimbingan: [], // Initialize with an empty queue
                    },
                  ],
                });
              }

              return updatedState;
            });

            toast.success("Jadwal baru telah ditambahkan!");
            break;

          default:
            console.log("Received unknown event:", data.event);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    });

    // Connection closed or error
    socketRef.current.addEventListener("close", () => {
      console.log("❌ WebSocket connection closed");
      setSocketConnected(false);

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (socketRef.current?.readyState === WebSocket.CLOSED) {
          console.log("🔄 Attempting to reconnect WebSocket...");
          socketRef.current = null;
        }
      }, 5000);
    });

    socketRef.current.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      setSocketConnected(false);
    });

    // Clean up on unmount or token change
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [nimMahasiswa, updateAntrianStatus, token]); // Added token to dependency array

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get authenticated user data from localStorage
        const authRaw = localStorage.getItem('auth');
        const auth = JSON.parse(authRaw);
        const nim = auth?.user?.profile?.nim || '121140179'; // Fallback for testing
        const nama = auth?.user?.profile?.name || 'Mahasiswa';
        
        setNamaMahasiswa(nama);
        setNimMahasiswa(nim);

        // Fetch relation data for the logged in student
        const relationResponse = await fetch(`https://d1raf3a33gcfqd.cloudfront.net/relation/mahasiswa/${nim}`);
        
        if (!relationResponse.ok) {
          throw new Error(`Error fetching relations: ${relationResponse.statusText}`);
        }
        
        const relationData = await relationResponse.json();
        
        if (!relationData.length) {
          setJadwalByDosen([]);
          setLoading(false);
          return;
        }

        // Fetch schedule for each related dosen
        const dosenSchedules = await Promise.all(
          relationData.map(async (relation) => {
            try {
              const scheduleResponse = await fetch(`https://d1raf3a33gcfqd.cloudfront.net/waktu_bimbingan/dosen/${relation.dosen_alias}`); // Updated URL
              const scheduleData = await scheduleResponse.json();
              
              return {
                dosenAlias: relation.dosen_alias,
                dosenRole: relation.role,
                jadwalList: scheduleData
              };
            } catch (err) {
              console.error(`Failed to fetch schedules for dosen ${relation.dosen_alias}:`, err);
              return {
                dosenAlias: relation.dosen_alias,
                dosenRole: relation.role,
                jadwalList: [],
                error: err.message
              };
            }
          })
        );
        
        setJadwalByDosen(dosenSchedules);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // Format from "08:00:00" to "08:00"
  };

  const isInQueue = (jadwal) => {
    if (!jadwal.antrian_bimbingan) return false;
    return jadwal.antrian_bimbingan.some(antrian => antrian.mahasiswa_nim === nimMahasiswa);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (maksimal 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB");
        e.target.value = '';
        return;
      }
      
      // Validasi tipe file
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Format file tidak didukung. Gunakan PDF, Word, Excel, PowerPoint, atau gambar.");
        e.target.value = '';
        return;
      }
    }
    
    setSelectedFile(file);
  };

  const openConfirmationModal = (jadwal, dosenInfo) => {
    setSelectedJadwal(jadwal);
    setSelectedDosenInfo(dosenInfo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJadwal(null);
    setSelectedDosenInfo(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openDetailModal = (jadwal, dosenInfo) => {
    // Mencari antrian mahasiswa yang sedang login
    const myAntrian = jadwal.antrian_bimbingan?.find(
      antrian => antrian.mahasiswa_nim === nimMahasiswa
    );
    
    if (myAntrian) {
      // Make sure we're always using the latest status
      setSelectedAntrianDetail({
        ...myAntrian,
        jadwal,
        dosenInfo
      });
      setIsDetailModalOpen(true);
    } else {
      toast.error("Tidak dapat menemukan data antrian Anda");
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAntrianDetail(null);
  };

  const handleUpdateAntrianStatus = async (antrianId) => {
    setProcessingAntrian(true);
    setProcessingAntrianId(antrianId);

    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      const currentToken = token || auth?.token; // Use context token or fallback to localStorage

      if (!currentToken) {
        toast.error("Silakan login terlebih dahulu");
        setProcessingAntrian(false);
        setProcessingAntrianId(null);
        return;
      }

      const endpoint = `https://d1raf3a33gcfqd.cloudfront.net/antrian/f/${antrianId}`; // Updated URL
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (response.ok) {
        // Determine new status based on current status
        let newStatus = "";
        if (selectedAntrianDetail.status_antrian === "Menunggu") {
          newStatus = "Dalam Bimbingan";
          toast.success("Status berhasil diubah menjadi Dalam Bimbingan");
        } else if (selectedAntrianDetail.status_antrian === "Dalam Bimbingan") {
          newStatus = "Selesai";
          toast.success("Status berhasil diubah menjadi Selesai");
        }

        // Update state jadwalByDosen
        setJadwalByDosen((prevState) =>
          prevState.map((dosenData) => ({
            ...dosenData,
            jadwalList: dosenData.jadwalList.map((jadwal) => ({
              ...jadwal,
              antrian_bimbingan: jadwal.antrian_bimbingan?.map((antrian) =>
                antrian.id_antrian === antrianId
                  ? { ...antrian, status_antrian: newStatus }
                  : antrian
              ) || [],
            })),
          }))
        );

        // Update selectedAntrianDetail immediately
        setSelectedAntrianDetail((prev) => ({
          ...prev,
          status_antrian: newStatus,
        }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "Gagal mengubah status antrian");
      }
    } catch (err) {
      console.error("Error saat mengubah status antrian:", err);
      toast.error("Terjadi kesalahan saat mengubah status antrian");
    } finally {
      setProcessingAntrian(false);
      setProcessingAntrianId(null);
    }
  };

  const handleDaftarAntrian = async () => {
    if (submitting || !selectedJadwal) return;
    
    setSubmitting(true);
    
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      const currentToken = token || auth?.token; // Use context token or fallback to localStorage
      
      if (!currentToken) {
        toast.error("Silakan login terlebih dahulu");
        setSubmitting(false);
        return;
      }
      
      // Buat FormData hanya untuk file
      const formData = new FormData();
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      // Gunakan query parameters untuk waktu_id dan mahasiswa_nim
      const queryParams = new URLSearchParams({
        waktu_id: selectedJadwal.bimbingan_id,
        mahasiswa_nim: nimMahasiswa
      });
      
      const response = await fetch(`https://d1raf3a33gcfqd.cloudfront.net/antrian/?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success(`Berhasil mendaftar antrian! Posisi antrian: ${result.posisi}`);
        
        // Update local state to reflect the change - FIX UNTUK HINDARI DUPLIKASI
        setJadwalByDosen(prevState => {
          const newState = [...prevState];
          
          // Find the dosen schedule
          const dosenIndex = newState.findIndex(dosen => 
            dosen.jadwalList.some(jadwal => jadwal.bimbingan_id === selectedJadwal.bimbingan_id)
          );
          
          if (dosenIndex !== -1) {
            // Find the jadwal
            const jadwalIndex = newState[dosenIndex].jadwalList.findIndex(
              jadwal => jadwal.bimbingan_id === selectedJadwal.bimbingan_id
            );
            
            if (jadwalIndex !== -1) {
              // Check if the user is already in queue to prevent duplicates
              const isAlreadyInQueue = newState[dosenIndex].jadwalList[jadwalIndex].antrian_bimbingan?.some(
                antrian => antrian.mahasiswa_nim === nimMahasiswa
              );
              
              if (!isAlreadyInQueue) {
                // Create a new antrian object based on the response
                const newAntrian = {
                  mahasiswa_nim: nimMahasiswa,
                  nama: namaMahasiswa,
                  status_antrian: "Menunggu",
                  position: result.posisi,
                  id_antrian: result.id_antrian
                };
                
                // Add the new antrian to the jadwal's antrian_bimbingan array
                if (!newState[dosenIndex].jadwalList[jadwalIndex].antrian_bimbingan) {
                  newState[dosenIndex].jadwalList[jadwalIndex].antrian_bimbingan = [];
                }
                
                newState[dosenIndex].jadwalList[jadwalIndex].antrian_bimbingan.push(newAntrian);
              }
            }
          }
          
          return newState;
        });
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setSelectedFile(null);
        
        // Tutup modal
        closeModal();
        
      } else {
        toast.error(result.detail || "Gagal mendaftar antrian");
      }
    } catch (err) {
      console.error("Error saat mendaftar antrian:", err);
      toast.error("Terjadi kesalahan saat mendaftar antrian");
    } finally {
      setSubmitting(false);
    }
  };

  // Untuk menampilkan nama file yang dipilih
  const getFileName = () => {
    if (!selectedFile) return "";
    if (selectedFile.name.length > 25) {
      return selectedFile.name.substring(0, 22) + "...";
    }
    return selectedFile.name;
  };

  // Mendapatkan ukuran file dalam format yang mudah dibaca
  const getFileSize = () => {
    if (!selectedFile) return "";
    const sizeInKB = selectedFile.size / 1024;
    if (sizeInKB < 1024) {
      return `${sizeInKB.toFixed(2)} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    }
  };

  // Status badge untuk antrian
  const renderStatusBadge = (status) => {
    let bgColor, textColor, icon;
    
    switch(status) {
      
      case "Dalam Bimbingan":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        icon = <Play className="shrink-0 mr-1" size={12} />;
        break;
      case "Selesai":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        icon = <CheckCircle className="shrink-0 mr-1" size={12} />;
        break;
      case "Menunggu":
      default:
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        icon = <Clock className="shrink-0 mr-1" size={12} />;
        break;
    }
    
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full inline-flex items-center ${bgColor} ${textColor}`}>
        {icon} {status}
      </span>
    );
  };

  // Mendapatkan antrian mahasiswa pada jadwal tertentu
  const getMyAntrian = (jadwal) => {
    if (!jadwal.antrian_bimbingan) return null;
    return jadwal.antrian_bimbingan.find(antrian => antrian.mahasiswa_nim === nimMahasiswa);
  };

  // Mendapatkan warna latar belakang untuk kartu jadwal berdasarkan status antrian
  const getCardBgStyle = (jadwal) => {
    const myAntrian = getMyAntrian(jadwal);
    
    if (!myAntrian) return "bg-gray-50";
    
    switch(myAntrian.status_antrian) {
      case "Dalam Bimbingan":
        return "bg-blue-50 border-blue-300";
      case "Selesai":
        return "bg-green-50 border-green-300";
      case "Menunggu":
      default:
        return "bg-yellow-50 border-yellow-300";
    }
  };

  if (loading) return <div className="p-4 text-center">Memuat jadwal bimbingan...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Jadwal Bimbingan</h1>
          <p className="text-slate-500 mt-1">Pilih jadwal bimbingan dengan dosen pembimbing Anda</p>
        </div>
        <div className={`flex items-center px-3 py-1.5 rounded-full ${socketConnected ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
          {socketConnected ? (
            <>
              <Wifi size={16} className="mr-1.5" />
              <span className="text-xs font-medium">Realtime aktif</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="mr-1.5" />
              <span className="text-xs font-medium">Menghubungkan...</span>
            </>
          )}
        </div>
      </div>
      
      {jadwalByDosen.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">Belum ada relasi dosen pembimbing</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Anda belum terhubung dengan dosen pembimbing. Silakan hubungi administrator untuk pengaturan relasi.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {jadwalByDosen.map((dosenData, idx) => (
            <div key={idx} className="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
              <div className="bg-blue-600 text-white px-6 py-4">
                <h2 className="text-lg font-semibold">{dosenData.dosenRole} ({dosenData.dosenAlias})</h2>
              </div>
              
              {dosenData.error ? (
                <div className="p-6 flex items-center text-red-500">
                  <AlertCircle size={20} className="mr-2" />
                  <span>Gagal memuat jadwal: {dosenData.error}</span>
                </div>
              ) : dosenData.jadwalList.length === 0 ? (
                <div className="p-6 text-slate-500 italic flex items-center">
                  <Calendar size={20} className="mr-2 text-slate-400" />
                  <span>Belum ada jadwal bimbingan yang dibuat oleh dosen ini.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
                  {dosenData.jadwalList.map((jadwal) => {
                    const myAntrian = getMyAntrian(jadwal);
                    const cardStyle = getCardBgStyle(jadwal);
                    
                    return (
                      <div 
                        key={jadwal.bimbingan_id} 
                        className={`rounded-xl p-5 border ${cardStyle} transition-all duration-200 hover:shadow-md`}
                      >
                        {myAntrian && (
                          <div className="mb-3 flex justify-between items-center">
                            <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                              Antrian Saya
                            </span>
                            {renderStatusBadge(myAntrian.status_antrian)}
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <h3 className="font-semibold text-slate-800 flex items-center">
                            <Calendar size={16} className="mr-1.5 text-blue-600" />
                            {formatDate(jadwal.tanggal)}
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                            <p className="text-xs text-slate-500">Waktu Mulai</p>
                            <p className="font-medium text-slate-800">{formatTime(jadwal.waktu_mulai)} WIB</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                            <p className="text-xs text-slate-500">Waktu Selesai</p>
                            <p className="font-medium text-slate-800">{formatTime(jadwal.waktu_selesai)} WIB</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1.5">
                            <p className="text-xs text-slate-500">Status Kuota</p>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {jadwal.antrian_bimbingan?.length || 0}/{jadwal.jumlah_antrian} Slot
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${((jadwal.antrian_bimbingan?.length || 0) / jadwal.jumlah_antrian) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Lokasi */}
                        {jadwal.lokasi && (
                          <div className="mb-3 text-sm flex items-start">
                            <MapPin size={16} className="text-slate-400 mr-1.5 mt-0.5 shrink-0" />
                            <span className="text-slate-700">{jadwal.lokasi}</span>
                          </div>
                        )}
                        
                        {/* Keterangan */}
                        {jadwal.keterangan && (
                          <div className="mb-4 text-sm flex items-start">
                            <FileText size={16} className="text-slate-400 mr-1.5 mt-0.5 shrink-0" />
                            <span className="text-slate-700">{jadwal.keterangan}</span>
                          </div>
                        )}
                        
                        {myAntrian ? (
                          <button
                            onClick={() => openDetailModal(jadwal, dosenData)}
                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center font-medium border border-blue-200"
                          >
                            <Eye size={16} className="mr-1.5" /> Detail Antrian Saya
                          </button>
                        ) : (
                          (jadwal.antrian_bimbingan?.length || 0) < jadwal.jumlah_antrian && (
                            <button 
                              onClick={() => openConfirmationModal(jadwal, dosenData)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center font-medium"
                            >
                              <Users size={16} className="mr-1.5" />
                              Ambil Antrian Bimbingan
                            </button>
                          )
                        )}
                        
                        {jadwal.antrian_bimbingan?.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-200">
                            <p className="text-xs font-medium text-slate-500 mb-2 flex items-center">
                              <Users size={14} className="mr-1" /> 
                              Daftar Antrian ({jadwal.antrian_bimbingan.length})
                            </p>
                            <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-100">
                              <ul className="text-sm divide-y divide-slate-100">
                                {jadwal.antrian_bimbingan.map((antrian, index) => (
                                  <li 
                                    key={antrian.id_antrian || index} 
                                    className={`py-2 px-3 flex items-center justify-between ${
                                      antrian.mahasiswa_nim === nimMahasiswa 
                                        ? 'bg-blue-50 font-medium' 
                                        : 'bg-white'
                                    }`}
                                  >
                                    <span className="flex items-center">
                                      <span className="bg-slate-100 text-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">
                                        {antrian.position || index + 1}
                                      </span>
                                      {antrian.mahasiswa_nim}
                                    </span>
                                    {renderStatusBadge(antrian.status_antrian)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Modal Konfirmasi Ambil Antrian */}
      {isModalOpen && selectedJadwal && (
        <div className="fixed inset-0 bg-none bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fadeIn overflow-hidden flex flex-col" style={{ maxHeight: '85vh' }}>
            {/* Header Modal - Tetap Fixed */}
            <div className="bg-blue-600 text-white px-5 py-3 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Ambil Antrian Bimbingan
              </h3>
              <button 
                onClick={closeModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Content area - Scrollable */}
            <div className="p-5 overflow-y-auto flex-1">
              {/* Detail Jadwal - Lebih Compact */}
              <div className="space-y-4 mb-5">
                <div className="flex items-center gap-3">
                  <Calendar className="text-blue-600 shrink-0" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Tanggal</p>
                    <p className="font-medium text-gray-800">{formatDate(selectedJadwal.tanggal)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="text-blue-600 shrink-0" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Waktu</p>
                    <p className="font-medium text-gray-800">
                      {formatTime(selectedJadwal.waktu_mulai)} - {formatTime(selectedJadwal.waktu_selesai)} WIB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="text-blue-600 shrink-0" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Dosen</p>
                    <p className="font-medium text-gray-800">
                      {selectedDosenInfo?.dosenRole} ({selectedDosenInfo?.dosenAlias})
                    </p>
                  </div>
                </div>
                
                {selectedJadwal.lokasi && (
                  <div className="flex items-center gap-3">
                    <MapPin className="text-blue-600 shrink-0" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Lokasi</p>
                      <p className="font-medium text-gray-800">{selectedJadwal.lokasi}</p>
                    </div>
                  </div>
                )}
                
                {selectedJadwal.keterangan && (
                  <div className="flex items-start gap-3">
                    <FileText className="text-blue-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Keterangan</p>
                      <p className="font-medium text-gray-800">{selectedJadwal.keterangan}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Upload File Section - Simplified */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Upload File Bimbingan (Opsional)</h4>
                
                <div className="bg-gray-50 rounded p-3 border border-gray-200">
                  <label className="block w-full">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="block w-full text-sm text-gray-500
                        file:mr-3 file:py-1.5 file:px-3
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </label>
                  
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-100 flex items-center">
                      <FileText size={14} className="text-blue-600 mr-2" />
                      <div className="flex-1 truncate">
                        <p className="text-xs font-medium text-blue-700 truncate">{getFileName()}</p>
                        <p className="text-xs text-blue-600">{getFileSize()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Confirmation Note */}
              <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4">
                <p className="text-xs text-blue-800 flex items-start">
                  <Check size={14} className="shrink-0 mr-1.5 mt-0.5 text-blue-600" />
                  Pastikan Anda siap mengikuti bimbingan pada jadwal yang dipilih.
                </p>
              </div>
            </div>
            
            {/* Fixed Footer with Actions */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDaftarAntrian}
                  disabled={submitting}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>Mendaftar...</>
                  ) : (
                    <>
                      <Upload size={15} className="mr-1.5" /> 
                      Ambil Antrian
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Antrian Saya */}
      {isDetailModalOpen && selectedAntrianDetail && (
        <div className="fixed inset-0 bg-none bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fadeIn overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center">
                <Bell size={20} className="mr-2" /> Detail Antrian Saya
              </h3>
              <button 
                onClick={closeDetailModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Status Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status Antrian</p>
                  <div className="flex items-center">
                    {renderStatusBadge(selectedAntrianDetail.status_antrian)}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Posisi Antrian</p>
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      #{selectedAntrianDetail.position || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detail Section */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="mr-2 text-blue-600" size={18} /> 
                Detail Jadwal Bimbingan
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Tanggal</p>
                    <p className="font-medium text-gray-800">{formatDate(selectedAntrianDetail.jadwal.tanggal)}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Waktu</p>
                    <p className="font-medium text-gray-800">
                      {formatTime(selectedAntrianDetail.jadwal.waktu_mulai)} - {formatTime(selectedAntrianDetail.jadwal.waktu_selesai)} WIB
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Dosen</p>
                    <p className="font-medium text-gray-800">
                      {selectedAntrianDetail.dosenInfo.dosenRole} ({selectedAntrianDetail.dosenInfo.dosenAlias})
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Lokasi</p>
                    <p className="font-medium text-gray-800">{selectedAntrianDetail.jadwal.lokasi || "-"}</p>
                  </div>
                </div>
              </div>
              
              {selectedAntrianDetail.jadwal.keterangan && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Keterangan</p>
                  <p className="font-medium text-gray-800">{selectedAntrianDetail.jadwal.keterangan}</p>
                </div>
              )}
            </div>
            
            {/* File Section */}
            {selectedAntrianDetail.files && (
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <FileCheck className="mr-2 text-blue-600" size={18} /> 
                  File Bimbingan
                </h4>
                
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText size={16} className="text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-700 truncate max-w-[200px]">
                        {selectedAntrianDetail.files.filename}
                      </p>
                    </div>
                  </div>
                  
                  <a 
                    href={selectedAntrianDetail.files.file_url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs flex items-center"
                  >
                    <Download size={14} className="mr-1" />
                    Download
                  </a>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="p-6">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Ubah Status Antrian</h4>
              
              <div className="flex flex-wrap gap-3">
                {selectedAntrianDetail.status_antrian === "Menunggu" && (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleUpdateAntrianStatus(selectedAntrianDetail.id_antrian)}
                    disabled={processingAntrian}
                  >
                    {processingAntrian && processingAntrianId === selectedAntrianDetail.id_antrian ? (
                      "Memproses..."
                    ) : (
                      <>
                        <Play size={16} /> Mulai Bimbingan
                      </>
                    )}
                  </button>
                )}
                
                {selectedAntrianDetail.status_antrian === "Dalam Bimbingan" && (
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleUpdateAntrianStatus(selectedAntrianDetail.id_antrian)}
                    disabled={processingAntrian}
                  >
                    {processingAntrian && processingAntrianId === selectedAntrianDetail.id_antrian ? (
                      "Memproses..."
                    ) : (
                      <>
                        <CheckCircle size={16} /> Selesai Bimbingan
                      </>
                    )}
                  </button>
                )}
                
                {selectedAntrianDetail.status_antrian === "Selesai" && (
                  <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2">
                    <CheckCircle size={16} /> Antrian telah selesai
                  </div>
                )}
                
                <button
                  className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ml-auto"
                  onClick={closeDetailModal}
                >
                  <X size={16} /> Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JadwalBimbinganMahasiswa;