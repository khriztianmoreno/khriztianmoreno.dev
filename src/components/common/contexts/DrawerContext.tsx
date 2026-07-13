import { useReducer, createContext, type Dispatch, type ReactNode } from 'react';

interface DrawerState {
  isOpen: boolean;
}

interface DrawerAction {
  type: 'TOGGLE';
}

export interface DrawerContextValue {
  state: DrawerState;
  dispatch: Dispatch<DrawerAction>;
}

const initialState: DrawerState = {
  isOpen: false,
};

function reducer(state: DrawerState, action: DrawerAction): DrawerState {
  switch (action.type) {
    case 'TOGGLE':
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    default:
      return state;
  }
}

export const DrawerContext = createContext<DrawerContextValue>({
  state: initialState,
  dispatch: () => undefined,
});

export const DrawerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <DrawerContext.Provider value={{ state, dispatch }}>
      {children}
    </DrawerContext.Provider>
  );
};
