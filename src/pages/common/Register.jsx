import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const RegisterMahasiswa = () => {
  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    if (!nim || !nama || !email || !password) {
      toast.error("Semua field wajib diisi!");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Format email tidak valid!");
      return false;
    }

    if (!/^\d+$/.test(nim)) {
      toast.error("NIM hanya boleh angka!");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter!");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const res = await axios.post("http://127.0.0.1:8000/mahasiswa", {
        nim,
        nama,
        email,
        password,
      });

      toast.success("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.detail || "Terjadi kesalahan saat registrasi."
      );
    }
  };

  return (
    <div className="bg-[#005AE6] min-h-screen flex flex-col md:flex-row">
      {/* Left Side */}
      <div className="md:flex md:w-1/2 bg-[#005AE6] items-center justify-center p-6">
        <img
          src="/illustration.jpg"
          alt="Ilustrasi Register"
          className="max-w-md w-full"
        />
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 bg-[#005AE6] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-[#005AE6] text-center mb-6">
            Register Mahasiswa
          </h1>
          <form onSubmit={handleRegister}>
            <input
              type="integer"
              placeholder="NIM"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-[#005AE6]"
            />
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-[#005AE6]"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-[#005AE6]"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-[#005AE6]"
            />
            <button
              type="submit"
              className="w-full bg-[#005AE6] text-white py-3 rounded hover:bg-white hover:text-[#005AE6] transition border border-[#005AE6]"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterMahasiswa;
