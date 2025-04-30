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
  const [autoRefreshTimer, setAutoRefreshTimer] = useState(null);

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

  const syncTokenToLocalStorage = (newToken) => {
    const stored = JSON.parse(localStorage.getItem("auth")) || {};
    localStorage.setItem("auth", JSON.stringify({ ...stored, token: newToken }));
  };

  const login = (authData) => {
    try {
      const { token, refresh_token, user } = authData;
      const tokenDecoded = JSON.parse(atob(token.split(".")[1]));
      const now = new Date();
      const exp = new Date(tokenDecoded.exp * 1000);
      const duration = (exp.getTime() - now.getTime()) / 1000;

      localStorage.setItem("auth", JSON.stringify({ token, refresh_token, user }));
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      setAuthError(null);
      syncTokenToLocalStorage(token);

      // Warning 1 menit sebelum expired
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

  const refreshToken = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem("auth"));
      if (!stored?.refresh_token) throw new Error("Refresh token tidak ditemukan");

      const response = await axios.post(
        `http://127.0.0.1:8000/auth/refresh?token=${stored.refresh_token}`
      );

      const { access_token, refresh_token } = response.data;

      const updatedAuth = { ...stored, token: access_token, refresh_token };
      localStorage.setItem("auth", JSON.stringify(updatedAuth));
      setToken(access_token);
      syncTokenToLocalStorage(access_token);

      console.log("🔄 Token berhasil diperbarui");
      return access_token;
    } catch (err) {
      console.error("❌ Gagal refresh token:", err);
      logout();
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
    if (autoRefreshTimer) {
      clearTimeout(autoRefreshTimer);
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
      logout();
    }
  };

  // Axios interceptor untuk refresh token jika 401
  useEffect(() => {
    const axiosInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.warn("🔒 Token expired, mencoba refresh...");
          const newToken = await refreshToken();
          if (newToken) {
            error.config.headers["Authorization"] = `Bearer ${newToken}`;
            return axios(error.config);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(axiosInterceptor);
    };
  }, [token]);

  // Timer otomatis refresh token sebelum expired
  useEffect(() => {
    if (!token) return;

    let timeoutId;
    try {
      const tokenDecoded = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now();
      const exp = tokenDecoded.exp * 1000;
      const refreshBefore = 60 * 1000; // 1 menit sebelum expired
      const delay = exp - now - refreshBefore;

      if (delay > 0) {
        timeoutId = setTimeout(() => {
          refreshToken();
        }, delay);
        setAutoRefreshTimer(timeoutId);
      }
    } catch (e) {
      // ignore
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [token]);

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
        refreshToken, // expose refreshToken if needed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);