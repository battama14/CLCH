// Firebase Service Worker pour les notifications en arrière-plan
// Version: 1.1 (mise à jour pour Netlify)

// Importation des scripts Firebase nécessaires
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Log pour vérifier que le service worker est bien chargé
console.log('Firebase Messaging Service Worker Loaded on Netlify');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDDTsKpifjFMSSJrn20Xc3q8szf27F2ZP0",
  authDomain: "clch-3a8f4.firebaseapp.com",
  databaseURL: "https://clch-3a8f4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "clch-3a8f4",
  storageBucket: "clch-3a8f4.firebasestorage.app",
  messagingSenderId: "258957198457",
  appId: "1:258957198457:web:2998d1c0f6ba295f3080a8",
  measurementId: "G-NWT4D2D1ER"
};

// Initialiser l'application Firebase
firebase.initializeApp(firebaseConfig);

// Récupérer une instance de Firebase Messaging
const messaging = firebase.messaging();

// Gérer les messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Personnaliser la notification
  const notificationTitle = payload.notification.title || 'Nouvelle notification';
  const notificationOptions = {
    body: payload.notification.body || 'Vous avez reçu une nouvelle notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    tag: 'new-photo-notification',
    data: payload.data
  };

  // Afficher la notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
  
  // Personnaliser la notification
  const notificationTitle = payload.notification.title || 'CLCH Notification';
  const notificationOptions = {
    body: payload.notification.body || 'Nouvelle activité sur CLCH',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    // Vous pouvez ajouter d'autres options comme:
    // image: payload.notification.image,
    // data: payload.data,
    // actions: [
    //   { action: 'view', title: 'Voir' },
    //   { action: 'close', title: 'Fermer' }
    // ]
  };

  // Afficher la notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gérer le clic sur la notification
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click');
  
  // Fermer la notification
  event.notification.close();
  
  // Gérer le clic sur la notification
  // Vous pouvez personnaliser le comportement en fonction de l'action
  const clickAction = event.notification.data?.FCM_MSG?.notification?.click_action || '/';
  
  // Ouvrir une fenêtre si elle est fermée, ou se concentrer sur une fenêtre existante
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Vérifier si une fenêtre est déjà ouverte
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si aucune fenêtre n'est ouverte, en ouvrir une nouvelle
        if (clients.openWindow) {
          return clients.openWindow(clickAction);
        }
      })
  );
});