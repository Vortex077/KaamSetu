import api from './api';
import toast from 'react-hot-toast';
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const subscribeToPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    toast.error('Push messaging is not supported by your browser.');
    throw new Error('Push messaging is not supported.');
  }

  try {
    // 1. Check/Request Permission
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    
    if (permission !== 'granted') {
       toast.error('You must allow notifications in your browser settings.');
       throw new Error('Notification permission denied');
    }

    // 2. Get Service Worker with timeout
    const swReady = new Promise((resolve, reject) => {
       const timeout = setTimeout(() => reject(new Error('Service Worker took too long to become ready')), 5000);
       navigator.serviceWorker.ready.then(reg => {
          clearTimeout(timeout);
          resolve(reg);
       });
    });

    const registration = await swReady;
    
    // 3. VAPID Key validation
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey || vapidPublicKey === 'generate_with_web-push') {
       throw new Error('VAPID public key is not configured');
    }

    // 4. Check for existing subscription first
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    // 5. Sync with backend
    await api.post('/api/notifications/subscribe', { subscription });
    
    return subscription;
  } catch (error) {
    console.error('Push Subscription Error:', error);
    throw error;
  }
};
