/**
 * Three ways to register a WebMCP tool from a React component. Only the
 * first one is right; the other two exist so the lab can show what goes
 * wrong.
 *
 *   useWebMCPTool       the contract hook: registers once per mount, aborts
 *                       on unmount, reads live values at call time.
 *   useNaiveWebMCPTool  re-registers whenever the tool object changes, which
 *                       is every render when you build it inline.
 *   useStaleWebMCPTool  registers once, but `execute` closes over the values
 *                       of the first render forever.
 */
import { createContext, useContext, useEffect, useLayoutEffect, useRef } from 'react';

export const WebMCPContext = createContext({ modelContext: null, catchRegistration: true });

function registerWithSignal(modelContext, tool, signal, catchRegistration) {
  const registration = modelContext.registerTool(tool, { signal });
  if (!catchRegistration) return; // lab toggle: leave the promise unhandled
  registration.catch((err) => {
    // Aborting before the promise resolves rejects it with the abort reason.
    // That's the expected path for StrictMode and fast unmounts.
    if (err?.name === 'AbortError') return;
    console.error(`[webmcp] registerTool("${tool.name}") failed:`, err);
  });
}

/**
 * The contract hook. The effect depends on the contract (name, title,
 * description, schema, annotations), never on state, so state changes
 * don't re-register anything. `execute` goes through a ref that always
 * points at the latest committed render's function.
 */
export function useWebMCPTool(tool) {
  const { modelContext, catchRegistration } = useContext(WebMCPContext);

  const executeRef = useRef(tool.execute);
  useLayoutEffect(() => {
    executeRef.current = tool.execute;
  });

  const { name, title, description } = tool;
  const schemaKey = JSON.stringify(tool.inputSchema ?? null);
  const annotationsKey = JSON.stringify(tool.annotations ?? null);

  useEffect(() => {
    if (!modelContext) return; // no WebMCP here (yet): nothing to register

    const controller = new AbortController();
    const inputSchema = JSON.parse(schemaKey) ?? undefined;
    const annotations = JSON.parse(annotationsKey) ?? undefined;

    registerWithSignal(
      modelContext,
      {
        name,
        title,
        description,
        inputSchema,
        annotations,
        execute: (input, options) => executeRef.current(input, options),
      },
      controller.signal,
      catchRegistration,
    );

    // There is no unregisterTool(). Aborting the signal is the unregistration.
    return () => controller.abort();
  }, [modelContext, catchRegistration, name, title, description, schemaKey, annotationsKey]);
}

/** Anti-pattern: `tool` is a new object every render, so this re-registers every render. */
export function useNaiveWebMCPTool(tool) {
  const { modelContext, catchRegistration } = useContext(WebMCPContext);

  useEffect(() => {
    const controller = new AbortController();
    registerWithSignal(modelContext, tool, controller.signal, catchRegistration);
    return () => controller.abort();
  }, [modelContext, catchRegistration, tool]);
}

/** Anti-pattern: registered once, but `tool.execute` is the first render's closure. */
export function useStaleWebMCPTool(tool) {
  const { modelContext, catchRegistration } = useContext(WebMCPContext);

  useEffect(() => {
    const controller = new AbortController();
    registerWithSignal(modelContext, tool, controller.signal, catchRegistration);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelContext, catchRegistration]);
}
