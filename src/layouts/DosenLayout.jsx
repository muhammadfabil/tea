import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, Calendar, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { GrTechnology } from "react-icons/gr";
import { FaRegNewspaper } from "react-icons/fa6";


const DosenLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItem = "flex items-center w-full px-5 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:bg-blue-50";
  const activeNav = "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600 hover:text-white";

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl p-6 flex flex-col justify-between z-30 transition-all duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        <div>
          {/* Header Sidebar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
                <LiaChalkboardTeacherSolid className="text-white font-bold text-lg" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">Dosen Panel</h2>
            </div>
            <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={toggleSidebar}>
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="my-6 border-t border-gray-100"></div>
          
          <nav className="space-y-3">
            <NavLink
              to="/dosen/dashboard"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeNav : "text-gray-700"}`
              }
            >
              <div className="flex items-center">
                <LayoutDashboard className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </div>
            </NavLink>
            <NavLink
              to="/dosen/kelola-jadwal"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeNav : "text-gray-700"}`
              }
            >
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3" />
                <span>Kelola Jadwal</span>
              </div>
            </NavLink>
            <NavLink
              to="/dosen/daftar-mahasiswa"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeNav : "text-gray-700"}`
              }
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3" />
                <span>Daftar Mahasiswa</span>
              </div>
            </NavLink>
            <NavLink
              to="/dosen/profil"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeNav : "text-gray-700"}`
              }
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3" />
                <span>Profile</span>
              </div>
            </NavLink>
            <NavLink
              to="/dosen/news"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeNav : "text-gray-700"}`
              }
            >
              <div className="flex items-center">
                <FaRegNewspaper className="w-5 h-5 mr-3" />
                <span>News IF</span>
              </div>
            </NavLink>

          
            
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mt-6 flex items-center justify-center w-full px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md"
        >
          <LogOut className="w-5 h-5 mr-2" />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar for mobile */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-10">
          <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100">
            <Menu className="w-6 h-6 text-blue-600" />
          </button>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">Dosen Panel</h1>
          <div className="w-6"></div> {/* For balance */}
        </div>
        <div className="bg-white text-blue-800 py-4 px-6 shadow-md border-b border-gray-200 flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center space-x-2">
            <GrTechnology className="w-7 h-7 text-blue-700" />
            <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-blue-700 to-blue-900 text-transparent bg-clip-text">
              SIMANTAP
            </h1>
          </div>
          <p className="text-xs text-blue-600 tracking-wide font-medium text-center">
          Sistem Manajemen Layanan Administrasi dan Antrean Program Studi
          </p>
        </div>

        {/* Page Content Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-sm border border-gray-100 animate-fadeIn">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Konfirmasi Logout</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah kamu yakin ingin logout dari sistem?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DosenLayout;