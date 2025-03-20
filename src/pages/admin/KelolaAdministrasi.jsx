import { useState, useEffect } from "react";

const KelolaAdministrasi = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const storedRequests = JSON.parse(localStorage.getItem("administrasiRequests")) || [];
    setRequests(storedRequests);
  }, []);

  // 🔥 Fungsi untuk mengubah status
  const updateStatus = (id, newStatus) => {
    const updatedRequests = requests.map((req) =>
      req.id === id ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);
    localStorage.setItem("administrasiRequests", JSON.stringify(updatedRequests));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Kelola Pelayanan Administrasi</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">Belum ada pengajuan.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">No</th>
              <th className="border border-gray-300 px-4 py-2">Mahasiswa</th>
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
                <td className="border border-gray-300 px-4 py-2">{req.namaMahasiswa}</td>
                <td className="border border-gray-300 px-4 py-2">{req.layanan}</td>
                <td className="border border-gray-300 px-4 py-2">{req.fileName}</td>
                <td className="border border-gray-300 px-4 py-2 text-blue-500">{req.status}</td>
                <td className="border border-gray-300 px-4 py-2 space-x-2">
                  {req.status === "Diajukan" && (
                    <button
                      onClick={() => updateStatus(req.id, "Diproses")}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      Proses
                    </button>
                  )}
                  {req.status === "Diproses" && (
                    <button
                      onClick={() => updateStatus(req.id, "Selesai")}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Selesai
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

export default KelolaAdministrasi;
