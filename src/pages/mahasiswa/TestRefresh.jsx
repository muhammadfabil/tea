"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext"; // pastikan path ini benar
import { toast } from "react-toastify";

const TestRefresh = () => {
  const { refreshToken } = useAuth();

  const handleRefresh = async () => {
    try {
      console.log("🔄 Memulai refresh token...");
      const newToken = await refreshToken();
      console.log("✅ Token baru:", newToken);
      toast.success("✅ Token berhasil diperbarui!");
    } catch (error) {
      console.error("❌ Gagal memperbarui token:", error);
      toast.error("❌ Gagal memperbarui token!");
    }
  };

  return (
    <div className="text-blue-900 flex flex-col items-center gap-4 mt-10">
      <div>Test Manual Refresh Token</div>
      <button
        onClick={handleRefresh}
        className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition"
      >
        Perpanjang Sesi
      </button>
    </div>
  );
};

export default TestRefresh;
