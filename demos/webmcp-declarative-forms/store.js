/**
 * The app's single source of truth, same idea as part 1. The enhanced submit
 * handlers in app.js call these functions for humans and agents alike.
 */

export const FLIGHTS = [
  { id: 'AV-010', airline: 'Avianca', origin: 'BOG', destination: 'MAD', departs: '18:05', arrives: '11:10+1', stops: 0, price: 742 },
  { id: 'IB-6584', airline: 'Iberia', origin: 'BOG', destination: 'MAD', departs: '16:40', arrives: '09:55+1', stops: 0, price: 689 },
  { id: 'AA-920', airline: 'American', origin: 'BOG', destination: 'MAD', departs: '07:15', arrives: '07:30+1', stops: 1, price: 541 },
  { id: 'UX-196', airline: 'Air Europa', origin: 'BOG', destination: 'MAD', departs: '21:30', arrives: '14:20+1', stops: 0, price: 701 },
  { id: 'AV-024', airline: 'Avianca', origin: 'MDE', destination: 'MAD', departs: '19:45', arrives: '12:35+1', stops: 0, price: 768 },
  { id: 'CM-201', airline: 'Copa', origin: 'BOG', destination: 'MIA', departs: '10:20', arrives: '15:05', stops: 1, price: 312 },
  { id: 'AV-044', airline: 'Avianca', origin: 'BOG', destination: 'MIA', departs: '13:10', arrives: '17:40', stops: 0, price: 389 },
];

const CABIN_MULTIPLIER = { economy: 1, premium: 1.6, business: 3.2 };

const state = {
  query: null,
  results: [],
  booking: null,
};

export function searchFlights({ origin, destination, date, cabin = 'economy', passengers = 1 }) {
  const from = String(origin ?? '').trim().toUpperCase();
  const to = String(destination ?? '').trim().toUpperCase();
  const count = Math.max(1, Number.parseInt(passengers, 10) || 1);
  const multiplier = CABIN_MULTIPLIER[cabin] ?? 1;

  state.query = { origin: from, destination: to, date: date || null, cabin, passengers: count };
  state.results = FLIGHTS.filter((f) => f.origin === from && f.destination === to).map((f) => {
    const price = Math.round(f.price * multiplier);
    return { ...f, date: date || null, cabin, price, total: price * count };
  });

  return structuredClone(state.results);
}

export function bookFlight({ flight: flightId, passenger, email, bags = 0, insurance = false }) {
  const flight = FLIGHTS.find((f) => f.id === flightId);
  const name = String(passenger ?? '').trim();
  const mail = String(email ?? '').trim();

  if (!flight) throw new Error(`Unknown flight "${flightId}".`);
  if (name.length < 2) throw new Error('Passenger name is required.');
  if (!mail.includes('@')) throw new Error('A contact email is required.');

  state.booking = {
    confirmation: `WMCP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    flight: structuredClone(flight),
    passenger: name,
    email: mail,
    bags: Number(bags) || 0,
    insurance: Boolean(insurance),
    bookedAt: new Date().toISOString(),
  };

  return structuredClone(state.booking);
}

export function resetStore() {
  state.query = null;
  state.results = [];
  state.booking = null;
}
