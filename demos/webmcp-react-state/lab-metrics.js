/**
 * Counters for the teaching panel. Nothing here is part of WebMCP: it wraps
 * whichever ModelContext is active (native or shim) so the panel can show
 * how many times React rendered vs. how many times a tool was registered.
 *
 * The wrapper never mutates the real `document.modelContext`; the app's
 * hooks get the wrapper instead.
 */

const initial = () => ({
  renders: 0, // commits of <TripCart>, the component that owns the cart tools
  registrations: 0, // registerTool() calls
  aborts: 0, // registration signals aborted (= unregistrations)
  toolchanges: 0, // toolchange events observed
  rejections: 0, // registration promises that rejected with something other than AbortError
  unhandled: 0, // `unhandledrejection` events on window
  perTool: {}, // name -> registerTool() calls
});

let counters = initial();
const listeners = new Set();

function emit() {
  for (const fn of listeners) fn(counters);
}

export const metrics = {
  get: () => counters,
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  bump(key) {
    counters = { ...counters, [key]: counters[key] + 1 };
    emit();
  },
  bumpTool(name) {
    counters = {
      ...counters,
      registrations: counters.registrations + 1,
      perTool: { ...counters.perTool, [name]: (counters.perTool[name] ?? 0) + 1 },
    };
    emit();
  },
  reset() {
    counters = initial();
    emit();
  },
};

/** A ModelContext-shaped facade that counts registrations and aborts. */
export function instrument(modelContext) {
  modelContext.addEventListener('toolchange', () => metrics.bump('toolchanges'));

  return {
    registerTool(tool, options = {}) {
      metrics.bumpTool(tool?.name);
      options.signal?.addEventListener('abort', () => metrics.bump('aborts'), { once: true });
      return modelContext.registerTool(tool, options);
    },
    getTools: (...args) => modelContext.getTools(...args),
    executeTool: (...args) => modelContext.executeTool(...args),
    addEventListener: (...args) => modelContext.addEventListener(...args),
    removeEventListener: (...args) => modelContext.removeEventListener(...args),
  };
}
