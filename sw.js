// Estrategia:
//  - Telas, scripts e chinelos.json: "rede primeiro" -> pega sempre a versao nova
//    quando ha internet; sem internet usa o que esta guardado.
//  - Fotos (.webp/.png): "cache primeiro" -> abrem na hora.
// Se trocar uma FOTO mantendo o mesmo nome, aumente o numero em VERSAO.
const VERSAO = "v1";
const CACHE = "chinelos-" + VERSAO;
const BASE = ["./", "index.html", "style.css", "app.js", "manifest.webmanifest", "chinelos.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;

  if (/\.(webp|png|jpg)$/i.test(url.pathname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
      return r;
    })));
    return;
  }

  e.respondWith(
    fetch(req, { cache: "no-cache" }).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match("index.html")))
  );
});
