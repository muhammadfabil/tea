import React from "react";
import { Link } from "react-router-dom";
import Noise from '../../reactbits/Noise.jsx';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center px-6 relative">
      <div className="w-full h-full absolute top-0 left-0 overflow-hidden">
        <Noise
          patternSize={1000}
          patternScaleX={1.5}
          patternScaleY={1.5}
          patternRefreshInterval={0.5}
          patternAlpha={25}
        />
      </div>
      <div className="z-10 bg-black bg-opacity-60 p-10 rounded-lg border border-gray-700 shadow-lg backdrop-blur-sm">
        <h1 className="text-8xl font-bold mb-4 text-red-500 glitch-text">404</h1>
        <p className="text-2xl mb-8 text-center text-gray-100">
          Halaman tidak ditemukan.
        </p>
        <Link to="/" className="bg-gray-100 text-gray-900 px-6 py-3 rounded shadow hover:bg-white transition font-medium block text-center">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFound;