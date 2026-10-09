import { subscribe, getState, searchFlights, selectFlight, bookFlight } from './store.js';

/**
 * The flight-booking UI. It has two "skins": v1 (what the actuation agent
 * was built against) and v2 (a perfectly ordinary redesign: renamed ids and
 * classes, new button copy, and a cookie banner). Behavior is identical —
 * only the markup changes, which is exactly what breaks selector-driven agents.
 */
const SKINS = {
  v1: {
    brand: 'SkyFare',
    ids: { origin: 'origin', destination: 'destination', date: 'date', search: 'search-btn', passenger: 'passenger-name', confirm: 'confirm-booking', confirmation: 'booking-confirmation' },
    classes: { card: 'flight-card', price: 'flight-price', stops: 'flight-stops', select: 'select-flight' },
    labels: { search: 'Search flights', select: 'Select', confirm: 'Confirm booking' },
    formatPrice: (p) => `$${p}`,
    cookieBanner: false,
  },
  v2: {
    brand: 'SkyFare 2.0',
    // Search fields happen to survive the redesign; everything after them doesn't.
    ids: { origin: 'origin', destination: 'destination', date: 'date', search: 'find-trips', passenger: 'traveler', confirm: 'pay-now', confirmation: 'trip-summary' },
    classes: { card: 'trip-option', price: 'fare-amount', stops: 'leg-info', select: 'choose-trip' },
    labels: { search: 'Find trips', select: 'Choose', confirm: 'Book now' },
    formatPrice: (p) => `USD ${p}.00`,
    cookieBanner: true,
  },
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const stopsLabel = (n) => (n === 0 ? 'Nonstop' : `${n} stop${n > 1 ? 's' : ''}`);

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950';

let root;
let skin = SKINS.v1;

export function mountApp(el) {
  root = el;
  render();
  subscribe(renderDynamic);
}

export function setSkin(name) {
  skin = SKINS[name];
  render();
}

function render() {
  const { ids, labels } = skin;
  const v2 = skin === SKINS.v2;

  root.innerHTML = `
    <div class="mb-4 flex items-center justify-between">
      <span class="text-lg font-semibold tracking-tight">${skin.brand}</span>
      <span class="rounded-full px-2 py-0.5 text-xs font-medium ${v2 ? 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}">
        UI ${v2 ? 'v2 (redesign)' : 'v1'}
      </span>
    </div>

    <form class="grid grid-cols-2 gap-3 sm:grid-cols-4" novalidate>
      <label class="text-xs font-medium text-slate-500">From
        <input id="${ids.origin}" class="${inputClass} mt-1 uppercase" placeholder="BOG" autocomplete="off" />
      </label>
      <label class="text-xs font-medium text-slate-500">To
        <input id="${ids.destination}" class="${inputClass} mt-1 uppercase" placeholder="MAD" autocomplete="off" />
      </label>
      <label class="col-span-2 text-xs font-medium text-slate-500 sm:col-span-1">Date
        <input id="${ids.date}" type="date" class="${inputClass} mt-1" value="2026-11-20" />
      </label>
      <button id="${ids.search}" class="col-span-2 self-end rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 sm:col-span-1">
        ${labels.search}
      </button>
    </form>

    <ul data-results class="mt-4 space-y-2"></ul>

    <div class="mt-4 flex flex-col gap-2 sm:flex-row">
      <input id="${ids.passenger}" class="${inputClass}" placeholder="Passenger full name" autocomplete="off" />
      <button id="${ids.confirm}" class="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40">
        ${labels.confirm}
      </button>
    </div>

    <p data-error class="mt-2 text-sm text-rose-600 dark:text-rose-400" hidden></p>
    <div id="${ids.confirmation}" class="mt-4" aria-live="polite"></div>

    ${skin.cookieBanner ? cookieBannerHtml() : ''}
  `;

  root.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    searchFlights({
      origin: root.querySelector(`#${ids.origin}`).value,
      destination: root.querySelector(`#${ids.destination}`).value,
      date: root.querySelector(`#${ids.date}`).value,
    });
  });

  root.querySelector(`#${ids.confirm}`).addEventListener('click', () => {
    const { selectedId } = getState();
    try {
      bookFlight({ flightId: selectedId, passenger: root.querySelector(`#${ids.passenger}`).value });
    } catch (err) {
      showError(err.message);
    }
  });

  root.querySelector('[data-cookie-accept]')?.addEventListener('click', () => root.querySelector('[data-cookie]').remove());

  renderDynamic(getState());
}

function cookieBannerHtml() {
  return `
    <div data-cookie class="cookie-backdrop absolute inset-0 z-10 flex items-end rounded-2xl bg-slate-900/40 p-3 backdrop-blur-[2px]">
      <div class="cookie-banner w-full rounded-xl bg-white p-4 shadow-xl dark:bg-slate-800">
        <p class="text-sm font-semibold">We value your privacy</p>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">We use cookies to personalise fares. Shipped in the same release as the redesign.</p>
        <div class="mt-3 flex gap-2">
          <button data-cookie-accept class="cookie-accept rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">Accept all</button>
          <button class="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Manage</button>
        </div>
      </div>
    </div>`;
}

function showError(message) {
  const el = root.querySelector('[data-error]');
  el.textContent = message;
  el.hidden = !message;
}

function renderDynamic(state) {
  if (!root) return;
  const { ids, classes, labels } = skin;

  const list = root.querySelector('[data-results]');
  list.innerHTML = state.results
    .map((f) => {
      const selected = f.id === state.selectedId;
      return `
        <li class="${classes.card} flex items-center justify-between gap-3 rounded-xl border p-3 transition ${selected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' : 'border-slate-200 dark:border-slate-800'}" data-id="${esc(f.id)}">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">${esc(f.airline)} <span class="text-slate-400">${esc(f.id)}</span></p>
            <p class="text-xs text-slate-500">${esc(f.departs)} → ${esc(f.arrives)} · <span class="${classes.stops}">${stopsLabel(f.stops)}</span></p>
          </div>
          <div class="flex items-center gap-3">
            <span class="${classes.price} font-mono text-sm font-semibold">${skin.formatPrice(f.price)}</span>
            <button type="button" class="${classes.select} rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
              ${selected ? '✓' : labels.select}
            </button>
          </div>
        </li>`;
    })
    .join('');

  if (state.query && state.results.length === 0) {
    list.innerHTML = `<li class="text-sm text-slate-500">No flights for ${esc(state.query.origin)} → ${esc(state.query.destination)}.</li>`;
  }

  list.querySelectorAll(`.${classes.select}`).forEach((btn) =>
    btn.addEventListener('click', () => selectFlight(btn.closest('[data-id]').dataset.id)),
  );

  root.querySelector(`#${ids.confirm}`).disabled = !state.selectedId;
  showError('');

  const conf = root.querySelector(`#${ids.confirmation}`);
  const b = state.booking;
  conf.innerHTML = b
    ? `<div class="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm dark:border-emerald-800 dark:bg-emerald-950/40">
         <p class="font-semibold text-emerald-800 dark:text-emerald-300">Booked · <span class="font-mono">${esc(b.confirmation)}</span></p>
         <p class="mt-1 text-emerald-900/80 dark:text-emerald-200/80">${esc(b.passenger)} — ${esc(b.flight.airline)} ${esc(b.flight.id)}, ${esc(b.flight.origin)} → ${esc(b.flight.destination)}, $${b.flight.price}</p>
       </div>`
    : '';
}

/** Exposed for the actuation agent's "screenshot": the DOM it would send to a model. */
export function snapshotSize() {
  return root.outerHTML.length;
}
