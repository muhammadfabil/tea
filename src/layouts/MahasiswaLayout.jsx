import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const MahasiswaLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItem =
    "block px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-blue-100";
  const activeNav = "bg-blue-500 text-white";

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed z-30 top-0 left-0 h-screen w-64 bg-white shadow-md p-6 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <h2 className="text-xl font-bold text-blue-600">SI Bimbingan</h2>
          <button className="md:hidden" onClick={toggleSidebar}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="space-y-2">
          <NavLink
            to="/mahasiswa/dashboard"
            className={({ isActive }) =>
              `${navItem} ${isActive ? activeNav : "text-gray-800"}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/mahasiswa/pilih-dosen"
            className={({ isActive }) =>
              `${navItem} ${isActive ? activeNav : "text-gray-800"}`
            }
          >
            Pilih Dosen
          </NavLink>
          <NavLink
            to="/mahasiswa/ajukan-layanan"
            className={({ isActive }) =>
              `${navItem} ${isActive ? activeNav : "text-gray-800"}`
            }
          >
            Ajukan Layanan
          </NavLink>
          <NavLink
            to="/mahasiswa/status-layanan"
            className={({ isActive }) =>
              `${navItem} ${isActive ? activeNav : "text-gray-800"}`
            }
          >
            Status Layanan
          </NavLink>
          <NavLink
            to="/mahasiswa/pilih-jadwal"
            className={({ isActive }) =>
              `${navItem} ${isActive ? activeNav : "text-gray-800"}`
            }
          >
            Pilih Jadwal
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-0 md:ml-16">
        {/* Topbar for mobile */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white shadow">
          <button onClick={toggleSidebar}>
            <Menu className="w-6 h-6 text-blue-600" />
          </button>
          <h1 className="text-lg font-semibold text-blue-600">Mahasiswa</h1>
        </div>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );  
};

export default MahasiswaLayout;
