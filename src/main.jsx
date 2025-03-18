import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { registerServiceWorker, requestNotificationPermission } from "./utils/notification";

// Daftarkan service worker & minta izin notifikasi saat aplikasi dimuat
registerServiceWorker();
requestNotificationPermission();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
