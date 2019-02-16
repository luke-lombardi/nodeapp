import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';

export function walletChangedReducer(
  state: any = InitialState.wallet, action: ActionTypes,
): any {
  if (action.type === ActionTypeKeys.WALLET_UPDATED) {
    return action.wallet;
  }
  return state;
}