import { sleep } from './agent-console.js';

/**
 * A simulated "computer use" agent: it sees the page only as pixels/DOM and
 * acts only through clicks and keystrokes. There's no LLM here — the plan
 * below (the selectors, the "$" price format, the "Nonstop" label) stands in
 * for what a model would have inferred from screenshots of UI v1. Every
 * action costs a fresh snapshot sent to the model, which is where the steps
 * and the payload come from.
 */

const PLAN = {
  origin: '#origin',
  destination: '#destination',
  date: '#date',
  search: '#search-btn',
  card: '.flight-card',
  price: '.flight-price',
  stops: '.flight-stops',
  select: '.select-flight',
  passenger: '#passenger-name',
  confirm: '#confirm-booking',
  confirmation: '#booking-confirmation',
};

const DISMISS_PATTERN = /^(accept|accept all|agree|ok|got it)$/i;

class InterceptedClick extends Error {
  constructor(target, blocker) {
    super(`click on ${describe(target)} intercepted by ${describe(blocker)}`);
    this.blocker = blocker;
  }
}

// How a log would name an element: tag + id, or tag + its first (semantic) class.
function describe(el) {
  if (!el) return 'nothing';
  if (el.id) return `<${el.tagName.toLowerCase()}#${el.id}>`;
  return `<${el.tagName.toLowerCase()}${el.classList[0] ? `.${el.classList[0]}` : ''}>`;
}

export async function runActuationAgent({ root, goal, ui, snapshotSize }) {
  ui.reset();
  ui.status('running', 'running');
  ui.log('think', `Goal: ${goal.text}`);

  // One "screenshot" per step: the whole app's DOM goes to the model.
  const observe = (why) => ui.step('observe', `snapshot → model: ${why}`, snapshotSize());

  async function waitFor(selector, timeout = 1500) {
    const started = performance.now();
    while (performance.now() - started < timeout) {
      const el = root.querySelector(selector);
      if (el) return el;
      await sleep(100);
    }
    throw new Error(`selector ${selector} matched nothing after ${timeout / 1000}s`);
  }

  function highlight(el) {
    el.classList.add('agent-target');
    setTimeout(() => el.classList.remove('agent-target'), 600);
  }

  // A real click lands on whatever is on top at those coordinates.
  function physicalClick(el) {
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (!el.contains(hit)) throw new InterceptedClick(el, hit);
    highlight(el);
    el.focus?.();
    el.click();
  }

  // Overlays are the classic failure. Try the usual "find an Accept button" trick once.
  async function click(el, label) {
    try {
      physicalClick(el);
    } catch (err) {
      if (!(err instanceof InterceptedClick)) throw err;
      ui.log('warn', err.message);
      observe('unexpected overlay — re-plan');
      let dismiss;
      for (let scope = err.blocker; scope && !dismiss; scope = scope.parentElement) {
        dismiss = [...scope.querySelectorAll('button')].find((b) => DISMISS_PATTERN.test(b.textContent.trim()));
      }
      if (!dismiss) throw err;
      ui.step('act', `click ${describe(dismiss)} "${dismiss.textContent.trim()}" to dismiss overlay`);
      physicalClick(dismiss);
      await sleep(250);
      observe('overlay gone? retry');
      physicalClick(el);
    }
    ui.step('act', `click ${label}`);
  }

  async function type(selector, text) {
    const el = await waitFor(selector);
    await click(el, selector);
    if (el.type === 'date') {
      el.value = text; // date inputs reject partial values, so "type" it in one go
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      el.value = '';
      for (const ch of text) {
        el.value += ch;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(25);
      }
    }
    ui.step('act', `type "${text}" into ${selector}`);
  }

  try {
    observe('initial page state');
    await sleep(250);

    await type(PLAN.origin, goal.origin);
    await type(PLAN.destination, goal.destination);
    await type(PLAN.date, goal.date);

    await click(await waitFor(PLAN.search), PLAN.search);
    await sleep(300);
    observe('did results load?');

    await waitFor(PLAN.card);
    const cards = [...root.querySelectorAll(PLAN.card)].map((card) => ({
      card,
      price: Number(card.querySelector(PLAN.price)?.textContent.match(/[\d.]+/)?.[0]),
      nonstop: card.querySelector(PLAN.stops)?.textContent.trim() === 'Nonstop',
      label: card.querySelector('p')?.textContent.trim(),
    }));
    ui.step('think', `parsed ${cards.length} cards from rendered text — reading prices like "$689"`);

    const pick = cards.filter((c) => c.nonstop && Number.isFinite(c.price)).sort((a, b) => a.price - b.price)[0];
    if (!pick) throw new Error('could not find a nonstop price in the rendered text');
    ui.log('think', `cheapest nonstop: ${pick.label} at $${pick.price}`);

    await click(pick.card.querySelector(PLAN.select), `${PLAN.select} on ${pick.label}`);
    await sleep(250);
    observe('is the flight selected?');

    await type(PLAN.passenger, goal.passenger);
    await click(await waitFor(PLAN.confirm), PLAN.confirm);
    await sleep(300);

    observe('did the booking go through?');
    const confirmation = (await waitFor(PLAN.confirmation)).textContent.trim();
    if (!confirmation) throw new Error(`${PLAN.confirmation} is empty — no visible confirmation`);

    ui.log('ok', `scraped confirmation text: "${confirmation.replace(/\s+/g, ' ')}"`);
    ui.status('done', 'done');
  } catch (err) {
    ui.log('fail', err.message);
    ui.log('think', 'A real agent would now take another screenshot and re-plan: more steps, more tokens, and no guarantee it lands on the same answer twice.');
    ui.status('failed', 'broke');
  }
}
