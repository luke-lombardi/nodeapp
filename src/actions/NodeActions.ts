import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';
import keys from './ActionTypeKeys';

///////// Action interfaces

export interface IPublicPersonListUpdated {
  readonly type: keys.PUBLIC_PERSON_LIST_UPDATED;
  readonly nodeList: Array<any>;
}

export interface IPublicPlaceListUpdated {
  readonly type: keys.PUBLIC_PLACE_LIST_UPDATED;
  readonly nodeList: Array<any>;
}

export interface IPrivatePersonListUpdated {
  readonly type: keys.PRIVATE_PERSON_LIST_UPDATED;
  readonly nodeList: Array<any>;
}

export interface IPrivatePlaceListUpdated {
  readonly type: keys.PRIVATE_PLACE_LIST_UPDATED;
  readonly nodeList: Array<any>;
}

///////// ACTIONS/ACTION CREATORS

function PublicPersonListUpdatedAction(nodeList: Array<any>): IPublicPersonListUpdated {
  return {
    type: keys.PUBLIC_PERSON_LIST_UPDATED,
    nodeList: nodeList,
  };
}

export function PublicPersonListUpdatedActionCreator(nodeList: Array<any>): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(PublicPersonListUpdatedAction(nodeList));
  };
}

//////////

function PublicPlaceListUpdatedAction(nodeList: Array<any>): IPublicPlaceListUpdated {
  return {
    type: keys.PUBLIC_PLACE_LIST_UPDATED,
    nodeList: nodeList,
  };
}

export function PublicPlaceListUpdatedActionCreator(nodeList: Array<any>): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(PublicPlaceListUpdatedAction(nodeList));
  };
}

//////////

function PrivatePersonListUpdatedAction(nodeList: Array<any>): IPrivatePersonListUpdated {
  return {
    type: keys.PRIVATE_PERSON_LIST_UPDATED,
    nodeList: nodeList,
  };
}

export function PrivatePersonListUpdatedActionCreator(nodeList: Array<any>): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(PrivatePersonListUpdatedAction(nodeList));
  };
}

//////////

function PrivatePlaceListUpdatedAction(nodeList: Array<any>): IPrivatePlaceListUpdated {
  return {
    type: keys.PRIVATE_PLACE_LIST_UPDATED,
    nodeList: nodeList,
  };
}

export function PrivatePlaceListUpdatedActionCreator(nodeList: Array<any>): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(PrivatePlaceListUpdatedAction(nodeList));
  };
}

//////////