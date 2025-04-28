// Handle push events
self.addEventListener('push', function(event) {
  console.log('Push received:', event);

  if(event.data){
    console.log('Push Received', event)
  } else {
    console.log('No Payload Data')
  }
  
  // Get notification content
  const notificationText = event.data ? event.data.text() : 'New notification!';
  
  // Notification options
  const options = {
    body: notificationText,
    icon: '/icon.png',  // Replace with your own icon
    badge: '/badge.png', // Replace with your own badge
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      url: self.location.origin // URL to open when notification is clicked
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      }
    ]
  };
  
  // Show the notification
  event.waitUntil(
    self.registration.showNotification('Attendance Update', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  // Close the notification
  event.notification.close();
  
  // Get the URL to open
  const urlToOpen = event.notification.data.url || '/';
  
  // Handle action buttons if needed
  if (event.action === 'open') {
    console.log('Open action clicked');
  }
  
  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(function(clientList) {
      // If a window is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// For a complete implementation, you may also want to handle push subscription change
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('Subscription expired');
  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true })
      .then(function(subscription) {
        console.log('Subscribed after expiration', subscription);
        // Re-subscribe on server (you would need to implement this)
        // This requires a way to communicate back to your application
      })
  );
});