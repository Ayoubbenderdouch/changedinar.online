/**
 * Change Dinar - Service Worker
 * Enables offline functionality and caching
 */

const CACHE_NAME = 'change-dinar-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache immediately
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/images/logo.png',
    '/images/flags/algeria.png',
    '/images/flags/euro.png',
    '/images/flags/usa.png',
    '/images/flags/uk.png'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching essential files');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        // For API requests, try network first
        if (event.request.url.includes('changedinaradmin')) {
            event.respondWith(
                fetch(event.request)
                    .then((response) => {
                        // Clone and cache API responses
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                        return response;
                    })
                    .catch(() => {
                        // Return cached API data if available
                        return caches.match(event.request);
                    })
            );
            return;
        }
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version and update in background
                    event.waitUntil(
                        fetch(event.request)
                            .then((response) => {
                                if (response && response.status === 200) {
                                    const responseClone = response.clone();
                                    caches.open(CACHE_NAME).then((cache) => {
                                        cache.put(event.request, responseClone);
                                    });
                                }
                            })
                            .catch(() => {})
                    );
                    return cachedResponse;
                }

                // No cache, try network
                return fetch(event.request)
                    .then((response) => {
                        // Cache successful responses
                        if (response && response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/');
                        }
                    });
            })
    );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-rates') {
        event.waitUntil(syncRates());
    }
});

async function syncRates() {
    try {
        const response = await fetch('https://changedinaradmin-main-ufzenb.laravel.cloud/api/v1/today');
        const data = await response.json();
        // Notify all clients about new data
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
            client.postMessage({
                type: 'RATES_UPDATED',
                data: data
            });
        });
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'Neue Wechselkurse verfügbar',
            icon: '/images/logo.png',
            badge: '/images/icons/badge.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/'
            },
            actions: [
                { action: 'open', title: 'Öffnen' },
                { action: 'dismiss', title: 'Schließen' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'Change Dinar', options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url === event.notification.data.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data.url);
                }
            })
    );
});
