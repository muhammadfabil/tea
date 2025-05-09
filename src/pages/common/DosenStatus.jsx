import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCheck, FaUserTimes } from "react-icons/fa";
import { BsArrowRightSquareFill, BsArrowLeftSquareFill } from "react-icons/bs";

const DosenStatus = () => {
  const [dosenList, setDosenList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const wsRef = useRef(null);
  const autoSwitchRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const API = import.meta.env.VITE_API_BASE_URL;
  
  // Jumlah kartu per halaman (sesuaikan dengan ukuran monitor)
  const CARDS_PER_PAGE = 20;

  // Auto-switch halaman setiap 15 detik
  useEffect(() => {
    if (dosenList.length > CARDS_PER_PAGE) {
      autoSwitchRef.current = setInterval(() => {
        setCurrentPage(prev => 
          (prev + 1) % Math.ceil(dosenList.length / CARDS_PER_PAGE)
        );
      }, 15000);
    }
    
    return () => {
      if (autoSwitchRef.current) clearInterval(autoSwitchRef.current);
    };
  }, [dosenList.length]);

  useEffect(() => {
    // Fetch initial data
    const fetchDosen = async () => {
      try {
        const response = await axios.get(`${API}/dosen/all`);
        setDosenList(response.data);
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

      wsRef.current.onclose = () => {
        setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      wsRef.current.onerror = () => {
        wsRef.current.close();
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [API]);

  // Effect to handle cursor movement and hiding controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      // Clear any existing timeout
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      // Set a new timeout to hide controls after 3 seconds
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    // Add event listener for mouse movement
    window.addEventListener('mousemove', handleMouseMove);
    
    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const updateDosenStatus = (inisial, status, nama, keterangan) => {
    setDosenList((prevList) => {
      return prevList.map((dosen) => {
        if (dosen.alias === inisial) {
          return {
            ...dosen,
            status_kehadiran: status,
            name: nama || dosen.name,
            keterangan: keterangan, // Perbarui keterangan meskipun kosong
          };
        }
        return dosen;
      });
    });
  };

  // Dapatkan subset dosen untuk halaman saat ini
  const getVisibleDosen = () => {
    // Sort dosen - hadir (status_kehadiran = true) first, then tidak hadir
    const sortedDosen = [...dosenList].sort((a, b) => {
      // Sort by status_kehadiran (true first)
      if (a.status_kehadiran !== b.status_kehadiran) {
        return a.status_kehadiran ? -1 : 1;
      }
      // If same status, sort by alias/name
      return a.alias.localeCompare(b.alias);
    });
    
    const startIndex = currentPage * CARDS_PER_PAGE;
    return sortedDosen.slice(startIndex, startIndex + CARDS_PER_PAGE);
  };

  // Hitung total halaman
  const totalPages = Math.ceil(dosenList.length / CARDS_PER_PAGE);

  // Navigasi halaman
  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <div 
      className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800"
    >
      <div className="h-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full p-2"
          >
            <div className="grid grid-cols-5 grid-rows-4 gap-2 h-full">
              {getVisibleDosen().map((dosen, index) => (
                <motion.div
                  key={`${dosen.alias}-${index}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: index * 0.03, 
                    duration: 0.2 
                  }}
                  className={`flex flex-col relative ${
                    dosen.status_kehadiran 
                      ? "bg-gradient-to-br from-emerald-600 to-emerald-900" 
                      : "bg-gradient-to-br from-rose-600 to-rose-900"
                  } text-white rounded-lg overflow-hidden border-2 ${
                    dosen.status_kehadiran
                      ? "border-emerald-400"
                      : "border-rose-400"
                  } shadow-xl`}
                  style={{
                    boxShadow: dosen.status_kehadiran 
                      ? "0 8px 20px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3)" 
                      : "0 8px 20px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3)"
                  }}
                >
                  {/* Status indicator with embossed look */}
                  <div className="absolute top-2 right-3 bg-white/10 p-1.5 rounded-full" 
                       style={{ 
                         boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 1px rgba(255, 255, 255, 0.1)" 
                       }}>
                    {dosen.status_kehadiran ? 
                      <FaUserCheck size={24} className="text-white" style={{ filter: "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.5))" }} /> : 
                      <FaUserTimes size={24} className="text-white" style={{ filter: "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.5))" }} />
                    }
                  </div>
                  
                  {/* Alias - Big and prominent with embossed text */}
                  <div className="px-3 py-3 text-center">
                    <span className="text-6xl font-bold tracking-wide" 
                          style={{ 
                            textShadow: "0 -2px 1px rgba(0, 0, 0, 0.8), 0 1px 1px rgba(255, 255, 255, 0.3)"
                          }}>
                      {dosen.alias}
                    </span>
                  </div>
                  
                  {/* Name and status */}
                  <div className="px-3 pb-2 flex-grow">
                    <h3 className="text-xl font-bold break-words" 
                        style={{ 
                          textShadow: "0 -1px 1px rgba(0, 0, 0, 0.8), 0 1px 1px rgba(255, 255, 255, 0.2)",
                          lineHeight: "1.2"
                        }}>
                      {dosen.name}
                    </h3>
                    
                    {/* Keterangan with embossed panel */}
                    <div className={`mt-2 p-2 rounded-md text-xl min-h-12 max-h-24 overflow-auto text-center
                      ${dosen.status_kehadiran 
                        ? "bg-emerald-800/80" 
                        : "bg-rose-800/80"
                      } border ${
                        dosen.status_kehadiran
                          ? "border-emerald-500/40"
                          : "border-rose-500/40"
                      }`}
                      style={{ 
                        boxShadow: "inset 0 2px 5px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.1)"
                      }}
                    >
                      <span className="font-bold" 
                            style={{ 
                              textShadow: "0 -1px 0 rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.2)" 
                            }}>
                        {dosen.keterangan || "-"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons - only show if multiple pages AND cursor moved recently */}
        {totalPages > 1 && (
          <AnimatePresence>
            {showControls && (
              <>
                <motion.button 
                  onClick={prevPage}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white hover:scale-110 transition-all duration-200 focus:outline-none z-10"
                  aria-label="Previous page"
                >
                  <BsArrowLeftSquareFill size={40} className="drop-shadow-lg" />
                </motion.button>
                
                <motion.button 
                  onClick={nextPage}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white hover:scale-110 transition-all duration-200 focus:outline-none z-10"
                  aria-label="Next page"
                >
                  <BsArrowRightSquareFill size={40} className="drop-shadow-lg" />
                </motion.button>
              </>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default DosenStatus;