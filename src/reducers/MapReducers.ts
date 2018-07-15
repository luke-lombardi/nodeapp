import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';


export function userPositionChangedReducer(
  state: any = InitialState.userRegion, action: ActionTypes,
): any {
  if (action.type === ActionTypeKeys.USER_POSITIION_CHANGED) {
    return action.userRegion;
  }
  return state;
}