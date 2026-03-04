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
  function getPrefs() {
    return {
      patient_firstname: localStorage.getItem("patient_firstname") ?? "",
      patient_lastname: localStorage.getItem("patient_lastname") ?? "",
      fiscal_code: localStorage.getItem("fiscal_code") ?? "",
      doctor_phone: localStorage.getItem("doctor_phone") ?? "",
      doctor_email: localStorage.getItem("doctor_email") ?? "",
      send_method: localStorage.getItem("send_method") ?? "whatsapp",
      message_template: localStorage.getItem("message_template")
    };
  }
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
  function parseMedicines() {
    return parseImportText(getMedicinesText());
  }
  function medicineNameOnly(entry) {
    return entry.replace(/^\d+\s*x\s+/i, "").trim();
  }
  function applyTemplate(template, firstName, lastName, fiscalCode, selectedMeds) {
    const listaRegex = /\{lista\("([^"]*)",\s*([^)]*)\)\}/g;
    let result = template.replace(listaRegex, (_, rawSep, itemTpl) => {
      const sep = rawSep.replace(/\\n/g, "\n").replace(/\\t/g, "	").replace(/\\\\/g, "\\");
      return selectedMeds.map((med) => {
        const m = med.trim().match(/^(\d+)\s*x\s+(.+)/i);
        const qty = m ? m[1] : "1";
        const name = m ? m[2].trim() : med.trim();
        return itemTpl.replace(/{qta}/g, qty).replace(/{farmaco}/g, name);
      }).join(sep);
    });
    return result.replace(/{COGNOME}/g, lastName.toUpperCase()).replace(/{cognome}/g, lastName).replace(/{nome}/g, firstName).replace(/{cod_fisc}/g, fiscalCode);
  }
  function formatLastRequest() {
    const ms = parseInt(localStorage.getItem("last_request_ms") ?? "0");
    if (!ms) return "";
    const sentDate = new Date(ms);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const sentDay = new Date(sentDate);
    sentDay.setHours(0, 0, 0, 0);
    const days = Math.round((today.getTime() - sentDay.getTime()) / 864e5);
    const dateLabel = sentDate.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
    const daysLabel = days === 0 ? "oggi" : days === 1 ? "1 giorno fa" : `${days} giorni fa`;
    return `Ultima richiesta ${daysLabel} (${dateLabel})`;
  }
  var DEFAULT_TEMPLATE;
  var init_shared = __esm({
    "src/shared.ts"() {
      "use strict";
      DEFAULT_TEMPLATE = 'Farmaci: {COGNOME} {nome}, {lista(", ", {qta} x {farmaco})}';
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js");
      }
    }
  });

  // src/index.ts
  var require_index = __commonJS({
    "src/index.ts"() {
      init_shared();
      var medicines = parseMedicines();
      var sorted = [...medicines].sort((a, b) => medicineNameOnly(a.entry).localeCompare(medicineNameOnly(b.entry), "it"));
      var container = document.getElementById("medicineList");
      sorted.forEach(({ entry, isDefault }, i) => {
        const div = document.createElement("div");
        div.className = "medicine-item";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.id = `med${i}`;
        cb.checked = isDefault;
        const lbl = document.createElement("label");
        lbl.htmlFor = cb.id;
        lbl.textContent = entry;
        div.append(cb, lbl);
        container.appendChild(div);
      });
      document.getElementById("lastRequest").textContent = formatLastRequest();
      document.getElementById("btnSend").addEventListener("click", () => {
        const selected = [];
        container.querySelectorAll("input[type=checkbox]").forEach((cb, i) => {
          if (cb.checked) selected.push(sorted[i].entry);
        });
        if (!selected.length) {
          alert("Seleziona almeno un farmaco");
          return;
        }
        const p = getPrefs();
        if (!p.patient_firstname && !p.patient_lastname) {
          alert("Imposta nome e cognome nelle Impostazioni");
          return;
        }
        if (p.send_method === "email" && !p.doctor_email) {
          alert("Imposta l'email del medico nelle Impostazioni");
          return;
        }
        if (p.send_method !== "email" && !p.doctor_phone) {
          alert("Imposta il numero del medico nelle Impostazioni");
          return;
        }
        const message = applyTemplate(
          p.message_template ?? DEFAULT_TEMPLATE,
          p.patient_firstname,
          p.patient_lastname,
          p.fiscal_code,
          selected
        );
        switch (p.send_method) {
          case "whatsapp": {
            const phone = p.doctor_phone.replace(/[^0-9]/g, "");
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
            break;
          }
          case "sms":
            window.location.href = `sms:${p.doctor_phone}?body=${encodeURIComponent(message)}`;
            break;
          case "email":
            window.location.href = `mailto:${p.doctor_email}?subject=${encodeURIComponent("Richiesta farmaci")}&body=${encodeURIComponent(message)}`;
            break;
        }
        localStorage.setItem("last_request_ms", Date.now().toString());
        document.getElementById("lastRequest").textContent = formatLastRequest();
      });
    }
  });
  require_index();
})();
