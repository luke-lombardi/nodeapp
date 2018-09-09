import { RootStack } from '../components/App';

export function navReducer(state, action) {
  const newState = RootStack.router.getStateForAction(action, state);
  return newState || state;
}