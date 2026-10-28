/**
 * The React app: flight results, the trip cart, a seat map you can mount
 * and unmount, and a fare quote computed in a Web Worker. No build step:
 * `htm` gives us JSX-like templates on top of React.createElement.
 */
import { createElement, useEffect, useState } from 'react';
import htm from 'htm';
import { useTripStore, cartItems, cartSubtotal } from './store.js';
import { useWebMCPTool } from './use-webmcp-tool.js';
import { fareClient } from './fare-client.js';
import { metrics } from './lab-metrics.js';

const html = htm.bind(createElement);

const usd = (n) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const card = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900';
const smallBtn =
  'rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800';

export function App({ useCartTools }) {
  return html`
    <div className="flex flex-col gap-4">
      <${FlightResults} />
      <${TripCart} useCartTools=${useCartTools} />
      <${SeatMapPanel} />
      <${FareQuote} />
    </div>
  `;
}

function FlightResults() {
  const trip = useTripStore((s) => s.trip);
  const results = useTripStore((s) => s.results);
  const cart = useTripStore((s) => s.cart);
  const addToCart = useTripStore((s) => s.addToCart);

  return html`
    <section className=${card} aria-labelledby="results-title">
      <h3 id="results-title" className="text-sm font-semibold">
        ${trip.origin} → ${trip.destination} · ${trip.date}
        <span className="font-normal text-slate-500"> · ${results.length} results</span>
      </h3>
      <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
        ${results.map(
          (f) => html`
            <li key=${f.id} className="flex items-center justify-between gap-3 py-2 text-sm" data-flight=${f.id}>
              <div className="min-w-0">
                <p className="font-medium">${f.airline} <span className="font-mono text-xs text-slate-500">${f.id}</span></p>
                <p className="text-xs text-slate-500">
                  ${f.departs} → ${f.arrives} · ${f.stops === 0 ? 'nonstop' : `${f.stops} stop`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-mono text-sm font-semibold">${usd(f.price)}</span>
                <button className=${smallBtn} disabled=${cart.includes(f.id)} onClick=${() => addToCart(f.id)}>
                  ${cart.includes(f.id) ? 'In cart' : 'Add'}
                </button>
              </div>
            </li>
          `,
        )}
      </ul>
    </section>
  `;
}

/** Owns the four cart tools. Re-renders on every cart or passenger change. */
function TripCart({ useCartTools }) {
  const trip = useTripStore((s) => s.trip);
  const results = useTripStore((s) => s.results);
  const cart = useTripStore((s) => s.cart);
  const seat = useTripStore((s) => s.seat);
  const removeFromCart = useTripStore((s) => s.removeFromCart);
  const setPassengers = useTripStore((s) => s.setPassengers);

  // Naive and stale modes build tools from these render values; the contract mode ignores them.
  useCartTools({ trip, results, cart, seat });

  // Count commits, not render calls (StrictMode calls render twice). StrictMode's
  // dev double-mount does run this effect twice on mount, so expect +1 there.
  useEffect(() => metrics.bump('renders'));

  const state = { trip, results, cart, seat };
  const items = cartItems(state);

  return html`
    <section id="trip-cart" className=${card} aria-labelledby="cart-title">
      <div className="flex items-center justify-between gap-3">
        <h3 id="cart-title" className="text-sm font-semibold">Trip cart <span className="font-normal text-slate-500">· ${items.length} ${items.length === 1 ? 'flight' : 'flights'}</span></h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Passengers</span>
          <button className=${smallBtn} aria-label="Fewer passengers" disabled=${trip.passengers <= 1} onClick=${() => setPassengers(trip.passengers - 1)}>−</button>
          <span className="w-4 text-center font-mono font-semibold" data-passengers>${trip.passengers}</span>
          <button className=${smallBtn} aria-label="More passengers" disabled=${trip.passengers >= 6} onClick=${() => setPassengers(trip.passengers + 1)}>+</button>
        </div>
      </div>
      ${items.length === 0
        ? html`<p className="mt-3 text-sm text-slate-500">Empty. Add a flight, or let the agent do it.</p>`
        : html`
            <ul className="mt-3 flex flex-col gap-2">
              ${items.map(
                (f) => html`
                  <li key=${f.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60" data-cart-item=${f.id}>
                    <span className="min-w-0 truncate"><span className="font-mono text-xs">${f.id}</span> ${f.airline}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="font-mono text-xs">${usd(f.price)} × ${trip.passengers}</span>
                      <button className=${smallBtn} onClick=${() => removeFromCart(f.id)}>Remove</button>
                    </span>
                  </li>
                `,
              )}
            </ul>
          `}
      <p className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
        <span className="text-slate-500">Subtotal${seat ? ` · seat ${seat}` : ''}</span>
        <span className="font-mono font-semibold" data-subtotal>${usd(cartSubtotal(state))}</span>
      </p>
    </section>
  `;
}

function SeatMapPanel() {
  const [open, setOpen] = useState(false);
  return html`
    <section className=${card} aria-labelledby="seat-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 id="seat-title" className="text-sm font-semibold">Seat map</h3>
          <p className="text-xs text-slate-500">Owns <code>select_seat</code>. Mounted = registered; unmounted = aborted.</p>
        </div>
        <button id="toggle-seat-map" className=${smallBtn} aria-expanded=${open} onClick=${() => setOpen((v) => !v)}>
          ${open ? 'Close seat map' : 'Open seat map'}
        </button>
      </div>
      ${open && html`<${SeatMap} />`}
    </section>
  `;
}

const ROWS = [10, 11, 12, 13, 14];
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const AVAILABILITY = [
  ['10B', '11E', '12A', '12C', '13D', '14F'],
  ['10A', '11C', '12F', '13B', '14D', '14E'],
];

function SeatMap() {
  const seat = useTripStore((s) => s.seat);
  const selectSeat = useTripStore((s) => s.selectSeat);
  // Component-local state the tool depends on. The contract hook's ref
  // makes `execute` see the latest value without re-registering.
  const [snapshot, setSnapshot] = useState(0);
  const occupied = AVAILABILITY[snapshot % AVAILABILITY.length];

  useWebMCPTool({
    name: 'select_seat',
    title: 'Select seat',
    description: 'Pick a seat on the open seat map (rows 10-14, letters A-F). Fails if the seat is occupied.',
    inputSchema: {
      type: 'object',
      properties: { seat: { type: 'string', pattern: '^1[0-4][A-F]$', description: 'Row + letter, e.g. "12A".' } },
      required: ['seat'],
    },
    execute: async ({ seat: wanted }) => {
      if (occupied.includes(wanted)) throw new Error(`Seat ${wanted} is occupied. Occupied right now: ${occupied.join(', ')}.`);
      selectSeat(wanted);
      return { seat: wanted, occupied };
    },
  });

  return html`
    <div className="mt-3" data-seat-map>
      <div className="grid grid-cols-6 gap-1.5 sm:max-w-xs">
        ${ROWS.flatMap((row) =>
          LETTERS.map((letter) => {
            const id = `${row}${letter}`;
            const taken = occupied.includes(id);
            const selected = seat === id;
            return html`<button
              key=${id}
              className=${`seat ${selected ? 'seat-selected' : ''}`}
              disabled=${taken}
              aria-pressed=${selected}
              aria-label=${`Seat ${id}${taken ? ', occupied' : ''}`}
              onClick=${() => selectSeat(id)}
            >${id}</button>`;
          }),
        )}
      </div>
      <button className=${`${smallBtn} mt-3`} onClick=${() => setSnapshot((n) => n + 1)}>Refresh availability</button>
    </div>
  `;
}

function quoteCart(signal) {
  const state = useTripStore.getState();
  return fareClient.request(
    'quote',
    { items: cartItems(state), passengers: state.trip.passengers, seat: state.seat },
    { signal },
  );
}

const quoteFareTool = {
  name: 'quote_fare',
  title: 'Quote fare',
  description:
    'Quote the total fare for the flights in the trip cart: base fare, taxes, fees and seat fee, in USD. Computed by the fare calculator; fails if the cart is empty.',
  annotations: { readOnlyHint: true },
  execute: async (_input, { signal } = {}) => quoteCart(signal),
};

function FareQuote() {
  const [result, setResult] = useState(null);
  const [slow, setSlow] = useState(false);
  const [busy, setBusy] = useState(false);

  useWebMCPTool(quoteFareTool);

  // The worker outlives this component: reset its latency so it matches the unchecked box after a remount.
  useEffect(() => {
    fareClient.request('set-latency', { ms: 0 }).catch(() => {});
  }, []);

  async function onQuote() {
    setBusy(true);
    try {
      setResult({ ok: true, value: await quoteCart() });
    } catch (err) {
      setResult({ ok: false, value: `${err.name}: ${err.message}` });
    } finally {
      setBusy(false);
    }
  }

  async function onSlow(event) {
    const checked = event.target.checked;
    setSlow(checked);
    await fareClient.request('set-latency', { ms: checked ? 3000 : 0 }).catch(() => {});
  }

  return html`
    <section className=${card} aria-labelledby="fare-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="fare-title" className="text-sm font-semibold">Fare quote <span className="font-normal text-slate-500">· Web Worker</span></h3>
          <p className="text-xs text-slate-500">The fare store lives in a Worker; <code>quote_fare</code> proxies to it (timeout 1.5 s).</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs">
            <input id="slow-worker" type="checkbox" checked=${slow} onChange=${onSlow} /> Slow worker (3 s)
          </label>
          <button id="quote-btn" className=${smallBtn} disabled=${busy} onClick=${onQuote}>${busy ? 'Quoting…' : 'Quote cart'}</button>
        </div>
      </div>
      ${result &&
      html`<pre
        data-quote
        className=${`mt-3 overflow-x-auto rounded-lg p-3 font-mono text-xs ${result.ok ? 'bg-slate-50 dark:bg-slate-800/60' : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'}`}
      >${result.ok ? JSON.stringify(result.value, null, 2) : result.value}</pre>`}
    </section>
  `;
}
