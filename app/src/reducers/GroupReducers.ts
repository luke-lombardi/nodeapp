import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';

export function groupListChangedReducer(
  state: any = InitialState.groupList, action: ActionTypes,
): any {
  if (action.type === ActionTypeKeys.GROUP_LIST_UPDATED) {
    return action.groupList;
  }
  return state;
}