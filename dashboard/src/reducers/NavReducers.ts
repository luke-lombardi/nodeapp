import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';

export function pageChangedReducer(
    state: string = InitialState.currentPage, action: ActionTypes,
  ): string {
    if (action.type === ActionTypeKeys.PAGE_CHANGED_ACTION) {
      return action.currentPage;
    }
    return state;
}