import { searchFlights, bookFlight, resetStore } from './store.js';

/**
 * Progressive enhancement for the two forms in index.html. The forms already
 * work without this file (they GET submitted.html). With JavaScript, the
 * same submit event is handled in-page, for humans and agents alike. The
 * only agent-specific part is answering through respondWith().
 */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const stopsLabel = (n) => (n === 0 ? 'Nonstop' : `${n} stop${n > 1 ? 's' : ''}`);

export function enhanceForms({ searchForm, bookForm, resultsEl, confirmationEl }) {
  searchForm.addEventListener('submit', (event) => {
    // Enhanced path: answer in-page instead of navigating to the GET action.
    event.preventDefault();
    const flights = searchFlights(Object.fromEntries(new FormData(searchForm)));
    renderResults(resultsEl, flights, bookForm);

    if (event.agentInvoked) {
      // The agent gets structured data back; the page never navigates.
      event.respondWith(Promise.resolve({ flights }));
    }
  });

  bookForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(bookForm);
    let result;
    try {
      const booking = bookFlight({
        flight: data.get('flight'),
        passenger: data.get('passenger'),
        email: data.get('email'),
        bags: data.get('bags'),
        insurance: data.has('insurance'),
      });
      result = { ok: true, booking };
      renderBooking(confirmationEl, booking);
    } catch (err) {
      result = { ok: false, error: err.message };
      renderError(confirmationEl, err.message);
    }

    if (event.agentInvoked) event.respondWith(Promise.resolve(result));
  });

  return {
    reset() {
      resetStore();
      searchForm.reset();
      bookForm.reset();
      resultsEl.replaceChildren();
      confirmationEl.replaceChildren();
    },
  };
}

function renderResults(list, flights, bookForm) {
  if (flights.length === 0) {
    list.innerHTML = '<li class="text-sm text-slate-500">No flights for that route.</li>';
    return;
  }

  list.innerHTML = flights
    .map(
      (f) => `
        <li class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800" data-id="${esc(f.id)}">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">${esc(f.airline)} <span class="text-slate-400">${esc(f.id)}</span></p>
            <p class="text-xs text-slate-500">${esc(f.departs)} → ${esc(f.arrives)} · ${stopsLabel(f.stops)}</p>
          </div>
          <div class="flex shrink-0 items-center gap-3">
            <span class="font-mono text-sm font-semibold">$${f.price}</span>
            <button type="button" data-pick class="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">Pick</button>
          </div>
        </li>`,
    )
    .join('');

  list.querySelectorAll('[data-pick]').forEach((btn) =>
    btn.addEventListener('click', () => {
      bookForm.elements.flight.value = btn.closest('[data-id]').dataset.id;
      bookForm.elements.passenger.focus();
    }),
  );
}

function renderBooking(el, b) {
  el.innerHTML = `
    <div class="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm dark:border-emerald-800 dark:bg-emerald-950/40">
      <p class="font-semibold text-emerald-800 dark:text-emerald-300">Booked · <span class="font-mono">${esc(b.confirmation)}</span></p>
      <p class="mt-1 text-emerald-900/80 dark:text-emerald-200/80">${esc(b.passenger)} (${esc(b.email)}) — ${esc(b.flight.airline)} ${esc(b.flight.id)}, ${esc(b.flight.origin)} → ${esc(b.flight.destination)}, ${b.bags} bag(s)${b.insurance ? ', insured' : ''}</p>
    </div>`;
}

function renderError(el, message) {
  el.innerHTML = `<p class="text-sm text-rose-600 dark:text-rose-400">${esc(message)}</p>`;
}
