import { createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app.js';
import { CART_TOOL_HOOKS } from './cart-tools.js';
import { WebMCPContext } from './use-webmcp-tool.js';
import { useTripStore } from './store.js';
import { getModelContext } from './webmcp-shim.js';
import { instrument, metrics } from './lab-metrics.js';
import { createAgentConsole } from './agent-console.js';
import { GOAL, runAgent, rereadCart } from './agent.js';

const $ = (id) => document.getElementById(id);

// --- WebMCP runtime: native if the browser has it, otherwise the shim ------

const { modelContext, kind, note } = await getModelContext();
const labContext = instrument(modelContext);

// Handy from DevTools: await demo.modelContext.getTools()
window.demo = { modelContext };

$('runtime').textContent = kind === 'native' ? 'native document.modelContext' : 'shim (no native WebMCP)';
$('runtime').dataset.kind = kind;
$('runtime-note').textContent = note;
$('goal').textContent = GOAL;

// --- Unhandled rejections, surfaced in the page --------------------------

const alertsEl = $('unhandled-list');

window.addEventListener('unhandledrejection', (event) => {
  // Not calling preventDefault(): the browser still logs it, like it would in your app.
  metrics.bump('unhandled');
  const reason = event.reason;
  const li = document.createElement('li');
  li.textContent = `Uncaught (in promise) ${reason?.name ?? 'Error'}: ${reason?.message ?? reason}`;
  alertsEl.append(li);
  alertsEl.closest('[data-alerts]').hidden = false;
});

function clearAlerts() {
  alertsEl.replaceChildren();
  alertsEl.closest('[data-alerts]').hidden = true;
}

// --- Counters + live getTools() list -------------------------------------

const COUNTERS = ['renders', 'registrations', 'aborts', 'toolchanges', 'unhandled'];

function renderCounters(c) {
  for (const key of COUNTERS) document.querySelector(`[data-counter="${key}"]`).textContent = String(c[key]);
}

let liveTools = [];

function renderToolList() {
  const { perTool } = metrics.get();
  const list = $('tool-list');
  list.replaceChildren(
    ...liveTools.map((t) => {
      const li = document.createElement('li');
      li.className = 'tool-row';
      li.dataset.tool = t.name;
      const hints = Object.entries(t.annotations ?? {})
        .filter(([, v]) => v === true)
        .map(([k]) => k)
        .join(', ');
      li.innerHTML = '<code></code><span class="tool-hint"></span><span class="tool-count"></span>';
      li.querySelector('code').textContent = t.name;
      li.querySelector('.tool-hint').textContent = hints;
      li.querySelector('.tool-count').textContent = `registered ×${perTool[t.name] ?? 0}`;
      return li;
    }),
  );
  $('tool-count').textContent = `${liveTools.length} tools registered`;
}

async function refreshTools() {
  liveTools = await modelContext.getTools();
  renderToolList();
}

metrics.subscribe((c) => {
  renderCounters(c);
  renderToolList();
});
modelContext.addEventListener('toolchange', refreshTools);

// --- The React root: recreated whenever a lab setting changes ------------

let root = null;
let mountGeneration = 0;

function settings() {
  return {
    mode: document.querySelector('input[name="hook-mode"]:checked').value,
    strict: $('strict-mode').checked,
    catchRegistration: $('catch-registration').checked,
  };
}

async function mountApp() {
  const generation = ++mountGeneration;
  if (root) {
    root.unmount(); // every effect cleanup runs: every tool's signal is aborted
    root = null;
    await new Promise((r) => setTimeout(r, 50)); // let the unmount's toolchange events land
  }
  if (generation !== mountGeneration) return; // a newer mountApp() call owns the container now
  metrics.reset();
  clearAlerts();

  const { mode, strict, catchRegistration } = settings();
  document.documentElement.dataset.mode = mode;

  const tree = createElement(
    WebMCPContext.Provider,
    { value: { modelContext: labContext, catchRegistration } },
    createElement(App, { useCartTools: CART_TOOL_HOOKS[mode] }),
  );

  root = createRoot($('app'));
  root.render(strict ? createElement(StrictMode, null, tree) : tree);
}

for (const input of document.querySelectorAll('[data-lab-setting]')) input.addEventListener('change', mountApp);

$('reset').addEventListener('click', () => {
  useTripStore.getState().reset();
  agentUi.reset();
  mountApp();
});

// --- Agent ---------------------------------------------------------------

const agentUi = createAgentConsole($('agent-panel'));
agentUi.reset();

$('run-agent').addEventListener('click', async () => {
  $('run-agent').disabled = $('reread-cart').disabled = true;
  try {
    await runAgent({ modelContext, ui: agentUi });
  } finally {
    $('run-agent').disabled = $('reread-cart').disabled = false;
  }
});

$('reread-cart').addEventListener('click', () => rereadCart({ modelContext, ui: agentUi }));

await mountApp();
await refreshTools();
