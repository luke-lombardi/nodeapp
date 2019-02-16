import { combineReducers } from 'redux';
import IStoreState from '../store/IStoreState';

import { navReducer } from './NavReducers';

import { publicPersonListUpdatedReducer as publicPersonList } from './NodeReducers';
import { publicPlaceListUpdatedReducer as publicPlaceList } from './NodeReducers';
import { privatePersonListUpdatedReducer as privatePersonList } from './NodeReducers';
import { privatePlaceListUpdatedReducer as privatePlaceList } from './NodeReducers';
import { trackedNodeListChangedReducer as trackedNodeList } from './TrackedNodeReducers';

import { friendListChangedReducer as friendList } from './FriendReducers';
import { relationListChangedReducer as relationList } from './RelationReducers';

import { userPositionChangedReducer as userRegion } from './MapReducers';

import { notificationListChangedReducer as notificationList } from './NotificationReducers';
import { transactionListChangedReducer as transactionList } from './TransactionReducers';
import { walletChangedReducer as wallet } from './WalletReducers';

const RootReducer = combineReducers<IStoreState>({
  // NOTE: The reducer names in this list MUST match the state member names
  navReducer,
  publicPersonList,
  publicPlaceList,
  privatePersonList,
  privatePlaceList,
  trackedNodeList,
  friendList,
  relationList,
  userRegion,
  notificationList,
  transactionList,
  wallet,
});

export default RootReducer;
