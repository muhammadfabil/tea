import { Routes, Route } from "react-router-dom";
import MahasiswaSidebar from "../../components/sidebar/MahasiswaSidebar";
import Navbar from "../../components/Navbar";
import ProfileCard from "../../components/ProfileCard";
import AjukanAdministrasi from "./AjukanAdministrasi";
import StatusPelayanan from "./StatusPelayanan";

const MahasiswaDashboard = () => (
  <div className="flex">
    <MahasiswaSidebar />
    <div className="flex-1">
      <Navbar title="Mahasiswa Dashboard" />
      <div className="p-4">
        <Routes>
          <Route
            path="/"
            element={
              <ProfileCard
                name="Mahasiswa C"
                ttl="Bandung, 15 Juli 2000"
                id="19000123"
                email="mahasiswa@example.com"
                role="mahasiswa"
              />
            }
          />
          <Route path="pelayanan" element={<AjukanAdministrasi />} />
          <Route path="status-pelayanan" element={<StatusPelayanan />} />
        </Routes>
      </div>
    </div>
  </div>
);

export default MahasiswaDashboard;
