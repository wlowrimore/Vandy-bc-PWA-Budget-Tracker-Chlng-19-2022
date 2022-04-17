const APP_PREFIX = "BudgetTracker-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = CACHE_NAME + "_data";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "./css/styles.css",
  "./js/index.js",
  "/manifest.json",
  "./icons/icon-72x72.png",
  "./icons/icon-96x96.png",
  "./icons/icon-128x128.png",
  "./icons/icon-144x144.png",
  "./icons/icon-152x152.png",
  "./icons/icon-192x192.png",
  "./icons/icon-384x384.png",
  "./icons/icon-512x512.png",
  "/js/idb.js"
];

self.addEventListener('install', event => {
  // The promise that skipWaiting() returns can be safely ignored.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('installing offline cache : ' + CACHE_NAME)
      return cache.addAll(FILES_TO_CACHE);
    })
  )
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
    .keys()
    .then(keyList => {
      // return array of cache names that are old to delete
      return Promise
        .all(keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Deleting previously cached information", key);
            return caches.delete(key);
          }
        }));
    })
  )
  self.clients.claim();
});

// fetch
self.addEventListener("fetch", event => {
  if (event.request.url.includes('/api/')) {
    console.log('[Service Worker] Fetch(data)', event.request.url);

    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch(err => {
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        return response || fetch(event.request);
      });
    })
  );
});