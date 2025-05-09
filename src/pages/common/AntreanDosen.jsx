import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaUserCheck, FaUserTimes, FaChalkboardTeacher, FaArrowLeft } from "react-icons/fa";
import { BiTimeFive } from "react-icons/bi";
import { IoIosSchool } from "react-icons/io";
import { GrTechnology } from "react-icons/gr";
import { Link, useLocation } from "react-router-dom";

const AntreanDosen = () => {
  const [time, setTime] = useState(new Date());
  const [dosenList, setDosenList] = useState([]);
  const wsRef = useRef(null);
  const API = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const auth = localStorage.getItem("auth");
    if (auth) {
      try {
        const authData = JSON.parse(auth);
        setIsLoggedIn(true);
        setUserRole(authData.user?.role || null);
      } catch (error) {
        console.error("Error parsing auth data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch initial data
    const fetchDosen = async () => {
      try {
        const response = await axios.get(`${API}/dosen/all`);
        const data = response.data;
        setDosenList(data);
      } catch (error) {
        console.error("Gagal ambil data dosen:", error);
      }
    };

    fetchDosen();

    // Setup WebSocket connection
    const connectWebSocket = () => {
      wsRef.current = new WebSocket(`${API.replace(/^https?/, 'wss')}/ws/public`);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket data received:", data);

          if (data && data["Inisial Dosen"]) {
            updateDosenStatus(
              data["Inisial Dosen"],
              data["Status Kehadiran"], 
              data["Nama Dosen"],
              data["Keterangan"] || "" 
            );
          }
        } catch (error) {
          console.error("Error parsing WebSocket data:", error);
        }
      };

      wsRef.current.onclose = (e) => {
        console.log("WebSocket disconnected:", e.reason);
        // Try to reconnect after 3 seconds
        setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        wsRef.current.close();
      };
    };

    connectWebSocket();

    // Cleanup WebSocket connection on component unmount
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  // Update dosen status when new WebSocket data is received
  const updateDosenStatus = (inisial, status, nama, keterangan) => {
    console.log(`Updating dosen ${inisial} status to:`, status, "keterangan:", keterangan);
    
    setDosenList((prevList) => {
      return prevList.map((dosen) => {
        if (dosen.alias === inisial) {
          return {
            ...dosen,
            status_kehadiran: status, // Pastikan nilai status di-pass ke properti yang benar
            name: nama || dosen.name,
            keterangan: keterangan || dosen.keterangan
          };
        }
        return dosen;
      });
    });
  };

  const formatTime = (date) =>
    date.toLocaleTimeString("id-ID", { hour12: false });
    
  const formatDate = (date) => 
    date.toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100
      }
    }
  };

  // Determine back button destination
  const getBackButtonLink = () => {
    if (isLoggedIn) {
      // If user is logged in, determine which dashboard to return to based on role
      if (userRole === 'mahasiswa') {
        return '/mahasiswa/dashboard';
      } else if (userRole === 'dosen') {
        return '/dosen/dashboard';
      } else if (userRole === 'admin') {
        return '/admin/dashboard';
      } else {
        return '/';
      }
    } else {
      // If not logged in, return to landing page
      return '/';
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative accent elements for left and right sides */}
      <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-blue-800 to-blue-600 opacity-80 hidden lg:block">
        <div className="h-full flex flex-col items-center justify-center gap-16">
          <IoIosSchool className="text-white/40 w-8 h-8" />
          <div className="h-32 w-px bg-white/20"></div>
          <FaChalkboardTeacher className="text-white/40 w-8 h-8" />
          <div className="h-32 w-px bg-white/20"></div>
          <IoIosSchool className="text-white/40 w-8 h-8" />
        </div>
      </div>
      
      <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-blue-800 to-blue-600 opacity-80 hidden lg:block">
        <div className="h-full flex flex-col items-center justify-center gap-16">
          <FaChalkboardTeacher className="text-white/40 w-8 h-8" />
          <div className="h-32 w-px bg-white/20"></div>
          <IoIosSchool className="text-white/40 w-8 h-8" />
          <div className="h-32 w-px bg-white/20"></div>
          <FaChalkboardTeacher className="text-white/40 w-8 h-8" />
        </div>
      </div>

      {/* Stylish header with gradient and texture */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-700 text-white py-4 shadow-lg relative z-10">
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOSAxLjc5MS00IDQtNHM0IDEuNzkxIDQgNC0xLjc5MSA0LTQgNC00LTEuNzkxLTQtNHptMC0zMGMwLTIuMjA5IDEuNzkxLTQgNC00czQgMS43OTEgNCA0LTEuNzkxIDQtNCA0LTQtMS43OTEtNC00em0wIDYwYzAtMi4yMDkgMS43OTEtNCA0LTRzNCAxLjc5MSA0IDQtMS43OTEgNC00IDQtNC0xLjc5MS00LTR6TTYgMzRjMC0yLjIwOSAxLjc5MS00IDQtNHM0IDEuNzkxIDQgNC0xLjc5MSA0LTQgNC00LTEuNzkxLTQtNHptMC0zMGMwLTIuMjA5IDEuNzkxLTQgNC00czQgMS43OTEgNCA0LTEuNzkxIDQtNCA0LTQtMS43OTEtNC00em0wIDYwYzAtMi4yMDkgMS43OTEtNCA0LTRzNCAxLjc5MSA0IDQtMS43OTEgNC00IDQtNC0xLjc5MS00LTR6Ij48L3BhdGg+PC9nPjwvZz48L3N2Zz4=')]"></div>
        
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center mb-3 sm:mb-0"
          >
            {/* Back button */}
            <Link 
              to={getBackButtonLink()} 
              className="mr-3 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors duration-200"
            >
              <FaArrowLeft className="text-white w-5 h-5" />
            </Link>
            
            <div className="bg-white rounded-full p-2 mr-4 shadow-md">
              <GrTechnology className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide">
                SIMANTAP
              </h1>
              <p className="text-xs text-blue-100 tracking-wide font-medium">
                Status Kehadiran Dosen
              </p>
              <p className="text-xs text-blue-100 tracking-wide font-medium">
                Program Studi Teknik Informatika
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center bg-white/10 px-4 py-3 rounded-lg backdrop-blur-sm border border-white/20 shadow-md"
          >
            <BiTimeFive className="mr-3 text-2xl text-white" />
            <div className="flex flex-col">
              <span className="text-xs text-blue-100">{formatDate(time)}</span>
              <span className="text-xl font-mono font-medium text-white">{formatTime(time)}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-grow bg-gradient-to-br from-gray-50 to-blue-50 py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Dosen Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pb-24"
          >
            {dosenList.map((dosen, index) => (
              <motion.div
                key={dosen.id || index}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                className="rounded-xl overflow-hidden shadow-lg bg-white"
              >
                {/* Card Header with Alias - Now with solid background and centered */}
                <div className={`py-4 flex flex-col items-center justify-center ${
                  dosen.status_kehadiran 
                    ? "bg-emerald-600 text-white" 
                    : "bg-rose-600 text-white"
                }`}>
                  <div className="text-3xl font-bold">{dosen.alias}</div>
                  <div className="mt-2 flex items-center">
                    {dosen.status_kehadiran ? 
                      <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                        <FaUserCheck size={14} className="mr-1" /> 
                        <span className="text-sm font-medium">Hadir</span>
                      </div> 
                      : 
                      <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                        <FaUserTimes size={14} className="mr-1" /> 
                        <span className="text-sm font-medium">Tidak Hadir</span>
                      </div>
                    }
                  </div>
                </div>
                
                {/* Card Body with Keterangan */}
                <div className="p-4">
                  {/* Keterangan Section - With improved contrast */}
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Keterangan</div>
                    <div className={`p-3 rounded-lg text-sm ${
                      dosen.status_kehadiran 
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                        : "bg-rose-50 text-rose-800 border border-rose-100"
                    }`}>
                      {dosen.keterangan || "Tidak ada keterangan"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Floating navigation button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30"
      >
        <div className="flex items-center justify-center gap-3">
          <Link 
            to={getBackButtonLink()}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="rounded-full bg-white/20 p-1.5 transition-all duration-300 group-hover:bg-white/30">
              <FaArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">
              {isLoggedIn ? 'Kembali ke Dashboard' : 'Kembali ke Beranda'}
            </span>
          </Link>
          
          {!isLoggedIn && (
            <Link 
              to="/login"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="font-medium">Masuk</span>
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AntreanDosen;