import { IPublicPersonListUpdated } from './NodeActions';
import { IPublicPlaceListUpdated } from './NodeActions';
import { IPrivatePersonListUpdated } from './NodeActions';
import { IPrivatePlaceListUpdated } from './NodeActions';

import { ITrackedFriendListUpdated } from './TrackedFriendActions';
import { ITrackedNodeListUpdated } from './TrackedNodeActions';

import { IRelationListUpdated } from './RelationActions';

import { IUserPositionChanged } from './MapActions';

import { INotificationListUpdated } from './NotificationActions';

type ActionTypes =

  | IPublicPersonListUpdated

  | IPublicPlaceListUpdated

  | IPrivatePersonListUpdated

  | IPrivatePlaceListUpdated

  | IUserPositionChanged

  | ITrackedFriendListUpdated

  | ITrackedNodeListUpdated

  | IRelationListUpdated

  | INotificationListUpdated

  ;

export default ActionTypes;