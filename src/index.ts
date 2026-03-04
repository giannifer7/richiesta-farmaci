import { parseMedicines, medicineNameOnly, getPrefs, applyTemplate,
         DEFAULT_TEMPLATE, formatLastRequest } from './shared';

const medicines = parseMedicines();
const sorted = [...medicines].sort((a, b) =>
  medicineNameOnly(a.entry).localeCompare(medicineNameOnly(b.entry), 'it'));

const container = document.getElementById('medicineList')!;
sorted.forEach(({ entry, isDefault }, i) => {
  const div = document.createElement('div');
  div.className = 'medicine-item';
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.id = `med${i}`;
  cb.checked = isDefault;
  const lbl = document.createElement('label');
  lbl.htmlFor = cb.id;
  lbl.textContent = entry;
  div.append(cb, lbl);
  container.appendChild(div);
});

document.getElementById('lastRequest')!.textContent = formatLastRequest();

document.getElementById('btnSend')!.addEventListener('click', () => {
  const selected: string[] = [];
  container.querySelectorAll<HTMLInputElement>('input[type=checkbox]').forEach((cb, i) => {
    if (cb.checked) selected.push(sorted[i].entry);
  });

  if (!selected.length) { alert('Seleziona almeno un farmaco'); return; }

  const p = getPrefs();
  if (!p.patient_firstname && !p.patient_lastname) {
    alert('Imposta nome e cognome nelle Impostazioni'); return;
  }
  if (p.send_method === 'email' && !p.doctor_email) {
    alert("Imposta l'email del medico nelle Impostazioni"); return;
  }
  if (p.send_method !== 'email' && !p.doctor_phone) {
    alert('Imposta il numero del medico nelle Impostazioni'); return;
  }

  const message = applyTemplate(
    p.message_template ?? DEFAULT_TEMPLATE,
    p.patient_firstname, p.patient_lastname, p.fiscal_code, selected);

  switch (p.send_method) {
    case 'whatsapp': {
      const phone = p.doctor_phone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      break;
    }
    case 'sms':
      window.location.href = `sms:${p.doctor_phone}?body=${encodeURIComponent(message)}`;
      break;
    case 'email':
      window.location.href = `mailto:${p.doctor_email}` +
        `?subject=${encodeURIComponent('Richiesta farmaci')}` +
        `&body=${encodeURIComponent(message)}`;
      break;
  }

  localStorage.setItem('last_request_ms', Date.now().toString());
  document.getElementById('lastRequest')!.textContent = formatLastRequest();
});
