import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // 🔄 Ambil login dari useAuth
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  
    let userData = null;
  
    if (username === "admin123" && password === "adminpass") {
      userData = { id: "1", nama: "Admin Sistem", role: "admin" };
    } else if (username === "dosen123" && password === "dosenpass") {
      userData = { id: "2", nama: "Dosen Pembimbing", role: "dosen" };
    } else if (username === "mahasiswa123" && password === "mahasiswapass") {
      userData = { id: "3", nama: "Budi Santoso", role: "mahasiswa" };
    } else {
      setError("Username atau Password salah!");
      return;
    }
  
    console.log("🔹 Login berhasil:", userData); // ✅ Cek log saat login
  
    login(userData); // ✅ Simpan user di context/auth
  
    // ✅ Redirect ke dashboard setelah login
    navigate(`/${userData.role}/dashboard`);
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-center text-3xl text-blue-500">SIMANTAP TEKNIK INFORMATIKA ITERA</h2>
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Login Sistem Antrian</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg border"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg border"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-white hover:text-blue-500 border hover:border-blue-500">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
