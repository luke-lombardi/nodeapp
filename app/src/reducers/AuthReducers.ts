import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';


export function userLoggedInReducer(
  state: boolean = InitialState.loggedIn, action: ActionTypes,
): boolean {
  if (action.type === ActionTypeKeys.USER_LOGGED_IN) {
    return action.loggedIn;
  }
  return state;
}