import keys from './ActionTypeKeys';
import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';

export interface IFiltersChanged {
  readonly type: keys.FILTERS_CHANGED_ACTION;
  readonly currentFilters: any;
}

export function FiltersChangedActionCreator(currentFilters: any): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(FiltersChangedAction(currentFilters));
  };
}

function FiltersChangedAction(currentFilters: any): IFiltersChanged {
  return {
    type: keys.FILTERS_CHANGED_ACTION,
    currentFilters: currentFilters,
  };
}