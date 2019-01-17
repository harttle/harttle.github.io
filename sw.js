var CACHE_NAME = 'v1';
var urlsToCache = [
    '/',
    '/assets/css/site.css',
    '/assets/js/blog.min.js'
];

self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
        return cache.addAll(urlsToCache);
    }));
});

self.addEventListener('activate', function (event) {
    event.waitUntil(caches.keys().then(function (cacheNames) {
        return Promise.all(cacheNames.map(function (cacheName) {
            if (cacheName !== CACHE_NAME) {
                return caches.delete(cacheName);
            }
        }));
    }));
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        fetch(event.request.clone()).then(validate).then(function (response) {
            save(event.request, response.clone());
            return response;
        }).catch(function () {
            return caches.match(event.request).then(function (cached) {
                if (!cached) throw new Error('cache miss:' + event.request.url);
                return cached;
            });
        }));
});

function save (key, val) {
    return caches.open(CACHE_NAME).then(function (cache) {
        cache.put(key, val);
    });
}

function validate (res) {
    if (res && res.type === 'basic' && res.status !== 200) throw new Error(res);
    return res;
}
