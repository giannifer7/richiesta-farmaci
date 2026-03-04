"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/shared.ts
  function getMedicinesText() {
    return localStorage.getItem("medicines_text") ?? "[x] 1 x Paracetamolo 1000 mg";
  }
  function normalizeEntry(entry) {
    const trimmed = entry.trim();
    return /^\d+\s*x\s+/i.test(trimmed) ? trimmed : `1 x ${trimmed}`;
  }
  function parseImportText(text) {
    const trimmed = (text ?? "").trim();
    if (!trimmed) return [];
    if (/^farmaci:/i.test(trimmed)) {
      return trimmed.slice(trimmed.indexOf(":") + 1).split(",").map((s) => s.trim()).filter(Boolean).slice(1).map((s) => ({ entry: normalizeEntry(s), isDefault: false }));
    }
    return trimmed.split("\n").flatMap((line) => {
      const t = line.trim();
      if (!t) return [];
      if (/^\[x\]\s/i.test(t)) return [{ entry: normalizeEntry(t.slice(4).trim()), isDefault: true }];
      if (t.startsWith("[ ] ")) return [{ entry: normalizeEntry(t.slice(4).trim()), isDefault: false }];
      return [{ entry: normalizeEntry(t), isDefault: false }];
    }).filter((m) => m.entry);
  }
  function normalizeMedicinesText(text) {
    return parseImportText(text).map(({ entry, isDefault }) => (isDefault ? "[x] " : "[ ] ") + entry).join("\n");
  }
  var init_shared = __esm({
    "src/shared.ts"() {
      "use strict";
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js");
      }
    }
  });

  // src/medicines.ts
  var require_medicines = __commonJS({
    "src/medicines.ts"() {
      init_shared();
      var textarea = document.getElementById("medicinesText");
      textarea.value = normalizeMedicinesText(getMedicinesText());
      document.getElementById("btnImport").addEventListener("click", () => {
        const text = document.getElementById("importText").value.trim();
        if (!text) return;
        const entries = parseImportText(text);
        if (!entries.length) return;
        textarea.value = entries.map(({ entry, isDefault }) => (isDefault ? "[x] " : "[ ] ") + entry).join("\n");
        document.getElementById("importText").value = "";
      });
      document.getElementById("btnSave").addEventListener("click", () => {
        localStorage.setItem("medicines_text", normalizeMedicinesText(textarea.value));
        window.location.href = "settings.html";
      });
    }
  });
  require_medicines();
})();
