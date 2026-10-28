/**
 * Tiny log widget for the simulated agent (trimmed from part 1's console:
 * no payload counters, this demo is about state, not tokens).
 */

const TAG_STYLES = {
  observe: 'text-sky-600 dark:text-sky-400',
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
  const statusEl = panel.querySelector('[data-status]');

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
      logEl.replaceChildren();
      this.status('idle', 'idle');
    },

    status(tone, text) {
      statusEl.className = `rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[tone]}`;
      statusEl.textContent = text;
    },

    log: line,

    /** A collapsible JSON block under the last line. */
    json(summary, value, { open = false } = {}) {
      const li = document.createElement('li');
      li.className = 'log-line log-json';
      li.innerHTML = '<details><summary></summary><pre></pre></details>';
      li.querySelector('details').open = open;
      li.querySelector('summary').textContent = summary;
      li.querySelector('pre').textContent = JSON.stringify(value, null, 2);
      logEl.append(li);
      logEl.scrollTop = logEl.scrollHeight;
    },
  };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
