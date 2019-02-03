import { IUserLoggedIn } from './AuthActions';

import { IPublicPersonListUpdated } from './NodeActions';
import { IPublicPlaceListUpdated } from './NodeActions';
import { IPrivatePersonListUpdated } from './NodeActions';
import { IPrivatePlaceListUpdated } from './NodeActions';

import { ITrackedFriendListUpdated } from './TrackedFriendActions';
import { ITrackedNodeListUpdated } from './TrackedNodeActions';

import { IRelationListUpdated } from './RelationActions';

import { IUserPositionChanged } from './MapActions';

type ActionTypes =

  // User Actions
  | IUserLoggedIn

  | IPublicPersonListUpdated

  | IPublicPlaceListUpdated

  | IPrivatePersonListUpdated

  | IPrivatePlaceListUpdated

  | IUserPositionChanged

  | ITrackedFriendListUpdated

  | ITrackedNodeListUpdated

  | IRelationListUpdated

  ;

export default ActionTypes;