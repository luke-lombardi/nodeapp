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


export function visitedNodeListUpdatedReducer(
  state: Array<any> = InitialState.visitedNodeList, action: ActionTypes,
): Array<any> {
  if (action.type === ActionTypeKeys.VISITED_NODE_LIST_UPDATED) {
    return action.visitedNodeList;
  }
  return state;
}