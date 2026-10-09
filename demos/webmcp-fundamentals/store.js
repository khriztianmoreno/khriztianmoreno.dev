/**
 * The app's single source of truth. Both the UI (app.js) and the WebMCP
 * tools (tools.js) call these same functions — that's the whole point:
 * a tool is not a second implementation of the feature, it's another
 * entry point into the one you already have.
 */

const FLIGHTS = [
  { id: 'AV-010', airline: 'Avianca', origin: 'BOG', destination: 'MAD', departs: '18:05', arrives: '11:10+1', stops: 0, price: 742 },
  { id: 'IB-6584', airline: 'Iberia', origin: 'BOG', destination: 'MAD', departs: '16:40', arrives: '09:55+1', stops: 0, price: 689 },
  { id: 'AA-920', airline: 'American', origin: 'BOG', destination: 'MAD', departs: '07:15', arrives: '07:30+1', stops: 1, price: 541 },
  { id: 'UX-196', airline: 'Air Europa', origin: 'BOG', destination: 'MAD', departs: '21:30', arrives: '14:20+1', stops: 0, price: 701 },
  { id: 'AV-024', airline: 'Avianca', origin: 'MDE', destination: 'MAD', departs: '19:45', arrives: '12:35+1', stops: 0, price: 768 },
  { id: 'CM-201', airline: 'Copa', origin: 'BOG', destination: 'MIA', departs: '10:20', arrives: '15:05', stops: 1, price: 312 },
  { id: 'AV-044', airline: 'Avianca', origin: 'BOG', destination: 'MIA', departs: '13:10', arrives: '17:40', stops: 0, price: 389 },
];

const state = {
  query: null, // { origin, destination, date } of the last search
  results: [],
  selectedId: null,
  booking: null,
};

const listeners = new Set();

function emit() {
  for (const fn of listeners) fn(getState());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return structuredClone(state);
}

export function searchFlights({ origin, destination, date }) {
  const from = String(origin ?? '').trim().toUpperCase();
  const to = String(destination ?? '').trim().toUpperCase();

  state.query = { origin: from, destination: to, date: date || null };
  state.results = FLIGHTS.filter((f) => f.origin === from && f.destination === to).map((f) => ({ ...f, date: date || null }));
  state.selectedId = null;
  emit();

  return structuredClone(state.results);
}

export function selectFlight(flightId) {
  if (!state.results.some((f) => f.id === flightId)) {
    throw new Error(`Flight ${flightId} is not in the current results — search first.`);
  }
  state.selectedId = flightId;
  emit();
}

export function bookFlight({ flightId, passenger }) {
  const flight = state.results.find((f) => f.id === flightId);
  const name = String(passenger ?? '').trim();

  if (!flight) throw new Error(`Flight ${flightId} is not in the current results — search first.`);
  if (name.length < 2) throw new Error('Passenger name is required.');

  state.selectedId = flightId;
  state.booking = {
    confirmation: `WMCP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    passenger: name,
    flight: structuredClone(flight),
    bookedAt: new Date().toISOString(),
  };
  emit();

  return structuredClone(state.booking);
}

export function getBooking() {
  return state.booking ? structuredClone(state.booking) : null;
}

export function resetStore() {
  state.query = null;
  state.results = [];
  state.selectedId = null;
  state.booking = null;
  emit();
}
