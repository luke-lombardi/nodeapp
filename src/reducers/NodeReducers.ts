import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';


export function nodeListUpdatedReducer(
  state: Array<any> = InitialState.nodeList, action: ActionTypes,
): Array<any> {
  if (action.type === ActionTypeKeys.NODE_LIST_UPDATED) {
    return action.nodeList;
  }
  return state;
}