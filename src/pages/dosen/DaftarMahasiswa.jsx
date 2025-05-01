import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Filter, AlertCircle, X, UserCircle, BookOpen, GraduationCap, Mail, Users, Eye, Calendar } from "lucide-react";

const DaftarMahasiswa = () => {
  const [data, setData] = useState([]);
  const [selectedRole, setSelectedRole] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [bimbinganData, setBimbinganData] = useState([]);
  const [isLoadingBimbingan, setIsLoadingBimbingan] = useState(false);

  const roles = [
    "All",
    "Dosen Wali",
    "Dosen KP",
    "Dosen Pembimbing 1",
    "Dosen Pembimbing 2",
    "Dosen Penguji 1",
    "Dosen Penguji 2",
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const auth = JSON.parse(localStorage.getItem("auth"));
        const alias = auth?.user?.profile?.alias;
        if (!alias) return;

        const res = await axios.get(`https://d1raf3a33gcfqd.cloudfront.net/relation/dosen/${alias}`);
        setData(res.data["Daftar Mahasiswa"] || []);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchStudentDetail = async (nim) => {
    setIsLoadingDetail(true);
    try {
      const res = await axios.get(`https://d1raf3a33gcfqd.cloudfront.net/mahasiswa/detail/${nim}`);
      setStudentDetail(res.data);
    } catch (err) {
      console.error("Gagal mengambil detail mahasiswa:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const fetchBimbinganData = async () => {
    setIsLoadingBimbingan(true);
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const alias = auth?.user?.profile?.alias;
      if (!alias) return;

      const res = await axios.get(`https://d1raf3a33gcfqd.cloudfront.net/waktu_bimbingan/dosen/${alias}`);
      setBimbinganData(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data bimbingan:", err);
    } finally {
      setIsLoadingBimbingan(false);
    }
  };

  const openStudentDetail = (student) => {
    setSelectedStudent(student);
    setDetailModalOpen(true);

    // Fetch detail mahasiswa, termasuk jumlah bimbingan
    fetchStudentDetail(student.nim);
  };

  const closeStudentDetail = () => {
    setDetailModalOpen(false);
    setSelectedStudent(null);
    setStudentDetail(null);
  };

  const filteredData = data
    .filter((mhs) => selectedRole === "All" || mhs.role === selectedRole)
    .filter((mhs) =>
      searchTerm === "" ||
      mhs.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mhs.nim.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Function to identify student's academic information based on NIM
  const getStudentAcademicInfo = (nim) => {
    // Extract year from NIM
    let entryYearCode = '';
    
    if (nim && nim.length >= 3) {
        // Get first digits
        entryYearCode = nim.substring(0, 3);
        
        // Check format
        if (entryYearCode[0] !== '1') {
            entryYearCode = nim.substring(0, 2);
        }
    }
    
    // Current date information
    const currentDate = new Date("2025-04-29"); // April 2025
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Semester period detection
    const isFirstSemester = currentMonth >= 7 || currentMonth <= 0;
    
    // Calculate entry year
    let entryYear;
    if (entryYearCode.length === 3 && entryYearCode[0] === '1') {
        // For 3-digit format like '121' -> 2021
        entryYear = 2000 + parseInt(entryYearCode.substring(1), 10);
    } else {
        // For 2-digit format
        entryYear = 2000 + parseInt(entryYearCode, 10);
    }
    
    // Calculate years since enrollment
    const yearsSinceEnrollment = currentYear - entryYear;
    
    // Calculate current semester
    let currentSemester;
    let academicYear = `${currentYear - 1}/${currentYear}`;
    let semesterStatus = isFirstSemester ? "Ganjil" : "Genap";

    // Special case for April 2025 (genap):
    if (entryYear === 2021) {
        currentSemester = 8; // Semester 8 for 2021 batch
        academicYear = "2024/2025"; // Fixed academic year
        semesterStatus = "Genap"; // Fixed semester status
    } else {
        // General case
        if (isFirstSemester) {
            currentSemester = yearsSinceEnrollment * 2 + 1;
        } else {
            currentSemester = yearsSinceEnrollment * 2;
        }
    }
    
    // Format semester text
    const semesterText = `Semester ${currentSemester}`;
    
    return {
        entryYear,
        currentSemester,
        semesterText,
        semesterStatus,
        isFirstSemester,
        academicYear
    };
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Daftar Mahasiswa Bimbingan</h1>
        <p className="text-slate-500">Kelola dan pantau mahasiswa bimbingan Anda</p>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <input 
            type="text" 
            className="pl-10 pr-4 py-3 w-full bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all"
            placeholder="Cari nama atau NIM..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filter dropdown */}
        <div className="relative min-w-[180px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="pl-10 pr-10 py-3 w-full bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all appearance-none"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">Tidak ada data mahasiswa</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Tidak ada mahasiswa yang ditemukan dengan filter yang diterapkan. Coba ubah filter atau kata kunci pencarian.
            </p>
          </div>
        </div>
      ) : (
        // Table View with Action Column
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <tr>
                  <th className="px-6 py-4 font-medium">No</th>
                  <th className="px-6 py-4 font-medium">Nama</th>
                  <th className="px-6 py-4 font-medium">NIM</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((mhs, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 align-top text-slate-500 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 align-top">
                      <p className="font-medium text-slate-800">{mhs.nama}</p>
                    </td>
                    <td className="px-6 py-4 align-top text-slate-600">{mhs.nim}</td>
                    <td className="px-6 py-4 align-top">
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
                    </td>
                    <td className="px-6 py-4 align-middle text-center">
                      <button
                        onClick={() => openStudentDetail(mhs)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-xs font-medium"
                        title="Lihat Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Data summary */}
      {!isLoading && filteredData.length > 0 && (
        <div className="mt-6 text-sm text-slate-500 pl-1">
          Menampilkan {filteredData.length} dari {data.length} mahasiswa
        </div>
      )}

      {/* Student Detail Modal */}
      {detailModalOpen && (
        <div className="fixed inset-0 bg-none backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
              <h3 className="text-lg font-semibold">Detail Mahasiswa</h3>
              <button 
                onClick={closeStudentDetail}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
              {isLoadingDetail ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              ) : studentDetail ? (
                <div className="space-y-8">
                  {/* Student Basic Information */}
                  <div className="border border-blue-100 rounded-xl bg-blue-50 p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-shrink-0 w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center">
                        <UserCircle className="w-12 h-12 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-semibold text-slate-800">{studentDetail.mahasiswa.nama}</h4>
                        <div className="flex flex-wrap gap-y-2 gap-x-4">
                          <div className="flex items-center text-slate-600">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            <span>{studentDetail.mahasiswa.nim}</span>
                          </div>
                          <div className="flex items-center text-slate-600">
                            <Mail className="w-4 h-4 mr-2" />
                            <span>{studentDetail.mahasiswa.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Academic Information - New section */}
                    {studentDetail.mahasiswa.nim && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(() => {
                          const academicInfo = getStudentAcademicInfo(studentDetail.mahasiswa.nim);
                          return (
                            <>
                              <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                                <p className="text-sm text-slate-500 mb-1">Angkatan</p>
                                <p className="text-slate-800 font-semibold">{academicInfo.entryYear}</p>
                              </div>
                              <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                                <p className="text-sm text-slate-500 mb-1">Semester Saat Ini</p>
                                <p className="text-slate-800 font-semibold">
                                  {academicInfo.semesterText}
                                  <span className="text-xs font-normal text-slate-500 ml-1">
                                    ({academicInfo.semesterStatus})
                                  </span>
                                </p>
                              </div>
                              <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                                <p className="text-sm text-slate-500 mb-1">Tahun Akademik</p>
                                <p className="text-slate-800 font-semibold">
                                  {new Date().getFullYear()}/{new Date().getFullYear() + 1}
                                  <span className="text-xs font-normal text-slate-500 ml-1">
                                    {academicInfo.isFirstSemester ? "(Ganjil)" : "(Genap)"}
                                  </span>
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  
                  {/* Bimbingan Information */}
                  <div className="rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="text-blue-600 w-5 h-5" />
                      <h4 className="text-lg font-medium text-slate-800">Riwayat Bimbingan</h4>
                    </div>

                    {isLoadingBimbingan ? (
                      <div className="flex items-center justify-center h-16">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 rounded-lg p-4 flex flex-col gap-4">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Total Bimbingan</p>
                          <p className="text-xl font-semibold text-blue-800">
                            {studentDetail.jumlah_bimbingan}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Jumlah Bimbingan per Dosen</p>
                          <ul className="list-disc pl-5 text-slate-800">
                            {Object.entries(studentDetail.jumlah_bimbingan_by_dosen).map(([dosen, count]) => (
                              <li key={dosen}>
                                {dosen}: {count} sesi
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Thesis Information */}
                  {studentDetail.mahasiswa.tugas_akhir && (
                    <div className="rounded-xl border border-slate-200 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="text-blue-600 w-5 h-5" />
                        <h4 className="text-lg font-medium text-slate-800">Tugas Akhir</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Judul</p>
                          <p className="text-slate-800 font-medium">{studentDetail.mahasiswa.tugas_akhir.judul}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-slate-500">Status:</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            studentDetail.mahasiswa.tugas_akhir.status === "Selesai" 
                              ? "bg-green-100 text-green-800" 
                              : studentDetail.mahasiswa.tugas_akhir.status === "Dalam Pengerjaan"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {studentDetail.mahasiswa.tugas_akhir.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Lecturer Information */}
                  <div className="rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="text-blue-600 w-5 h-5" />
                      <h4 className="text-lg font-medium text-slate-800">Dosen Pembimbing & Penguji</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studentDetail.mahasiswa_dosen && Object.entries(studentDetail.mahasiswa_dosen).map(([role, dosen]) => (
                        <div key={role} className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-500 mb-1">{role}</p>
                          {dosen ? (
                            <>
                              <p className="font-medium text-slate-800">{dosen.nama}</p>
                              <p className="text-sm text-slate-600">{dosen.alias}</p>
                            </>
                          ) : (
                            <p className="font-medium text-slate-800">Belum ditentukan</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-500">
                  Gagal memuat data mahasiswa.
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
              <button
                onClick={closeStudentDetail}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarMahasiswa;