import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Trash2, X, User, Mail, BookOpen, GraduationCap, Users, AlertTriangle, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const AdminMahasiswa = () => {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [filteredMahasiswa, setFilteredMahasiswa] = useState([]);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mahasiswaToDelete, setMahasiswaToDelete] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCohort, setSelectedCohort] = useState("");
  
  // Available cohorts
  const cohorts = [
    { value: "118", label: "Angkatan 2018" },
    { value: "119", label: "Angkatan 2019" },
    { value: "120", label: "Angkatan 2020" },
    { value: "121", label: "Angkatan 2021" },
    { value: "122", label: "Angkatan 2022" },
    { value: "123", label: "Angkatan 2023" },
    { value: "124", label: "Angkatan 2024" },
    { value: "125", label: "Angkatan 2025" },
    { value: "126", label: "Angkatan 2026" },
    { value: "127", label: "Angkatan 2027" },
    { value: "128", label: "Angkatan 2028" },
    { value: "129", label: "Angkatan 2029" },
    { value: "130", label: "Angkatan 2030" },
  ];

  useEffect(() => {
    fetchMahasiswa();
  }, []);

  // Filter and search mahasiswa whenever data, search query or cohort changes
  useEffect(() => {
    let result = [...mahasiswa];
    
    // Sort by name alphabetically by default
    result.sort((a, b) => a.nama.localeCompare(b.nama));
    
    // Filter by cohort if selected
    if (selectedCohort) {
      result = result.filter(mhs => {
        // Check if NIM starts with the selected cohort code
        return mhs.nim.startsWith(selectedCohort);
      });
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(mhs => 
        mhs.nama.toLowerCase().includes(query) || 
        mhs.nim.toLowerCase().includes(query) || 
        mhs.email.toLowerCase().includes(query)
      );
    }
    
    setFilteredMahasiswa(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [mahasiswa, searchQuery, selectedCohort]);

  const getAuthToken = () => {
    const authData = localStorage.getItem("auth");
    return authData ? JSON.parse(authData).token : null;
  };

  const API = import.meta.env.VITE_API_BASE_URL;

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
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API}/mahasiswa/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMahasiswa(response.data);
      setFilteredMahasiswa(response.data.sort((a, b) => a.nama.localeCompare(b.nama)));
    } catch (error) {
      console.error("Gagal mengambil data mahasiswa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetailMahasiswa = async (nim) => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API}/mahasiswa/detail/${nim}`, {
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
      const response = await axios.get(`${API}/mahasiswa/detail/${mhs.nim}`, {
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
      console.log("Mengirim request delete ke:", `${API}/mahasiswa/del/${deleteId}`);
      const response = await axios.delete(`${API}/mahasiswa/del/${deleteId}`, {
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

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCohort("");
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMahasiswa.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredMahasiswa.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Mahasiswa</h1>
        <div className="bg-blue-50 px-4 py-2 rounded-lg text-sm text-blue-700">
          Total: {filteredMahasiswa.length} mahasiswa
        </div>
      </div>

      {/* Search and filter section */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="col-span-3 md:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Cari Mahasiswa</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Cari nama, NIM, atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          {/* Filter by Cohort */}
          <div className="col-span-3 md:col-span-1">
            <label htmlFor="cohort" className="block text-sm font-medium text-gray-700 mb-1">Filter Angkatan</label>
            <div className="relative">
              <select
                id="cohort"
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Semua Angkatan</option>
                {cohorts.map((cohort) => (
                  <option key={cohort.value} value={cohort.value}>
                    {cohort.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          {/* Reset filters button */}
          <div className="col-span-3 md:col-span-1 md:self-end">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
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
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                    </div>
                    <p className="mt-2 text-gray-500">Memuat data...</p>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((mhs, index) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    {filteredMahasiswa.length === 0 && mahasiswa.length > 0 ? 
                      "Tidak ada data yang sesuai dengan filter" : 
                      "Tidak ada data mahasiswa yang tersedia"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredMahasiswa.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> hingga{" "}
              <span className="font-medium">
                {indexOfLastItem > filteredMahasiswa.length ? filteredMahasiswa.length : indexOfLastItem}
              </span>{" "}
              dari <span className="font-medium">{filteredMahasiswa.length}</span> mahasiswa
            </div>
            <div className="flex gap-1">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`inline-flex items-center px-3 py-1.5 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, Math.ceil(filteredMahasiswa.length / itemsPerPage)) }, (_, i) => {
                // Logic to show pages around current page
                const totalPages = Math.ceil(filteredMahasiswa.length / itemsPerPage);
                let pageNum;
                
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                if (pageNum <= totalPages) {
                  return (
                    <button
                      key={i}
                      onClick={() => paginate(pageNum)}
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-md ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
              <button
                onClick={nextPage}
                disabled={currentPage === Math.ceil(filteredMahasiswa.length / itemsPerPage)}
                className={`inline-flex items-center px-3 py-1.5 rounded-md ${
                  currentPage === Math.ceil(filteredMahasiswa.length / itemsPerPage)
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
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