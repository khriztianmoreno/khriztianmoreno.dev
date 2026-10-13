import { enhanceForms } from './app.js';
import { definePassengerStepper } from './passenger-stepper.js';
import { DeclarativeToolsShim } from './declarative-shim.js';
import { mountSchemaInspector } from './schema-inspector.js';
import { createAgentConsole } from './agent-console.js';
import { runAgent } from './agent.js';

const GOAL = {
  text: 'Find the cheapest nonstop BOG → MAD on 2026-11-20 for 2 passengers in economy, and book it for Ana Gómez (ana.gomez@example.com) with 1 checked bag.',
  search: { origin: 'BOG', destination: 'MAD', date: '2026-11-20', cabin: 'economy', passengers: '2' },
  booking: { passenger: 'Ana Gómez', email: 'ana.gomez@example.com', bags: 1, insurance: false },
};

const $ = (id) => document.getElementById(id);
const searchForm = $('search-form');
const bookForm = $('book-form');

// ?nojs: the page script stops here, so the forms behave exactly as they
// would with JavaScript disabled (no custom element upgrade, no submit
// handlers, plain GET navigation). For the real thing, disable JavaScript
// in DevTools.
if (new URLSearchParams(location.search).has('nojs')) {
  document.documentElement.dataset.nojs = '';
} else {
  await boot();
}

async function boot() {
  $('goal').textContent = GOAL.text;

  // --- Runtime badge -------------------------------------------------------
  // There's no documented feature detection for the declarative API, so the
  // demo doesn't pretend to have one: declarative behavior is always the shim.
  const native = document.modelContext;
  const badge = $('runtime');
  if (native && typeof native.registerTool === 'function') {
    badge.textContent = 'native document.modelContext detected (imperative API)';
    badge.dataset.kind = 'native';
  } else {
    badge.textContent = 'no native WebMCP';
    badge.dataset.kind = 'shim';
  }

  // --- Progressive enhancement --------------------------------------------
  definePassengerStepper();
  const app = enhanceForms({
    searchForm,
    bookForm,
    resultsEl: $('results'),
    confirmationEl: $('confirmation'),
  });

  // --- Declarative tools (shim) ------------------------------------------
  const ui = createAgentConsole($('agent-panel'));
  ui.reset();
  const tools = new DeclarativeToolsShim(document);
  tools.addEventListener('toolactivated', (e) => ui.log('observe', `toolactivated: ${e.toolName}`));
  tools.addEventListener('toolcanceled', (e) => ui.log('observe', `toolcanceled: ${e.toolName}`));
  await mountSchemaInspector({ tools, listEl: $('schemas'), updatesEl: $('schema-updates') });

  // --- Live attribute edits (watch the inspector and the agent react) -----
  const autosubmitToggle = $('toggle-autosubmit');
  autosubmitToggle.addEventListener('change', () => bookForm.toggleAttribute('toolautosubmit', autosubmitToggle.checked));

  const renameBtn = $('rename-tool');
  renameBtn.addEventListener('click', () => {
    const next = bookForm.getAttribute('toolname') === 'book_flight' ? 'reserve_flight' : 'book_flight';
    bookForm.setAttribute('toolname', next);
    renameBtn.textContent = `Rename to ${next === 'book_flight' ? 'reserve_flight' : 'book_flight'}`;
  });

  // --- Agent ---------------------------------------------------------------
  const runBtn = $('run-agent');
  const cancelBtn = $('cancel-agent');
  const resetBtn = $('reset');
  let controller = null;

  runBtn.addEventListener('click', async () => {
    controller = new AbortController();
    runBtn.disabled = resetBtn.disabled = true;
    cancelBtn.disabled = false;
    app.reset();
    try {
      await runAgent({ tools, goal: GOAL, ui, signal: controller.signal });
    } finally {
      runBtn.disabled = resetBtn.disabled = false;
      cancelBtn.disabled = true;
      controller = null;
    }
  });

  cancelBtn.addEventListener('click', () => controller?.abort());

  resetBtn.addEventListener('click', () => {
    app.reset();
    ui.reset();
  });
}
