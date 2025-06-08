import { messaging, getToken, onMessage } from "../firebase";
import { updateFCMToken } from "@/services/notification/notificationService";
import { INotification } from "../types/notification";
import { UserRole } from "@/types/UserRole";
import toast from 'react-hot-toast';

export const initializeFCM = async (
  role: UserRole,
  userId: string,
  onNotification: (notification: INotification) => void
) => {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('[DEBUG] Service workers not supported');
      toast.error('Service workers are not supported in this browser.');
      return;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/firebase-cloud-messaging-push-scope',
    });
    console.log('[DEBUG] Service worker registered:', registration);

    // Request notification permission
    const permission = await Notification.requestPermission();
    console.log('[DEBUG] Notification permission:', permission);
    if (permission === 'denied') {
      console.warn('[DEBUG] Notification permission denied');
      toast.error('Notifications blocked. Enable them in browser settings for real-time updates.', {
        duration: 10000,
        position: 'top-right',
        style: { zIndex: 9999 },
      });
      return;
    }
    if (permission !== 'granted') {
      console.warn('[DEBUG] Notification permission not granted:', permission);
      return;
    }

    // Retrieve VAPID key
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      throw new Error('[DEBUG] VITE_FIREBASE_VAPID_KEY missing');
    }

    // Get FCM token
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    if (!token) {
      throw new Error('[DEBUG] Failed to retrieve FCM token');
    }
    console.log('[DEBUG] FCM token:', token);

    // Save FCM token
    try {
      await updateFCMToken(role, userId, token);
      console.log('[DEBUG] FCM token saved for user:', userId);
    } catch (error) {
      console.error('[DEBUG] Failed to save FCM token:', error);
    }

    // Handle foreground messages
    onMessage(messaging, (payload) => {
      console.log('[DEBUG] Raw FCM payload:', payload);
      const notification: INotification = {
        id: payload.data?.id || payload.messageId || crypto.randomUUID(),
        userId,
        title: payload.notification?.title || 'Notification',
        message: payload.notification?.body || 'New notification',
        type: (payload.data?.type as INotification['type']) || 'INFO',
        isRead: false,
        createdAt: new Date(),
      };
      console.log('[DEBUG] Processed FCM notification:', notification);
      onNotification(notification);
    });
  } catch (error) {
   kert: console.error('[DEBUG] FCM initialization failed:', error);
  }
};