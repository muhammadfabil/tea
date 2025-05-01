import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Trash2, X, User, Mail, BookOpen, GraduationCap, Users, AlertTriangle } from "lucide-react";

const AdminMahasiswa = () => {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mahasiswaToDelete, setMahasiswaToDelete] = useState(null);

  useEffect(() => {
    fetchMahasiswa();
  }, []);

  const getAuthToken = () => {
    const authData = localStorage.getItem("auth");
    return authData ? JSON.parse(authData).token : null;
  };

  const handleDeleteFromDetail = () => {
    if (detailData && detailData.mahasiswa && detailData.mahasiswa.id) {
      openDeleteConfirmation({
        id: detailData.mahasiswa.id,
        nama: detailData.mahasiswa.nama,
        nim: detailData.mahasiswa.nim
      });
    } else {
      alert("Data mahasiswa tidak lengkap. Silakan refresh halaman.");
    }
  };

  const fetchMahasiswa = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get("https://13.236.194.123/mahasiswa/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMahasiswa(response.data);
    } catch (error) {
      console.error("Gagal mengambil data mahasiswa:", error);
    }
  };

  const fetchDetailMahasiswa = async (nim) => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(`https://13.236.194.123/mahasiswa/detail/${nim}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDetailData(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Gagal mengambil detail mahasiswa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetail = (mhs) => {
    setSelectedMahasiswa(mhs);
    fetchDetailMahasiswa(mhs.nim);
  };

  // Modified to fetch the ID first before opening delete confirmation
  const openDeleteConfirmation = async (mhs) => {
    // If we already have the ID, use it directly
    if (mhs.id) {
      console.log("Membuka konfirmasi hapus dengan data:", mhs);
      setDeleteId(mhs.id);
      setMahasiswaToDelete(mhs);
      setShowDeleteModal(true);
      return;
    }
    
    // Otherwise, fetch the details to get the ID
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(`https://13.236.194.123/mahasiswa/detail/${mhs.nim}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const mahasiswaWithId = {
        ...mhs,
        id: response.data.mahasiswa.id
      };
      
      console.log("Membuka konfirmasi hapus dengan data:", mahasiswaWithId);
      setDeleteId(mahasiswaWithId.id);
      setMahasiswaToDelete(mahasiswaWithId);
      setShowDeleteModal(true);
    } catch (error) {
      console.error("Gagal mengambil ID mahasiswa:", error);
      alert("Gagal mendapatkan ID mahasiswa untuk penghapusan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    console.log("Mencoba menghapus dengan ID:", deleteId);
    if (!deleteId) {
      console.error("ID tidak ditemukan");
      return;
    }
    
    setIsDeleting(true);
    try {
      const token = getAuthToken();
      console.log("Mengirim request delete ke:", `https://13.236.194.123/mahasiswa/del/${deleteId}`); // Fixed URL
      const response = await axios.delete(`https://13.236.194.123/mahasiswa/del/${deleteId}`, { // Updated URL
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Respon hapus berhasil:", response);
      
      // Update the mahasiswa list by filtering out the deleted mahasiswa
      if (mahasiswaToDelete && mahasiswaToDelete.nim) {
        setMahasiswa(mahasiswa.filter(mhs => mhs.nim !== mahasiswaToDelete.nim));
      }
      
      // Close modal and clean up
      setShowDeleteModal(false);
      setDeleteId(null);
      setMahasiswaToDelete(null);
      
      // If detail modal was open and we're deleting that mahasiswa, close it
      if (detailData && detailData.mahasiswa && detailData.mahasiswa.id === deleteId) {
        setShowModal(false);
        setDetailData(null);
      }
    } catch (error) {
      console.error("Gagal menghapus:", error);
      alert(`Gagal menghapus mahasiswa. Error: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setDetailData(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
    setMahasiswaToDelete(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Mahasiswa</h1>
        <div className="bg-blue-50 px-4 py-2 rounded-lg text-sm text-blue-700">
          Total: {mahasiswa.length} mahasiswa
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mahasiswa.map((mhs, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{mhs.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{mhs.nim}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{mhs.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDetail(mhs)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <Eye size={16} className="mr-1" />
                        Detail
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(mhs)}
                        className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {mahasiswa.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data mahasiswa yang tersedia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Mahasiswa */}
      {showModal && (
        <div className="fixed inset-0 bg-none backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Detail Mahasiswa</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            {isLoading ? (
              <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
              </div>
            ) : detailData ? (
              <div className="p-6 space-y-6">
                {/* Informasi Mahasiswa */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-800 flex items-center mb-3">
                      <User size={20} className="mr-2" /> Informasi Mahasiswa
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Nama</p>
                        <p className="font-medium">{detailData.mahasiswa.nama}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">NIM</p>
                        <p className="font-medium">{detailData.mahasiswa.nim}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium flex items-center">
                          <Mail size={16} className="mr-1 text-gray-400" />
                          {detailData.mahasiswa.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tugas Akhir */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-green-800 flex items-center mb-3">
                      <BookOpen size={20} className="mr-2" /> Tugas Akhir
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Judul</p>
                        <p className="font-medium">{detailData.mahasiswa.tugas_akhir.judul}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          detailData.mahasiswa.tugas_akhir.status === "Lulus" 
                            ? "bg-green-100 text-green-800" 
                            : detailData.mahasiswa.tugas_akhir.status === "Sedang Berjalan"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          <GraduationCap size={12} className="mr-1" />
                          {detailData.mahasiswa.tugas_akhir.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dosen */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-purple-800 flex items-center mb-3">
                      <Users size={20} className="mr-2" /> Informasi Dosen
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(detailData.mahasiswa_dosen).map(([role, dosen], index) => (
                        <div key={index} className="pb-2 border-b border-purple-100 last:border-0">
                          <p className="text-sm text-gray-500">{role}</p>
                          {dosen ? (
                            <div className="flex items-center">
                              <div className="bg-purple-200 text-purple-800 w-8 h-8 rounded-full flex items-center justify-center mr-2 font-medium">
                                {dosen.alias}
                              </div>
                              <p className="font-medium">{dosen.nama}</p>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">Belum ditentukan</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Added Delete Button in Detail Modal */}
                <div className="flex justify-end">
                  <button
                    onClick={handleDeleteFromDetail}
                    className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Hapus Mahasiswa
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Tidak dapat memuat data mahasiswa
              </div>
            )}
            
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-none backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4 text-red-500">
                <AlertTriangle size={48} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Konfirmasi Hapus</h3>
              {isLoading ? (
                <div className="p-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : mahasiswaToDelete ? (
                <div className="mb-4 bg-red-50 p-3 rounded-lg">
                  <p className="font-medium text-center">{mahasiswaToDelete.nama}</p>
                  <p className="text-sm text-center text-gray-600">NIM: {mahasiswaToDelete.nim}</p>
                  {deleteId && <p className="text-xs text-center text-gray-500 mt-1">ID: {deleteId}</p>}
                </div>
              ) : null}
              <p className="text-gray-500 text-center">
                Apakah Anda yakin ingin menghapus data mahasiswa ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-center gap-3 rounded-b-xl">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={isDeleting || isLoading}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="mr-1" />
                    Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMahasiswa;