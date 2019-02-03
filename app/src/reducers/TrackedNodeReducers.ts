import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';

export function trackedNodeListChangedReducer(
  state: any = InitialState.trackedNodeList, action: ActionTypes,
): any {
  if (action.type === ActionTypeKeys.TRACKED_NODE_LIST_UPDATED) {
    return action.nodeList;
  }
  return state;
}