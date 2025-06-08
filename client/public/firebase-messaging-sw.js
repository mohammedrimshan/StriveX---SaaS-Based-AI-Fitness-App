importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

try {
  const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyB6ab6kU8avLsICZEFfTasajoRJH_fg4ZA",
    authDomain: "strivex-6233b.firebaseapp.com",
    projectId: "strivex-6233b",
    storageBucket: "strivex-6233b.firebasestorage.app",
    messagingSenderId: "537396482027",
    appId: "1:537396482027:web:91c1217f7d9ddd00c9d3ae",
    measurementId: "G-EHQQW9DLZR",
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    const notificationTitle = payload.notification?.title || 'Notification';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new notification',
      icon: '/favicon.ico',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.error('[firebase-messaging-sw.js] Error:', error);
}