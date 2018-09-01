import * as HttpStatus from 'http-status-codes';
import Logger from './Logger';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

// @ts-ignore
import { AsyncStorage } from 'react-native';

// @ts-ignore
interface IProps {
  readonly currentGroupList?: () => any;
}

export default class ApiService {
    // @ts-ignore
    private readonly props: IProps;
    private readonly configGlobal = ConfigGlobalLoader.config;

    constructor(props: IProps) {
        this.props = props;
        Logger.info(`ApiService.constructor -  Initialized api service`);

        this.getNodes = this.getNodes.bind(this);

    }

    // Get all nodes, both private and public, and update the redux store
    public async getNodes() {
     let response = await fetch(this.configGlobal.apiServicesUrlBase + '/dev/getPublicNodes', {
          method: 'GET',
      });

      // This response contains the public nodes currently available in the cache
      let responseBody = await response.json();

      // TODO: add error checking for bad requests here
      let publicNodes = JSON.parse(responseBody);

      // This gets the currently tracked private nodes in ASYNC storage
      let trackedNodes = await AsyncStorage.getItem('trackedNodes');

      Logger.info(`Fetching these public nodes: ${JSON.stringify(publicNodes)}`);

      let nodesToGet = {
        'node_ids': [],
      };

      // If we are tracking any nodes, add them to request body
      if (trackedNodes !== null) {
        trackedNodes = JSON.parse(trackedNodes);
        nodesToGet.node_ids = publicNodes.node_ids.concat(trackedNodes);
      } else {
        // If we aren't tracking any private nodes, then we'll just get the public nodes
        nodesToGet.node_ids = publicNodes.node_ids;
      }

     // If we are tracking any groups, get the member nodes as well
     let trackedGroups = await AsyncStorage.getItem('trackedGroups');

     if (trackedGroups !== null) {
       trackedGroups = JSON.parse(trackedGroups);
       let groupMembers = [];
       let groups = this.props.currentGroupList();

       if (groups) {
           // @ts-ignore
           groups.forEach(function (group, index) {
              groupMembers = groupMembers.concat(group.members);
              // console.log(groupMembers);
           });
        }
        nodesToGet.node_ids = nodesToGet.node_ids.concat(groupMembers);
      }

      Logger.info(`Fetching these nodes: ${JSON.stringify(nodesToGet)}`);
      response = await fetch(this.configGlobal.apiServicesUrlBase + '/dev/getNodes', {
          method: 'POST',
          headers: {'Content-Type': 'text/plain'},
          body: JSON.stringify(nodesToGet),
      });

      // TODO: add error handling here
      let nodeList = await response.json();
      return nodeList;
    }

    public async getFriends() {
      // This gets the currently tracked private friends in ASYNC storage
      let trackedFriends = await AsyncStorage.getItem('trackedFriends');

      // If we are tracking any nodes, add them to request body
      if (trackedFriends !== null) {
        trackedFriends = JSON.parse(trackedFriends);
        // @ts-ignore
      }

      Logger.info(`Fetching these friends: ${JSON.stringify(trackedFriends)}`);
      let response = await fetch(this.configGlobal.apiServicesUrlBase + '/dev/getGroups', {
          method: 'POST',
          headers: {'Content-Type': 'text/plain'},
          body: JSON.stringify(trackedFriends),
      });

      // TODO: add error handling here
      let friendList = await response.json();
      return friendList;
  }

    public async getGroups() {
        // This gets the currently tracked private groups in ASYNC storage
        let trackedGroups = await AsyncStorage.getItem('trackedGroups');

        let groupsToGet = {
          'group_ids': [],
        };

        // If we are tracking any nodes, add them to request body
        if (trackedGroups !== null) {
          trackedGroups = JSON.parse(trackedGroups);
          // @ts-ignore
          groupsToGet.group_ids = trackedGroups;
        }

        Logger.info(`Fetching these groups: ${JSON.stringify(groupsToGet)}`);
        let response = await fetch(this.configGlobal.apiServicesUrlBase + '/dev/getGroups', {
            method: 'POST',
            headers: {'Content-Type': 'text/plain'},
            body: JSON.stringify(groupsToGet),
        });

        // TODO: add error handling here
        let groupList = await response.json();
        return groupList;
    }

    // Creates a new node at the users position, this can be either public or private
    async CreateNodeAsync(nodeData: any) {
      let requestBody = {
        'node_data': nodeData,
      };

      let response = await fetch(this.configGlobal.apiServicesUrlBase + '/dev/createNode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.CreateNodeAsync - Unable to get user info');

        return undefined;
      }

      let newNode = await response.json();
      return newNode;
    }

      // Creates a new group
      async CreateGroupAsync(groupData: any) {
        let requestBody = groupData;

        let response = await fetch(this.configGlobal.apiServicesUrlBase + '/dev/createGroup', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            });

        if (response.status !== HttpStatus.OK) {
          Logger.info('ApiService.CreateGroupAsync - Unable to get user info');

          return undefined;
        }

        let newGroup = await response.json();
        return newGroup;
    }

    // Updates an existing group
    async UpdateGroupAsync(groupData: any) {
      let requestBody = groupData;

      let response = await fetch(this.configGlobal.apiServicesUrlBase + '/dev/updateGroup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.UpdateGroupAsync - Unable to get group data');

        return undefined;
      }

      let newGroupData = await response.json();
      return newGroupData;
  }

  // Deletes an existing group
    async DeleteGroupAsync(groupData: any) {
      let requestBody = groupData;

      let response = await fetch(this.configGlobal.apiServicesUrlBase + '/dev/deleteGroup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.CreateGroupAsync - Unable to get user info');

        return undefined;
      }

      let result = await response.json();
      return result;
    }

    // Creates a new group
    async JoinGroupAsync(groupData: any) {
      let requestBody = groupData;

      let response = await fetch(this.configGlobal.apiServicesUrlBase + '/dev/joinGroup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.CreateGroupAsync - Unable to get user info');

        return undefined;
      }

      let newGroup = await response.json();
      return newGroup;
  }

    // Creates a new group
    async AddFriendAsync(inviteData: any) {
      let requestBody = inviteData;

      let response = await fetch(this.configGlobal.apiServicesUrlBase + '/dev/addFriend', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.AddFriendAsync - Unable to add friend');

        return undefined;
      }

      let newRelation = await response.json();
      return newRelation;
    }

    // Creates a new group
    async AcceptFriendAsync(inviteData: any) {
      let requestBody = inviteData;

      let response = await fetch(this.configGlobal.apiServicesUrlBase + '/dev/acceptFriend', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.AcceptFriendAsync - Unable to accept friend request');

        return undefined;
      }

      let newRelation = await response.json();
      return newRelation;
    }

    // Updates the users location node
    async PostLocationAsync(nodeData: any) {
      let response = await fetch(this.configGlobal.apiServicesUrlBase + '/dev/postNode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(nodeData),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.CreateNodeAsync - Unable to get user info');

        return undefined;
      }

      response = await response.json();
      return response;
    }

    // Sends a text to add a friend or share a node
    async sendText(contactInfo: any) {
      let requestBody = {
        'contact_info': contactInfo,
      };

      let response = await fetch(this.configGlobal.apiServicesUrlBase + '/dev/sendText', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.sendText - Unable to send text');
        console.log('could not send text', response);
        return undefined;
      }

      let result = await response.json();
      console.log('successfully sent text', response);
      return result;
    }

  }