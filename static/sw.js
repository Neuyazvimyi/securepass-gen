const CACHE_NAME = 'securepass-v1';
const ASSETS = ['/', '/manifest.json'];

self.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(ASSETS);
		}),
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.keys().then((names) => {
			return Promise.all(
				names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
			);
		}),
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event: FetchEvent) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		}),
	);
});
