import Logger from './Logger';
import SleepUtil from './SleepUtil';
import DeferredPromise from './DeferredPromise';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

// @ts-ignore
import { AsyncStorage } from 'react-native';

// services
import LocationService from './LocationService';
import ApiService from './ApiService';
import AuthService from './AuthService';

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

export interface IRelationListUpdated {
  readonly relationList: Array<any>;
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
  readonly relationListUpdated?: (props: IRelationListUpdated) => Promise<void>;

}

export default class NodeService {
    public monitoring: boolean = false;

    private readonly props: IProps;
    private readonly configGlobal = ConfigGlobalLoader.config;

    private stopping: boolean = false;
    private checkNowTrigger: DeferredPromise;

    private locationService: LocationService;

    public static async doesRelationExist(userId: string) {
      let trackedRelations: any = await AsyncStorage.getItem('trackedRelations');
      if (trackedRelations !== null) {
          trackedRelations = JSON.parse(trackedRelations);
      } else {
          // @ts-ignore
          trackedRelations = {};
      }

      if (userId in trackedRelations) {
        Logger.info(`NodeService.doesRelationExist - currently tracked relations ${JSON.stringify(trackedRelations)}`);
        return true;
      }  else {
        return false;
      }
    }

    // Stores a new friend ID in async storage
    public static async storeRelation(userId: string, relationData: any) {

      let trackedRelations: any = await AsyncStorage.getItem('trackedRelations');
      if (trackedRelations !== null) {
          trackedRelations = JSON.parse(trackedRelations);
      } else {
          // @ts-ignore
          trackedRelations = {};
      }

      Logger.info(`NodeService.storeRelation - Current tracked relations: ${JSON.stringify(trackedRelations)}`);

      if (!(userId in trackedRelations)) {
          Logger.info(`NodeService.storeRelation - this is a new relation: ${JSON.stringify(trackedRelations)}`);

          trackedRelations[userId] = relationData;

          await AsyncStorage.setItem('trackedRelations', JSON.stringify(trackedRelations));
          Logger.info(`NodeService.storeRelation: now tracking ${JSON.stringify(trackedRelations)}`);

          return true;
      } else {
          Logger.info(`NodeService.storeRelation: you already are tracking this relation.`);

          return false;
      }
    }

     // Gets the relation object by friendId
     // @ts-ignore
     public static async getRelation(friendId: string) {

      let trackedRelations: any = await AsyncStorage.getItem('trackedRelations');
      if (trackedRelations !== null) {
          trackedRelations = JSON.parse(trackedRelations);
      } else {
          // @ts-ignore
          trackedRelations = {};
      }

      let foundRelation = undefined;

      // Loop through store relations and find the one w/ a matching friendID
      // in the relation object
      for (let property in trackedRelations) {
        if (trackedRelations.hasOwnProperty(property)) {
          let currentRelation = trackedRelations[property];

          console.log('THESE CURRENT RELATIONS', currentRelation);
          // If the friend ID matches, break & return
          if (currentRelation.their_id === friendId) {
            foundRelation = {
              'user': property,
              'relation': currentRelation,
            };
            break;
          }
        }
      }
      return foundRelation;
    }

    // Delete a relation from AsyncStorage
    public static async deleteRelation(userId: string) {
        let trackedRelations: any = await AsyncStorage.getItem('trackedRelations');
        if (trackedRelations !== null) {
          trackedRelations = JSON.parse(trackedRelations);
        } else {
          // @ts-ignore
          trackedRelations = {};
        }

        if ((userId in trackedRelations)) {
          Logger.info(`NodeService.deleteRelation - removed user: ${userId}`);

          // Remove the user from stored relations
          delete trackedRelations[userId];

          await AsyncStorage.setItem('trackedRelations', JSON.stringify(trackedRelations));
          Logger.info(`NodeService.storeRelation: now tracking ${JSON.stringify(trackedRelations)}`);

          return true;
      } else {
          Logger.info(`NodeService.deleteRelation: this relation does not exist`);

          return false;
      }
    }

