import { useState } from "react";
import useAuth  from "../../context/useAuth";
// import SplashCursor from '../../UI/SplashCursor/SplashCursor'



const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Cek akun dummy
    if (username === "admin123" && password === "adminpass") {
      login(username, "admin");
    } else if (username === "dosen123" && password === "dosenpass") {
      login(username, "dosen");
    } else if (username === "mahasiswa123" && password === "mahasiswapass") {
      login(username, "mahasiswa");
    } else {
      setError("Username atau Password salah!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-center text-3xl text-blue-500">SIMANTAP TEKNIK INFORMATIKA ITERA</h2>
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">
          Login Sistem Antrian
        </h2>
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
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-white hover:text-blue-500 cursor-pointer border-bl hover:border-blue-500"
        >
          Login
        </button> 
      </form>
      {/* <SplashCursor /> */}
    </div>
  );
};

export default Login;
