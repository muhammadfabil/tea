export const registerServiceWorker = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Service Worker terdaftar"))
        .catch((error) => console.error("Service Worker gagal:", error));
    }
  };
  