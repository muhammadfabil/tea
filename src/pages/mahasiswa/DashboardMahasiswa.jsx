import React, { useState, useEffect } from "react";
import { 
  FaUsers, FaCalendarAlt, FaFileAlt, FaCheckCircle, FaExclamationTriangle, 
  FaClock, FaUserGraduate, FaBookmark, FaExternalLinkAlt, FaUser, FaBell
} from "react-icons/fa";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

// Konversi Base64 URL ke Uint8Array
function base64UrlToUint8Array(base64Url) {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Animated counter component
const AnimatedCounter = ({ value, duration = 1.5 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{count}</>;
};

const DashboardMahasiswa = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [jadwalBimbingan, setJadwalBimbingan] = useState([]);
  const [statusPelayanan, setStatusPelayanan] = useState([]);
  const [relasiDosen, setRelasiDosen] = useState([]);
  const [antrianBimbingan, setAntrianBimbingan] = useState([]);
  const [mahasiswaData, setMahasiswaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jenisLayanan, setJenisLayanan] = useState({});


  const API = import.meta.env.VITE_API_BASE_URL;

  const getAuthData = () => {
    try {
      return JSON.parse(localStorage.getItem("auth"));
    } catch (error) {
      console.error("Error parsing auth data:", error);
      return null;
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const authData = getAuthData();
      const nim = authData?.user?.profile?.nim;
      const token = authData?.token;
      
      if (!nim || !token) {
        toast.error("Gagal memuat data. Silakan login ulang.");
        return;
      }

      setMahasiswaData({
        nim: nim,
        nama: authData?.user?.profile?.name || "Mahasiswa",
        prodi: authData?.user?.profile?.prodi || "Teknik Informatika"
      });

      // Fetch semua data secara paralel
      const [jadwalData, pelayananData, dosenData, antrianData, jenisLayananData] = await Promise.all([
        // Fetch Jadwal Bimbingan
        fetch(`${API}/relation/mahasiswa/${nim}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.json()),
        
        // Fetch Status Pelayanan
        fetch(`${API}/layanan/pengajuan/${nim}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.json()),
        
        // Fetch Relasi Dosen
        fetch(`${API}/dosen/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.json()),
        
        // Fetch Antrian Bimbingan
        fetch(`${API}/antrian/mahasiswa/${nim}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.json()).catch(() => []),
        
        // Fetch Jenis Layanan
        fetch(`${API}/layanan/jenis`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.json()).catch(() => [])
      ]);

      setJadwalBimbingan(jadwalData);
      // Sort pengajuan layanan dari terbaru ke terlama
      if (Array.isArray(pelayananData)) {
        // Sort by most recent submission date, using the same logic as in StatusPelayanan.jsx
        setStatusPelayanan(pelayananData.sort((a, b) => {
          const dateA = new Date(a.lampiran?.[0]?.uploaded_at || a.created_at || 0);
          const dateB = new Date(b.lampiran?.[0]?.uploaded_at || b.created_at || 0);
          return dateB - dateA; // Descending order (newest first)
        }));
      } else {
        setStatusPelayanan([]);
      }
      setRelasiDosen(dosenData);
      setAntrianBimbingan(antrianData);
      
      // Konversi array jenis layanan menjadi objek dengan id sebagai key
      const jenisLayananObject = {};
      if (Array.isArray(jenisLayananData)) {
        jenisLayananData.forEach(jenis => {
          jenisLayananObject[jenis.id] = jenis.nama_layanan;
        });
      }
      setJenisLayanan(jenisLayananObject);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const subscribeToPushNotifications = async () => {
    try {
      const authData = getAuthData();
      if (!authData) return;

      const { token } = authData;

      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Notification permission result:', permission);
      if (permission !== 'granted') {
        console.error('Notification permission denied');
        return;
      }

      console.log('Waiting for Service Worker...');
      const swRegistration = await navigator.serviceWorker.ready;
      console.log('Service Worker is ready:', swRegistration);

      let subscription = await swRegistration.pushManager.getSubscription();

      if (!subscription) {
        console.log('Fetching VAPID public key...');
        const response = await fetch(`${API}/wp/vapid-public-key`);
        if (!response.ok) {
          throw new Error(`VAPID public key request failed: ${response.status}`);
        }
        const { publicKey } = await response.json();
        console.log('Received public key:', publicKey);

        // Konversi kunci publik VAPID ke Uint8Array
        const applicationServerKey = base64UrlToUint8Array(publicKey);

        console.log('Subscribing to push manager...');
        subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        console.log('New subscription created:', subscription);
      } else {
        console.log('Already have a subscription:', subscription);
      }

      // Kirim subscription ke server
      console.log('Sending subscription to server...');
      const pushResponse = await fetch(`${API}/wp/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys.p256dh,
            auth: subscription.toJSON().keys.auth,
          },
        }),
      });

      if (!pushResponse.ok) {
        throw new Error(`Push subscribe failed: ${pushResponse.status}`);
      }

      console.log('Subscription successfully sent to server.');
      setIsSubscribed(true);
      toast.success("Notifikasi berhasil diaktifkan!");

    } catch (error) {
      console.error('Error during subscription process:', error);
      toast.error("Gagal mengaktifkan notifikasi");
    }
  };

  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Format tanggal dan waktu
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Status badge
  const getStatusBadge = (status) => {
    let bgColor, textColor, icon;
    
    switch(status) {
      case "Menunggu":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        icon = <FaClock size={12} className="mr-1" />;
        break;
      case "Diproses":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        icon = <FaClock size={12} className="mr-1" />;
        break;
      case "Selesai":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        icon = <FaCheckCircle size={12} className="mr-1" />;
        break;
      case "Ditolak":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        icon = <FaExclamationTriangle size={12} className="mr-1" />;
        break;
      default:
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
        icon = <FaClock size={12} className="mr-1" />;
        break;
    }
    
    return (
      <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {icon} {status}
      </span>
    );
  };

  const refreshData = () => {
    fetchDashboardData();
    toast.info("Menyegarkan data dashboard...");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      {/* Header section with profile overview and refresh button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-blue-600 p-3 rounded-full text-white mr-4">
              <FaUser size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{mahasiswaData?.nama || "Mahasiswa"}</h1>
              <p className="text-gray-500 flex items-center">
                <FaUserGraduate size={16} className="mr-1" /> 
                {mahasiswaData?.nim} • {mahasiswaData?.prodi}
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-2 items-end">
            <div className="text-sm text-gray-500 mb-2 text-right">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshData}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                title="Refresh data"
              >
                <FaCalendarAlt size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={subscribeToPushNotifications}
                disabled={isSubscribed}
                className={`flex items-center px-4 py-2 rounded-lg ${isSubscribed ? "bg-gray-200 text-gray-600" : "bg-blue-600 hover:bg-blue-700 text-white"} transition`}
              >
                <FaBell size={16} className="mr-2" />
                {isSubscribed ? "Notifikasi Aktif" : "Aktifkan Notifikasi"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistik Utama */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
      >
        {/* Jadwal Bimbingan */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-blue-100 rounded-full p-3"
            >
              <FaCalendarAlt className="w-7 h-7 text-blue-600" />
            </motion.div>
            <Link to="/mahasiswa/pilih-jadwal" className="text-blue-600 text-sm hover:underline flex items-center">
              Lihat Jadwal <FaExternalLinkAlt size={12} className="ml-1" />
            </Link>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Jadwal Bimbingan</h2>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            <AnimatedCounter value={jadwalBimbingan.length} />
          </p>
          <p className="text-sm text-gray-500">Total relasi pembimbing</p>
        </motion.div>

        {/* Status Pelayanan */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-green-100 rounded-full p-3"
            >
              <FaFileAlt className="w-7 h-7 text-green-600" />
            </motion.div>
            <Link to="/mahasiswa/status-pelayanan" className="text-green-600 text-sm hover:underline flex items-center">
              Lihat Pelayanan <FaExternalLinkAlt size={12} className="ml-1" />
            </Link>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Status Pelayanan</h2>
          <p className="text-3xl font-bold text-green-600 mb-2">
            <AnimatedCounter value={statusPelayanan.length} />
          </p>
          <p className="text-sm text-gray-500">Total pengajuan layanan</p>
        </motion.div>

        {/* Relasi Dosen */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-purple-100 rounded-full p-3"
            >
              <FaUsers className="w-7 h-7 text-purple-600" />
            </motion.div>
            <Link to="/mahasiswa/isi-data-dosen" className="text-purple-600 text-sm hover:underline flex items-center">
              Kelola Relasi <FaExternalLinkAlt size={12} className="ml-1" />
            </Link>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Relasi Dosen</h2>
          <p className="text-3xl font-bold text-purple-600 mb-2">
            <AnimatedCounter value={jadwalBimbingan.length} />
          </p>
          <p className="text-sm text-gray-500">Dosen yang berelasi</p>
        </motion.div>
      </motion.div>

      {/* Other content sections */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Relasi Dosen */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaUsers className="w-5 h-5 text-purple-600 mr-2" />
                Relasi Dosen
              </h2>
              <Link 
                to="/mahasiswa/isi-data-dosen"
                className="text-sm bg-purple-50 text-purple-600 px-3 py-1 rounded-lg hover:bg-purple-100 transition"
              >
                Kelola
              </Link>
            </div>
            
            {jadwalBimbingan.length > 0 ? (
              <div className="space-y-4">
                {jadwalBimbingan.map((jadwal, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-full mr-3">
                          <FaUser className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{jadwal.dosen_alias}</p>
                          <div className="mt-1 inline-block px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                            {jadwal.role}
                          </div>
                        </div>
                      </div>
                      <Link 
                        to="/mahasiswa/pilih-jadwal" 
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                      >
                        Lihat Jadwal
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-700 font-medium mb-1">Belum Ada Relasi Dosen</h3>
                <p className="text-gray-500 max-w-xs mx-auto mb-4">
                  Tambahkan relasi dosen untuk dapat mengikuti bimbingan
                </p>
                <Link 
                  to="/mahasiswa/isi-data-dosen"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                >
                  <FaUsers size={16} className="mr-2" />
                  Tambah Relasi Dosen
                </Link>
              </div>
            )}
          </div>

          {/* Status Pelayanan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaFileAlt className="w-5 h-5 text-green-600 mr-2" />
                Pengajuan Layanan Terbaru
              </h2>
              <Link 
                to="/mahasiswa/ajukan-pelayanan"
                className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded-lg hover:bg-green-100 transition"
              >
                Ajukan
              </Link>
            </div>
            
            {statusPelayanan.length > 0 ? (
              <div className="space-y-4">
                {/* Only take the first 3 items from the already sorted array */}
                {statusPelayanan.slice(0, 3).map((pelayanan, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800 truncate max-w-[200px]">
                        {jenisLayanan[pelayanan.jenis_layanan_id] || `Layanan #${pelayanan.jenis_layanan_id}`}
                      </p>
                      {getStatusBadge(pelayanan.status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(pelayanan.lampiran?.[0]?.uploaded_at || pelayanan.created_at)}
                    </p>
                  </div>
                ))}
                
                {statusPelayanan.length > 3 && (
                  <Link 
                    to="/mahasiswa/status-pelayanan"
                    className="block text-center text-sm text-green-600 hover:bg-green-50 py-2 border rounded-lg transition-all duration-200"
                  >
                    Lihat {statusPelayanan.length - 3} layanan lainnya
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FaFileAlt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-700 font-medium mb-1">Belum Ada Pengajuan</h3>
                <p className="text-gray-500 max-w-xs mx-auto mb-4">
                  Anda belum mengajukan layanan administrasi
                </p>
                <Link 
                  to="/mahasiswa/ajukan-pelayanan"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition"
                >
                  <FaFileAlt size={16} className="mr-2" />
                  Ajukan Pelayanan
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DashboardMahasiswa;
