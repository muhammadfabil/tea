import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // ✅ Ambil user dari sessionStorage saat pertama kali aplikasi dimuat
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    console.log("📌 Cek user di AuthContext setelah reload:", user);
  }, [user]); // 🔍 Debugging: Pastikan user diperbarui saat reload

  const login = (userData) => {
    console.log("✅ Login sukses, simpan ke sessionStorage:", userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    navigate(`/${userData.role}/dashboard`);
  };

  const logout = () => {
    console.log("🚪 Logout: Hapus sessionStorage");
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
