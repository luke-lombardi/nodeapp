import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';

export function authStateChangedReducer(
    state: any = InitialState.auth, action: ActionTypes,
  ): any {
    if (action.type === ActionTypeKeys.AUTH_CHANGED_ACTTION) {
      return action.auth;
    }
    return state;
}