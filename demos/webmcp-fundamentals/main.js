import { mountApp, setSkin, snapshotSize } from './app.js';
import { resetStore } from './store.js';
import { registerTools } from './tools.js';
import { getModelContext, ModelContextShim } from './webmcp-shim.js';
import { createAgentConsole } from './agent-console.js';
import { runActuationAgent } from './actuation-agent.js';
import { runWebMcpAgent } from './webmcp-agent.js';

const GOAL = {
  origin: 'BOG',
  destination: 'MAD',
  date: '2026-11-20',
  passenger: 'Ana Gómez',
  text: 'Book the cheapest nonstop flight BOG → MAD on 2026-11-20 for Ana Gómez.',
};

const appEl = document.getElementById('app');
const runtimeBadge = document.getElementById('runtime');
const runtimeNote = document.getElementById('runtime-note');
const toolCountEl = document.getElementById('tool-count');
const redesignToggle = document.getElementById('redesign');
const resetBtn = document.getElementById('reset');
const runActuationBtn = document.getElementById('run-actuation');
const runWebMcpBtn = document.getElementById('run-webmcp');

const actuationUi = createAgentConsole(document.getElementById('actuation-panel'));
const webMcpUi = createAgentConsole(document.getElementById('webmcp-panel'));

document.getElementById('goal').textContent = GOAL.text;
mountApp(appEl);
actuationUi.reset();
webMcpUi.reset();

// --- WebMCP runtime: native if the browser has it, otherwise the shim ------

let { modelContext, kind } = getModelContext();

try {
  await registerTools(modelContext);
} catch (err) {
  // e.g. NotAllowedError when the "tools" Permissions Policy blocks this document.
  if (kind !== 'native') throw err;
  runtimeNote.textContent = `Native registerTool() failed (${err.name}: ${err.message}). Using the shim instead.`;
  modelContext = new ModelContextShim();
  kind = 'shim';
  await registerTools(modelContext);
}

runtimeBadge.textContent = kind === 'native' ? 'native document.modelContext' : 'shim (no native WebMCP)';
runtimeBadge.dataset.kind = kind;

async function refreshToolCount() {
  const tools = await modelContext.getTools();
  toolCountEl.textContent = `${tools.length} tools registered`;
}
modelContext.addEventListener('toolchange', refreshToolCount);
modelContext.addEventListener('toolactivated', (e) => webMcpUi.log('tool', `toolactivated: ${e.toolName}`));
await refreshToolCount();

// --- Controls -------------------------------------------------------------

const currentSkin = () => (redesignToggle.checked ? 'v2' : 'v1');

// Each run starts from a clean app: empty store, fresh markup (cookie banner included).
function freshApp() {
  resetStore();
  setSkin(currentSkin());
}

// Reset and the redesign toggle stay locked during a run: wiping the app mid-run
// would orphan a pending approval prompt and leave the run buttons disabled.
function setRunning(running) {
  runActuationBtn.disabled = runWebMcpBtn.disabled = running;
  resetBtn.disabled = redesignToggle.disabled = running;
}

async function run(agent) {
  setRunning(true);
  freshApp();
  try {
    await agent();
  } finally {
    setRunning(false);
  }
}

redesignToggle.addEventListener('change', freshApp);

resetBtn.addEventListener('click', () => {
  freshApp();
  actuationUi.reset();
  webMcpUi.reset();
});

runActuationBtn.addEventListener('click', () =>
  run(() => runActuationAgent({ root: appEl, goal: GOAL, ui: actuationUi, snapshotSize })),
);

runWebMcpBtn.addEventListener('click', () => run(() => runWebMcpAgent({ modelContext, goal: GOAL, ui: webMcpUi })));
