import { getPrefs, DEFAULT_TEMPLATE } from './shared';

const p = getPrefs();
(document.getElementById('firstName')   as HTMLInputElement).value = p.patient_firstname;
(document.getElementById('lastName')    as HTMLInputElement).value = p.patient_lastname;
(document.getElementById('fiscalCode')  as HTMLInputElement).value = p.fiscal_code;
(document.getElementById('doctorPhone') as HTMLInputElement).value = p.doctor_phone;
(document.getElementById('doctorEmail') as HTMLInputElement).value = p.doctor_email;
(document.getElementById('template')    as HTMLTextAreaElement).value = p.message_template ?? DEFAULT_TEMPLATE;

const method = p.send_method ?? 'whatsapp';
(document.querySelector(`input[name=sendMethod][value="${method}"]`) as HTMLInputElement).checked = true;

function saveAll(): void {
  localStorage.setItem('patient_firstname', (document.getElementById('firstName')   as HTMLInputElement).value.trim());
  localStorage.setItem('patient_lastname',  (document.getElementById('lastName')    as HTMLInputElement).value.trim());
  localStorage.setItem('fiscal_code',       (document.getElementById('fiscalCode')  as HTMLInputElement).value.trim().toUpperCase());
  localStorage.setItem('doctor_phone',      (document.getElementById('doctorPhone') as HTMLInputElement).value.trim());
  localStorage.setItem('doctor_email',      (document.getElementById('doctorEmail') as HTMLInputElement).value.trim());
  localStorage.setItem('send_method',       (document.querySelector('input[name=sendMethod]:checked') as HTMLInputElement).value);
  localStorage.setItem('message_template',  (document.getElementById('template')    as HTMLTextAreaElement).value);
}

document.getElementById('firstName')!  .addEventListener('input', saveAll);
document.getElementById('lastName')!   .addEventListener('input', saveAll);
document.getElementById('fiscalCode')! .addEventListener('input', saveAll);
document.getElementById('doctorPhone')!.addEventListener('input', saveAll);
document.getElementById('doctorEmail')!.addEventListener('input', saveAll);
document.getElementById('template')!   .addEventListener('input', saveAll);
document.querySelectorAll('input[name=sendMethod]').forEach(r => r.addEventListener('change', saveAll));

document.getElementById('btnReset')!.addEventListener('click', () => {
  (document.getElementById('template') as HTMLTextAreaElement).value = DEFAULT_TEMPLATE;
  saveAll();
});
