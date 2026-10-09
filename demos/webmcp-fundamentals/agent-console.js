/**
 * Tiny log + metrics widget shared by both agent panels. Tracks two numbers:
 * steps (round trips to the model) and payload (characters the agent had
 * to send or read to make progress, a rough proxy for tokens).
 */

const TAG_STYLES = {
  observe: 'text-sky-600 dark:text-sky-400',
  act: 'text-indigo-600 dark:text-indigo-400',
  think: 'text-slate-500 dark:text-slate-400',
  tool: 'text-violet-600 dark:text-violet-400',
  ok: 'text-emerald-600 dark:text-emerald-400',
  fail: 'text-rose-600 dark:text-rose-400',
  warn: 'text-amber-600 dark:text-amber-400',
};

const STATUS_STYLES = {
  idle: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  running: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  done: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  failed: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
};

export function createAgentConsole(panel) {
  const logEl = panel.querySelector('[data-log]');
  const stepsEl = panel.querySelector('[data-steps]');
  const payloadEl = panel.querySelector('[data-payload]');
  const tokensEl = panel.querySelector('[data-tokens]');
  const statusEl = panel.querySelector('[data-status]');

  let steps = 0;
  let payload = 0;

  function renderMetrics() {
    stepsEl.textContent = String(steps);
    payloadEl.textContent = payload < 1000 ? `${payload}` : `${(payload / 1000).toFixed(1)}k`;
    tokensEl.textContent = `~${Math.round(payload / 4).toLocaleString()}`;
  }

  function line(kind, text) {
    const li = document.createElement('li');
    li.className = 'log-line';
    const tag = document.createElement('span');
    tag.className = `log-tag ${TAG_STYLES[kind] ?? ''}`;
    tag.textContent = kind;
    const body = document.createElement('span');
    body.textContent = text;
    li.append(tag, body);
    logEl.append(li);
    logEl.scrollTop = logEl.scrollHeight;
    return li;
  }

  return {
    reset() {
      steps = 0;
      payload = 0;
      logEl.replaceChildren();
      renderMetrics();
      this.status('idle', 'idle');
    },

    status(tone, text) {
      statusEl.className = `rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[tone]}`;
      statusEl.textContent = text;
    },

    /** Counts as one round trip to the model, carrying `chars` of context. */
    step(kind, text, chars = 0) {
      steps += 1;
      payload += chars;
      renderMetrics();
      return line(kind, chars ? `${text}  (+${chars.toLocaleString()} ch)` : text);
    },

    /** Adds payload without a new round trip (e.g. a tool result read back). */
    addPayload(chars) {
      payload += chars;
      renderMetrics();
    },

    log: line,

    /** A collapsible JSON block under the last line. */
    json(summary, value) {
      const li = document.createElement('li');
      li.className = 'log-line log-json';
      li.innerHTML = '<details><summary></summary><pre></pre></details>';
      li.querySelector('summary').textContent = summary;
      li.querySelector('pre').textContent = JSON.stringify(value, null, 2);
      logEl.append(li);
      logEl.scrollTop = logEl.scrollHeight;
    },

    /** Inline human-in-the-loop prompt. Resolves true (approve) or false (deny). */
    approval(text) {
      const li = line('warn', text);
      const actions = document.createElement('span');
      actions.className = 'ml-2 inline-flex gap-1.5';
      actions.innerHTML = `
        <button data-approve class="rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">Approve</button>
        <button data-deny class="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-800 dark:bg-slate-700 dark:text-slate-100">Deny</button>`;
      li.lastChild.append(actions);
      logEl.scrollTop = logEl.scrollHeight;

      return new Promise((resolve) => {
        const answer = (value) => {
          actions.replaceChildren(value ? '→ approved by user' : '→ denied by user');
          resolve(value);
        };
        actions.querySelector('[data-approve]').addEventListener('click', () => answer(true), { once: true });
        actions.querySelector('[data-deny]').addEventListener('click', () => answer(false), { once: true });
      });
    },
  };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
