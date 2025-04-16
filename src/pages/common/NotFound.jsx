import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#005AE6] text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-6xl font-bold mb-4 sm:text-7xl">404</h1>
      <p className="text-xl mb-6 sm:text-2xl text-center">
        Halaman tidak ditemukan.
      </p>
      <Link to="/" className="bg-white text-[#005AE6] px-6 py-3 rounded shadow hover:bg-[#e0e0e0] transition">
        Kembali ke Beranda
      </Link>
    </div>
  );
};

export default NotFound;
