import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Event listener untuk notifikasi jika ada update dari service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Dispatch event khusus ke React agar bisa tampilkan toast
    const event = new CustomEvent('sw-updated');
    window.dispatchEvent(event);
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Event listener di luar React untuk tangani update dan tampilkan toast
window.addEventListener('sw-updated', () => {
  toast.info("Aplikasi telah diperbarui! Klik untuk muat ulang.", {
    autoClose: false,
    onClick: () => window.location.reload(),
  });
});
