import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';
import keys from './ActionTypeKeys';

// User logged in

export interface IUserLoggedIn {
  readonly type: keys.USER_LOGGED_IN;
  readonly loggedIn: boolean;
}

function UserLoggedInAction(loggedIn: boolean): IUserLoggedIn {
  return {
    type: keys.USER_LOGGED_IN,
    loggedIn: loggedIn,
  };
}

export function UserLoggedInActionCreator(loggedIn: boolean): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(UserLoggedInAction(loggedIn));
  };
}