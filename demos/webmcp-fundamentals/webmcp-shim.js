/**
 * A minimal, in-page stand-in for `document.modelContext` so the demo runs
 * in any browser. It implements only the surface this demo uses, following
 * the WebMCP spec (Draft CG Report, 9 Oct 2026):
 *
 *   registerTool(tool, { signal, exposedTo })  -> Promise<undefined>
 *   getTools()                                  -> Promise<RegisteredTool[]>
 *   executeTool(registeredTool, input, { signal }) -> Promise<DOMString>
 *   events: toolchange, toolactivated, toolcancel
 *
 * It is NOT a polyfill: no cross-frame discovery, no origin checks, no
 * Permissions Policy. When the browser ships the real thing, the demo uses
 * that instead (see getModelContext() below).
 */

const NAME_PATTERN = /^[A-Za-z0-9_.-]{1,128}$/;

function domError(message, name) {
  return new DOMException(message, name);
}

function toolEvent(type, toolName) {
  const event = new Event(type);
  event.toolName = toolName; // ToolActivatedEvent / ToolCancelEvent expose `toolName`
  return event;
}

export class ModelContextShim extends EventTarget {
  #tools = new Map();

  async registerTool(tool, { signal } = {}) {
    const { name, title, description, inputSchema, execute, annotations } = tool ?? {};

    // Same checks, same order, same error names as the spec's algorithm.
    if (this.#tools.has(name)) throw domError(`A tool named "${name}" is already registered.`, 'InvalidStateError');
    if (!NAME_PATTERN.test(name ?? '')) throw domError(`Invalid tool name "${name}".`, 'InvalidStateError');
    if (!description) throw domError('Tool description must not be empty.', 'InvalidStateError');
    if (typeof execute !== 'function') throw new TypeError('Tool execute must be a function.');

    const serializedSchema = inputSchema === undefined ? undefined : JSON.stringify(inputSchema);
    signal?.throwIfAborted();

    this.#tools.set(name, {
      name,
      title,
      description,
      inputSchema: serializedSchema,
      execute,
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: false, debugging: false, ...annotations },
    });

    // Aborting the signal is how you unregister a tool.
    signal?.addEventListener('abort', () => {
      this.#tools.delete(name);
      queueMicrotask(() => this.dispatchEvent(new Event('toolchange')));
    }, { once: true });

    queueMicrotask(() => this.dispatchEvent(new Event('toolchange')));
  }

  async getTools() {
    return [...this.#tools.values()].map((t) => ({
      name: t.name,
      title: t.title,
      description: t.description,
      inputSchema: t.inputSchema === undefined ? undefined : JSON.parse(t.inputSchema),
      window,
      origin: location.origin,
      annotations: { ...t.annotations },
    }));
  }

  async executeTool(registeredTool, inputObject = {}, { signal } = {}) {
    const tool = this.#tools.get(registeredTool?.name);
    if (!tool) throw domError(`No tool named "${registeredTool?.name}".`, 'NotFoundError');

    const controller = new AbortController();
    signal?.addEventListener('abort', () => {
      controller.abort(signal.reason);
      this.dispatchEvent(toolEvent('toolcancel', tool.name));
    }, { once: true });

    this.dispatchEvent(toolEvent('toolactivated', tool.name));

    let result;
    try {
      result = await tool.execute(inputObject, { signal: controller.signal });
    } catch (err) {
      throw domError(`Tool rejected: ${err?.message ?? err}`, 'OperationError');
    }

    // The spec hands the agent a JSON string, never a live object.
    const serialized = JSON.stringify(result);
    if (serialized === undefined) throw domError('Unserializable result.', 'OperationError');
    return serialized;
  }
}

/**
 * `document.modelContext` is the spec's entry point. `navigator.modelContext`
 * is the legacy location (removed in Chrome 152 Canary) — still checked so
 * older builds don't fall back for no reason, but only if it has the same
 * getTools()/executeTool() surface this demo needs.
 */
export function getModelContext() {
  const native = document.modelContext ?? navigator.modelContext;
  const usable =
    native &&
    typeof native.registerTool === 'function' &&
    typeof native.getTools === 'function' &&
    typeof native.executeTool === 'function';

  return usable ? { modelContext: native, kind: 'native' } : { modelContext: new ModelContextShim(), kind: 'shim' };
}
