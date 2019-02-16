import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';
import keys from './ActionTypeKeys';

export interface ITransactionListUpdated {
  readonly type: keys.TRANSACTION_LIST_UPDATED;
  readonly transactionList: Array<any>;
}

function TransactionListUpdatedAction(transactionList: any): ITransactionListUpdated {
  return {
    type: keys.TRANSACTION_LIST_UPDATED,
    transactionList: transactionList,
  };
}

export function TransactionListUpdatedActionCreator(transactionList: any): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(TransactionListUpdatedAction(transactionList));
  };
}