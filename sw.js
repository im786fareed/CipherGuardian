// Service Worker for OTP Guardian

// This event is fired when the service worker is first installed.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
});

// This event is fired when the service worker is activated.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
});

// This event is fired when a push message is received.
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received.');
  
  const data = event.data ? event.data.json() : { title: 'OTP Guardian Alert', body: 'A new notification.' };
  
  const title = data.title;
  const options = {
    body: data.body,
    icon: './vite.svg',
    badge: './vite.svg'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click Received.');
  event.notification.close();
  // Focus or open a new window
  event.waitUntil(
    clients.openWindow('/')
  );
});