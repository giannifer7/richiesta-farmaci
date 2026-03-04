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

  // src/settings.ts
  var require_settings = __commonJS({
    "src/settings.ts"() {
      init_shared();
      var p = getPrefs();
      document.getElementById("firstName").value = p.patient_firstname;
      document.getElementById("lastName").value = p.patient_lastname;
      document.getElementById("fiscalCode").value = p.fiscal_code;
      document.getElementById("doctorPhone").value = p.doctor_phone;
      document.getElementById("doctorEmail").value = p.doctor_email;
      document.getElementById("template").value = p.message_template ?? DEFAULT_TEMPLATE;
      var method = p.send_method ?? "whatsapp";
      document.querySelector(`input[name=sendMethod][value="${method}"]`).checked = true;
      document.getElementById("btnReset").addEventListener("click", () => {
        document.getElementById("template").value = DEFAULT_TEMPLATE;
      });
      document.getElementById("btnSave").addEventListener("click", () => {
        localStorage.setItem("patient_firstname", document.getElementById("firstName").value.trim());
        localStorage.setItem("patient_lastname", document.getElementById("lastName").value.trim());
        localStorage.setItem("fiscal_code", document.getElementById("fiscalCode").value.trim().toUpperCase());
        localStorage.setItem("doctor_phone", document.getElementById("doctorPhone").value.trim());
        localStorage.setItem("doctor_email", document.getElementById("doctorEmail").value.trim());
        localStorage.setItem("send_method", document.querySelector("input[name=sendMethod]:checked").value);
        localStorage.setItem("message_template", document.getElementById("template").value);
        window.location.href = "index.html";
      });
    }
  });
  require_settings();
})();
