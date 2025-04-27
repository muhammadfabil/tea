import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FileText, FileCheck, CircleCheck, Clock, Info, Calendar, MessageSquare, File } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const StatusPelayanan = () => {
  const [pengajuanList, setPengajuanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mahasiswaNama, setMahasiswaNama] = useState({});

  useEffect(() => {
    fetchPengajuanData();
  }, []);

  const getAuthData = () => {
    const authData = JSON.parse(localStorage.getItem("auth"));
    return {
      token: authData?.token,
      nim: authData?.user?.profile?.nim,
      name: authData?.user?.profile?.name
    };
  };

  const fetchMahasiswaName = async (nim) => {
    const { token } = getAuthData();
    try {
      const response = await axios.get(`http://127.0.0.1:8000/mahasiswa/${nim}`, {
        headers: { Authorization: `Bearer ${token}` },
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
      const { token, nim } = getAuthData();
      
      if (!nim) {
        toast.error("Data mahasiswa tidak ditemukan");
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://127.0.0.1:8000/layanan/pengajuan/${nim}`, {
        headers: { Authorization: `Bearer ${token}` },
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
    setSelectedPengajuan(null);
  };

  const getStatusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1";
    switch (status) {
      case "Menunggu":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-700`}>
            <Clock className="w-3 h-3" /> {status}
          </span>
        );
      case "Diproses":
        return (
          <span className={`${base} bg-blue-100 text-blue-700`}>
            <FileCheck className="w-3 h-3" /> {status}
          </span>
        );
      case "Selesai":
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            <CircleCheck className="w-3 h-3" /> {status}
          </span>
        );
      case "Ditolak":
        return (
          <span className={`${base} bg-red-100 text-red-700`}>
            <FileCheck className="w-3 h-3" /> {status}
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-700`}>
            <Info className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getJenisLayananName = (id) => {
    const jenisLayanan = {
      1: "Surat Keterangan Aktif",
      2: "Transkrip Nilai",
      3: "Legalisir Ijazah",
      4: "Surat Rekomendasi",
      5: "Surat Keterangan Lulus"
      // Tambahkan jenis layanan lainnya sesuai kebutuhan
    };
    
    return jenisLayanan[id] || `Layanan #${id}`;
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-white text-gray-800">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">
        Status Pengajuan Layanan
      </h1>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Memuat data pengajuan...</p>
        </div>
      ) : pengajuanList.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {pengajuanList.map((pengajuan) => (
            <div
              key={pengajuan.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-5 flex flex-col transition duration-300 hover:shadow-lg"
            >
              <div className="mb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{getJenisLayananName(pengajuan.jenis_layanan_id)}</h3>
                  <p className="text-sm text-gray-500">
                    {mahasiswaNama[pengajuan.mahasiswa_nim] || pengajuan.mahasiswa_nim}
                  </p>
                </div>
                {getStatusBadge(pengajuan.status)}
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <FileText className="w-4 h-4" />
                  <span>Lampiran: {pengajuan.lampiran?.length || 0}</span>
                </div>
                
                {pengajuan.lampiran && pengajuan.lampiran.length > 0 && (
                  <div className="mt-2 text-sm">
                    <div className="flex items-center gap-1 text-blue-600 hover:underline">
                      <File className="w-4 h-4" />
                      <span className="truncate max-w-xs">
                        {pengajuan.lampiran[0].nama_dokumen.length > 25 
                          ? pengajuan.lampiran[0].nama_dokumen.substring(0, 25) + "..." 
                          : pengajuan.lampiran[0].nama_dokumen}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto">
                <button
                  onClick={() => handleDetailClick(pengajuan)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md text-sm transition flex items-center justify-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  Lihat Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-10 bg-gray-50 rounded-lg shadow-sm">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700">Tidak ada pengajuan</h3>
          <p className="text-gray-500">Anda belum memiliki pengajuan layanan saat ini.</p>
        </div>
      )}

      {/* Modal Detail Pengajuan */}
      {isModalOpen && selectedPengajuan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Detail Pengajuan</h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-700">Status</div>
                  <div>{getStatusBadge(selectedPengajuan.status)}</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-700">Jenis Layanan</div>
                  <div className="text-gray-600">{getJenisLayananName(selectedPengajuan.jenis_layanan_id)}</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-700">ID Pengajuan</div>
                  <div className="text-gray-600 text-sm">{selectedPengajuan.id}</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-700">Mahasiswa</div>
                  <div className="text-gray-600">
                    {mahasiswaNama[selectedPengajuan.mahasiswa_nim] || selectedPengajuan.mahasiswa_nim}
                  </div>
                </div>
                
                <hr className="my-2" />
                
                <div>
                  <div className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Catatan Admin
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                    {selectedPengajuan.catatan_admin || "Belum ada catatan"}
                  </div>
                </div>
                
                {selectedPengajuan.jadwal_pengambilan && (
                  <div>
                    <div className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Jadwal Pengambilan
                    </div>
                    <div className="bg-blue-50 p-3 rounded-md text-blue-700">
                      {formatDate(selectedPengajuan.jadwal_pengambilan)}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="font-medium text-gray-700 mb-2">Lampiran</div>
                  {selectedPengajuan.lampiran && selectedPengajuan.lampiran.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPengajuan.lampiran.map((doc, index) => (
                        <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">{index === 0 ? "File Utama" : "Lampiran"}</p>
                              <p className="text-xs text-gray-500 truncate max-w-xs">{doc.nama_dokumen}</p>
                            </div>
                          </div>
                          <a 
                            href={doc.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                          >
                            Lihat
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Tidak ada lampiran</p>
                  )}
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  Tanggal pengajuan: {formatDate(selectedPengajuan.lampiran?.[0]?.uploaded_at || new Date())}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default StatusPelayanan;