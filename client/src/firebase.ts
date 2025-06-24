// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY  || "AIzaSyB6ab6kU8avLsICZEFfTasajoRJH_fg4ZA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'strivex-6233b.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'strivex-6233b',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'strivex-6233b.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '537396482027',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:537396482027:web:91c1217f7d9ddd00c9d3ae',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-EHQQW9DLZR',
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const analytics = getAnalytics(app);

export { app, messaging, getToken, onMessage, analytics };