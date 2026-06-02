// Minimal service worker.
// Its only job is to make the app reliably installable on Android Chrome so the
// home-screen icon launches in the manifest's fullscreen display mode. It does
// not cache anything — every request goes straight to the network.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
