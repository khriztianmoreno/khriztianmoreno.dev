/**
 * A minimal, in-page stand-in for `document.modelContext` so the demo runs
 * in any browser. Adapted from part 1's shim, with the timing of
 * registerTool() aligned to the spec (Draft CG Report), because this demo is
 * about that timing:
 *
 *   - The tool map entry is set synchronously, and the duplicate-name check
 *     is synchronous (InvalidStateError).
 *   - An already-aborted signal rejects immediately with its abort reason.
 *   - Aborting the signal synchronously unregisters the tool AND rejects the
 *     registration promise with the abort reason (a no-op once it resolved).
 *   - `toolchange` and the promise resolution are queued as a task, so the
 *     promise resolves after `toolchange` fires.
 *
 * There is no unregisterTool(): the IDL only has registerTool(), getTools(),
 * executeTool() and the toolchange / toolactivated / toolcancel events.
 *
 * It is NOT a polyfill: no cross-frame discovery, no origin checks, no
 * Permissions Policy, no "fully active" check. When the browser ships the
 * real thing, the demo uses that instead (see getModelContext() below).
 */

const NAME_PATTERN = /^[A-Za-z0-9_.-]{1,128}$/;

const queueTask = (fn) => setTimeout(fn, 0);

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

  registerTool(tool, { signal } = {}) {
    const { name, title, description, inputSchema, execute, annotations } = tool ?? {};

    // Same checks, same order, same error names as the spec's algorithm.
    // All of them run synchronously, before the method returns.
    if (this.#tools.has(name)) {
      return Promise.reject(domError(`A tool named "${name}" is already registered.`, 'InvalidStateError'));
    }
    if (!NAME_PATTERN.test(name ?? '')) return Promise.reject(domError(`Invalid tool name "${name}".`, 'InvalidStateError'));
    if (!description) return Promise.reject(domError('Tool description must not be empty.', 'InvalidStateError'));
    if (typeof execute !== 'function') return Promise.reject(new TypeError('Tool execute must be a function.'));

    let serializedSchema;
    try {
      serializedSchema = inputSchema === undefined ? undefined : JSON.stringify(inputSchema);
    } catch (err) {
      return Promise.reject(err);
    }

    if (signal?.aborted) return Promise.reject(signal.reason);

    const { promise, resolve, reject } = Promise.withResolvers();

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          this.#unregister(name);
          reject(signal.reason); // ignored if the promise already resolved
        },
        { once: true },
      );
    }

    this.#tools.set(name, {
      name,
      title,
      description,
      inputSchema: serializedSchema,
      execute,
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: false, debugging: false, ...annotations },
    });

    queueTask(() => {
      this.dispatchEvent(new Event('toolchange'));
      resolve();
    });

    return promise;
  }

  // The spec's "unregister a tool": synchronous removal, async notification.
  #unregister(name) {
    if (!this.#tools.has(name)) return;
    this.#tools.delete(name);
    queueTask(() => this.dispatchEvent(new Event('toolchange')));
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
    signal?.addEventListener(
      'abort',
      () => {
        controller.abort(signal.reason);
        this.dispatchEvent(toolEvent('toolcancel', tool.name));
      },
      { once: true },
    );

    this.dispatchEvent(toolEvent('toolactivated', tool.name));

    // Unregistering a tool does not cancel an execution already in flight:
    // we hold on to `tool`, not to the map entry.
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
 * `document.modelContext` is the spec's entry point (it exists only on
 * Document, so Workers can't register tools). It is used only if it has the
 * getTools()/executeTool() surface this demo needs, and only if a probe
 * registration isn't blocked by the "tools" Permissions Policy.
 *
 * The probe passes an already-aborted signal: per the spec, the policy check
 * runs before the abort check, so a blocked document rejects with
 * NotAllowedError and an allowed one rejects with the abort reason. Either
 * way, nothing gets registered.
 */
export async function getModelContext() {
  const native = document.modelContext;
  const usable =
    native &&
    typeof native.registerTool === 'function' &&
    typeof native.getTools === 'function' &&
    typeof native.executeTool === 'function';

  if (!usable) return { modelContext: new ModelContextShim(), kind: 'shim', note: '' };

  try {
    await native.registerTool(
      { name: 'webmcp_probe', description: 'Probe. Never registered.', execute: async () => null },
      { signal: AbortSignal.abort() },
    );
  } catch (err) {
    if (err?.name !== 'AbortError') {
      return {
        modelContext: new ModelContextShim(),
        kind: 'shim',
        note: `Native registerTool() is unavailable here (${err.name}: ${err.message}). Using the shim instead.`,
      };
    }
  }
  return { modelContext: native, kind: 'native', note: '' };
}
