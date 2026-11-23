// GUP Nexus service worker: يفتح التطبيق بسرعة، ويجلب أحدث نسخة من المنصة دائماً عند توفر الإنترنت.
const CACHE = "gup-nexus-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png", "./favicon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  // لا نخزّن بيانات المنصة (Supabase) ولا أي طلب من موقع آخر: تبقى دائماً من الخادم مباشرة
  if (r.method !== "GET" || u.origin !== location.origin) return;
  // الشبكة أولاً حتى يصل كل تحديث فوراً، والنسخة المحفوظة فقط عند انقطاع الإنترنت
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })
    .catch(() => caches.match(r).then(m => m || caches.match("./index.html"))));
});
