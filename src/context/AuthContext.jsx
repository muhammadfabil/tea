import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarningTimer, setSessionWarningTimer] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      setToken(parsed.token);
      setUser(parsed.user);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    try {
      const token = authData.token;
      const user = authData.user;

      // Decode JWT untuk dapatkan waktu expired
      const tokenDecoded = JSON.parse(atob(token.split(".")[1]));
      const now = new Date();
      const exp = new Date(tokenDecoded.exp * 1000);
      const duration = (exp.getTime() - now.getTime()) / 1000; // dalam detik

      console.log("✅ Login berhasil");
      console.log("🕒 Waktu login:", now.toLocaleString());
      console.log("⏰ Token akan expired pada:", exp.toLocaleString());
      console.log("🔐 Durasi sesi (detik):", Math.floor(duration));

      localStorage.setItem("auth", JSON.stringify({ token, user }));
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      setAuthError(null);

      // Tampilkan toast warning 1 menit sebelum expired
      const warningTime = (duration - 60) * 1000;
      if (warningTime > 0) {
        const timeoutId = setTimeout(() => {
          toast.warn("⚠️ Sesi Anda akan berakhir dalam 1 menit!", {
            position: "top-right",
            autoClose: 8000,
          });
        }, warningTime);
        setSessionWarningTimer(timeoutId);
      }

      return true;
    } catch (err) {
      console.error("❌ Gagal login:", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setAuthError(null);
    if (sessionWarningTimer) {
      clearTimeout(sessionWarningTimer);
    }
  };

  const refreshProfile = async () => {
    try {
      if (!token) return;
      const res = await axios.get("http://127.0.0.1:8000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Gagal refresh profil:", err);
      logout(); // Logout kalau gagal ambil profil (kemungkinan token expired)
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout,
        authError,
        refreshProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
