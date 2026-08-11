// Service Worker for AdventCouple PWA Background Push Notifications
const CACHE_NAME = 'adventcouple-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Handling background push events
self.addEventListener('push', (event) => {
    let data = { title: '🔥 Чувственный Календарь', body: 'Новая романтическая активность пары!' };
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: './img/icon-192.png',
        badge: './img/icon-192.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: 'adventcouple-notification',
        renotify: true,
        data: { url: data.url || './index.html' }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Click action on system push notification
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : './index.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('index.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
