import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FileText, Trash2, FileCheck, CircleCheck, Clock } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const StatusPelayanan = () => {
  const [administrasiRequests, setAdministrasiRequests] = useState([]);

  useEffect(() => {
    const dummyData = [
      {
        layanan: "Pembuatan Surat Aktif Kuliah",
        berkas: { name: "Surat_Kuliah.pdf" },
        status: "Diajukan",
      },
      {
        layanan: "Permohonan Cuti Akademik",
        berkas: { name: "Form_Cuti.pdf" },
        status: "Diproses",
      },
      {
        layanan: "Pengajuan Legalisir Ijazah",
        berkas: { name: "Ijazah_Legalisir.pdf" },
        status: "Selesai",
      },
    ];

    setAdministrasiRequests(dummyData);
  }, []);

  const handleDelete = (index) => {
    if (window.confirm("Yakin ingin menghapus pengajuan ini?")) {
      const newRequests = administrasiRequests.filter((_, i) => i !== index);
      setAdministrasiRequests(newRequests);
      localStorage.setItem("administrasiRequests", JSON.stringify(newRequests));
      toast.success("Pengajuan berhasil dihapus!");
    }
  };

  const getStatusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1";
    switch (status) {
      case "Diajukan":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-700`}>
            <Clock className="w-3 h-3" /> {status}
          </span>
        );
      case "Diproses":
        return (
          <span className={`${base} bg-blue-100 text-blue-700`}>
            <FileCheck className="w-3 h-3" /> {status}
          </span>
        );
      case "Selesai":
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            <CircleCheck className="w-3 h-3" /> {status}
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto bg-white text-gray-800">
      <h1 className="text-3xl font-bold text-[#005AE6] mb-6 text-center">
        Status Pengajuan Administrasi
      </h1>

      {administrasiRequests.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {administrasiRequests.map((request, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col justify-between transition duration-300"
            >
              <div className="mb-3">
                <div className="flex items-center gap-3 text-[#005AE6] font-semibold mb-1">
                  <FileCheck className="w-5 h-5" />
                  Layanan
                </div>
                <p>{request.layanan}</p>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-3 text-[#005AE6] font-semibold mb-1">
                  <FileText className="w-5 h-5" />
                  Berkas
                </div>
                <p className="text-gray-600">{request.berkas.name}</p>
              </div>

              <div className="mb-4">{getStatusBadge(request.status)}</div>

              <button
                onClick={() => handleDelete(index)}
                className="mt-auto bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm hover:bg-red-200 transition flex items-center gap-2 w-fit"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 py-12">
          Tidak ada pengajuan layanan saat ini.
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default StatusPelayanan;
