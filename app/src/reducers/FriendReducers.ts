import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';

export function friendListChangedReducer(
  state: any = InitialState.friendList, action: ActionTypes,
): any {
  if (action.type === ActionTypeKeys.FRIEND_LIST_UPDATED) {
    return action.friendList;
  }
  return state;
}