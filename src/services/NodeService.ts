import Logger from './Logger';
import SleepUtil from './SleepUtil';
import DeferredPromise from './DeferredPromise';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

// @ts-ignore
import { AsyncStorage } from 'react-native';

// services
import LocationService from './LocationService';
import ApiService from './ApiService';

export interface IPublicPersonListUpdated {
    readonly nodeList: Array<any>;
}

export interface IPublicPlaceListUpdated {
    readonly nodeList: Array<any>;
}

export interface IPrivatePersonListUpdated {
    readonly nodeList: Array<any>;
}

export interface IPrivatePlaceListUpdated {
    readonly nodeList: Array<any>;
}

export interface IGroupListUpdated {
    readonly groupList: Array<any>;
}

export interface IFriendListUpdated {
    readonly friendList: Array<any>;
}

// @ts-ignore
interface IProps {
  readonly currentUserRegion?: () => any;
  readonly currentGroupList?: () => any;
  readonly currentFriendList?: () => any;

  readonly publicPersonListUpdated?: (props: IPublicPersonListUpdated) => Promise<void>;
  readonly publicPlaceListUpdated?: (props: IPublicPlaceListUpdated) => Promise<void>;
  readonly privatePersonListUpdated?: (props: IPrivatePersonListUpdated) => Promise<void>;
  readonly privatePlaceListUpdated?: (props: IPrivatePlaceListUpdated) => Promise<void>;
  readonly groupListUpdated?: (props: IGroupListUpdated) => Promise<void>;
  readonly friendListUpdated?: (props: IFriendListUpdated) => Promise<void>;
}

export default class NodeService {
    private readonly props: IProps;
    private readonly configGlobal = ConfigGlobalLoader.config;

    private stopping: boolean = false;
    private monitoring: boolean = false;
    private checkNowTrigger: DeferredPromise;

    private locationService: LocationService;
    private apiService: ApiService;

    constructor(props: IProps) {
        this.props = props;

        // Create services
        this.locationService = new LocationService({});
        this.apiService = new ApiService({
            currentGroupList: this.props.currentGroupList,
        });

        this.checkNowTrigger = new DeferredPromise();

        this.MonitorNodeListAsync = this.MonitorNodeListAsync.bind(this);

        this.CheckNow = this.CheckNow.bind(this);

        Logger.info(`NodeService.constructor -  Initialized node service`);
    }

    // Public interface functions

    public StartMonitoring() {
        if (this.monitoring) return;
        this.monitoring = true;

        // Start the monitoring loops - don't await this because it runs forever
        this.MonitorNodeListAsync();
        this.MonitorGroupListAsync();
    }

    public CheckNow() {
        Logger.info('NodeService.CheckNow - updating the node list');
        this.checkNowTrigger.resolve();
    }

    public StopMonitoring() {
        this.stopping = true;
        Logger.info(`NodeService.StopMonitoring -  Disabling monitoring loop.`);
    }

    // Stores a new node in async storage
    public async storeNode(newUuid) {
        let trackedNodes = await AsyncStorage.getItem('trackedNodes');
        if (trackedNodes !== null) {
          trackedNodes = JSON.parse(trackedNodes);
        } else {
          // @ts-ignore
          trackedNodes = [];
        }

        // @ts-ignore
        trackedNodes.push(newUuid);

        await AsyncStorage.setItem('trackedNodes', JSON.stringify(trackedNodes));
        Logger.info(`CreateNode.storeNode: now tracking ${newUuid}`);
    }

    // Stores a new group ID in async storage
    public async storeGroup(newGroupId) {
        let trackedGroups = await AsyncStorage.getItem('trackedGroups');
        if (trackedGroups !== null) {
            trackedGroups = JSON.parse(trackedGroups);
        } else {
          // @ts-ignore
          trackedGroups = [];
        }

        let index = trackedGroups.indexOf(newGroupId);

        if (index < 0) {
            // @ts-ignore
            trackedGroups.push(newGroupId);

            await AsyncStorage.setItem('trackedGroups', JSON.stringify(trackedGroups));
            Logger.info(`NodeService.storeGroup: now tracking ${trackedGroups}`);
        } else {
            Logger.info(`NodeService.storeGroup: you already are tracking this group.`);
        }
    }

