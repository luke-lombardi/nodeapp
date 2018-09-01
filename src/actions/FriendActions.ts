import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';
import keys from './ActionTypeKeys';

// User location changed

export interface IFriendListUpdated {
  readonly type: keys.FRIEND_LIST_UPDATED;
  readonly friendList: Array<any>;
}

function FriendListUpdatedAction(friendList: any): IFriendListUpdated {
  return {
    type: keys.FRIEND_LIST_UPDATED,
    friendList: friendList,
  };
}

export function FriendListUpdatedActionCreator(groupList: any): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(FriendListUpdatedAction(groupList));
  };
}