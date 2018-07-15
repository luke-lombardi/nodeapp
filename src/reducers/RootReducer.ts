import { combineReducers } from 'redux';
import IStoreState from '../store/IStoreState';

import { navReducer } from './NavReducers';
import { userLoggedInReducer as  loggedIn } from './AuthReducers';
import { nodeListUpdatedReducer as nodeList } from './NodeReducers';
import { visitedNodeListUpdatedReducer as visitedNodeList } from './NodeReducers';
import { challengeSettingsUpdatedReducer as challengeSettings } from './ChallengeReducers';

import { userPositionChangedReducer as userRegion } from './MapReducers';


const RootReducer = combineReducers<IStoreState>({
  // NOTE: The reducer names in this list MUST match the state member names
  navReducer,
  loggedIn,
  nodeList,
  visitedNodeList,
  userRegion,
  challengeSettings,
});

export default RootReducer;
