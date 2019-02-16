import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';

export function transactionListChangedReducer(
  state: any = InitialState.transactionList, action: ActionTypes,
): any {
  if (action.type === ActionTypeKeys.TRANSACTION_LIST_UPDATED) {
    return action.transactionList;
  }
  return state;
}