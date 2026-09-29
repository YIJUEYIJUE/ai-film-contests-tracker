// 离线缓存：始终先取最新版本，断网时用缓存，保证更新后立即生效。
const V = "aicontest-v4", SHELL = ["./", "index.html", "assets/styles.css", "assets/app.js", "assets/icon.svg", "manifest.webmanifest"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url); if (e.request.method !== "GET" || u.origin !== location.origin) return;
  const net = () => fetch(e.request).then(r => { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); return r; });
  e.respondWith(net().catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
