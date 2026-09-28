import { HybridAIService } from './orchestrator.js';
import { getHistory, clearAll } from './db.js';

const noteEl = document.getElementById('note');
const processBtn = document.getElementById('process');
const resetBtn = document.getElementById('reset');
const offlineToggle = document.getElementById('pretend-offline');
const statusEl = document.getElementById('status');
const reportEl = document.getElementById('report');
const sourceBadge = document.getElementById('source-badge');
const historyEl = document.getElementById('history');
const warningEl = document.getElementById('warning');

function setStatus(text) {
  statusEl.textContent = text;
}

function renderBadge(source) {
  sourceBadge.textContent =
    source === 'cache' ? 'cache (IndexedDB)' : source === 'nano' ? 'Gemini Nano (local)' : 'cloud';
  sourceBadge.className = `badge badge-${source}`;
  sourceBadge.hidden = false;
}

function renderReport(text) {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const report = JSON.parse(cleaned);
    reportEl.textContent = JSON.stringify(report, null, 2);
  } catch {
    reportEl.textContent = text; // model didn't return clean JSON — show raw output
  }
}

async function renderHistory() {
  const history = await getHistory();
  historyEl.innerHTML = '';
  for (const turn of history) {
    if (turn.role === 'system') continue;
    const li = document.createElement('li');
    li.textContent = `${turn.role}: ${turn.content.slice(0, 120)}`;
    historyEl.appendChild(li);
  }
}

const service = new HybridAIService((s) => {
  if (s.scope === 'model') {
    if (s.status === 'downloading') setStatus(`Downloading model… ${s.progress}%`);
    else if (s.status === 'ready') setStatus('Local model ready.');
    else if (s.status === 'unavailable') setStatus(`Local model unavailable: ${s.reason}`);
  }
});

if (!('LanguageModel' in self)) {
  warningEl.hidden = false;
  processBtn.disabled = true;
}

setStatus('Restoring session from IndexedDB and loading the model…');
service.bootstrap().then(renderHistory);

processBtn.addEventListener('click', async () => {
  const rawNote = noteEl.value.trim();
  if (!rawNote) return;

  processBtn.disabled = true;
  sourceBadge.hidden = true;
  reportEl.textContent = '';
  setStatus('Processing…');

  try {
    const { text, source } = await service.processNote(rawNote, {
      pretendOffline: offlineToggle.checked,
    });
    renderReport(text);
    renderBadge(source);
    setStatus('Done.');
    await renderHistory();
  } catch (err) {
    reportEl.textContent = `[error] ${err.message}`;
    setStatus('Failed.');
  } finally {
    processBtn.disabled = false;
  }
});

resetBtn.addEventListener('click', async () => {
  await clearAll();
  reportEl.textContent = '';
  sourceBadge.hidden = true;
  await renderHistory();
  setStatus('Session cleared. Reload the page to rebuild initialPrompts from (empty) history.');
});
