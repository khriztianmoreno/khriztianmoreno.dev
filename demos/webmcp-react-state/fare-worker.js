/**
 * The fare-calculator store, living in a dedicated Web Worker.
 *
 * `modelContext` exists only on Document, so this worker can't register a
 * tool. Instead, the main thread registers `quote_fare` and proxies each
 * call here over postMessage. The worker owns the fare rules and its own
 * state; the main thread never sees them, only the quotes.
 *
 * Protocol: { id, type, payload } in, { id, ok, result | error } out.
 */

const state = {
  rulesVersion: '2026-10',
  taxRate: 0.16, // airport + fuel taxes, applied to the base fare
  bookingFeePerPassenger: 12,
  seatFee: { window: 35, aisle: 25, middle: 0 },
  latencyMs: 0, // the lab's "slow worker" switch sets this
  quotesServed: 0,
};

const round = (n) => Math.round(n * 100) / 100;

function seatKind(seat) {
  if (!seat) return null;
  const letter = seat.slice(-1);
  if (letter === 'A' || letter === 'F') return 'window';
  if (letter === 'C' || letter === 'D') return 'aisle';
  return 'middle';
}

function quote({ items, passengers, seat }) {
  if (!Array.isArray(items) || items.length === 0) throw new Error('The cart is empty: nothing to quote.');
  if (!Number.isInteger(passengers) || passengers < 1) throw new Error('passengers must be a positive integer.');

  const base = items.reduce((sum, f) => sum + f.price, 0) * passengers;
  const taxes = base * state.taxRate;
  const fees = state.bookingFeePerPassenger * passengers;
  const kind = seatKind(seat);
  const seatFee = kind ? state.seatFee[kind] : 0;

  state.quotesServed += 1;
  return {
    flights: items.map((f) => f.id),
    passengers,
    seat: seat ?? null,
    breakdown: { base: round(base), taxes: round(taxes), fees: round(fees), seat: seatFee },
    total: round(base + taxes + fees + seatFee),
    currency: 'USD',
    rulesVersion: state.rulesVersion,
    quoteNumber: state.quotesServed,
  };
}

const handlers = {
  quote,
  'set-latency': ({ ms }) => {
    state.latencyMs = Math.max(0, Number(ms) || 0);
    return { latencyMs: state.latencyMs };
  },
};

self.addEventListener('message', async ({ data }) => {
  const { id, type, payload } = data ?? {};
  try {
    const handler = handlers[type];
    if (!handler) throw new Error(`Unknown message type "${type}".`);
    if (type === 'quote' && state.latencyMs) await new Promise((r) => setTimeout(r, state.latencyMs));
    self.postMessage({ id, ok: true, result: handler(payload ?? {}) });
  } catch (err) {
    self.postMessage({ id, ok: false, error: err?.message ?? String(err) });
  }
});
