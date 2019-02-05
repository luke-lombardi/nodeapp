import Logger from './Logger';
// import SleepUtil from './SleepUtil';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

import { AsyncStorage } from 'react-native';
import Snackbar from 'react-native-snackbar';

// services
import NavigationService from '../services/NavigationService';
import ApiService from '../services/ApiService';
import NodeService from '../services/NodeService';

interface IProps {
}

export default class NotificationService {
    // @ts-ignore
    private readonly props: IProps;
    // @ts-ignore
    private readonly configGlobal = ConfigGlobalLoader.config;

    // Stores a new notification in async storage
    public static async storeNotification(pushData: any) {
        let notifications: any = await AsyncStorage.getItem('notifications');
        if (notifications !== null) {
          notifications = JSON.parse(notifications);
        } else {
          notifications = [];
        }

        notifications.push(pushData);
        Logger.info(`NotificationService.storeNotification: now tracking ${JSON.stringify(notifications)}`);
        await AsyncStorage.setItem('notifications', JSON.stringify(notifications));

        // Show a snackbar that links to the notification list
        Snackbar.show({
          title: 'Received new notifications.',
          duration: Snackbar.LENGTH_INDEFINITE,
          action: {
            title: 'View',
            color: 'white',
            onPress: () => { NavigationService.reset('Notifications', {}); },
          },
        });
    }

    public static async notifyUser(notification: any) {
      if (notification.action === 'got_message') {
        Snackbar.show({
          title: `Received new message from ${notification.from_username}.`,
          duration: Snackbar.LENGTH_INDEFINITE,
          action: {
            title: 'View',
            color: 'white',
            onPress: () => { NavigationService.reset('Chat', {
              action: 'join_chat',
              nodeId: notification.relation_id,
              username: notification.from_username,
            }); },
          },
        });
      }

    }

    public static async handleAction(notification: any) {
      let action = notification.action;

      // console.log('Handling notification');
      // console.log(notification);

      if (action === 'confirm_friend') {
        let relationId = notification.relation_id;

        let fromUserId = notification.from_user;
        let friendId = notification.friend_id;
        let locationTracking = notification.location_tracking;

        let currentUUID = await AsyncStorage.getItem('user_uuid');

        let relationData = {
          'relation_id': relationId,
          'your_id': friendId,
          'location_tracking': locationTracking,
          'user_uuid': currentUUID,
        };

        let newRelation = await ApiService.AcceptFriendAsync(relationData);

        if (newRelation !== undefined) {
          let newFriendId = newRelation.their_id;
          Logger.info(`NotificationService.handleAction - response from AcceptFriendAsync: ${JSON.stringify(newRelation)}`);

          let exists = await NodeService.doesRelationExist(fromUserId);
          if (!exists) {
            Logger.info(`NotificationService.handleAction - this is a new relation, storing: ${JSON.stringify(newRelation)}`);

            // Store the new relation data in AsyncStorage
            await NodeService.storeRelation(fromUserId, relationData);

            //  If this request includes location tracking, store in the tracked node list separately
            await NodeService.storeNode(newFriendId);

            // Show 'added new friend' message
            Snackbar.show({
              title: 'Added new friend',
              duration: Snackbar.LENGTH_SHORT,
            });

            // Remove the notification from AsyncStorage
            await this.removeNotification(notification);
            return;
          }

          // Show 'already exists' message
          Snackbar.show({
            title: 'You have already added this friend',
            duration: Snackbar.LENGTH_SHORT,
          });

          await this.removeNotification(notification);

        } else {
          // Show success message
          Snackbar.show({
            title: 'Problem adding new friend',
            duration: Snackbar.LENGTH_SHORT,
          });

          Logger.info('NotificationService.handleAction - invalid response from AcceptFriendAsync.');
        }

      // If we are adding a new node to tracked node list
      } else if (action === 'add_node') {
          let nodeId = notification.node_id;

          Logger.info('MainMap.handleLink - Adding a tracked node.');

          let exists = await NodeService.storeNode(nodeId);
          if (!exists) {

            // Show success message
            Snackbar.show({
              title: 'Added new node',
              duration: Snackbar.LENGTH_SHORT,
            });

            Logger.info(`MainMap.handleAction - this is a new node, storing: ${JSON.stringify(nodeId)}`);

            await this.removeNotification(notification);
            return;
          }

          // Show 'already exists' message
          Snackbar.show({
            title: 'You have already added this node',
            duration: Snackbar.LENGTH_SHORT,
          });

          await this.removeNotification(notification);

      } else if (action === 'got_message') {
        Logger.info(`MainMap.handleAction - Received a DM from ${notification.from_username}`);
        let relationId = notification.relation_id;

        // Go to the DM chat
        NavigationService.reset('Chat', {nodeId: relationId});
      }
    }

    public static async handleNotification(pushData: any) {
      Logger.info(`MainMap.pushData: handling the following push data: ${pushData}`);
    }

    public static async removeNotification(notification) {
      let notifications: any = await AsyncStorage.getItem('notifications');
      if (notifications !== null) {
        notifications = JSON.parse(notifications);
      } else {
        // @ts-ignore
        notifications = [];
      }

      let notificationIndex = -1;

      if (notification.action !== undefined) {
        if (notification.action === 'confirm_friend' || notification.action === 'add_node') {
          for (let i = 0; i < notifications.length; i++) {
            if (notifications[i].friend_id === notification.friend_id) {
              notificationIndex = i;
              break;
            }
          }
        }
        // else if (notification.action === 'add_node') {
        //   console.log('not handled node thing yet');
        // }

      }

      if (notificationIndex >= 0) {
        notifications.splice(notificationIndex, 1);
        await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
        Logger.info(`NotificationService.removeNotification: removed notification: ${notification}`);
      }

    }

    // Private implementation functions

}
