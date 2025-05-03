import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Eye, Pencil, X, FileText, Calendar, User, Tag, Clock, Download, Wifi, WifiOff } from "lucide-react";
import { toast } from "react-toastify";

const STATUS_OPTIONS = ["Menunggu", "Diproses", "Selesai", "Tolak"];

const STATUS_COLORS = {
  Menunggu: "bg-yellow-100 text-yellow-800",
  Diproses: "bg-blue-100 text-blue-800",
  Selesai: "bg-green-100 text-green-800",
  Tolak: "bg-red-100 text-red-800",
};

const API = import.meta.env.VITE_API_BASE_URL;
const AdminPelayanan = () => {
  const [data, setData] = useState([]);
  const [jenisLayananMap, setJenisLayananMap] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [mahasiswaNames, setMahasiswaNames] = useState({});
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false); // WebSocket connection status
  const socketRef = useRef(null); // WebSocket reference

  const token = JSON.parse(localStorage.getItem("auth"))?.token;

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
      
      // Fetch names for all unique NIMs
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

    // Initialize WebSocket connection
    socketRef.current = new WebSocket(`${API.replace(/^https?/, 'ws')}/ws?token=${token}`);

    socketRef.current.onopen = () => {
      console.log("✅ WebSocket connected");
      setSocketConnected(true);
    };

    socketRef.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.event === "new_pengajuan") {
          // Fetch the latest data when a new pengajuan is received
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

      // Attempt to reconnect after 5 seconds
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

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [token]);

  useEffect(() => {
    fetchData();
  }, []);

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
      const { jadwal_pengambilan } = selectedItem;

      // Validasi tanggal pengambilan
      if (new Date(jadwal_pengambilan) < new Date()) {
        toast.error("Tanggal pengambilan tidak boleh di masa lalu");
        return;
      }

      const { id, status, catatan_admin } = selectedItem;

      await axios.put(`${API}/layanan/pengajuan/${id}`, {
        status,
        catatan_admin,
        jadwal_pengambilan,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Pengajuan berhasil diperbarui");
      setEditModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Gagal menyimpan perubahan");
    }
  };

  const handleViewPdf = (fileUrl) => {
    // Check if the file is a PDF
    if (fileUrl.toLowerCase().includes('.pdf?')) {
      setSelectedPdf(fileUrl);
      setPdfModalOpen(true);
    } else {
      // If not a PDF, just open it in a new tab
      window.open(fileUrl, '_blank');
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (extension === 'pdf') {
      return <FileText size={18} className="text-red-500" />;
    } else if (['doc', 'docx'].includes(extension)) {
      return <FileText size={18} className="text-blue-500" />;
    } else if (['xls', 'xlsx'].includes(extension)) {
      return <FileText size={18} className="text-green-500" />;
    } else {
      return <FileText size={18} className="text-gray-500" />;
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

  // Get the submission date from the first document in the lampiran array
  const getSubmissionDate = (item) => {
    if (item.lampiran && item.lampiran.length > 0 && item.lampiran[0].uploaded_at) {
      return item.lampiran[0].uploaded_at;
    }
    return null;
  };

  return (
    <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Pengajuan Layanan</h1>
        <div className={`flex items-center ${socketConnected ? "text-green-600" : "text-gray-400"}`}>
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

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">NIM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Mahasiswa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Layanan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.mahasiswa_nim}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {mahasiswaNames[item.mahasiswa_nim] || "Loading..."}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{jenisLayananMap[item.jenis_layanan_id]}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <button 
                    onClick={() => handleViewDetail(item)} 
                    className="flex items-center text-indigo-600 hover:text-indigo-900 transition-colors"
                  >
                    <Eye size={16} className="mr-1" />
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detailModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-screen overflow-y-auto relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Detail Pengajuan</h2>
              <button 
                onClick={() => setDetailModalOpen(false)} 
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <User size={18} className="text-gray-500 mr-2" />
                    <h3 className="text-sm font-medium text-gray-600">Identitas</h3>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">
                    {mahasiswaNames[selectedItem.mahasiswa_nim] || "Loading..."}
                  </p>
                  <p className="text-sm text-gray-600">NIM: {selectedItem.mahasiswa_nim}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Tag size={18} className="text-gray-500 mr-2" />
                    <h3 className="text-sm font-medium text-gray-600">Layanan</h3>
                  </div>
                  <p className="text-sm text-gray-800">{jenisLayananMap[selectedItem.jenis_layanan_id]}</p>
                  <p className="text-sm text-gray-600">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${STATUS_COLORS[selectedItem.status]}`}>
                      {selectedItem.status}
                    </span>
                  </p>
                </div>
                
                {getSubmissionDate(selectedItem) && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Clock size={18} className="text-gray-500 mr-2" />
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
                      <Calendar size={18} className="text-gray-500 mr-2" />
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
                      <FileText size={18} className="text-gray-500 mr-2" />
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
                            <Eye size={16} className="mr-1" />
                            Lihat
                          </button>
                          <a 
                            href={doc.file_url} 
                            download={doc.nama_dokumen}
                            className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center"
                          >
                            <Download size={16} className="mr-1" />
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
                <Pencil size={16} className="mr-2" />
                Edit Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
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
              <X size={20} />
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

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Jadwal Pengambilan</label>
                  <input
                    type="datetime-local"
                    value={selectedItem.jadwal_pengambilan?.slice(0, 16) || ""}
                    onChange={(e) => setSelectedItem({ ...selectedItem, jadwal_pengambilan: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)} // Membatasi tanggal dan waktu minimum
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
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

      {/* PDF Viewer Modal using iframe */}
      {pdfModalOpen && selectedPdf && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-5xl h-5/6 flex flex-col relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Preview Dokumen</h2>
              <button 
                onClick={() => setPdfModalOpen(false)} 
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                <X size={20} />
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
                <Download size={16} className="mr-1" />
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