// src/pages/common/LandingPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
      {/* Background image */}
      <img
        src="/bg.jpg" // ganti sesuai path lokalmu
        alt="Background Kampus"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1277C9dd] via-[#1277C9cc] to-[#1f3b6188]" />

      {/* Content */}
      <div className="relative z-10 px-6 py-12 text-center max-w-3xl">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-full shadow-md">
            <GraduationCap className="w-10 h-10 text-[#1277C9]" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Selamat Datang di <span className="text-yellow-300">SIMANTAP11</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-white/90 mb-8">
          Sistem Informasi Manajemen Administrasi & Pelayanan Terpadu untuk <b>Mahasiswa</b>, <b>Dosen</b>, dan <b>Admin</b>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="bg-white text-[#1277C9] font-semibold px-6 py-3 rounded-full shadow hover:bg-gray-100 transition duration-200 w-full sm:w-auto text-center"
          >
            Masuk Sekarang
          </Link>
          <Link
            to="/antrean-dosen"
            className="bg-[#ffffffcc] text-[#1277C9] font-semibold px-6 py-3 rounded-full shadow hover:bg-gray-100 transition duration-200 w-full sm:w-auto text-center"
          >
            Lihat Antrean Dosen
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
