import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';
import keys from './ActionTypeKeys';

export interface INodeListUpdated {
  readonly type: keys.NODE_LIST_UPDATED;
  readonly nodeList: Array<any>;
}

function NodeListUpdatedAction(nodeList: Array<any>): INodeListUpdated {
  return {
    type: keys.NODE_LIST_UPDATED,
    nodeList: nodeList,
  };
}

export function NodeListUpdatedActionCreator(nodeList: Array<any>): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(NodeListUpdatedAction(nodeList));
  };
}