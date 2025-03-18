import { useEffect, useState } from "react";
import { showNotification } from "../pwa/notification"; // Impor fungsi notifikasi

const PwaBadge = () => {
  const [isPwa, setIsPwa] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Cek apakah aplikasi berjalan sebagai PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsPwa(true);
    }

    // Tangkap event sebelum install
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Event ketika PWA berhasil diinstal
    window.addEventListener("appinstalled", () => {
      setIsPwa(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  // Fungsi untuk menampilkan prompt install PWA
  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted PWA install");
        } else {
          console.log("User dismissed PWA install");
        }
        setDeferredPrompt(null);
      });
    }
  };

  // ✅ Fungsi untuk mengetes notifikasi
  const handleTestNotification = () => {
    showNotification("Test Notifikasi", "Ini adalah notifikasi dari PWA!");
  };

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-xs">
      {isPwa ? (
        <div>
          <p>Running as PWA ✅</p>
          <button
            onClick={handleTestNotification}
            className="mt-2 bg-white text-blue-500 px-2 py-1 rounded"
          >
            Test Notif
          </button>
        </div>
      ) : (
        <div>
          <p>Running in Browser 🌍</p>
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="mt-2 bg-white text-blue-500 px-2 py-1 rounded"
            >
              Install PWA
            </button>
          )}
          <button
            onClick={handleTestNotification}
            className="mt-2 bg-white text-blue-500 px-2 py-1 rounded"
          >
            Test Notif
          </button>
        </div>
      )}
    </div>
  );
};

export default PwaBadge;
