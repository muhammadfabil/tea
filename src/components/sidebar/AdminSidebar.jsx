import { Link } from "react-router-dom";

const AdminSidebar = () => (
  <div className="w-64 bg-blue-500 text-white min-h-screen p-4">
    <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
    <ul className="space-y-4">
      <li><Link to="/admin">Dashboard</Link></li>
      <li><Link to="/admin/pelayanan">Pelayanan Administrasi</Link></li>
      <li><Link to="/admin/cms">CMS Dosen & Mahasiswa</Link></li>
    </ul>
  </div>
);

export default AdminSidebar;
