import keys from './ActionTypeKeys';
import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';

export interface IPageChangedAction {
  readonly type: keys.PAGE_CHANGED_ACTION;
  readonly currentPage: string;
}

export function PageChangedActionCreator(currentPage: string): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(PageChangedAction(currentPage));
  };
}

function PageChangedAction(currentPage: string): IPageChangedAction {
  return {
    type: keys.PAGE_CHANGED_ACTION,
    currentPage: currentPage,
  };
}