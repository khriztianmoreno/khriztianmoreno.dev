import { synthesizeInputSchema } from './schema-synthesis.js';

/**
 * A minimal, in-page stand-in for the browser side of the WebMCP
 * *declarative* API (declarative-api-explainer.md, last updated 2026-09-26).
 * It does what the explainer says the browser would do with a
 * <form toolname tooldescription [toolautosubmit]>:
 *
 *   - turns every such form into a tool, re-synthesizing its input schema
 *     whenever the form or its controls change (MutationObserver)
 *   - fills the form with the agent's input, then either auto-submits it
 *     (toolautosubmit) or focuses the submit button and waits for the human
 *   - adds `agentInvoked` and `respondWith()` to SubmitEvent
 *   - cancels the in-flight invocation on form reset, removal, or a change
 *     to toolname/tooldescription
 *   - mirrors :tool-form-active / :tool-submit-active as data attributes,
 *     because a script can't make a real pseudo-class match
 *
 * It is NOT a polyfill, and it is not wired into document.modelContext:
 * how declarative tools show up in getTools()/executeTool() is still TBD in
 * the explainer, so the shim exposes its own getTools()/executeTool().
 */

const TOOL_ATTRIBUTES = ['toolname', 'tooldescription', 'toolautosubmit'];
const OBSERVED_ATTRIBUTES = [
  ...TOOL_ATTRIBUTES,
  'toolparamdescription', 'name', 'type', 'required', 'disabled',
  'pattern', 'min', 'max', 'step', 'minlength', 'maxlength', 'value', 'label',
];

function domError(message, name) {
  return new DOMException(message, name);
}

function toolEvent(type, toolName) {
  const event = new Event(type);
  event.toolName = toolName;
  return event;
}

/**
 * Ignore DOM churn elsewhere on the page (logs, results, the inspector
 * itself) and inside a custom element's own rendering (its private UI,
 * not its form contract).
 */
function touchesAForm(record) {
  const el = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
  for (let up = el?.parentElement; up; up = up.parentElement) {
    if (up.localName.includes('-')) return false;
  }
  if (el?.closest('form')) return true;
  return [...record.addedNodes, ...record.removedNodes].some(
    (node) => node.nodeType === Node.ELEMENT_NODE && (node.localName === 'form' || node.querySelector('form')),
  );
}

function defaultSubmitButton(form) {
  return [...form.elements].find((el) => el.type === 'submit') ?? null;
}

/** Non-agent submissions get agentInvoked === false and a respondWith() that throws. */
function patchSubmitEventPrototype() {
  if ('agentInvoked' in SubmitEvent.prototype) return;
  Object.defineProperties(SubmitEvent.prototype, {
    agentInvoked: { get: () => false, configurable: true },
    respondWith: {
      value() {
        throw domError('respondWith() is only available on agent-invoked submissions.', 'InvalidStateError');
      },
      configurable: true,
      writable: true,
    },
  });
}

export class DeclarativeToolsShim extends EventTarget {
  #root;
  #observer;
  #pending = new Map(); // form -> in-flight invocation
  #scheduled = false;

