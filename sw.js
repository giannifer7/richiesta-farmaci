"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/sw.ts
  var require_sw = __commonJS({
    "src/sw.ts"() {
      var CACHE = "richiesta-farmaci-v2";
      var FILES = [
        "./",
        "index.html",
        "settings.html",
        "medicines.html",
        "index.js",
        "settings.js",
        "medicines.js",
        "sw.js",
        "style.css",
        "manifest.json",
        "icon-192.png",
        "icon-512.png"
      ];
      self.addEventListener("install", (e) => {
        e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
      });
      self.addEventListener("activate", (e) => {
        e.waitUntil(
          caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
        );
      });
      self.addEventListener("fetch", (e) => {
        e.respondWith(caches.match(e.request).then((r) => r ?? fetch(e.request)));
      });
    }
  });
  require_sw();
})();
