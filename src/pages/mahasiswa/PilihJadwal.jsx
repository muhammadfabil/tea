import React, { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Calendar, Clock, MapPin, FileText, Users, X, Upload, Check, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const JadwalBimbinganMahasiswa = () => {
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
  
  // State untuk modal konfirmasi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [selectedDosenInfo, setSelectedDosenInfo] = useState(null);

  // Fungsi untuk update status antrian secara real-time
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
          }
        }
      }
      
      return newState;
    });
  }, []);

  // Setup WebSocket connection
    // Setup WebSocket connection
    useEffect(() => {
      if (!nimMahasiswa) return;
      
      const authData = localStorage.getItem("auth");
      const token = authData ? JSON.parse(authData).token : null;

      
      if (!token) return;
      
      // Create WebSocket connection with correct endpoint
      socketRef.current = new WebSocket(`ws://localhost:8000/ws?token=${token}`);
      
      // Connection opened
      socketRef.current.addEventListener('open', (event) => {
        console.log('✅ WebSocket connected');
        setSocketConnected(true);
      });
      
      // Listen for messages
      socketRef.current.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different event types
          switch (data.event) {
            case 'update_antrian':
              updateAntrianStatus(data);
              // Show notification if user is in the queue that was updated
              const isUserInQueue = data.queue.some(q => q.nim === nimMahasiswa);
              if (isUserInQueue) {
                const status = data.queue.find(q => q.nim === nimMahasiswa).status;
                toast.info(`Status antrian Anda telah diperbarui menjadi: ${status}`);
              }
              break;
            default:
              console.log('Received unknown event:', data.event);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      });
      
      // Connection closed or error
      socketRef.current.addEventListener('close', (event) => {
        console.log('❌ WebSocket connection closed');
        setSocketConnected(false);
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (socketRef.current?.readyState === WebSocket.CLOSED) {
            console.log('🔄 Attempting to reconnect WebSocket...');
            // Recursively call this effect to attempt reconnection
            socketRef.current = null;
          }
        }, 5000);
      });
      
      socketRef.current.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        setSocketConnected(false);
      });
      
      // Clean up on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
      };
    }, [nimMahasiswa, updateAntrianStatus]);

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
        const relationResponse = await fetch(`http://127.0.0.1:8000/relation/mahasiswa/${nim}`);
        
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
              const scheduleResponse = await fetch(`http://127.0.0.1:8000/waktu_bimbingan/dosen/${relation.dosen_alias}`);
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

  const handleDaftarAntrian = async () => {
    if (submitting || !selectedJadwal) return;
    
    setSubmitting(true);
    
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      const token = auth?.token;
      
      if (!token) {
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
      
      const response = await fetch(`http://127.0.0.1:8000/antrian/?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData // Hanya berisi file
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
      case "Sedang Bimbingan":
      case "Dalam Bimbingan":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        icon = <Clock className="shrink-0 mr-1" size={12} />;
        break;
      case "Selesai":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        icon = <Check className="shrink-0 mr-1" size={12} />;
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

  if (loading) return <div className="p-4 text-center">Memuat jadwal bimbingan...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Jadwal Bimbingan</h1>
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
      
      {jadwalByDosen.length === 0 ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          Belum ada relasi dosen pembimbing yang terdaftar.
        </div>
      ) : (
        <div className="space-y-8">
          {jadwalByDosen.map((dosenData, idx) => (
            <div key={idx} className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 text-white px-4 py-3">
                <h2 className="text-lg font-semibold">{dosenData.dosenRole} ({dosenData.dosenAlias})</h2>
              </div>
              
              {dosenData.error ? (
                <div className="p-4 text-red-500">
                  Gagal memuat jadwal: {dosenData.error}
                </div>
              ) : dosenData.jadwalList.length === 0 ? (
                <div className="p-4 text-gray-500 italic">
                  Belum ada jadwal bimbingan yang dibuat oleh dosen ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {dosenData.jadwalList.map((jadwal) => (
                    <div key={jadwal.bimbingan_id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="mb-3">
                        <h3 className="font-semibold text-blue-700">Jadwal #{jadwal.bimbingan_id}</h3>
                        <p className="text-sm text-gray-600">{formatDate(jadwal.tanggal)}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-xs text-gray-500">Waktu Mulai</p>
                          <p className="font-medium">{formatTime(jadwal.waktu_mulai)} WIB</p>
                        </div>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-xs text-gray-500">Waktu Selesai</p>
                          <p className="font-medium">{formatTime(jadwal.waktu_selesai)} WIB</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs text-gray-500">Status Kuota</p>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                            {jadwal.antrian_bimbingan?.length || 0}/{jadwal.jumlah_antrian} Slot
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${((jadwal.antrian_bimbingan?.length || 0) / jadwal.jumlah_antrian) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Lokasi */}
                      {jadwal.lokasi && (
                        <div className="mb-3 text-sm flex items-start">
                          <MapPin size={16} className="text-gray-500 mr-1 mt-0.5" />
                          <span className="text-gray-700">{jadwal.lokasi}</span>
                        </div>
                      )}
                      
                      {/* Keterangan */}
                      {jadwal.keterangan && (
                        <div className="mb-3 text-sm flex items-start">
                          <FileText size={16} className="text-gray-500 mr-1 mt-0.5" />
                          <span className="text-gray-700">{jadwal.keterangan}</span>
                        </div>
                      )}
                      
                      {isInQueue(jadwal) ? (
                        <div className="bg-green-100 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
                          <Check size={16} className="inline mr-1" /> Anda sudah terdaftar dalam antrian ini
                        </div>
                      ) : (
                        (jadwal.antrian_bimbingan?.length || 0) < jadwal.jumlah_antrian && (
                          <button 
                            onClick={() => openConfirmationModal(jadwal, dosenData)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition duration-200 flex items-center justify-center"
                          >
                            <Users size={16} className="mr-2" />
                            Ambil Antrian Bimbingan
                          </button>
                        )
                      )}
                      
                      {jadwal.antrian_bimbingan?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Daftar Antrian ({jadwal.antrian_bimbingan.length})</p>
                          <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                            {jadwal.antrian_bimbingan.map((antrian, index) => (
                              <li key={antrian.id_antrian || index} className={`py-1 px-2 rounded ${antrian.mahasiswa_nim === nimMahasiswa ? 'bg-blue-50 border border-blue-100' : ''}`}>
                                <div className="flex justify-between items-center">
                                  <span>{antrian.position || index + 1}. {antrian.mahasiswa_nim}</span>
                                  {renderStatusBadge(antrian.status_antrian)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Konfirmasi Ambil Antrian - LEBIH KOMPAK DAN DENGAN SCROLL INTERNAL */}
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
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center disabled:bg-blue-400 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default JadwalBimbinganMahasiswa;