  constructor(root = document) {
    super();
    this.#root = root;
    patchSubmitEventPrototype();

    // Capture runs before the page's own submit/reset handlers; the bubble
    // listener on window runs after them.
    root.addEventListener('submit', (e) => this.#beforeSubmit(e), true);
    window.addEventListener('submit', (e) => this.#afterSubmit(e));
    root.addEventListener('reset', (e) => this.#onReset(e), true);

    this.#observer = new MutationObserver((records) => {
      if (records.some(touchesAForm)) this.#scheduleRescan();
    });
    this.#observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: OBSERVED_ATTRIBUTES,
    });
  }

  /** The forms that currently declare a tool. */
  #forms() {
    return [...this.#root.querySelectorAll('form[toolname]')].filter((f) => f.getAttribute('toolname').trim());
  }

  #describe(form) {
    return {
      name: form.getAttribute('toolname').trim(),
      description: form.getAttribute('tooldescription') ?? '',
      autosubmit: form.hasAttribute('toolautosubmit'),
      inputSchema: synthesizeInputSchema(form),
      kind: 'declarative',
    };
  }

  async getTools() {
    return this.#forms().map((form) => this.#describe(form));
  }

  #scheduleRescan() {
    if (this.#scheduled) return;
    this.#scheduled = true;
    queueMicrotask(() => {
      this.#scheduled = false;
      // A changed tool declaration (or a removed form) cancels its in-flight call.
      for (const [form, inv] of this.#pending) {
        const gone = !form.isConnected || !form.hasAttribute('toolname');
        const changed =
          form.getAttribute('toolname') !== inv.declaration.name ||
          form.getAttribute('tooldescription') !== inv.declaration.description;
        if (gone || changed) {
          this.#settle(form, { error: domError('The tool declaration changed or its form was removed.', 'AbortError') });
        }
      }
      this.dispatchEvent(new Event('toolchange'));
    });
  }

  /**
   * Resolves with a JSON string, like the imperative executeTool() from
   * part 1. How a declarative tool's result reaches the agent is still
   * under debate (webmcp issue #135); this is the shim's choice.
   */
  async executeTool(name, input = {}, { signal } = {}) {
    const form = this.#forms().find((f) => f.getAttribute('toolname').trim() === name);
    if (!form) throw domError(`No declarative tool named "${name}".`, 'NotFoundError');
    if (this.#pending.has(form)) throw domError(`"${name}" is already running.`, 'InvalidStateError');
    signal?.throwIfAborted();

    const { inputSchema, autosubmit } = this.#describe(form);
    for (const key of Object.keys(input)) {
      if (!(key in inputSchema.properties)) throw new TypeError(`"${name}" has no parameter "${key}".`);
    }

    let resolve;
    let reject;
    const promise = new Promise((res, rej) => ((resolve = res), (reject = rej)));
    const inv = {
      name,
      resolve,
      reject,
      responded: false,
      declaration: { name: form.getAttribute('toolname'), description: form.getAttribute('tooldescription') },
    };
    this.#pending.set(form, inv);

    signal?.addEventListener(
      'abort',
      () => {
        if (this.#pending.get(form) !== inv) return;
        this.#settle(form, { error: domError('The agent canceled the tool call.', 'AbortError') });
        // The explainer calls it `toolcanceled`; the spec IDL defines
        // `ontoolcancel`. Until that's reconciled, fire both.
        this.dispatchEvent(toolEvent('toolcanceled', name));
        this.dispatchEvent(toolEvent('toolcancel', name));
      },
      { once: true },
    );

    try {
      this.#fill(form, input);
    } catch (err) {
      // Settle so a failed fill doesn't leave the tool stuck as "already running".
      this.#settle(form, { error: domError(`Could not fill the form: ${err?.message ?? err}`, 'OperationError') });
      return promise;
    }
    this.#setActive(form, true);
    this.dispatchEvent(toolEvent('toolactivated', name));

    if (autosubmit) {
      const invalid = [...form.elements].filter((el) => el.willValidate && !el.checkValidity());
      if (invalid.length) {
        const details = invalid.map((el) => `${el.name}: ${el.validationMessage}`).join('; ');
        this.#settle(form, { error: domError(`The form is invalid, nothing was submitted (${details}).`, 'OperationError') });
      } else {
        // :tool-form-active ends when the form is auto-submitted.
        this.#setActive(form, false);
        form.requestSubmit();
      }
    } else {
      // No toolautosubmit: the browser brings the submit button into focus and
      // the human reviews and submits. The agent just waits.
      defaultSubmitButton(form)?.focus();
    }

    return promise;
  }

  #fill(form, input) {
    for (const [key, value] of Object.entries(input)) {
      for (const el of [...form.elements].filter((c) => c.name === key)) {
        if (el.type === 'checkbox') el.checked = Boolean(value);
        else el.value = String(value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.classList.remove('agent-filled');
        void el.offsetWidth; // restart the highlight animation
        el.classList.add('agent-filled');
      }
    }
  }

  #setActive(form, active) {
    form.toggleAttribute('data-tool-form-active', active);
    defaultSubmitButton(form)?.toggleAttribute('data-tool-submit-active', active);
  }

  #settle(form, { value, error }) {
    const inv = this.#pending.get(form);
    if (!inv) return;
    this.#pending.delete(form);
    this.#setActive(form, false);
    if (error) inv.reject(error);
    else inv.resolve(value);
  }

  #beforeSubmit(event) {
    const form = event.target;
    const inv = this.#pending.get(form);
    if (!inv) return; // A plain human submission: agentInvoked stays false.

    // The explainer doesn't say whether a human clicking submit on an
    // agent-filled form (no toolautosubmit) counts as agentInvoked. The shim
    // treats it as completing the agent's call, so the agent gets a response.
    Object.defineProperty(event, 'agentInvoked', { value: true });
    Object.defineProperty(event, 'respondWith', {
      value: (agentResponse) => {
        if (event.eventPhase === Event.NONE) {
          // Shim assumption (as with FetchEvent): call it during dispatch.
          throw domError('respondWith() must be called while the submit event is dispatched.', 'InvalidStateError');
        }
        if (!event.defaultPrevented) {
          throw domError('Call preventDefault() before respondWith().', 'InvalidStateError');
        }
        if (inv.responded) throw domError('respondWith() was already called.', 'InvalidStateError');
        inv.responded = true;
        Promise.resolve(agentResponse).then(
          (value) => this.#settle(form, { value: JSON.stringify(value ?? null) }),
          (err) => this.#settle(form, { error: domError(`Tool rejected: ${err?.message ?? err}`, 'OperationError') }),
        );
      },
    });
  }

  #afterSubmit(event) {
    const form = event.target;
    const inv = this.#pending.get(form);
    if (!inv || inv.responded) return;

    if (event.defaultPrevented) {
      this.#settle(form, { value: JSON.stringify({ submitted: true, note: 'The page handled the submit without respondWith().' }) });
    } else {
      // A real navigation. What the agent gets back from the next page is
      // under debate (issue #135); the shim just reports where it went.
      const url = new URL(form.action);
      for (const [k, v] of new FormData(form)) url.searchParams.append(k, v);
      this.#settle(form, { value: JSON.stringify({ navigatedTo: url.href }) });
    }
  }

  #onReset(event) {
    // Reset cancels the in-flight call. The explainer only fires `toolcanceled`
    // when the *agent* cancels, so the shim fires no event here.
    this.#settle(event.target, { error: domError('The form was reset.', 'AbortError') });
  }
}
