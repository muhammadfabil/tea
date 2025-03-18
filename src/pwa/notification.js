export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Browser tidak mendukung notifikasi.");
      return;
    }
  
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Izin notifikasi diberikan.");
    } else {
      console.log("Izin notifikasi ditolak.");
    }
  };
  
  export const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };
  