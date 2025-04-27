import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItem =
    "block px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-blue-100";
  const activeNav = "bg-blue-500 text-white";

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md p-6 flex flex-col justify-between z-30 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        <div>
          {/* Header Sidebar */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h2 className="text-xl font-bold text-blue-600">Admin Panel</h2>
            <button className="md:hidden" onClick={toggleSidebar}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-2">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeNav : "text-gray-800"}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/mahasiswa"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeNav : "text-gray-800"}`
              }
            >
              Mahasiswa
            </NavLink>
            <NavLink
              to="/admin/dosen"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeNav : "text-gray-800"}`
              }
            >
              Dosen
            </NavLink>
            <NavLink
              to="/admin/pelayanan"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeNav : "text-gray-800"}`
              }
            >
              Layanan Administrasi
            </NavLink>
            <NavLink
              to="/admin/manajemen-pelayanan"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeNav : "text-gray-800"}`
              }
            >
              Manajemen Layanan Administrasi
            </NavLink>
            <NavLink
              to="/admin/list-admin"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeNav : "text-gray-800"}`
              }
            >
              Manajemen Daftar Admin
            </NavLink>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setShowModal(true)}
          className="border-2 border-red-600 hover:cursor-pointer mt-6 flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-white hover:text-red-600 transition"
        >
          <LogOut className="w-4 h-4 mr-2 " />
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-24">
        {/* Topbar for mobile */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white shadow">
          <button onClick={toggleSidebar}>
            <Menu className="w-6 h-6 text-blue-600" />
          </button>
          <h1 className="text-lg font-semibold text-blue-600">Admin</h1>
        </div>

        {/* Page Content Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Konfirmasi Logout</h2>
            <p className="text-sm text-gray-600 mb-6">
              Apakah kamu yakin ingin logout?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="hover:cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 hover:cursor-pointer"
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

export default AdminLayout;
