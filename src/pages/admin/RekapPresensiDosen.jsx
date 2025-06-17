import { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO, getYear, getMonth } from "date-fns";
import { id } from "date-fns/locale";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { FiSearch, FiRefreshCw, FiDownload, FiCalendar, FiFilter, FiX, FiChevronRight, FiUser, FiCheckCircle, FiClock, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const RekapPresensiDosen = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isPeriodeModalOpen, setIsPeriodeModalOpen] = useState(false);
  const [dosenList, setDosenList] = useState([]);
  const [selectedDosen, setSelectedDosen] = useState(null);
  
  // Periode filtering
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [availableYears, setAvailableYears] = useState([]);

  const { token } = useAuth();
  const API = import.meta.env.VITE_API_BASE_URL;

  const months = [
    { value: "0", label: "Januari" },
    { value: "1", label: "Februari" },
    { value: "2", label: "Maret" },
    { value: "3", label: "April" },
    { value: "4", label: "Mei" },
    { value: "5", label: "Juni" },
    { value: "6", label: "Juli" },
    { value: "7", label: "Agustus" },
    { value: "8", label: "September" },
    { value: "9", label: "Oktober" },
    { value: "10", label: "November" },
    { value: "11", label: "Desember" }
  ];

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/dosen/attendance-all/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Sort by date (newest first)
      const sortedData = response.data.sort((a, b) => {
        return new Date(b.tanggal) - new Date(a.tanggal);
      });
      
      // Extract unique years from data
      const years = [...new Set(sortedData.map(item => getYear(parseISO(item.tanggal))))].sort((a, b) => b - a);
      setAvailableYears(years);
      
      // Set default year to current/latest year in data
      if (years.length > 0 && !selectedYear) {
        setSelectedYear(years[0].toString());
      }
      
      // Set default month to current/latest month in data if not set
      if (!selectedMonth) {
        const latestDate = sortedData[0]?.tanggal;
        if (latestDate) {
          setSelectedMonth(getMonth(parseISO(latestDate)).toString());
        } else {
          // Default to current month if no data
          setSelectedMonth(new Date().getMonth().toString());
        }
      }
      
      setAttendanceData(sortedData);
      applyPeriodFilter(sortedData, selectedMonth, selectedYear);
      
      // Process dosen list with attendance statistics
      const dosenMap = {};
      sortedData.forEach(item => {
        if (!dosenMap[item.dosen_inisial]) {
          dosenMap[item.dosen_inisial] = {
            inisial: item.dosen_inisial,
            nama: item.dosen_nama,
            totalKehadiran: 0,
            tanggalTerakhir: null,
            riwayatKehadiran: []
          };
        }
        
        dosenMap[item.dosen_inisial].totalKehadiran += 1;
        dosenMap[item.dosen_inisial].riwayatKehadiran.push(item);
        
        // Track last attendance date
        if (!dosenMap[item.dosen_inisial].tanggalTerakhir || 
            new Date(item.tanggal) > new Date(dosenMap[item.dosen_inisial].tanggalTerakhir)) {
          dosenMap[item.dosen_inisial].tanggalTerakhir = item.tanggal;
        }
      });
      
      // Create sorted dosen list
      const sortedDosenList = Object.values(dosenMap).sort((a, b) => a.nama.localeCompare(b.nama));
      setDosenList(sortedDosenList);
    } catch (error) {
      console.error("Gagal mengambil data presensi:", error);
      toast.error("Gagal mengambil data presensi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    
    return () => {
      toast.dismiss();
    };
  }, []);

  // Apply period filtering (month and year)
  const applyPeriodFilter = (data, month, year) => {
    if (!month && !year) {
      setFilteredData(data);
      return;
    }
    
    let filtered = [...data];
    
    if (year) {
      filtered = filtered.filter(item => {
        const itemYear = getYear(parseISO(item.tanggal));
        return itemYear.toString() === year.toString();
      });
    }
    
    if (month) {
      filtered = filtered.filter(item => {
        const itemMonth = getMonth(parseISO(item.tanggal));
        return itemMonth.toString() === month.toString();
      });
    }
    
    setFilteredData(filtered);
  };

  // Update filtered data when period changes
  useEffect(() => {
    applyPeriodFilter(attendanceData, selectedMonth, selectedYear);
    
    // Also update dosen list based on period filter
    if (selectedDosen) {
      let filteredRiwayat = [...selectedDosen.riwayatKehadiran];
      
      if (selectedYear) {
        filteredRiwayat = filteredRiwayat.filter(item => 
          getYear(parseISO(item.tanggal)).toString() === selectedYear.toString()
        );
      }
      
      if (selectedMonth) {
        filteredRiwayat = filteredRiwayat.filter(item =>
          getMonth(parseISO(item.tanggal)).toString() === selectedMonth.toString()
        );
      }
      
      setFilteredData(filteredRiwayat.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)));
    }
  }, [selectedMonth, selectedYear, selectedDosen]);

  // Filter dosen list based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      // If no search term, show all dosen
      return;
    }
    
    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = dosenList.filter(
      dosen => dosen.nama.toLowerCase().includes(lowercasedSearch) || 
              dosen.inisial.toLowerCase().includes(lowercasedSearch)
    );
    
  }, [searchTerm, dosenList]);

  // Filter attendance data when a dosen is selected and date filters are applied
  useEffect(() => {
    if (!selectedDosen) return;
    
    let result = selectedDosen.riwayatKehadiran;
    
    // Filter by date range (for detail view filters)
    if (startDate) {
      result = result.filter(item => item.tanggal >= startDate);
    }
    
    if (endDate) {
      result = result.filter(item => item.tanggal <= endDate);
    }
    
    // Filter by period (month and year)
    if (selectedYear) {
      result = result.filter(item => 
        getYear(parseISO(item.tanggal)).toString() === selectedYear.toString()
      );
    }
    
    if (selectedMonth) {
      result = result.filter(item =>
        getMonth(parseISO(item.tanggal)).toString() === selectedMonth.toString()
      );
    }
    
    // Sort by date (newest first)
    result = result.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    setFilteredData(result);
  }, [selectedDosen, startDate, endDate, selectedMonth, selectedYear]);

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setIsFilterModalOpen(false);
    
    // Reset filtered data to all attendance for selected dosen (with period filter still applied)
    if (selectedDosen) {
      let result = [...selectedDosen.riwayatKehadiran];
      
      // Keep period filters
      if (selectedYear) {
        result = result.filter(item => 
          getYear(parseISO(item.tanggal)).toString() === selectedYear.toString()
        );
      }
      
      if (selectedMonth) {
        result = result.filter(item =>
          getMonth(parseISO(item.tanggal)).toString() === selectedMonth.toString()
        );
      }
      
      const sortedData = result.sort(
        (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
      );
      setFilteredData(sortedData);
    }
  };
  
  const resetPeriodFilters = () => {
    setSelectedMonth("");
    setSelectedYear("");
    setIsPeriodeModalOpen(false);
    
    // Reset to all data
    setFilteredData(attendanceData);
  };
  
  const applyPeriodFilters = () => {
    setIsPeriodeModalOpen(false);
  };

  const exportToCSV = () => {
    const dataToExport = selectedDosen ? filteredData : attendanceData;
    
    // Prepare data for CSV format
    const headers = ["ID", "Inisial", "Nama Dosen", "Tanggal", "Status", "Keterangan"];
    const csvData = dataToExport.map(item => [
      item.id,
      item.dosen_inisial,
      item.dosen_nama,
      item.tanggal,
      "Hadir", // Since we're only dealing with attendance records
      item.keterangan || "-"
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    // Create download link
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    // Add period info to filename if filters are applied
    let filename = "rekap_presensi_dosen";
    if (selectedMonth && selectedYear) {
      const monthName = months.find(m => m.value === selectedMonth)?.label || "";
      filename = `${filename}_${monthName.toLowerCase()}_${selectedYear}`;
    } else if (selectedYear) {
      filename = `${filename}_${selectedYear}`;
    }
    
    link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    toast.success("Data presensi berhasil diunduh");
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(parseISO(dateString), "EEEE, d MMMM yyyy", { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  const handleDosenSelect = (dosen) => {
    setSelectedDosen(dosen);
    
    // Filter by current period settings
    let filteredRiwayat = [...dosen.riwayatKehadiran];
    
    if (selectedYear) {
      filteredRiwayat = filteredRiwayat.filter(item => 
        getYear(parseISO(item.tanggal)).toString() === selectedYear.toString()
      );
    }
    
    if (selectedMonth) {
      filteredRiwayat = filteredRiwayat.filter(item =>
        getMonth(parseISO(item.tanggal)).toString() === selectedMonth.toString()
      );
    }
    
    const sortedData = filteredRiwayat.sort(
      (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
    );
    
    setFilteredData(sortedData);
    
    // Reset date filters when switching dosen
    setStartDate("");
    setEndDate("");
  };

  const handleBackToDaftar = () => {
    setSelectedDosen(null);
    setStartDate("");
    setEndDate("");
    // Keep period filters when going back
    applyPeriodFilter(attendanceData, selectedMonth, selectedYear);
  };

  // Get current period display text
  const getPeriodeDisplayText = () => {
    let text = "Semua Periode";
    
    if (selectedMonth && selectedYear) {
      const monthName = months.find(m => m.value === selectedMonth)?.label || "";
      text = `${monthName} ${selectedYear}`;
    } else if (selectedYear) {
      text = `Tahun ${selectedYear}`;
    } else if (selectedMonth) {
      const monthName = months.find(m => m.value === selectedMonth)?.label || "";
      text = `${monthName} (Semua Tahun)`;
    }
    
    return text;
  };
  
  // Count present dosens in selected period by unique dosen
  const getDosenPresentCountInPeriod = () => {
    if (filteredData.length === 0) return 0;
    
    const uniqueDosens = new Set();
    filteredData.forEach(item => uniqueDosens.add(item.dosen_inisial));
    return uniqueDosens.size;
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="flex items-center mb-2">
          {selectedDosen && (
            <button 
              onClick={handleBackToDaftar}
              className="mr-3 p-2 bg-blue-500 text-white hover:bg-blue-600 hover:text-white hover:cursor-pointer rounded-full transition-colors inline-flex items-center"
              title="Kembali ke daftar dosen"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-3xl font-bold text-slate-800">Rekap Presensi Dosen</h1>
            </div>
            <p className="text-slate-500">
          {selectedDosen 
            ? `Melihat detail kehadiran dosen ${selectedDosen.nama}`
            : "Lihat dan analisis data kehadiran dosen"
          }
            </p>
          </div>
          
         
          {!selectedDosen && (
            <Link 
          to="/admin/dosen"
          className="mt-3 md:mt-0 px-4 py-2 bg-blue-500 text-white border border-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-colors shadow-sm flex items-center gap-2 text-sm font-medium"
            >
          <FiArrowLeft className="w-4 h-4" />
          Kembali 
            </Link>
          )}
        </div>
        
        {/* Navigation/Breadcrumbs */}
      {selectedDosen && (
        <div className="mb-6 flex items-center text-sm text-slate-600">
          <button 
            onClick={handleBackToDaftar} 
            className="hover:text-blue-600 transition-colors font-medium"
          >
            Daftar Dosen
          </button>
          <FiChevronRight className="mx-2" />
          <span className="text-slate-800 font-medium">
            {selectedDosen.inisial} - {selectedDosen.nama}
          </span>
        </div>
      )}
      
      {/* Period Info Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-blue-100 text-blue-700 p-2 rounded-xl mr-4">
              <FiCalendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm text-slate-500">Periode Presensi</h3>
              <p className="text-xl font-bold text-slate-800">{getPeriodeDisplayText()}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center md:justify-end">
            <button
              onClick={() => setIsPeriodeModalOpen(true)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm flex items-center"
            >
              <FiFilter className="mr-2" /> Pilih Periode
            </button>
            
            {(selectedMonth || selectedYear) && (
              <button
                onClick={resetPeriodFilters}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm flex items-center"
              >
                <FiX className="mr-2" /> Reset Periode
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Filter and Actions */}
      {!selectedDosen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiSearch className="w-5 h-5 text-gray-500" />
              </div>
              <input 
                type="text" 
                className="pl-10 pr-4 py-3 w-full bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all"
                placeholder="Cari dosen berdasarkan nama, inisial..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => fetchAttendanceData()}
                disabled={loading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-300 transition-all shadow-sm font-medium"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              
              <button
                onClick={exportToCSV}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-all shadow-sm font-medium"
              >
                <FiDownload className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      )}

{/* Active Filters Display - Only show when dosen is selected and filters are active */}
{selectedDosen && (startDate || endDate) && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
    <div className="mt-4 flex flex-wrap gap-2">
      {startDate && (
        <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
          <FiCalendar className="w-3.5 h-3.5 mr-1" />
          Dari: {formatDisplayDate(startDate).split(',')[1]}
          <button 
            className="ml-2 hover:text-blue-900" 
            onClick={() => setStartDate("")}
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      {endDate && (
        <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
          <FiCalendar className="w-3.5 h-3.5 mr-1" />
          Sampai: {formatDisplayDate(endDate).split(',')[1]}
          <button 
            className="ml-2 hover:text-blue-900" 
            onClick={() => setEndDate("")}
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  </div>
)}

      {/* Content Section */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat data presensi dosen...</p>
        </div>
      ) : !selectedDosen ? (
        /* Dosen List View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="p-8 text-center">
              <FiUser className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">Tidak ada data presensi</h3>
              <p className="text-gray-500">
                {(selectedMonth || selectedYear) 
                  ? "Tidak ada data presensi dosen pada periode yang dipilih."
                  : "Belum ada data presensi dosen yang tersedia."}
              </p>
              {(selectedMonth || selectedYear) && (
                <button
                  onClick={resetPeriodFilters}
                  className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                >
                  Reset Filter Periode
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* Stats Banner */}
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 text-white">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-slate-300">Dosen Hadir</h3>
                    <p className="text-2xl font-bold">{getDosenPresentCountInPeriod()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-slate-300">Total Presensi</h3>
                    <p className="text-2xl font-bold">{filteredData.length}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-slate-300">Periode</h3>
                    <p className="text-xl font-bold">
                      {getPeriodeDisplayText()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Dosen Listing */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px divide-y md:divide-y-0 bg-slate-200">
                {dosenList
                  .filter(dosen => {
                    if (!searchTerm) return true;
                    const search = searchTerm.toLowerCase();
                    return dosen.nama.toLowerCase().includes(search) || 
                           dosen.inisial.toLowerCase().includes(search);
                  })
                  .filter(dosen => {
                    // Only show dosens that have attendance in the selected period
                    if (!selectedMonth && !selectedYear) return true;
                    
                    return dosen.riwayatKehadiran.some(item => {
                      const itemDate = parseISO(item.tanggal);
                      const matchesYear = !selectedYear || getYear(itemDate).toString() === selectedYear;
                      const matchesMonth = !selectedMonth || getMonth(itemDate).toString() === selectedMonth;
                      return matchesYear && matchesMonth;
                    });
                  })
                  .map((dosen) => {
                    // Count attendance in selected period for this dosen
                    const periodAttendance = dosen.riwayatKehadiran.filter(item => {
                      const itemDate = parseISO(item.tanggal);
                      const matchesYear = !selectedYear || getYear(itemDate).toString() === selectedYear;
                      const matchesMonth = !selectedMonth || getMonth(itemDate).toString() === selectedMonth;
                      return matchesYear && matchesMonth;
                    });
                    
                    // Find latest attendance date in period
                    const latestAttendanceInPeriod = periodAttendance.length > 0 
                      ? periodAttendance.reduce((latest, item) => 
                          new Date(item.tanggal) > new Date(latest.tanggal) ? item : latest, 
                          periodAttendance[0]
                        ).tanggal
                      : null;
                    
                    return (
                      <div 
                        key={dosen.inisial}
                        className="p-6 bg-white hover:bg-blue-50 transition-colors cursor-pointer group"
                        onClick={() => handleDosenSelect(dosen)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h2 className="text-lg font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                              {dosen.inisial}
                            </h2>
                            <p className="text-sm text-slate-500">{dosen.nama}</p>
                          </div>
                          <div className="rounded-full bg-blue-100 text-blue-700 w-9 h-9 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition-colors">
                            <FiChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center text-sm">
                            <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-slate-700">{periodAttendance.length} Kehadiran</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <FiClock className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="text-slate-700">
                              Terakhir: {latestAttendanceInPeriod ? formatDisplayDate(latestAttendanceInPeriod).split(',')[1] : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Selected Dosen Detail View */
        <>
          {/* Dosen Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedDosen.inisial} - {selectedDosen.nama}</h2>
                <p className="text-slate-500 mt-1">
                  Total Kehadiran: {filteredData.length} kali {selectedMonth || selectedYear ? `(pada ${getPeriodeDisplayText()})` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {filteredData.length > 0 && (
                  <span className={`px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-sm font-medium`}>
                    Terakhir hadir: {format(parseISO(filteredData[0].tanggal), "d MMM yyyy", { locale: id })}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Attendance List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredData.length === 0 ? (
              <div className="p-8 text-center">
                <FiCalendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">Tidak ada data presensi</h3>
                <p className="text-gray-500">
                  {(startDate || endDate)
                    ? "Tidak ada hasil yang cocok dengan filter yang dipilih."
                    : (selectedMonth || selectedYear)
                      ? "Tidak ada data presensi pada periode yang dipilih."
                      : "Tidak ada data presensi untuk dosen ini."}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {(startDate || endDate) && (
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                    >
                      Reset Filter Tanggal
                    </button>
                  )}
                  {(selectedMonth || selectedYear) && (
                    <button
                      onClick={resetPeriodFilters}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                    >
                      Reset Filter Periode
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-sm font-medium">No</th>
                      <th className="px-6 py-4 text-sm font-medium">Tanggal</th>
                      <th className="px-6 py-4 text-sm font-medium">Hari</th>
                      <th className="px-6 py-4 text-sm font-medium">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-500 font-medium">{index + 1}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {format(parseISO(item.tanggal), "d MMMM yyyy", { locale: id })}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {format(parseISO(item.tanggal), "EEEE", { locale: id })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {item.keterangan || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Monthly Calendar View (Only show in selected period mode) */}
          {filteredData.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Kalender Kehadiran</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
                <div className="flex flex-wrap justify-center gap-2 min-w-fit">
                  {/* Filter months to show based on period selection */}
                  {(() => {
                    let monthsToShow = [...new Set(filteredData.map(item => 
                      format(parseISO(item.tanggal), "MM-yyyy")
                    ))];
                    
                    // Sort months by year descending, then by month descending
                    monthsToShow = monthsToShow.sort((a, b) => {
                      const [monthA, yearA] = a.split('-');
                      const [monthB, yearB] = b.split('-');
                      if (yearA !== yearB) return yearB - yearA;
                      return monthB - monthA;
                    });
                    
                    return monthsToShow.map(monthYear => {
                      const [month, year] = monthYear.split('-');
                      const monthName = format(new Date(year, month - 1, 1), "MMMM yyyy", { locale: id });
                      
                      // Get all dates in this month where the dosen was present
                      const attendanceDates = filteredData
                        .filter(item => format(parseISO(item.tanggal), "MM-yyyy") === monthYear)
                        .map(item => format(parseISO(item.tanggal), "dd-MM-yyyy"));
                      
                      return (
                        <div key={monthYear} className="p-4 border border-gray-200 rounded-lg text-center min-w-[200px]">
                          <h3 className="font-medium text-slate-700 mb-3">{monthName}</h3>
                          <div className="grid grid-cols-7 gap-1 text-center">
                            <div className="text-xs text-slate-500 font-medium">Min</div>
                            <div className="text-xs text-slate-500 font-medium">Sen</div>
                            <div className="text-xs text-slate-500 font-medium">Sel</div>
                            <div className="text-xs text-slate-500 font-medium">Rab</div>
                            <div className="text-xs text-slate-500 font-medium">Kam</div>
                            <div className="text-xs text-slate-500 font-medium">Jum</div>
                            <div className="text-xs text-slate-500 font-medium">Sab</div>
                            
                            {/* Generate calendar dates */}
                            {(() => {
                              const daysInMonth = new Date(year, month, 0).getDate();
                              const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
                              
                              const calendarCells = [];
                              
                              // Add empty cells for days before the first of the month
                              for (let i = 0; i < firstDayOfMonth; i++) {
                                calendarCells.push(
                                  <div key={`empty-${i}`} className="h-7"></div>
                                );
                              }
                              
                              // Add cells for each day of the month
                              for (let day = 1; day <= daysInMonth; day++) {
                                const date = `${day.toString().padStart(2, '0')}-${month}-${year}`;
                                const isPresent = attendanceDates.includes(date);
                                
                                // Find attendance record for this date to get keterangan
                                const attendanceForDay = filteredData.find(item => 
                                  format(parseISO(item.tanggal), "dd-MM-yyyy") === date
                                );
                                const keterangan = attendanceForDay?.keterangan || "";
                                
                                calendarCells.push(
                                  <div 
                                    key={date}
                                    className={`h-7 flex items-center justify-center text-xs rounded-full
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
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Date Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-none backdrop-blur-sm bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Filter Tanggal</h2>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Mulai</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Akhir</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all font-medium"
                >
                  Reset
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-medium"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Period Filter Modal */}
      {isPeriodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-none backdrop-blur-sm bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Pilih Periode</h2>
              <button
                onClick={() => setIsPeriodeModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bulan</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Bulan</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Tahun</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetPeriodFilters}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all font-medium"
                >
                  Reset
                </button>
                
                <button
                  type="button"
                  onClick={applyPeriodFilters}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-medium"
                >
                  Terapkan Periode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapPresensiDosen;