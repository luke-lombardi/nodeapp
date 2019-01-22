import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';
import keys from './ActionTypeKeys';

//

export interface IRelationListUpdated {
  readonly type: keys.RELATION_LIST_UPDATED;
  readonly relationList: Array<any>;
}

function RelationListUpdatedAction(relationList: any): IRelationListUpdated {
  return {
    type: keys.RELATION_LIST_UPDATED,
    relationList: relationList,
  };
}

export function RelationListUpdatedActionCreator(relationList: any): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(RelationListUpdatedAction(relationList));
  };
}