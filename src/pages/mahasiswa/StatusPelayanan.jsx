import { useState, useEffect } from "react";

const StatusPelayanan = () => {
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchRequests = () => {
      const storedRequests = JSON.parse(localStorage.getItem("administrasiRequests")) || [];
      const loggedInUser = JSON.parse(sessionStorage.getItem("user")); // Ambil user yang sedang login
      
      console.log("User Login:", loggedInUser);
      console.log("📂 Data dari localStorage:", storedRequests);
  
      setUser(loggedInUser);
  
      if (loggedInUser && loggedInUser.role === "mahasiswa") {
        // 🔥 Mahasiswa hanya melihat datanya sendiri
        const filteredRequests = storedRequests.filter(
          (req) => req.namaMahasiswa === loggedInUser.nama
        );
        console.log("✅ Data yang ditampilkan:", filteredRequests);
        setRequests(filteredRequests);
      } else {
        // 🔥 Admin/Dosen bisa melihat semua data
        setRequests(storedRequests);
      }
    };
  
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, []);
  

  const handleCancel = (id) => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin membatalkan pengajuan ini?");
    if (confirmDelete) {
      const updatedRequests = requests.filter((req) => req.id !== id);
      setRequests(updatedRequests);
      localStorage.setItem("administrasiRequests", JSON.stringify(updatedRequests));
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Status Pelayanan Administrasi</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">Belum ada pengajuan.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">No</th>
              <th className="border border-gray-300 px-4 py-2">Layanan</th>
              <th className="border border-gray-300 px-4 py-2">Berkas</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, index) => (
              <tr key={req.id} className="text-center">
                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">{req.layanan}</td>
                <td className="border border-gray-300 px-4 py-2">{req.fileName}</td>
                <td className="border border-gray-300 px-4 py-2 text-blue-500">{req.status}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {req.status === "Diajukan" && (
                    <button
                      onClick={() => handleCancel(req.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Batalkan
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StatusPelayanan;
