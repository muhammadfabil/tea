import { Link } from "react-router-dom";

const DosenSidebar = () => (
  <div className="w-64 bg-blue-500 text-white min-h-screen p-4">
    <h2 className="text-2xl font-bold mb-6">Dosen Panel</h2>
    <ul className="space-y-4">
      <li><Link to="/dosen">Dashboard</Link></li>
      <li><Link to="/dosen/jadwal">Atur Jadwal Bimbingan</Link></li>
      <li><Link to="/dosen/antrian">Antrian Bimbingan</Link></li>
    </ul>
  </div>
);

export default DosenSidebar;
