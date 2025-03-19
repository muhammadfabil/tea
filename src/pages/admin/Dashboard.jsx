import { Link } from "react-router-dom";
import AdminSidebar from "../../components/sidebar/AdminSidebar";
import Navbar from "../../components/Navbar";
import ProfileCard from "../../components/ProfileCard";

const AdminDashboard = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1">
        <Navbar title="Admin Dashboard" />
        <div className="p-4">
          <ProfileCard name="Admin A" email="admin@example.com" role="admin" />

          {/* Menu Aksi Admin */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Manajemen Layanan</h2>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/admin/kelola-administrasi"
                  className="block bg-blue-500 text-white px-4 py-2 rounded text-center"
                >
                  📄 Kelola Pelayanan Administrasi
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
