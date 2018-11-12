import keys from './ActionTypeKeys';
import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';

export interface IAuthChanged {
  readonly type: keys.AUTH_CHANGED_ACTTION;
  readonly auth: any;
}

export function AuthStateChangeActionCreator(auth: any): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(AuthStateChangeAction(auth));
  };
}

function AuthStateChangeAction(auth: any): IAuthChanged {
  return {
    type: keys.AUTH_CHANGED_ACTTION,
    auth: auth,
  };
}