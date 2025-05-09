import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const AuthContext = createContext();
export { AuthContext }; // Add explicit export for AuthContext
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarningTimer, setSessionWarningTimer] = useState(null);
  const [autoRefreshTimer, setAutoRefreshTimer] = useState(null);
  const [autoLogoutTimer, setAutoLogoutTimer] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const stored = localStorage.getItem("auth");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const isValid = await verifyTokenValidity(parsed.token, parsed.refresh_token);

          if (isValid) {
            setToken(parsed.token);
            setUser(parsed.user);
            setIsAuthenticated(true);
            setupAutoLogout(parsed.token);
          } else {
            // Jika token tidak valid, logout sudah dipanggil dalam verifyTokenValidity
          }
        } catch (err) {
          console.error("Invalid token format, logging out", err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Fungsi untuk menyiapkan timer auto logout
  const setupAutoLogout = (currentToken) => {
    if (autoLogoutTimer) {
      clearTimeout(autoLogoutTimer);
    }

    try {
      const tokenDecoded = JSON.parse(atob(currentToken.split(".")[1]));
      const now = Date.now();
      const exp = tokenDecoded.exp * 1000;
      const timeUntilExpiry = exp - now;

      if (timeUntilExpiry <= 0) {
        // Token sudah expired
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        logout();
        return;
      }

      // Set timer untuk logout otomatis saat token benar-benar expired
      const logoutTimer = setTimeout(() => {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        logout();
      }, timeUntilExpiry);

      setAutoLogoutTimer(logoutTimer);
      console.log(`🔒 Auto logout dijadwalkan dalam ${Math.round(timeUntilExpiry / 1000 / 60)} menit`);
    } catch (err) {
      console.error("Error setting up auto logout:", err);
    }
  };

  const verifyTokenValidity = async (currentToken, refreshTokenStr) => {
    if (!currentToken || !refreshTokenStr) {
      logout();
      return false;
    }

    try {
      // Cek apakah token sudah expired berdasarkan waktu
      const tokenDecoded = JSON.parse(atob(currentToken.split(".")[1]));
      const now = Date.now();
      const exp = tokenDecoded.exp * 1000;

      // Jika token sudah expired, coba refresh
      if (exp <= now) {
        console.log("🔒 Token expired, mencoba refresh otomatis...");
        try {
          const response = await axios.post(
            `${BASE_URL}/auth/refresh?token=${refreshTokenStr}`
          );

          if (response.data?.access_token) {
            const { access_token, refresh_token } = response.data;

            // Update localStorage dan context
            const stored = JSON.parse(localStorage.getItem("auth"));
            const updatedAuth = { ...stored, token: access_token, refresh_token };
            localStorage.setItem("auth", JSON.stringify(updatedAuth));
            setToken(access_token);

            // Setup auto logout timer dengan token baru
            setupAutoLogout(access_token);
            return true;
          } else {
            throw new Error("Refresh token invalid");
          }
        } catch (refreshError) {
          console.error("❌ Token tidak dapat diperbarui, melakukan logout otomatis:", refreshError);
          toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
          logout();
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error("Token verification failed:", err);
      logout();
      return false;
    }
  };

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

      // Setup auto logout timer
      setupAutoLogout(token);

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
        `${BASE_URL}/auth/refresh?token=${stored.refresh_token}`
      );

      const { access_token, refresh_token } = response.data;

      const updatedAuth = { ...stored, token: access_token, refresh_token };
      localStorage.setItem("auth", JSON.stringify(updatedAuth));
      setToken(access_token);
      syncTokenToLocalStorage(access_token);

      // Setup new auto logout timer with fresh token
      setupAutoLogout(access_token);

      console.log("🔄 Token berhasil diperbarui");
      return access_token;
    } catch (err) {
      console.error("❌ Gagal refresh token:", err);
      toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
      logout();
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setAuthError(null);
    if (sessionWarningTimer) clearTimeout(sessionWarningTimer);
    if (autoRefreshTimer) clearTimeout(autoRefreshTimer);
    if (autoLogoutTimer) clearTimeout(autoLogoutTimer);
  };

  const refreshProfile = async () => {
    try {
      if (!token) return;
      const res = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Gagal refresh profil:", err);
      logout();
    }
  };

  const ensureValidToken = async () => {
    const stored = localStorage.getItem("auth");
    if (!stored) {
      return false;
    }

    try {
      const parsed = JSON.parse(stored);
      return await verifyTokenValidity(parsed.token, parsed.refresh_token);
    } catch (err) {
      console.error("Token validation failed:", err);
      return false;
    }
  };

  // Axios interceptor untuk refresh token jika 401
  useEffect(() => {
    const axiosInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Skip token refresh during login/auth operations
        const isAuthEndpoint = error.config?.url?.includes('/auth/login');
        
        if (error.response?.status === 401 && !isAuthEndpoint) {
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

  // Tambahkan useEffect baru untuk memeriksa token saat pengguna kembali ke tab browser
  // dan untuk memeriksa token secara periodik
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Fungsi untuk memverifikasi token
    const checkTokenStatus = async () => {
      const stored = localStorage.getItem("auth");
      if (!stored) {
        logout();
        return;
      }
      
      try {
        const parsed = JSON.parse(stored);
        const isValid = await verifyTokenValidity(
          parsed.token, 
          parsed.refresh_token
        );
        
        if (!isValid) {
          // verifyTokenValidity sudah memanggil logout() jika token tidak valid
          console.log("Token tidak valid, melakukan logout");
        }
      } catch (err) {
        console.error("Error checking token:", err);
        logout();
      }
    };
    
    // Jalankan pengecekan ketika window mendapat fokus kembali
    const handleFocus = () => {
      console.log("🔍 Window focused, checking token validity");
      checkTokenStatus();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Jalankan pengecekan secara periodik (setiap 5 menit)
    const intervalId = setInterval(() => {
      console.log("🕒 Periodic token check");
      checkTokenStatus();
    }, 5 * 60 * 1000); // 5 menit
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [isAuthenticated]); // Tambahkan isAuthenticated sebagai dependency

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
        refreshToken,
        ensureValidToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
