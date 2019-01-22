import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';
import keys from './ActionTypeKeys';

// User location changed

export interface ITrackedFriendListUpdated {
  readonly type: keys.FRIEND_LIST_UPDATED;
  readonly friendList: Array<any>;
}

function TrackedFriendListUpdatedAction(friendList: any): ITrackedFriendListUpdated {
  return {
    type: keys.FRIEND_LIST_UPDATED,
    friendList: friendList,
  };
}

export function TrackedFriendListUpdatedActionCreator(friendList: any): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(TrackedFriendListUpdatedAction(friendList));
  };
}