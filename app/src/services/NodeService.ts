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

export interface IFriendListUpdated {
    readonly friendList: Array<any>;
}

// @ts-ignore
interface IProps {
  readonly currentUserRegion?: () => any;
  readonly currentFriendList?: () => any;

  readonly publicPersonListUpdated?: (props: IPublicPersonListUpdated) => Promise<void>;
  readonly publicPlaceListUpdated?: (props: IPublicPlaceListUpdated) => Promise<void>;
  readonly privatePersonListUpdated?: (props: IPrivatePersonListUpdated) => Promise<void>;
  readonly privatePlaceListUpdated?: (props: IPrivatePlaceListUpdated) => Promise<void>;
  readonly friendListUpdated?: (props: IFriendListUpdated) => Promise<void>;
}

export default class NodeService {
    public monitoring: boolean = false;

    private readonly props: IProps;
    private readonly configGlobal = ConfigGlobalLoader.config;

    private stopping: boolean = false;
    private checkNowTrigger: DeferredPromise;

    private locationService: LocationService;
    private apiService: ApiService;

    constructor(props: IProps) {
        this.props = props;

        // Create services
        this.locationService = new LocationService({});
        this.apiService = new ApiService({
        });

        this.checkNowTrigger = new DeferredPromise();

        this.MonitorNodeListAsync = this.MonitorNodeListAsync.bind(this);

        this.CheckNow = this.CheckNow.bind(this);

        Logger.trace(`NodeService.constructor -  Initialized node service`);
    }

    // Public interface functions

    public StartMonitoring() {
        if (this.monitoring) return;
        this.monitoring = true;

        // Start the monitoring loops - don't await this because it runs forever
        this.MonitorNodeListAsync();
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
    public async storeNode(newNodeId) {
        let trackedNodes = await AsyncStorage.getItem('trackedNodes');
        if (trackedNodes !== null) {
          trackedNodes = JSON.parse(trackedNodes);
        } else {
          // @ts-ignore
          trackedNodes = [];
        }

        let index = trackedNodes.indexOf(newNodeId);

        if (index < 0) {
            // @ts-ignore
            trackedNodes.push(newNodeId);
            Logger.info(`NodeService.storeNode: now tracking ${trackedNodes}`);

            await AsyncStorage.setItem('trackedNodes', JSON.stringify(trackedNodes));

            return false;
        } else {
            Logger.info(`NodeService.storeNode: you already are tracking this node.`);
            return true;
        }

    }

    public async doesRelationExist(userId: string) {
      let trackedRelations: any = await AsyncStorage.getItem('trackedRelations');
      if (trackedRelations !== null) {
          trackedRelations = JSON.parse(trackedRelations);
      } else {
          // @ts-ignore
          trackedRelations = {};
      }

      if (userId in trackedRelations) {
        return true;
      }  else {
        return false;
      }
    }

    // Stores a new friend ID in async storage
    public async storeRelation(userId: string, relationData: any) {

      let trackedRelations: any = await AsyncStorage.getItem('trackedRelations');
      if (trackedRelations !== null) {
          trackedRelations = JSON.parse(trackedRelations);
      } else {
          // @ts-ignore
          trackedRelations = {};
      }

      if (!(userId in trackedRelations)) {
          Logger.info(`NodeService.storeRelation - this is a new relation: ${JSON.stringify(trackedRelations)}`);

          trackedRelations[userId] = relationData;

          Logger.info(`NodeService.storeRelation - Current tracked relations: ${JSON.stringify(trackedRelations)}`);

          await AsyncStorage.setItem('trackedRelations', JSON.stringify(trackedRelations));
          Logger.info(`NodeService.storeRelation: now tracking ${JSON.stringify(trackedRelations)}`);

          return true;
      } else {
          Logger.info(`NodeService.storeRelation: you already are tracking this relation.`);

          return false;
      }
  }

    // Delete a node ID from async storage
    public async deleteNode(nodeId) {
        let trackedNodes = await AsyncStorage.getItem('trackedNodes');
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

    // Monitors the cache for updates to the node list
    private async MonitorNodeListAsync() {
        while (true) {
            if (this.stopping) return;

            // Re-create the check-now trigger in case it was triggered last time
            this.checkNowTrigger = new DeferredPromise();

            await this.GetNodeListAsync();

            const sleepPromise = SleepUtil.SleepAsync(this.configGlobal.nodeCheckIntervalMs);
            await Promise.race([ sleepPromise, this.checkNowTrigger ]);

            Logger.trace('NodeService.MonitorNodeListAsync - Looping around to check nodes again');
        }
    }

    // Gets the current node list, which includes both public and tracked nodes
    private async GetNodeListAsync() {
      let nodes = undefined;

      try  {
        nodes = await this.apiService.getNodes();
      } catch (error) {
        // Do nothing if this fails
      }

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
