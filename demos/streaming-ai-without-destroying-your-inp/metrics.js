/**
 * Wires up web-vitals' onINP so every interaction (including clicks on the
 * "probe" button) shows up on screen without having to open DevTools.
 */
import { onINP } from 'https://unpkg.com/web-vitals@5?module';

const log = document.getElementById('inp-log');

onINP((metric) => {
  const target = metric.entries.at(-1)?.target;
  const label = target?.id || target?.tagName?.toLowerCase() || 'unknown target';

  const item = document.createElement('li');
  item.textContent = `${metric.value.toFixed(0)}ms — ${label}`;
  item.className = metric.value > 200 ? 'inp-poor' : 'inp-good';
  log?.prepend(item);
});
