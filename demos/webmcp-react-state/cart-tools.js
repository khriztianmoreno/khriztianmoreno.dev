/**
 * The four tools owned by <TripCart>. The contracts (name, description,
 * schema, annotations) are module-level constants: they don't depend on
 * state, so they never change while the component is mounted.
 *
 * Three hooks wire them up, one per lab mode. The mode is fixed for the
 * lifetime of a React root, so calling a different one per mode is safe.
 */
import { useTripStore, cartItems, cartSubtotal } from './store.js';
import { useWebMCPTool, useNaiveWebMCPTool, useStaleWebMCPTool } from './use-webmcp-tool.js';

const flightIdSchema = {
  type: 'object',
  properties: {
    flightId: { type: 'string', description: 'Flight id from get_trip_state, e.g. "IB-6584".' },
  },
  required: ['flightId'],
};

export const CART_CONTRACTS = {
  getCartItems: {
    name: 'get_cart_items',
    title: 'Get cart items',
    description:
      'Return the flights currently in the trip cart, the passenger count and the subtotal in USD. Reflects what the user sees right now.',
    annotations: { readOnlyHint: true },
  },
  getTripState: {
    name: 'get_trip_state',
    title: 'Get trip state',
    description:
      'Return the current trip: route, date, passengers, the flight results on screen (id, airline, stops, price per passenger), the ids in the cart and the selected seat.',
    annotations: { readOnlyHint: true },
  },
  addFlightToCart: {
    name: 'add_flight_to_cart',
    title: 'Add flight to cart',
    description: 'Add one of the flight results to the trip cart. Adding a flight that is already in the cart does nothing.',
    inputSchema: flightIdSchema,
  },
  removeFromCart: {
    name: 'remove_from_cart',
    title: 'Remove flight from cart',
    description: 'Remove a flight from the trip cart.',
    inputSchema: flightIdSchema,
  },
};

// Plain-data views. `state` is either the store right now or a render's snapshot.
function cartView(state) {
  return {
    passengers: state.trip.passengers,
    items: cartItems(state).map(({ id, airline, departs, arrives, stops, price }) => ({
      id,
      airline,
      departs,
      arrives,
      stops,
      pricePerPassenger: price,
    })),
    subtotal: cartSubtotal(state),
    currency: 'USD',
  };
}

function tripView(state) {
  return {
    ...state.trip,
    results: state.results.map(({ id, airline, stops, price }) => ({ id, airline, stops, pricePerPassenger: price })),
    cart: [...state.cart],
    seat: state.seat,
    currency: 'USD',
  };
}

// --- Contract mode: execute reads the store at call time -----------------

export const cartTools = {
  getCartItems: {
    ...CART_CONTRACTS.getCartItems,
    execute: async () => cartView(useTripStore.getState()),
  },
  getTripState: {
    ...CART_CONTRACTS.getTripState,
    execute: async () => tripView(useTripStore.getState()),
  },
  addFlightToCart: {
    ...CART_CONTRACTS.addFlightToCart,
    execute: async ({ flightId }) => {
      const flight = useTripStore.getState().addToCart(flightId);
      return { added: flight.id, cart: cartView(useTripStore.getState()) };
    },
  },
  removeFromCart: {
    ...CART_CONTRACTS.removeFromCart,
    execute: async ({ flightId }) => {
      useTripStore.getState().removeFromCart(flightId);
      return { removed: flightId, cart: cartView(useTripStore.getState()) };
    },
  },
};

export function useContractCartTools() {
  useWebMCPTool(cartTools.getCartItems);
  useWebMCPTool(cartTools.getTripState);
  useWebMCPTool(cartTools.addFlightToCart);
  useWebMCPTool(cartTools.removeFromCart);
}

// --- Naive and stale modes: tools built inline from the render's values ---

function snapshotTools(snapshot) {
  const { addToCart, removeFromCart } = useTripStore.getState();
  return {
    getCartItems: { ...CART_CONTRACTS.getCartItems, execute: async () => cartView(snapshot) },
    getTripState: { ...CART_CONTRACTS.getTripState, execute: async () => tripView(snapshot) },
    addFlightToCart: {
      ...CART_CONTRACTS.addFlightToCart,
      execute: async ({ flightId }) => ({ added: addToCart(flightId).id, cart: cartView(snapshot) }),
    },
    removeFromCart: {
      ...CART_CONTRACTS.removeFromCart,
      execute: async ({ flightId }) => {
        removeFromCart(flightId);
        return { removed: flightId, cart: cartView(snapshot) };
      },
    },
  };
}

export function useNaiveCartTools(snapshot) {
  const tools = snapshotTools(snapshot); // new objects on every render
  useNaiveWebMCPTool(tools.getCartItems);
  useNaiveWebMCPTool(tools.getTripState);
  useNaiveWebMCPTool(tools.addFlightToCart);
  useNaiveWebMCPTool(tools.removeFromCart);
}

export function useStaleCartTools(snapshot) {
  const tools = snapshotTools(snapshot); // only the first render's copy is ever registered
  useStaleWebMCPTool(tools.getCartItems);
  useStaleWebMCPTool(tools.getTripState);
  useStaleWebMCPTool(tools.addFlightToCart);
  useStaleWebMCPTool(tools.removeFromCart);
}

export const CART_TOOL_HOOKS = {
  contract: useContractCartTools,
  naive: useNaiveCartTools,
  stale: useStaleCartTools,
};
