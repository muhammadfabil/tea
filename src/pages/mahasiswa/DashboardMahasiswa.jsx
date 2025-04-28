import React, { useState } from "react";

const DashboardMahasiswa = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const getAuthData = () => {
    try {
      const authString = localStorage.getItem('auth');
      if (!authString) throw new Error('Auth data not found in localStorage');

      const auth = JSON.parse(authString);
      const token = auth.token;
      const userId = auth.user?.user_id;

      if (!token || !userId) {
        throw new Error('Token or User ID missing in auth data');
      }

      return { token, userId };
    } catch (error) {
      console.error('Error reading auth from localStorage:', error);
      return null;
    }
  };

  const base64UrlToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  };

  const subscribeToPushNotifications = async () => {
    try {
      const authData = getAuthData();
      if (!authData) return;

      const { token } = authData;

      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Notification permission result:', permission);
      if (permission !== 'granted') {
        console.error('Notification permission denied');
        return;
      }

      console.log('Waiting for Service Worker...');
      const swRegistration = await navigator.serviceWorker.ready;
      console.log('Service Worker is ready:', swRegistration);

      let subscription = await swRegistration.pushManager.getSubscription();

      if (!subscription) {
        console.log('Fetching VAPID public key...');
        const response = await fetch('http://127.0.0.1:8000/wp/vapid-public-key');
        if (!response.ok) {
          throw new Error(`VAPID public key request failed: ${response.status}`);
        }
        const { publicKey } = await response.json();
        console.log('Received public key:', publicKey);

        const applicationServerKey = base64UrlToUint8Array(publicKey);

        console.log('Subscribing to push manager...');
        subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        console.log('New subscription created:', subscription);
      } else {
        console.log('Already have a subscription:', subscription);
      }

      // Kirim subscription ke server
      console.log('Sending subscription to server...');
      const pushResponse = await fetch('http://127.0.0.1:8000/wp/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys.p256dh,
            auth: subscription.toJSON().keys.auth,
          },
        }),
      });

      if (!pushResponse.ok) {
        throw new Error(`Push subscribe failed: ${pushResponse.status}`);
      }

      console.log('Subscription successfully sent to server.');
      setIsSubscribed(true);

    } catch (error) {
      console.error('Error during subscription process:', error);
    }
  };

  return (
    <div className="p-4 md:ml-10">
      <h1 className="text-2xl md:text-3xl font-bold text-[#005AE6] mb-6">
        Selamat Datang, Mahasiswa!
      </h1>

      {/* Card Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-[#005AE6]">
          <h2 className="text-sm text-gray-500">Jumlah Layanan</h2>
          <p className="text-2xl font-bold text-[#005AE6]">25</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-[#005AE6]">
          <h2 className="text-sm text-gray-500">Dosen Pembimbing</h2>
          <p className="text-2xl font-bold text-[#005AE6]">2</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-[#005AE6]">
          <h2 className="text-sm text-gray-500">Status Layanan</h2>
          <p className="text-2xl font-bold text-[#005AE6]">3 Diproses</p>
        </div>
      </div>

      {/* Push Notification Button */}
      <div className="mt-4">
        <button
          onClick={subscribeToPushNotifications}
          disabled={isSubscribed}
          className={`px-4 py-2 rounded ${isSubscribed ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
        >
          {isSubscribed ? 'Subscribed' : 'Subscribe to Notifications'}
        </button>
      </div>
    </div>
  );
};

export default DashboardMahasiswa;
