import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';

export function relationListChangedReducer(
  state: any = InitialState.relationList, action: ActionTypes,
): any {
  if (action.type === ActionTypeKeys.RELATION_LIST_UPDATED) {
    return action.relationList;
  }
  return state;
}