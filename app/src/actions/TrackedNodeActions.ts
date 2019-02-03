import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';
import keys from './ActionTypeKeys';

export interface ITrackedNodeListUpdated {
  readonly type: keys.TRACKED_NODE_LIST_UPDATED;
  readonly nodeList: Array<any>;
}

function TrackedNodeListUpdatedAction(nodeList: any): ITrackedNodeListUpdated {
  return {
    type: keys.TRACKED_NODE_LIST_UPDATED,
    nodeList: nodeList,
  };
}

export function TrackedNodeListUpdatedActionCreator(nodeList: any): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(TrackedNodeListUpdatedAction(nodeList));
  };
}