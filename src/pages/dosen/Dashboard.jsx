import DosenSidebar from "../../components/sidebar/DosenSidebar";
import Navbar from "../../components/Navbar";
import ProfileCard from "../../components/ProfileCard";

const DosenDashboard = () => (
  <div className="flex">
    <DosenSidebar />
    <div className="flex-1">
      <Navbar title="Dosen Dashboard" />
      <div className="p-4">
        <ProfileCard
          name="Dosen B"
          ttl="Jakarta, 10 Mei 1980"
          id="123456789"
          email="dosen@example.com"
          role="dosen"
        />
      </div>
    </div>
  </div>
);

export default DosenDashboard;
