import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';

export function publicPersonListUpdatedReducer(
  state: Array<any> = InitialState.publicPersonList, action: ActionTypes,
): Array<any> {
  if (action.type === ActionTypeKeys.PUBLIC_PERSON_LIST_UPDATED) {
    return action.nodeList;
  }
  return state;
}

export function publicPlaceListUpdatedReducer(
  state: Array<any> = InitialState.publicPlaceList, action: ActionTypes,
): Array<any> {
  if (action.type === ActionTypeKeys.PUBLIC_PLACE_LIST_UPDATED) {
    return action.nodeList;
  }
  return state;
}

export function privatePersonListUpdatedReducer(
  state: Array<any> = InitialState.privatePersonList, action: ActionTypes,
): Array<any> {
  if (action.type === ActionTypeKeys.PRIVATE_PERSON_LIST_UPDATED) {
    return action.nodeList;
  }
  return state;
}

export function privatePlaceListUpdatedReducer(
  state: Array<any> = InitialState.privatePlaceList, action: ActionTypes,
): Array<any> {
  if (action.type === ActionTypeKeys.PRIVATE_PLACE_LIST_UPDATED) {
    return action.nodeList;
  }
  return state;
}
