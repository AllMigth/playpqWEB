'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "cf6348f4c1824437406d376743fe3cb0",
"assets/assets/icons/connect.png": "38b43014900ad6936d0d930c9ca67b9e",
"assets/assets/icons/create.png": "be4345d1e4aff5507475131e0a7cf347",
"assets/assets/icons/discover.png": "6bd3bc9b1ca40178092f296886b2ad09",
"assets/assets/icons/menu.png": "2b5c09dfabd9fcb99a42379fd34c76d4",
"assets/assets/images/1.jpg": "b71286cba8c82c78e3bc313d9605dfc7",
"assets/assets/images/AYACA.png": "56404aacc423c1581ab637f137d683ee",
"assets/assets/images/balnearios.jpg": "c5fa5e82080666b35da64316fa532bc8",
"assets/assets/images/ciclismo.jpg": "7f63a90c5ed1561596815c3e8a63635b",
"assets/assets/images/daydream.png": "49f7cf2b96b3d7516ac5c93b3e2f223a",
"assets/assets/images/google_logo.png": "fd77efa8338aa3e0ec44f768889d8915",
"assets/assets/images/google_text_logo.png": "7949937c72083fbf722d3f23516224f8",
"assets/assets/images/hayaca.png": "ea9c3932c0fd476020fcfc5bb9266c8c",
"assets/assets/images/HORNADO.png": "dcb86d8fb216f3526544a417380c951a",
"assets/assets/images/hotel.jpg": "e28898ca688245f5a5c240bacbe376a5",
"assets/assets/images/kayak.jpg": "2fbd645eeb9b54e25ddf5a29ce4bed99",
"assets/assets/images/LASANA.png": "ce521ecc51d51dbb2ad307275002a219",
"assets/assets/images/MAJADO.png": "2106159dad305c5f1f32081b5b474789",
"assets/assets/images/malacatos.jpg": "e6850c94f099101c7c61cdf14ca506a0",
"assets/assets/images/moto.jpg": "a297ffb9622c78459848fcdde3385489",
"assets/assets/images/pixelstand.webp": "b724a943386eff8aac839e241718608d",
"assets/assets/images/softLogo.png": "83ea0f3257751772c9d2d6ebed7745bf",
"assets/assets/images/softyon.png": "207777223e022815ae2ed913589e499a",
"assets/assets/images/spa.jpg": "d8988df97a61199780305068bb46f9e5",
"assets/assets/images/tristan.jpg": "35cad98e7fc075edd409a284e642cb94",
"assets/assets/images/tubing.jpg": "18d4d53c93a8179d5023ac4c445f480b",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/NOTICES": "7e11e9bf92d9e3002b2555d3cf133084",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "b14fcf3ee94e3ace300b192e9e7c8c5d",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "b751a515f91eddb4cef65b971973d0cc",
"/": "b751a515f91eddb4cef65b971973d0cc",
"main.dart.js": "69d787ae137ea949bac6ca9bc7285d1d",
"manifest.json": "e2d659d1ff33e775195b05dafe49ec85",
"version.json": "597ae9361327c20959a90d6697783f52"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