    // Stores a new node in async storage
    public static async storeNode(newNodeId) {
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

    // Delete a node ID from async storage
    public static async deleteNode(nodeId) {
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

  public static async getRelations()  {
    // Load this here so we can remove relations from async that aren't in the cache anymore
    let trackedRelations: any = await AsyncStorage.getItem('trackedRelations');
    if (trackedRelations !== null) {
      trackedRelations = JSON.parse(trackedRelations);
    } else {
      trackedRelations = {};
    }

    let relationsToGet = [];

    for (let key in trackedRelations) {
        if (trackedRelations.hasOwnProperty(key)) {
          relationsToGet.push(trackedRelations[key].relation_id);
        }
    }

    Logger.trace(`ApiService.MonitorRelationsAsync - checking these relations ${JSON.stringify(relationsToGet)}`);

    let currentUUID = await AuthService.getUUID();
    // @ts-ignore
    let relations = undefined;
    try  {

      let requestBody = {
        'relations': relationsToGet,
        'user_id': currentUUID,
      };

      relations = await ApiService.getRelations(requestBody);
    } catch (error) {
      // Do nothing if this fails
    }

    let relationList = [];

    let modified = false;

    for (let key in relations) {
        if (relations.hasOwnProperty(key)) {

            if (relations[key].status === 'not_found') {
              Logger.info(`Cannot find relation ${key}, removing from storage.`);

              // TODO: make this make sense
              // What it's doing right now is going through the trackedRelations dict
              // by user UUID (of the rcpt) and then checking if the relation id matches
              // This should be just a map of user UUID : relation UUID so the loop can be
              // eliminated here
              for (let userId in trackedRelations) {
                if (trackedRelations.hasOwnProperty(userId)) {
                  if (trackedRelations[userId].relation_id === key) {
                    delete  trackedRelations[userId];
                    modified = true;
                  }
                }
              }
            }

            currentUUID = await AuthService.getUUID();

            // @ts-ignore
            let yourFriendId = undefined;
            let theirTopicName = undefined;
            let theirFriendId = undefined;
            let theirUUID = undefined;

            // Loop through member data in the relation to add detail to the relationList
            // This is used for formatting the flatList that stores the relations later
            for (let member in relations[key].member_data) {
              if (relations[key].member_data.hasOwnProperty(member)) {
                if (member === currentUUID) {
                  yourFriendId = relations[key].member_data[member].friend_id;
                } else {
                  theirFriendId = relations[key].member_data[member].friend_id;
                  theirTopicName = relations[key].member_data[member].topic;
                  theirUUID = member;
                }
              }
            }

            relations[key].relation_id = key;
            relations[key].their_friend_id = theirFriendId;
            relations[key].their_uuid = theirUUID;
            relations[key].your_friend_id = yourFriendId;
            relations[key].topic = theirTopicName;

            relationList.push(relations[key]);
        }
    }

    // If any relations were not found in the cache, update the tracked list
    if (modified) {
      await AsyncStorage.setItem('trackedRelations', JSON.stringify(trackedRelations));
    }

    return relationList;
  }

  constructor(props: IProps) {
        this.props = props;

        // Create services
        this.locationService = new LocationService({});

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
        this.MonitorRelationsAsync();
    }

    public CheckNow() {
        Logger.info('NodeService.CheckNow - updating the node list');
        this.checkNowTrigger.resolve();
    }

    public StopMonitoring() {
        this.stopping = true;
        Logger.info(`NodeService.StopMonitoring -  Disabling monitoring loop.`);
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

      // Monitors the cache for updates to the node list
      private async MonitorRelationsAsync() {
        while (true) {
            if (this.stopping) return;

            // Re-create the check-now trigger in case it was triggered last time
            this.checkNowTrigger = new DeferredPromise();

            let relationList = await NodeService.getRelations();
            await this.props.relationListUpdated({relationList: relationList});

            const sleepPromise = SleepUtil.SleepAsync(this.configGlobal.relationCheckIntervalMs);
            await Promise.race([ sleepPromise, this.checkNowTrigger ]);

            Logger.trace('NodeService.MonitorRelationsAsync - Looping around to check relations again');
        }
    }

    // Gets the current node list, which includes both public and tracked nodes
    private async GetNodeListAsync() {
      let nodes = undefined;

      try  {
        nodes = await ApiService.getNodes();
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
