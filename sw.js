// Service Worker for AdventCouple PWA Background Push & Offline Synchronization
const CACHE_NAME = 'adventcouple-v2';
let pairInfo = { pairCode: '', userRole: 'p1' };
let lastCheckState = { challenge: null, status: null };

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Message listener from app.js to receive active pair credentials
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SET_PAIR_INFO') {
        pairInfo.pairCode = event.data.pairCode || '';
        pairInfo.userRole = event.data.userRole || 'p1';
        startBackgroundPolling();
    }
});

function startBackgroundPolling() {
    if (self.pollInterval) clearInterval(self.pollInterval);
    checkPartnerActivityInBackground();
    self.pollInterval = setInterval(checkPartnerActivityInBackground, 25000);
}

async function checkPartnerActivityInBackground() {
    if (!pairInfo.pairCode) return;
    const partnerRole = pairInfo.userRole === 'p1' ? 'p2' : 'p1';
    const firebaseUrl = `https://adventcouple-4fd17-default-rtdb.europe-west1.firebasedatabase.app/pairs/${pairInfo.pairCode}.json`;

    try {
        const response = await fetch(firebaseUrl);
        if (!response.ok) return;
        const data = await response.json();
        if (!data) return;

        // 1. Check partner challenge
        if (data.challenge && data.challenge[partnerRole]) {
            const ch = data.challenge[partnerRole];
            const chText = typeof ch === 'string' ? ch : (ch.text || '💌 Секретный конверт с фото/видео');
            const chKey = JSON.stringify(ch);
            if (chKey !== lastCheckState.challenge) {
                lastCheckState.challenge = chKey;
                self.registration.showNotification('💌 Входящий Секретный Вызов!', {
                    body: chText,
                    icon: './img/icon-192.png',
                    badge: './img/icon-192.png',
                    vibrate: [200, 100, 200],
                    tag: 'adventcouple-challenge',
                    renotify: true,
                    data: { url: './index.html' }
                });
            }
        }

        // 2. Check partner status
        if (data.status && data.status[partnerRole]) {
            const st = data.status[partnerRole];
            if (st !== lastCheckState.status && st !== 'Статус не установлен') {
                lastCheckState.status = st;
                self.registration.showNotification('💬 Новый Статус Партнера', {
                    body: st,
                    icon: './img/icon-192.png',
                    badge: './img/icon-192.png',
                    vibrate: [100, 100, 100],
                    tag: 'adventcouple-status',
                    renotify: true,
                    data: { url: './index.html' }
                });
            }
        }
    } catch (e) {
        console.log('Background SW poll error:', e);
    }
}

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
