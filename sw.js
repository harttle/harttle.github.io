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
    if (event.request.method !== 'GET') return network(event.request);
    var pn = networkAndSave(event.request);
    event.respondWith(cache(event.request).then(function (res) {
        return res || pn;
    }).catch(function () {
        return pn;
    }));
});

function cache (req) {
    return caches.open(CACHE_NAME).then(cache => cache.match(req.clone()));
}

function networkAndSave (req) {
    return network(req).then(function (res) {
        save(req.clone(), res.clone());
        return res;
    });
}

function network (req) {
    return fetch(req.clone()).then(validate);
}

function save (key, val) {
    return caches.open(CACHE_NAME).then(function (cache) {
        cache.put(key, val);
    });
}

function validate (res) {
    if (res && res.type === 'basic' && res.status !== 200) throw new Error(res);
    return res;
}