    // Stores a new friend ID in async storage
    public async storeFriend(newFriendId) {
        let trackedFriends = await AsyncStorage.getItem('trackedFriends');
        if (trackedFriends !== null) {
            trackedFriends = JSON.parse(trackedFriends);
        } else {
            // @ts-ignore
            trackedFriends = [];
        }

        let index = trackedFriends.indexOf(newFriendId);

        if (index < 0) {
            Logger.info(`NodeService.storeFriend - this is a new friend: ${JSON.stringify(newFriendId)}`);

            // @ts-ignore
            trackedFriends.push(newFriendId);

            Logger.info(`NodeService.storeFriend - Current tracked friends: ${JSON.stringify(trackedFriends)}`);

            await AsyncStorage.setItem('trackedFriends', JSON.stringify(trackedFriends));
            Logger.info(`NodeService.storeFriend: now tracking ${JSON.stringify(trackedFriends)}`);

            return false;
        } else {
            Logger.info(`NodeService.storeFriend: you already are tracking this person.`);

            return true;
        }
    }

    // Delete a group ID from async storage
    public async deleteGroup(groupId) {
            let trackedGroups = await AsyncStorage.getItem('trackedGroups');
            if (trackedGroups !== null) {
                trackedGroups = JSON.parse(trackedGroups);
            } else {
              // @ts-ignore
              trackedGroups = [];
            }

            let index = trackedGroups.indexOf(groupId);

            if (index >= 0) {
                // @ts-ignore
                trackedGroups.splice(index, 1);

                await AsyncStorage.setItem('trackedGroups', JSON.stringify(trackedGroups));
                Logger.info(`NodeService.storeGroup: rnow tracking ${trackedGroups}`);
            } else {
                Logger.info(`NodeService.storeGroup: you are not tracking this group.`);
            }
    }

    // Private implementation functions

    // Monitors the cache for updates to the node list
    private async MonitorNodeListAsync() {
        while (true) {
            if (this.stopping) return;

            // Re-create the check-now trigger in case it was triggered last time
            this.checkNowTrigger = new DeferredPromise();

            await this.GetNodeListAsync();

            const sleepPromise = SleepUtil.SleepAsync(this.configGlobal.nodeCheckIntervalMs);
            await Promise.race([ sleepPromise, this.checkNowTrigger ]);

            Logger.info('NodeService.MonitorNodeListAsync - Looping around to check nodes again');
        }
    }

    // Monitors the cache for updates to the group list
    private async MonitorGroupListAsync() {
        while (true) {
            if (this.stopping) return;

            // Re-create the check-now trigger in case it was triggered last time
            this.checkNowTrigger = new DeferredPromise();

            await this.GetGroupListAsync();

            const sleepPromise = SleepUtil.SleepAsync(this.configGlobal.groupCheckIntervalMs);
            await Promise.race([ sleepPromise, this.checkNowTrigger ]);

            Logger.info('NodeService.MonitorNodeListAsync - Looping around to check nodes again');
        }
    }

    // Gets the current group list
    private async GetGroupListAsync() {
        Logger.info('NodeService.GetGroupListAsync - Getting the group list.');
        let trackedGroups = await AsyncStorage.getItem('trackedGroups');

        if (trackedGroups !== null) {
            trackedGroups = JSON.parse(trackedGroups);
        }

        let groupListArray = [];
        let groupList = await this.apiService.getGroups();
        let modified = false;

        if (groupList) {
            for (let key in groupList) {
                if (groupList.hasOwnProperty(key)) {

                    if (groupList[key].status === 'not_found') {

                        Logger.info(`Cannot find group ${key}, removing from storage.`);

                        if (trackedGroups) {
                            let index = trackedGroups.indexOf(key);
                            if (index !== -1) {
                                // @ts-ignore
                                trackedGroups.splice(index, 1);
                                modified = true;
                            }
                        }
                        continue;
                    }
                    groupList[key].group_id = key;
                    groupListArray.push(groupList[key]);
                }
            }

            // If any groups were not found in the cache, update the tracked group list
            if (modified) {
                await AsyncStorage.setItem('trackedGroups', JSON.stringify(trackedGroups));
            }

            Logger.info(`GetGroupListAsync.GetGroupListAsync - Got these groups: ${JSON.stringify(groupListArray)}`);
            await this.props.groupListUpdated({groupList: groupListArray});
            }
    }

    // Gets the current node list, which includes both public and tracked nodes
    private async GetNodeListAsync() {
      let nodes = await this.apiService.getNodes();
      if (nodes) {
        let orderedNodes = await this.locationService.orderNodes(this.props.currentUserRegion(), nodes);
        await this.props.publicPersonListUpdated({nodeList: orderedNodes.publicPersonList});
        await this.props.publicPlaceListUpdated({nodeList: orderedNodes.publicPlaceList});
        await this.props.privatePersonListUpdated({nodeList: orderedNodes.privatePersonList});
        await this.props.privatePlaceListUpdated({nodeList: orderedNodes.privatePlaceList});
        await this.props.friendListUpdated({friendList: orderedNodes.friendList});
      }
    }

}
