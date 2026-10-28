/**
 * Request/response over postMessage, with request ids and a timeout.
 * The main-thread side of the Worker proxy pattern.
 */

export const FARE_TIMEOUT_MS = 1500;

export function createWorkerClient(worker, { timeoutMs = FARE_TIMEOUT_MS } = {}) {
  let nextId = 1;
  const pending = new Map(); // id -> { resolve, reject, timer, cleanup }

  function settle(id) {
    const entry = pending.get(id);
    if (!entry) return null;
    pending.delete(id);
    clearTimeout(entry.timer);
    entry.cleanup();
    return entry;
  }

  worker.addEventListener('message', ({ data }) => {
    // A late answer (after a timeout or abort) has no pending entry: drop it.
    const entry = settle(data?.id);
    if (!entry) return;
    if (data.ok) entry.resolve(data.result);
    else entry.reject(new Error(data.error));
  });

  worker.addEventListener('error', (event) => {
    for (const id of [...pending.keys()]) settle(id).reject(new Error(`Worker error: ${event.message ?? 'unknown'}`));
  });

  function request(type, payload, { signal } = {}) {
    if (signal?.aborted) return Promise.reject(signal.reason);

    const id = nextId++;
    return new Promise((resolve, reject) => {
      const onAbort = () => settle(id)?.reject(signal.reason);
      const timer = setTimeout(() => {
        settle(id)?.reject(new DOMException(`The fare worker did not answer "${type}" within ${timeoutMs} ms.`, 'TimeoutError'));
      }, timeoutMs);

      signal?.addEventListener('abort', onAbort, { once: true });
      pending.set(id, { resolve, reject, timer, cleanup: () => signal?.removeEventListener('abort', onAbort) });
      worker.postMessage({ id, type, payload });
    });
  }

  return { request };
}

export const fareWorker = new Worker(new URL('./fare-worker.js', import.meta.url), { type: 'module' });
export const fareClient = createWorkerClient(fareWorker);
