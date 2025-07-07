import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format, parseISO, getYear, getMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  FiCalendar,
  FiCheckCircle,
  FiDownload,
  FiRefreshCw,
  FiAlertTriangle,
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const RekapPresensi = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth()); // Current month
  const [filterYear, setFilterYear] = useState(new Date().getFullYear()); // Current year
  const [dosenInfo, setDosenInfo] = useState({
    alias: '',
    nama: ''
  });
  const [stats, setStats] = useState({
    totalKeseluruhan: 0,
    totalPeriode: 0
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const API = import.meta.env.VITE_API_BASE_URL;

  // Function to get dosen alias from localStorage
  const getAliasDosen = () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      return auth?.user?.profile?.alias;
    } catch (error) {
      console.error('Error getting alias from localStorage:', error);
      return null;
    }
  };

  const alias = getAliasDosen();

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!alias) {
        setError('Alias dosen tidak ditemukan. Silakan login ulang.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API}/dosen/attendance/${alias}`);
        
        // Sort data by date (newest first)
        const sortedData = response.data.sort((a, b) => {
          return new Date(b.tanggal) - new Date(a.tanggal);
        });
        
        setAttendanceData(sortedData);
        
        // Set dosen info based on first record
        if (sortedData.length > 0) {
          const firstRecord = sortedData[0];
          setDosenInfo({
            alias: firstRecord.dosen_inisial,
            nama: firstRecord.dosen_nama
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Gagal mengambil data presensi. Silakan coba lagi nanti.');
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [API, alias]);

  // Filter data and compute statistics when data or filters change
  useEffect(() => {
    if (!attendanceData.length) return;
    
    // Reset to first page whenever filter changes
    setCurrentPage(1);
    
    // Filter data by month and year for current period
    const filteredData = attendanceData.filter(record => {
      const recordDate = new Date(record.tanggal);
      return (
        recordDate.getMonth() === filterMonth &&
        recordDate.getFullYear() === filterYear
      );
    });
    
    // Calculate total attendances
    const totalKeseluruhan = attendanceData.length;
    const totalPeriode = filteredData.length;
    
    setStats({
      totalKeseluruhan,
      totalPeriode
    });
    
  }, [attendanceData, filterMonth, filterYear]);

  // Format date nicely
  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };

  // Get month name
  const getMonthName = (monthIndex) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[monthIndex];
  };

  // Generate years for dropdown (5 years back, 2 years forward)
  const years = Array.from(
    { length: 8 }, 
    (_, i) => filterYear - 5 + i
  );

  // Handle export to CSV
  const exportToCSV = () => {
    // Filter data by month and year
    const filteredData = attendanceData.filter(record => {
      const recordDate = new Date(record.tanggal);
      return (
        recordDate.getMonth() === filterMonth &&
        recordDate.getFullYear() === filterYear
      );
    });
    
    // Prepare CSV content
    const headers = 'ID,Inisial,Nama Dosen,Tanggal,Status,Keterangan\n';
    const csvContent = filteredData.map(record => {
      return `${record.id},"${record.dosen_inisial}","${record.dosen_nama}","${record.tanggal}",${record.status_kehadiran ? 'Hadir' : 'Tidak Hadir'},"${record.keterangan}"`;
    }).join('\n');
    
    // Create and download the file
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap-presensi-${dosenInfo.alias}-${getMonthName(filterMonth)}-${filterYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Data berhasil diexport ke CSV');
  };

  // Filter data for current view
  const filteredAttendanceData = attendanceData.filter(record => {
    const recordDate = new Date(record.tanggal);
    return (
      recordDate.getMonth() === filterMonth &&
      recordDate.getFullYear() === filterYear
    );
  });
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAttendanceData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAttendanceData.length / itemsPerPage);
  
  // Change page handler
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Pagination controls
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <FiRefreshCw size={40} className="text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Memuat data presensi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 max-w-md text-center">
          <FiAlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw size={16} />
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white p-6 mb-6 shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Rekap Presensi Dosen</h1>
              <p className="text-blue-100">
                {dosenInfo.alias ? (
                  <>
                    <span className="font-semibold">{dosenInfo.alias}</span> - {dosenInfo.nama}
                  </>
                ) : (
                  'Silakan login untuk melihat rekap presensi'
                )}
              </p>
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3 bg-indigo-800/60 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <label htmlFor="month-select" className="text-white text-sm font-medium mr-2">Bulan:</label>
                <select
                  id="month-select"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                  className="bg-white text-indigo-900 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 border-none"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {getMonthName(i)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <label htmlFor="year-select" className="text-white text-sm font-medium mr-2">Tahun:</label>
                <select
                  id="year-select"
                  value={filterYear}
                  onChange={(e) => setFilterYear(parseInt(e.target.value))}
                  className="bg-white text-indigo-900 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 border-none"
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-md py-2 px-4 text-sm font-medium transition-colors"
              >
                <FiDownload size={14} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
        
        {/* Statistics Cards + Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Keseluruhan */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-medium text-sm">Total Presensi</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalKeseluruhan}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FiCalendar className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Total keseluruhan presensi yang tercatat
            </p>
          </motion.div>
          
          {/* Calendar Visualization */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 lg:col-span-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 font-medium text-sm">Kalender Kehadiran</p>
                <h3 className="text-xl font-bold text-gray-800 mt-1">{getMonthName(filterMonth)} {filterYear}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FiCalendar className="text-purple-600" size={20} />
              </div>
            </div>
            
            {filteredAttendanceData.length > 0 ? (
              <div className="mt-2">
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  <div className="text-xs text-slate-500 font-medium">Min</div>
                  <div className="text-xs text-slate-500 font-medium">Sen</div>
                  <div className="text-xs text-slate-500 font-medium">Sel</div>
                  <div className="text-xs text-slate-500 font-medium">Rab</div>
                  <div className="text-xs text-slate-500 font-medium">Kam</div>
                  <div className="text-xs text-slate-500 font-medium">Jum</div>
                  <div className="text-xs text-slate-500 font-medium">Sab</div>
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {(() => {
                    const month = filterMonth;
                    const year = filterYear;
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const firstDayOfMonth = new Date(year, month, 1).getDay();
                    
                    // Get the dates when the dosen was present
                    const presentDates = filteredAttendanceData.map(item => 
                      new Date(item.tanggal).getDate()
                    );
                    
                    const calendarCells = [];
                    
                    // Add empty cells for days before the first of the month
                    for (let i = 0; i < firstDayOfMonth; i++) {
                      calendarCells.push(
                        <div key={`empty-${i}`} className="h-8"></div>
                      );
                    }
                    
                    // Add cells for each day of the month
                    for (let day = 1; day <= daysInMonth; day++) {
                      const isPresent = presentDates.includes(day);
                      
                      // Find attendance record for this date to get keterangan
                      const attendanceForDay = filteredAttendanceData.find(item => 
                        new Date(item.tanggal).getDate() === day
                      );
                      const keterangan = attendanceForDay?.keterangan || "";
                      
                      calendarCells.push(
                        <div 
                          key={`day-${day}`}
                          className={`h-8 flex items-center justify-center text-xs rounded-full
                            ${isPresent 
                              ? "bg-green-500 text-white font-medium" 
                              : "text-slate-700"}
                          `}
                          title={keterangan || (isPresent ? "Hadir" : "")}
                        >
                          {day}
                        </div>
                      );
                    }
                    
                    return calendarCells;
                  })()}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[170px] text-center">
                <FiCalendar size={32} className="text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">Tidak ada data presensi</p>
                <p className="text-gray-400 text-xs">untuk bulan ini</p>
              </div>
            )}
          </motion.div>
          
          {/* Presensi Periode */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-medium text-sm">Presensi {getMonthName(filterMonth)} {filterYear}</p>
                <h3 className="text-3xl font-bold text-emerald-600 mt-1">{stats.totalPeriode}</h3>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <FiBarChart2 className="text-emerald-600" size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              {stats.totalPeriode} Presensi pada periode ini
            </p>
          </motion.div>
        </div>
        
        {/* Data Table with Pagination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Riwayat Presensi - {getMonthName(filterMonth)} {filterYear}
            </h2>
           
          </div>
          
          {filteredAttendanceData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FiCalendar size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Tidak ada data presensi untuk periode ini</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        No
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Hari
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((record, index) => {
                      const recordDate = parseISO(record.tanggal);
                      const dayName = format(recordDate, "EEEE", { locale: id });
                      
                      return (
                        <tr 
                          key={record.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700 font-medium">
                            {format(recordDate, "d MMMM yyyy", { locale: id })}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {dayName}
                          </td>
                          <td className="py-4 px-6 text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FiCheckCircle className="mr-1" size={12} />
                              Hadir
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700">
                            {record.keterangan || <span className="text-gray-400 italic">Tidak ada keterangan</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md flex items-center text-sm ${
                        currentPage === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      <FiChevronLeft size={16} className="mr-1" />
                      Sebelumnya
                    </button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(num => {
                          // Show first, last, current and numbers close to current
                          if (num === 1 || num === totalPages) return true;
                          if (Math.abs(num - currentPage) <= 1) return true;
                          return false;
                        })
                        .map((number, idx, array) => {
                          // Add ellipsis where there are gaps in sequence
                          if (idx > 0 && array[idx - 1] !== number - 1) {
                            return (
                              <React.Fragment key={`ellipsis-${number}`}>
                                <span className="px-3 py-1 text-gray-500">...</span>
                                <button
                                  onClick={() => paginate(number)}
                                  className={`px-3 py-1 rounded-md ${
                                    currentPage === number
                                      ? "bg-blue-600 text-white"
                                      : "text-blue-600 hover:bg-blue-50"
                                  }`}
                                >
                                  {number}
                                </button>
                              </React.Fragment>
                            );
                          }
                          return (
                            <button
                              key={number}
                              onClick={() => paginate(number)}
                              className={`px-3 py-1 rounded-md ${
                                currentPage === number
                                  ? "bg-blue-600 text-white"
                                  : "text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              {number}
                            </button>
                          );
                        })}
                    </div>
                    
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md flex items-center text-sm ${
                        currentPage === totalPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      Selanjutnya
                      <FiChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default RekapPresensi;