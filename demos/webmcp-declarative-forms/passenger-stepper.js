/**
 * <passenger-stepper>: a form-associated custom element. Because it sets
 * `static formAssociated = true` and uses ElementInternals, HTML treats it
 * as a form-associated element, so it shows up in form.elements, submits a
 * value, and takes part in constraint validation and form reset, which also
 * means the declarative API can see it.
 *
 * Progressive enhancement: the markup ships a plain <input type="number">
 * inside the element. Without JavaScript the element never upgrades and that
 * input is what the form submits. On upgrade, the element copies the input's
 * attributes and replaces it with the stepper UI.
 */

const BUTTON_CLASS =
  'grid h-9 w-9 place-items-center rounded-lg border border-slate-300 text-base font-semibold hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800';

class PassengerStepper extends HTMLElement {
  static formAssociated = true;

  #internals = this.attachInternals();
  #value = 1;
  #defaultValue = 1;
  #min = 1;
  #max = 9;
  #output;
  #dec;
  #inc;

  connectedCallback() {
    if (this.#output) return;

    const fallback = this.querySelector('input');
    if (fallback) {
      // Take over the fallback input's contract, then remove it so only one
      // control named "passengers" is submitted.
      for (const name of ['name', 'min', 'max', 'toolparamdescription']) {
        if (fallback.hasAttribute(name) && !this.hasAttribute(name)) this.setAttribute(name, fallback.getAttribute(name));
      }
      this.#defaultValue = Number(fallback.defaultValue) || 1;
      fallback.remove();
    }
    this.#min = Number(this.getAttribute('min') ?? 1);
    this.#max = Number(this.getAttribute('max') ?? 9);

    this.classList.add('inline-flex', 'items-center', 'gap-2');
    this.innerHTML = `
      <button type="button" data-dec class="${BUTTON_CLASS}" aria-label="Fewer passengers">−</button>
      <output class="w-6 text-center font-mono text-sm font-semibold" aria-live="polite"></output>
      <button type="button" data-inc class="${BUTTON_CLASS}" aria-label="More passengers">+</button>`;
    this.#output = this.querySelector('output');
    this.#dec = this.querySelector('[data-dec]');
    this.#inc = this.querySelector('[data-inc]');
    this.#dec.addEventListener('click', () => this.#set(this.#value - 1, true));
    this.#inc.addEventListener('click', () => this.#set(this.#value + 1, true));

    this.#set(this.#defaultValue);
  }

  get name() {
    return this.getAttribute('name');
  }

  get form() {
    return this.#internals.form;
  }

  get type() {
    return this.localName;
  }

  get value() {
    return String(this.#value);
  }

  /** The declarative shim fills form controls through `.value`. */
  set value(v) {
    this.#set(Number.parseInt(v, 10));
  }

  get willValidate() {
    return this.#internals.willValidate;
  }

  get validationMessage() {
    return this.#internals.validationMessage;
  }

  checkValidity() {
    return this.#internals.checkValidity();
  }

  #set(next, fromUser = false) {
    const value = Number.isFinite(next) ? next : this.#min;
    this.#value = value;
    this.#internals.setFormValue(String(value));

    if (value < this.#min) {
      this.#internals.setValidity({ rangeUnderflow: true }, `At least ${this.#min} passenger(s).`, this.#dec);
    } else if (value > this.#max) {
      this.#internals.setValidity({ rangeOverflow: true }, `At most ${this.#max} passengers.`, this.#inc);
    } else {
      this.#internals.setValidity({});
    }

    if (this.#output) {
      this.#output.textContent = String(value);
      this.#dec.disabled = value <= this.#min;
      this.#inc.disabled = value >= this.#max;
    }
    if (fromUser) this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  formResetCallback() {
    this.#set(this.#defaultValue);
  }

  formStateRestoreCallback(state) {
    this.#set(Number.parseInt(state, 10));
  }
}

export function definePassengerStepper() {
  if (!customElements.get('passenger-stepper')) customElements.define('passenger-stepper', PassengerStepper);
}
