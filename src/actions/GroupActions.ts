import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';
import keys from './ActionTypeKeys';

// User location changed

export interface IGroupListUpdated {
  readonly type: keys.GROUP_LIST_UPDATED;
  readonly groupList: Array<any>;
}

function GroupListUpdatedAction(groupList: any): IGroupListUpdated {
  return {
    type: keys.GROUP_LIST_UPDATED,
    groupList: groupList,
  };
}

export function GroupListUpdatedActionCreator(groupList: any): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(GroupListUpdatedAction(groupList));
  };
}