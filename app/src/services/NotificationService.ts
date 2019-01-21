import Logger from './Logger';
// import SleepUtil from './SleepUtil';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

// @ts-ignore
import { AsyncStorage } from 'react-native';
import Snackbar from 'react-native-snackbar';

// services
import NavigationService from '../services/NavigationService';
import ApiService from '../services/ApiService';
import NodeService from '../services/NodeService';

// @ts-ignore
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
          // @ts-ignore
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

    // let notificationTitle = 'Smartshare';
    // // Attempt to extract the "message" property from the payload: {"message":"Hello World!"}
    // let notificationText = data.message || 'Test notification';
    // Display basic system notification
    // Pushy.notify(notificationTitle, notificationText);

    public static async handleAction(notification: any) {
      let action = notification.action;

      console.log('Handling notification');
      console.log(notification);

      if (action === 'confirm_friend') {

        /*
          {
            "relation_id":"relation:87a46a97-050a-463a-a293-0d284604f050",
            "your_id":"friend:0d196ce6-3f71-4cb2-8a4d-35a0742ef7ff",
            "their_id":"friend:d6748e33-835a-408d-90aa-a8789d023581",
            "error_msg":"",
            "location_tracking":true
          }
        */

        let relationId = notification.relation_id;

        // @ts-ignore
        let fromUserId = 'private:' + notification.from_user;
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
          // @ts-ignore
          let newFriendId = newRelation.their_id;
          Logger.info(`MainMap.handlePushData - response from AcceptFriendAsync: ${JSON.stringify(newRelation)}`);

          let exists = await NodeService.doesRelationExist(fromUserId);
          if (!exists) {
            Logger.info(`MainMap.handlePushData - this is a new relation, storing: ${JSON.stringify(newRelation)}`);

            //  If this request includes location tracking, store in the tracked node list separately
            if (locationTracking) {
              await NodeService.storeNode(newFriendId);
            }

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
        } else {
          // Show success message
          Snackbar.show({
            title: 'Problem adding new friend',
            duration: Snackbar.LENGTH_SHORT,
          });

          Logger.info('MainMap.handleLink - invalid response from AcceptFriendAsync.');
        }

      // If we are adding a new node to tracked node list
      } else if (action === 'add_node') {
          let nodeId = notification.node_id;

          Logger.info('MainMap.handleLink - Adding a tracked node.');

          let exists = false; // await NodeService.storeNode(nodeId);
          if (!exists) {

            // Show success message
            Snackbar.show({
              title: 'Added new node',
              duration: Snackbar.LENGTH_SHORT,
            });

            Logger.info(`MainMap.handleLink - this is a new node, storing: ${JSON.stringify(nodeId)}`);

            return;
          }

          // Show 'already exists' message
          Snackbar.show({
            title: 'You have already added this node',
            duration: Snackbar.LENGTH_SHORT,
          });
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
        if (notification.action === 'confirm_friend') {
          for (let i = 0; i < notifications.length; i++) {
            if (notifications[i].friend_id === notification.friend_id) {
              notificationIndex = i;
              break;
            }
          }
        } else if (notification.action === 'add_node') {
          console.log('not handled node thing yet');
        }

      }

      if (notificationIndex >= 0) {
        notifications.splice(notificationIndex, 1);
        await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
        Logger.info(`NotificationService.removeNotification: removed notification: ${notification}`);
      }

    }

    // Private implementation functions

}
