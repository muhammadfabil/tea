import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";

const RegisterMahasiswa = () => {
  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    if (!nim || !nama || !email || !password) {
      setError("Semua field wajib diisi!");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid!");
      return false;
    }

    if (!/^\d+$/.test(nim)) {
      setError("NIM hanya boleh angka!");
      return false;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter!");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post("https://d1raf3a33gcfqd.cloudfront.net/mahasiswa", {
        nim,
        nama,
        email,
        password,
      });

      toast.success("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.detail || "Terjadi kesalahan saat registrasi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-4xl flex overflow-hidden rounded-2xl shadow-xl">
        {/* Left side - Brand and Illustration */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 p-12 text-white">
          <div className="h-full flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-center">SIMANTAP</h2>
              <p className="text-blue-100 mb-6 text-center">Sistem Manajemen Layanan Administrasi dan Antrean Program Studi</p>
            </div>
            <div className="flex justify-center items-end h-full">
              <img
                src="/illustration.jpg"
                alt="Register Illustration"
                className="max-w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Right side - Registration Form */}
        <div className="w-full md:w-1/2 bg-white p-10">
          <div className="md:hidden text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-600">SIMANTAP</h2>
            <p className="text-gray-500 text-sm">Sistem Manajemen Layanan Administrasi dan Antrean Program Studi</p>
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Register Mahasiswa</h3>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label htmlFor="nim" className="block text-sm font-medium text-gray-700 mb-1">
                NIM
              </label>
              <input
                id="nim"
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Masukkan NIM Anda"
              />
            </div>
            
            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                id="nama"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Masukkan nama lengkap Anda"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Masukkan email Anda"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12"
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : "Register"}
            </button>
            
            <div className="text-center">
              <p className="text-gray-600 mt-4">
                Sudah memiliki akun?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Login
                </button>
              </p>
            </div>
          </form>
          
          <div className="mt-10 pt-5 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              © {new Date().getFullYear()} SIMANTAP. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterMahasiswa;
