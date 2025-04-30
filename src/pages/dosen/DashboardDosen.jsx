import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  Calendar, Users, Clock, FileText, ChevronRight, 
  AlertCircle, User, BookOpen, CheckCircle2, 
  Activity, MapPin
} from "lucide-react";

const DashboardDosen = () => {
  const [stats, setStats] = useState({
    jadwalCount: 0,
    mahasiswaCount: 0,
    antrianCount: 0,
    loading: true
  });
  const [userData, setUserData] = useState(null);
  const [recentJadwal, setRecentJadwal] = useState([]);
  const [recentMahasiswa, setRecentMahasiswa] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authData = localStorage.getItem("auth");
    if (authData) {
      try {
        const parsedData = JSON.parse(authData);
        setUserData(parsedData);

        if (parsedData.user?.profile?.alias) {
          fetchData(parsedData.user.profile.alias, parsedData.token);
        }
      } catch (error) {
        console.error("Error parsing auth data:", error);
      }
    }
  }, []);

  const fetchData = async (alias, token) => {
    try {
      setLoading(true);
      
      // Fetch jadwal bimbingan
      const jadwalResponse = await axios.get(
        `http://127.0.0.1:8000/waktu_bimbingan/dosen/${alias}`, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Fetch mahasiswa
      const mahasiswaResponse = await axios.get(
        `http://127.0.0.1:8000/relation/dosen/${alias}`, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Calculate statistics
      const jadwalData = jadwalResponse.data || [];
      const mahasiswaData = mahasiswaResponse.data["Daftar Mahasiswa"] || [];
      
      // Count all antrian from all jadwal
      let totalAntrian = 0;
      jadwalData.forEach(jadwal => {
        totalAntrian += jadwal.antrian_bimbingan?.length || 0;
      });
      
      setStats({
        jadwalCount: jadwalData.length,
        mahasiswaCount: mahasiswaData.length,
        antrianCount: totalAntrian,
        loading: false
      });
      
      // Get recent jadwal (sort by most recent date)
      const sortedJadwal = [...jadwalData].sort((a, b) => 
        new Date(b.tanggal) - new Date(a.tanggal)
      ).slice(0, 3);
      
      setRecentJadwal(sortedJadwal);
      
      // Get recent mahasiswa (just take first 3)
      setRecentMahasiswa(mahasiswaData.slice(0, 3));
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return "";
    // Format HH:MM:SS to HH:MM
    return timeString.substring(0, 5);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Selamat Datang, {userData?.user?.profile?.name || "Dosen"}
        </h1>
        <p className="text-slate-500">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-blue-100 rounded-full p-3">
            <Calendar className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Jadwal Bimbingan</p>
            {stats.loading ? (
              <div className="h-7 w-12 bg-slate-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-slate-800">{stats.jadwalCount}</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-purple-100 rounded-full p-3">
            <Users className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Mahasiswa Bimbingan</p>
            {stats.loading ? (
              <div className="h-7 w-12 bg-slate-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-slate-800">{stats.mahasiswaCount}</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-amber-100 rounded-full p-3">
            <Activity className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Antrian</p>
            {stats.loading ? (
              <div className="h-7 w-12 bg-slate-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-slate-800">{stats.antrianCount}</p>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Schedules */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Jadwal Terbaru
            </h2>
            <Link to="/dosen/kelola-jadwal" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-slate-100 rounded-lg p-4 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-5 bg-slate-200 rounded w-2/5"></div>
                    <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mt-3"></div>
                </div>
              ))}
            </div>
          ) : recentJadwal.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>Belum ada jadwal bimbingan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJadwal.map((jadwal) => (
                <div key={jadwal.bimbingan_id} className="border border-slate-100 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-slate-800">{formatDate(jadwal.tanggal)}</h3>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      jadwal.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {jadwal.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(jadwal.waktu_mulai)} - {formatTime(jadwal.waktu_selesai)} WIB</span>
                  </div>
                  {jadwal.lokasi && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{jadwal.lokasi}</span>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>
                        <span className="font-medium">{jadwal.antrian_bimbingan?.length || 0}</span>/{jadwal.jumlah_antrian} Mahasiswa
                      </span>
                    </div>
                    <Link 
                      to={`/dosen/kelola-jadwal?id=${jadwal.bimbingan_id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Students */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Mahasiswa Bimbingan
            </h2>
            <Link to="/dosen/daftar-mahasiswa" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-slate-100 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentMahasiswa.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>Belum ada mahasiswa bimbingan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMahasiswa.map((mhs) => (
                <div key={mhs.nim} className="border border-slate-100 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800">{mhs.nama}</h3>
                      <p className="text-sm text-slate-500">{mhs.nim}</p>
                    </div>
                    <div className="ml-auto">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        mhs.role.includes("Pembimbing") 
                          ? "bg-blue-100 text-blue-800" 
                          : mhs.role.includes("Penguji") 
                          ? "bg-purple-100 text-purple-800"
                          : mhs.role.includes("Wali")
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {mhs.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Link 
          to="/dosen/kelola-jadwal"
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl p-5 shadow-sm flex items-center gap-3 transition-all hover:shadow-md"
        >
          <Calendar className="w-6 h-6" />
          <span className="font-medium">Kelola Jadwal Bimbingan</span>
        </Link>
        
        <Link 
          to="/dosen/daftar-mahasiswa"
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl p-5 shadow-sm flex items-center gap-3 transition-all hover:shadow-md"
        >
          <Users className="w-6 h-6" />
          <span className="font-medium">Lihat Daftar Mahasiswa</span>
        </Link>
        
        <div className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl p-5 shadow-sm flex items-center gap-3 transition-all hover:shadow-md cursor-pointer">
          <CheckCircle2 className="w-6 h-6" />
          <span className="font-medium">Lihat Status Bimbingan</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardDosen;