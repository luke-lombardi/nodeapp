import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';

export function notificationListChangedReducer(
  state: any = InitialState.notificationList, action: ActionTypes,
): any {
  if (action.type === ActionTypeKeys.NOTIFICATION_LIST_UPDATED) {
    return action.notificationList;
  }
  return state;
}