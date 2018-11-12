import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';

export function filtersChangedReducer(
    state: any = InitialState.currentFilters, action: ActionTypes,
  ): any {
    if (action.type === ActionTypeKeys.FILTERS_CHANGED_ACTION) {
      return action.currentFilters;
    }
    return state;
}