import { getMedicinesText, normalizeMedicinesText, parseImportText } from './shared';

const textarea = document.getElementById('medicinesText') as HTMLTextAreaElement;
textarea.value = normalizeMedicinesText(getMedicinesText());

document.getElementById('btnImport')!.addEventListener('click', () => {
  const text = (document.getElementById('importText') as HTMLTextAreaElement).value.trim();
  if (!text) return;
  const entries = parseImportText(text);
  if (!entries.length) return;
  textarea.value = entries.map(({ entry, isDefault }) =>
    (isDefault ? '[x] ' : '[ ] ') + entry).join('\n');
  (document.getElementById('importText') as HTMLTextAreaElement).value = '';
});

document.getElementById('btnSave')!.addEventListener('click', () => {
  localStorage.setItem('medicines_text', normalizeMedicinesText(textarea.value));
  window.location.href = 'settings.html';
});
