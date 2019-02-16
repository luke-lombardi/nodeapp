import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';
import keys from './ActionTypeKeys';

export interface IWalletUpdated {
  readonly type: keys.WALLET_UPDATED;
  readonly wallet: any;
}

function WalletUpdatedAction(wallet: any): IWalletUpdated {
  return {
    type: keys.WALLET_UPDATED,
    wallet: wallet,
  };
}

export function WalletUpdatedActionCreator(wallet: any): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(WalletUpdatedAction(wallet));
  };
}