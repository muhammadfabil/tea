// Handle push events
self.addEventListener('push', function(event) {
  console.log('Push received:', event);

  let notificationData = { title: 'Attendance Update', body: 'New notification!', url: self.location.origin };

  if (event.data) {
    try {
      notificationData = JSON.parse(event.data.text());
    } catch (e) {
      console.error('Error parsing push event data', e);
    }
  }

  const options = {
    body: notificationData.body,
    icon: '/icon.png',   // Replace with your own icon
    badge: '/badge.png', // Replace with your own badge
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      url: notificationData.url
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);

  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('Subscription expired or changed');

  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true }).then(function(newSubscription) {
      console.log('Re-subscribed after expiration', newSubscription);
      // Ideally here you would send the newSubscription to your server
    })
  );
});
