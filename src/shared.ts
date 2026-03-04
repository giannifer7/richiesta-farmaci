export const DEFAULT_TEMPLATE = 'Farmaci: {COGNOME} {nome}, {lista(", ", {qta} x {farmaco})}';

export interface Medicine {
  entry: string;     // sempre "N x Nome farmaco"
  isDefault: boolean;
}

export interface Prefs {
  patient_firstname: string;
  patient_lastname:  string;
  fiscal_code:       string;
  doctor_phone:      string;
  doctor_email:      string;
  send_method:       'whatsapp' | 'sms' | 'email';
  message_template:  string | null;
}

export function getPrefs(): Prefs {
  return {
    patient_firstname: localStorage.getItem('patient_firstname')  ?? '',
    patient_lastname:  localStorage.getItem('patient_lastname')   ?? '',
    fiscal_code:       localStorage.getItem('fiscal_code')        ?? '',
    doctor_phone:      localStorage.getItem('doctor_phone')       ?? '',
    doctor_email:      localStorage.getItem('doctor_email')       ?? '',
    send_method:      (localStorage.getItem('send_method') ?? 'whatsapp') as Prefs['send_method'],
    message_template:  localStorage.getItem('message_template'),
  };
}

export function getMedicinesText(): string {
  return localStorage.getItem('medicines_text') ?? '[x] 1 x Paracetamolo 1000 mg';
}

/** Garantisce il formato "N x Nome", aggiungendo "1 x " se mancante. */
function normalizeEntry(entry: string): string {
  const trimmed = entry.trim();
  return /^\d+\s*x\s+/i.test(trimmed) ? trimmed : `1 x ${trimmed}`;
}

export function parseImportText(text: string): Medicine[] {
  const trimmed = (text ?? '').trim();
  if (!trimmed) return [];

  // Formato medico: "Farmaci: COGNOME Nome, 2 x Farmaco A, ..."
  if (/^farmaci:/i.test(trimmed)) {
    return trimmed.slice(trimmed.indexOf(':') + 1)
      .split(',').map(s => s.trim()).filter(Boolean)
      .slice(1)   // salta nome paziente
      .map(s => ({ entry: normalizeEntry(s), isDefault: false }));
  }

  // Formato riga per riga
  return trimmed.split('\n').flatMap(line => {
    const t = line.trim();
    if (!t) return [];
    if (/^\[x\]\s/i.test(t)) return [{ entry: normalizeEntry(t.slice(4).trim()), isDefault: true }];
    if (t.startsWith('[ ] '))  return [{ entry: normalizeEntry(t.slice(4).trim()), isDefault: false }];
    return [{ entry: normalizeEntry(t), isDefault: false }];
  }).filter(m => m.entry);
}

export function parseMedicines(): Medicine[] {
  return parseImportText(getMedicinesText());
}

/** Converte qualsiasi testo nel formato canonico "[x] N x farmaco" */
export function normalizeMedicinesText(text: string): string {
  return parseImportText(text)
    .map(({ entry, isDefault }) => (isDefault ? '[x] ' : '[ ] ') + entry)
    .join('\n');
}

export function medicineNameOnly(entry: string): string {
  return entry.replace(/^\d+\s*x\s+/i, '').trim();
}

export function applyTemplate(
  template: string,
  firstName: string,
  lastName: string,
  fiscalCode: string,
  selectedMeds: string[],
): string {
  const listaRegex = /\{lista\("([^"]*)",\s*([^)]*)\)\}/g;
  let result = template.replace(listaRegex, (_, rawSep: string, itemTpl: string) => {
    const sep = rawSep.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
    return selectedMeds.map(med => {
      const m = med.trim().match(/^(\d+)\s*x\s+(.+)/i);
      const qty  = m ? m[1] : '1';
      const name = m ? m[2].trim() : med.trim();
      return itemTpl.replace(/{qta}/g, qty).replace(/{farmaco}/g, name);
    }).join(sep);
  });
  return result
    .replace(/{COGNOME}/g, lastName.toUpperCase())
    .replace(/{cognome}/g, lastName)
    .replace(/{nome}/g,    firstName)
    .replace(/{cod_fisc}/g, fiscalCode);
}

export function formatLastRequest(): string {
  const ms = parseInt(localStorage.getItem('last_request_ms') ?? '0');
  if (!ms) return '';
  const sentDate = new Date(ms);
  const today   = new Date(); today.setHours(0, 0, 0, 0);
  const sentDay = new Date(sentDate); sentDay.setHours(0, 0, 0, 0);
  const days    = Math.round((today.getTime() - sentDay.getTime()) / 86400000);
  const dateLabel = sentDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  const daysLabel = days === 0 ? 'oggi' : days === 1 ? '1 giorno fa' : `${days} giorni fa`;
  return `Ultima richiesta ${daysLabel} (${dateLabel})`;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
