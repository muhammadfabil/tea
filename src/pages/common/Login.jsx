import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, authError, user } = useAuth();

  // Redirect jika sudah terautentikasi
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role;
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "dosen") {
        navigate("/dosen/dashboard");
      } else if (role === "mahasiswa") {
        navigate("/mahasiswa/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Menampilkan pesan error dari AuthContext jika ada
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Menampilkan pesan dari redirect jika ada
  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      setError(message);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Email dan Password wajib diisi!");
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Login untuk mendapatkan token
      const loginResponse = await axios.post("http://127.0.0.1:8000/auth/login", {
        email: email,
        password: password,
      });

      const tokenData = loginResponse.data;
      
      // Step 2: Mengambil data profil pengguna menggunakan token
      const profileResponse = await axios.get("http://127.0.0.1:8000/auth/me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      });

      const userData = profileResponse.data;
      
      // Gabungkan data token dan profil
      const authData = {
        token: tokenData.access_token,
        user: userData
      };
      
      // Simpan ke context dan localStorage melalui fungsi login
      const loginSuccess = login(authData);
      
      if (!loginSuccess) {
        throw new Error("Gagal menyimpan data autentikasi");
      }

      // Redirect dilakukan oleh useEffect di atas yang mengamati isAuthenticated
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.detail || 
        error.message ||
        "Login gagal. Cek kembali email dan password."
      );
    } finally {
      setIsLoading(false);
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
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
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
              className="w-full bg-[#005AE6] text-white py-3 rounded hover:bg-white hover:text-[#005AE6] transition hover:cursor-pointer border border-[#005AE6] flex justify-center"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;