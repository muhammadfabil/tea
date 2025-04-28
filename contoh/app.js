// TEMP for manual testing
localStorage.setItem('user_id', '98feb9e7-21ee-477c-8d5b-df5496aa91b9');
localStorage.setItem('access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5OGZlYjllNy0yMWVlLTQ3N2MtOGQ1Yi1kZjU0OTZhYTkxYjkiLCJyb2xlIjoibWFoYXNpc3dhIiwiZXhwIjoxNzQ1ODExNTk4fQ.5Fl3JO3UAUJgGbpHTjTYNYndqVr1Wbu1cIJ8aFzbEAE');

// Service worker registration and push notification handling
let swRegistration = null;
let subscription = null;

// Get userId and token (assuming saved from login)
const userId = localStorage.getItem('user_id');
const accessToken = localStorage.getItem('access_token');

// Show notification to user
function showNotification(message, isError = false) {
  const notificationElement = document.getElementById('notification');
  notificationElement.textContent = message;
  notificationElement.className = isError ? 'error' : 'success';
  notificationElement.style.display = 'block';

  setTimeout(() => {
    notificationElement.style.display = 'none';
  }, 5000);
}

// Base64URL to Uint8Array conversion for VAPID public key
function base64UrlToUint8Array(base64String) {
  const base64 = base64String.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const base64Padded = base64 + padding;
  const rawData = window.atob(base64Padded);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Fetch VAPID public key from server
async function getPublicKey() {
  try {
    const response = await fetch('http://127.0.0.1:8000/wp/vapid-public-key');
    const data = await response.json();
    return data.publicKey;
  } catch (error) {
    console.error('Error fetching public key:', error);
    showNotification('Failed to get public key from server', true);
    throw error;
  }
}

// Register the service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      swRegistration = await navigator.serviceWorker.register('service-worker.js');
      console.log('Service Worker registered successfully');
      return swRegistration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  } else {
    throw new Error('Push notifications not supported in this browser');
  }
}

// Subscribe to push notifications
async function subscribeToPushNotifications() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      showNotification('Notification Permission Denied', true);
      return;
    }

    if (!swRegistration) {
      swRegistration = await registerServiceWorker();
    }

    subscription = await swRegistration.pushManager.getSubscription();
    if (subscription) {
      showNotification('Already subscribed to push notifications');
      updateButtons(true);
      return subscription;
    }

    const publicKey = await getPublicKey();
    const applicationServerKey = base64UrlToUint8Array(publicKey);

    subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    console.log('New Subscription:', subscription);

    await saveSubscriptionToServer(subscription);
    showNotification('Successfully subscribed to push notifications');
    updateButtons(true);
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    showNotification(`Failed to subscribe: ${error.message}`, true);
    throw error;
  }
}

// Save subscription info to backend
async function saveSubscriptionToServer(subscription) {
  if (!userId || !accessToken) {
    throw new Error('User not authenticated');
  }

  const subscriptionObject = subscription.toJSON();

  try {
    const response = await fetch('http://127.0.0.1:8000/wp/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        endpoint: subscriptionObject.endpoint,
        keys: {
          p256dh: subscriptionObject.keys.p256dh,
          auth: subscriptionObject.keys.auth
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription on server');
    }

    const data = await response.json();
    console.log('Saved subscription on server:', data);
  } catch (error) {
    console.error('Error saving subscription:', error);
    throw error;
  }
}

// Request server to send a test notification
async function requestPushNotification() {
  if (!accessToken) {
    showNotification('User not authenticated', true);
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/wp/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: "Hello World!",
        body: "This is a Test Push Notification",
        url: "https://your-website.com"
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send push notification');
    }

    const data = await response.json();
    showNotification('Push notification sent: ' + data.message);
  } catch (error) {
    console.error('Error sending push notification:', error);
    showNotification(`Failed to send notification: ${error.message}`, true);
  }
}

// Unsubscribe from push notifications
async function unsubscribeFromPushNotifications() {
  try {
    if (!subscription) {
      const registration = await navigator.serviceWorker.ready;
      subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        showNotification('No subscription found');
        updateButtons(false);
        return;
      }
    }

    await subscription.unsubscribe();
    showNotification('Successfully unsubscribed from push notifications');
    updateButtons(false);
    subscription = null;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    showNotification(`Failed to unsubscribe: ${error.message}`, true);
  }
}

// Update button states
function updateButtons(isSubscribed) {
  document.getElementById('subscribe-button').disabled = isSubscribed;
  document.getElementById('unsubscribe-button').disabled = !isSubscribed;
  document.getElementById('send-notification-button').disabled = !isSubscribed;
}

// Initialize on page load
async function initializePushNotifications() {
  try {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      swRegistration = await navigator.serviceWorker.ready;
      subscription = await swRegistration.pushManager.getSubscription();
      updateButtons(!!subscription);
      if (subscription) {
        console.log('Found existing push subscription');
      }
    } else {
      showNotification('Push notifications are not supported in this browser', true);
      updateButtons(false);
    }
  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
}

// Attach event listeners
document.addEventListener('DOMContentLoaded', () => {
  initializePushNotifications();
  document.getElementById('subscribe-button').addEventListener('click', subscribeToPushNotifications);
  document.getElementById('unsubscribe-button').addEventListener('click', unsubscribeFromPushNotifications);
  document.getElementById('send-notification-button').addEventListener('click', requestPushNotification);
});
