import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, UserCheck, FileText, Clock, BarChart2, 
  CheckCircle, AlertTriangle, UploadCloud 
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    mahasiswa: { total: 0, loading: true },
    dosen: { total: 0, active: 0, loading: true },
    layanan: { total: 0, active: 0, loading: true },
    pengajuan: { total: 0, pending: 0, processed: 0, completed: 0, rejected: 0, loading: true }
  });
  
  const [recentRequests, setRecentRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const getToken = () => {
    const authData = localStorage.getItem("auth");
    return authData ? JSON.parse(authData).token : null;
  };

  useEffect(() => {
    const fetchStats = async () => {
      const token = getToken();
      if (!token) return;

      try {
        // Fetch mahasiswa stats
        const mahasiswaRes = await axios.get("https://http://13.236.194.123/mahasiswa/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch dosen stats
        const dosenRes = await axios.get("https://http://13.236.194.123/dosen/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch layanan stats
        const layananRes = await axios.get("https://http://13.236.194.123/layanan/jenis", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch pengajuan stats
        const pengajuanRes = await axios.get("https://http://13.236.194.123/layanan/pengajuan/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Calculate stats
        const activeDosenCount = dosenRes.data.filter(d => 
          d.status_kehadiran === "hadir" && d.ketersediaan_bimbingan).length;
        
        const activeLayananCount = layananRes.data.filter(l => l.is_aktif).length;
        
        const pendingCount = pengajuanRes.data.filter(p => p.status === "Menunggu").length;
        const processedCount = pengajuanRes.data.filter(p => p.status === "Diproses").length;
        const completedCount = pengajuanRes.data.filter(p => p.status === "Selesai").length;
        const rejectedCount = pengajuanRes.data.filter(p => p.status === "Tolak").length;
        
        // Get recent requests
        const recent = [...pengajuanRes.data]
          .sort((a, b) => new Date(b.lampiran[0]?.uploaded_at || 0) - new Date(a.lampiran[0]?.uploaded_at || 0))
          .slice(0, 5);
          
        setStats({
          mahasiswa: { 
            total: mahasiswaRes.data.length, 
            loading: false 
          },
          dosen: { 
            total: dosenRes.data.length, 
            active: activeDosenCount,
            loading: false 
          },
          layanan: { 
            total: layananRes.data.length,
            active: activeLayananCount,
            loading: false 
          },
          pengajuan: { 
            total: pengajuanRes.data.length,
            pending: pendingCount,
            processed: processedCount,
            completed: completedCount,
            rejected: rejectedCount,
            loading: false 
          }
        });
        
        setRecentRequests(recent);
        setRequestsLoading(false);
        
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };
    
    fetchStats();
  }, []);
  
  // Function to get student names for display
  const getStudentName = async (nim) => {
    try {
      const token = getToken();
      const response = await axios.get(`https://http://13.236.194.123/mahasiswa/${nim}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.nama;
    } catch {
      return nim;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Admin</h1>
        <p className="text-sm text-slate-500">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Mahasiswa Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="bg-blue-100 rounded-full p-3">
            <Users className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Jumlah Mahasiswa</p>
            {stats.mahasiswa.loading ? (
              <div className="h-7 w-12 bg-slate-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-slate-800">{stats.mahasiswa.total}</p>
            )}
          </div>
        </div>
        
        {/* Dosen Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="bg-purple-100 rounded-full p-3">
            <UserCheck className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Dosen Aktif</p>
            {stats.dosen.loading ? (
              <div className="h-7 w-12 bg-slate-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-slate-800">
                {stats.dosen.active} <span className="text-sm text-slate-400 font-normal">/ {stats.dosen.total}</span>
              </p>
            )}
          </div>
        </div>
        
        {/* Layanan Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="bg-green-100 rounded-full p-3">
            <FileText className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Layanan Tersedia</p>
            {stats.layanan.loading ? (
              <div className="h-7 w-12 bg-slate-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-slate-800">
                {stats.layanan.active} <span className="text-sm text-slate-400 font-normal">/ {stats.layanan.total}</span>
              </p>
            )}
          </div>
        </div>
        
        {/* Pengajuan Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="bg-amber-100 rounded-full p-3">
            <Clock className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pengajuan Menunggu</p>
            {stats.pengajuan.loading ? (
              <div className="h-7 w-12 bg-slate-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-slate-800">
                {stats.pengajuan.pending} <span className="text-sm text-slate-400 font-normal">/ {stats.pengajuan.total}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status Distribution & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              Distribusi Status Pengajuan
            </h2>
          </div>
          
          {stats.pengajuan.loading ? (
            <div className="h-52 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Waiting */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium flex items-center">
                    <Clock className="w-4 h-4 text-yellow-500 mr-2" />
                    Menunggu
                  </span>
                  <span className="text-slate-500">{stats.pengajuan.pending} pengajuan</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ 
                    width: `${stats.pengajuan.total ? (stats.pengajuan.pending / stats.pengajuan.total) * 100 : 0}%` 
                  }}></div>
                </div>
              </div>
              
              {/* In Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium flex items-center">
                    <UploadCloud className="w-4 h-4 text-blue-500 mr-2" />
                    Diproses
                  </span>
                  <span className="text-slate-500">{stats.pengajuan.processed} pengajuan</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ 
                    width: `${stats.pengajuan.total ? (stats.pengajuan.processed / stats.pengajuan.total) * 100 : 0}%` 
                  }}></div>
                </div>
              </div>
              
              {/* Completed */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Selesai
                  </span>
                  <span className="text-slate-500">{stats.pengajuan.completed} pengajuan</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ 
                    width: `${stats.pengajuan.total ? (stats.pengajuan.completed / stats.pengajuan.total) * 100 : 0}%` 
                  }}></div>
                </div>
              </div>
              
              {/* Rejected */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                    Ditolak
                  </span>
                  <span className="text-slate-500">{stats.pengajuan.rejected} pengajuan</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-red-500 h-2.5 rounded-full" style={{ 
                    width: `${stats.pengajuan.total ? (stats.pengajuan.rejected / stats.pengajuan.total) * 100 : 0}%` 
                  }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Recent Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Pengajuan Terbaru
            </h2>
            <a href="/admin/pelayanan" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Lihat Semua
            </a>
          </div>
          
          {requestsLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border border-slate-100 rounded-lg p-4 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-5 bg-slate-200 rounded w-2/5"></div>
                    <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mt-3"></div>
                </div>
              ))}
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>Belum ada pengajuan layanan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="border border-slate-100 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-slate-800">{request.mahasiswa_nim}</h3>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      request.status === 'Menunggu' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'Diproses' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {request.lampiran && request.lampiran[0] && (
                      <span>
                        Upload: {new Date(request.lampiran[0].uploaded_at).toLocaleDateString('id-ID')}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
