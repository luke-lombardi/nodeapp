import Logger from './Logger';
// import SleepUtil from './SleepUtil';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

// @ts-ignore
import { AsyncStorage } from 'react-native';

// services

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
        Logger.info(`NotificationService.storeNotification: now tracking ${notifications}`);
        await AsyncStorage.setItem('notifications', JSON.stringify(notifications));

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

    // Delete a friend ID from async storage
    public async deleteFriend(friendId) {
        let trackedFriends = await AsyncStorage.getItem('trackedFriends');
        if (trackedFriends !== null) {
            trackedFriends = JSON.parse(trackedFriends);
        } else {
          // @ts-ignore
          trackedFriends = [];
        }

        let index = trackedFriends.indexOf(friendId);

        if (index >= 0) {
            // @ts-ignore
            trackedFriends.splice(index, 1);

            await AsyncStorage.setItem('trackedFriends', JSON.stringify(trackedFriends));
            Logger.info(`NodeService.deleteFriend: removed friend: ${trackedFriends}`);
        } else {
            Logger.info(`NodeService.deleteFriend: you are not tracking this person.`);
        }
    }

    // Private implementation functions

}
