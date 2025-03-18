import AdminSidebar from "../../components/sidebar/AdminSidebar";
import Navbar from "../../components/Navbar";
import ProfileCard from "../../components/ProfileCard";

const AdminDashboard = () => (
  <div className="flex">
    <AdminSidebar />
    <div className="flex-1">
      <Navbar title="Admin Dashboard" />
      <div className="p-4">
        <ProfileCard name="Admin A" email="admin@example.com" role="admin" />
      </div>
    </div>
  </div>
);

export default AdminDashboard;
