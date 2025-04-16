import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulasi validasi login
    if (!username || !password) {
      alert("Username dan Password wajib diisi!");
    } else {
      // Login berhasil, arahkan ke halaman Dashboard Mahasiswa
      navigate("/mahasiswa/dashboard");
    }
  };

  return (
    <div className="bg-[#005AE6] min-h-screen flex flex-col md:flex-row">
      {/* Left side - Illustration */}
      <div className="md:flex md:w-1/2 bg-[#005AE6] items-center justify-center p-6">
        <img
          src="/illustration.jpg"
          alt="Ilustrasi Login"
          className="max-w-md w-full"
        />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 bg-[#005AE6] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-[#005AE6] text-center mb-6">
            SIMANTAP
          </h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              className="w-full bg-[#005AE6] text-white py-3 rounded hover:bg-white hover:text-[#005AE6] transition hover:cursor-pointer border-1 border-[#005AE6]"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
