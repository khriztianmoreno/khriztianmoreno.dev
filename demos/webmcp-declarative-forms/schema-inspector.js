/**
 * Live view of what the shim synthesizes from each form. It re-renders on
 * every `toolchange`, which the shim fires from a MutationObserver whenever
 * a form's tool attributes or its controls change.
 */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function mountSchemaInspector({ tools, listEl, updatesEl }) {
  let updates = 0;

  async function render() {
    const catalog = await tools.getTools();
    updatesEl.textContent = `${catalog.length} tools · re-synthesized ${updates}×`;
    listEl.innerHTML = catalog
      .map(
        (t) => `
          <li class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <div class="flex flex-wrap items-center gap-2">
              <code class="font-mono text-sm font-semibold">${esc(t.name)}</code>
              <span class="rounded-full px-2 py-0.5 text-[11px] font-medium ${
                t.autosubmit
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }">${t.autosubmit ? 'toolautosubmit' : 'human submits'}</span>
            </div>
            <p class="mt-1 text-xs text-slate-500">${esc(t.description)}</p>
            <pre class="schema-json">${esc(JSON.stringify(t.inputSchema, null, 2))}</pre>
          </li>`,
      )
      .join('');
  }

  tools.addEventListener('toolchange', () => {
    updates += 1;
    render();
  });
  return render();
}
