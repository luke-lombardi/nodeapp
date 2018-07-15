import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';
import keys from './ActionTypeKeys';

// User location changed

export interface IUserPositionChanged {
  readonly type: keys.USER_POSITIION_CHANGED;
  readonly userRegion: any;
}

function UserPositionChangedAction(userRegion: any): IUserPositionChanged {
  return {
    type: keys.USER_POSITIION_CHANGED,
    userRegion: userRegion,
  };
}

export function UserPositionChangedActionCreator(userRegion: any): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(UserPositionChangedAction(userRegion));
  };
}