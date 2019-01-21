import Logger from './Logger';
// import SleepUtil from './SleepUtil';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

// @ts-ignore
import { AsyncStorage } from 'react-native';
import Snackbar from 'react-native-snackbar';

// services
import NavigationService from '../services/NavigationService';
import ApiService from '../services/ApiService';

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

        // let index = notifications.indexOf(newNodeId);

        // if (index < 0) {
        //     // @ts-ignore
        //     trackedNodes.push(newNodeId);

        //     return false;
        // } else {
        //     Logger.info(`NodeService.storeNode: you already are tracking this node.`);
        //     return true;
        // }

    }

    // Delete a notification from async storage
    public static async deleteNotification(nodeId) {
        let trackedNodes = await AsyncStorage.getItem('notifications');
        if (trackedNodes !== null) {
            trackedNodes = JSON.parse(trackedNodes);
        } else {
          // @ts-ignore
          trackedNodes = [];
        }

        let index = trackedNodes.indexOf(nodeId);

        if (index >= 0) {
            // @ts-ignore
            trackedNodes.splice(index, 1);

            await AsyncStorage.setItem('trackedNodes', JSON.stringify(trackedNodes));
            Logger.info(`NodeService.deleteNode: removed node: ${trackedNodes}`);
        } else {
            Logger.info(`NodeService.deleteNode: you are not tracking this node.`);
        }
    }

    // // Delete a friend ID from async storage
    // public async deleteFriend(friendId) {
    //     let trackedFriends = await AsyncStorage.getItem('trackedFriends');
    //     if (trackedFriends !== null) {
    //         trackedFriends = JSON.parse(trackedFriends);
    //     } else {
    //       // @ts-ignore
    //       trackedFriends = [];
    //     }

    //     let index = trackedFriends.indexOf(friendId);

    //     if (index >= 0) {
    //         // @ts-ignore
    //         trackedFriends.splice(index, 1);

    //         await AsyncStorage.setItem('trackedFriends', JSON.stringify(trackedFriends));
    //         Logger.info(`NodeService.deleteFriend: removed friend: ${trackedFriends}`);
    //     } else {
    //         Logger.info(`NodeService.deleteFriend: you are not tracking this person.`);
    //     }
    // }

    // let notificationTitle = 'Smartshare';
    // // Attempt to extract the "message" property from the payload: {"message":"Hello World!"}
    // let notificationText = data.message || 'Test notification';
    // Display basic system notification
    // Pushy.notify(notificationTitle, notificationText);

    public static async handleAction(pushData: any) {
      let action = pushData.action;
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

        let relationId = pushData.relation_id;
        // @ts-ignore
        let fromUserId = 'private:' + pushData.from_user;
        let friendId = pushData.friend_id;
        let locationTracking = pushData.location_tracking;

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

          let exists = false; // await this.nodeService.storeRelation(fromUserId, relationData);
          if (!exists) {
            Logger.info(`MainMap.handlePushData - this is a new relation, storing: ${JSON.stringify(newRelation)}`);

            //  If this request includes location tracking, store in the tracked node list separately
            if (locationTracking) {
              // await this.nodeService.storeNode(newFriendId);
            }

            // Show 'added new friend' message
            Snackbar.show({
              title: 'Added new friend',
              duration: Snackbar.LENGTH_SHORT,
            });

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
          let nodeId = pushData.node_id;

          Logger.info('MainMap.handleLink - Adding a tracked node.');

          let exists = false; // await this.nodeService.storeNode(nodeId);
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

    // Private implementation functions

}
