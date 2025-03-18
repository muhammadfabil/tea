import { useState, useEffect } from "react";

const StatusPelayanan = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const storedRequests = JSON.parse(localStorage.getItem("administrasiRequests")) || [];
    setRequests(storedRequests);
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Status Pelayanan Administrasi</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">Belum ada pengajuan.</p>
      ) : (
        <ul className="space-y-2">
          {requests.map((req) => (
            <li key={req.id} className="border p-2 rounded">
              <p><strong>Layanan:</strong> {req.service}</p>
              <p><strong>Berkas:</strong> {req.fileName}</p>
              <p><strong>Status:</strong> {req.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StatusPelayanan;
