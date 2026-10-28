/**
 * The trip cart's client state, in a Zustand store. The UI subscribes to it
 * with selectors; the WebMCP tools read it with `useTripStore.getState()` at
 * call time. Same store, same actions, two entry points.
 */
import { create } from 'zustand';

export const FLIGHTS = [
  { id: 'AV-010', airline: 'Avianca', departs: '18:05', arrives: '11:10+1', stops: 0, price: 742 },
  { id: 'IB-6584', airline: 'Iberia', departs: '16:40', arrives: '09:55+1', stops: 0, price: 689 },
  { id: 'AA-920', airline: 'American', departs: '07:15', arrives: '07:30+1', stops: 1, price: 541 },
  { id: 'UX-196', airline: 'Air Europa', departs: '21:30', arrives: '14:20+1', stops: 0, price: 701 },
];

const initialState = () => ({
  trip: { origin: 'BOG', destination: 'MAD', date: '2026-11-20', passengers: 1 },
  results: FLIGHTS,
  cart: [], // flight ids, in the order they were added
  seat: null,
});

export const useTripStore = create((set, get) => ({
  ...initialState(),

  addToCart(flightId) {
    const flight = get().results.find((f) => f.id === flightId);
    if (!flight) throw new Error(`Unknown flight "${flightId}". Valid ids: ${get().results.map((f) => f.id).join(', ')}.`);
    if (get().cart.includes(flightId)) return flight;
    set((s) => ({ cart: [...s.cart, flightId] }));
    return flight;
  },

  removeFromCart(flightId) {
    if (!get().cart.includes(flightId)) throw new Error(`Flight "${flightId}" is not in the cart.`);
    set((s) => ({ cart: s.cart.filter((id) => id !== flightId) }));
  },

  setPassengers(passengers) {
    set((s) => ({ trip: { ...s.trip, passengers: Math.min(6, Math.max(1, passengers)) } }));
  },

  selectSeat(seat) {
    set({ seat });
  },

  reset() {
    set(initialState());
  },
}));

/** Plain-data views shared by the UI and the tools. */
export function cartItems(state) {
  return state.cart.map((id) => state.results.find((f) => f.id === id));
}

export function cartSubtotal(state) {
  return cartItems(state).reduce((sum, f) => sum + f.price, 0) * state.trip.passengers;
}
