import { combineReducers } from 'redux';
import IStoreState from '../store/IStoreState';

import { navReducer } from './NavReducers';
import { userLoggedInReducer as  loggedIn } from './AuthReducers';

import { publicPersonListUpdatedReducer as publicPersonList } from './NodeReducers';
import { publicPlaceListUpdatedReducer as publicPlaceList } from './NodeReducers';
import { privatePersonListUpdatedReducer as privatePersonList } from './NodeReducers';
import { privatePlaceListUpdatedReducer as privatePlaceList } from './NodeReducers';

import { friendListChangedReducer as friendList } from './FriendReducers';
import { groupListChangedReducer as groupList } from './GroupReducers';

import { userPositionChangedReducer as userRegion } from './MapReducers';

const RootReducer = combineReducers<IStoreState>({
  // NOTE: The reducer names in this list MUST match the state member names
  navReducer,
  loggedIn,
  publicPersonList,
  publicPlaceList,
  privatePersonList,
  privatePlaceList,
  groupList,
  friendList,
  userRegion,
});

export default RootReducer;
