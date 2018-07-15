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



export interface IVisitedNodeListUpdated {
  readonly type: keys.VISITED_NODE_LIST_UPDATED;
  readonly visitedNodeList: Array<any>;
}

function VisitedNodeListUpdatedAction(visitedNodeList: Array<any>): IVisitedNodeListUpdated {
  return {
    type: keys.VISITED_NODE_LIST_UPDATED,
    visitedNodeList: visitedNodeList,
  };
}

export function VisitedNodeListUpdatedActionCreator(visitedNodeList: Array<any>): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(VisitedNodeListUpdatedAction(visitedNodeList));
  };
}