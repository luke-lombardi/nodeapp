import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';
import keys from './ActionTypeKeys';

export interface INotificationListUpdated {
  readonly type: keys.NOTIFICATION_LIST_UPDATED;
  readonly notificationList: Array<any>;
}

function NotificationListUpdatedAction(notificationList: any): INotificationListUpdated {
  return {
    type: keys.NOTIFICATION_LIST_UPDATED,
    notificationList: notificationList,
  };
}

export function NotificationListUpdatedActionCreator(notificationList: any): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(NotificationListUpdatedAction(notificationList));
  };
}