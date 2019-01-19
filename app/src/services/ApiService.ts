import * as HttpStatus from 'http-status-codes';
import Logger from './Logger';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

// @ts-ignore
import { AsyncStorage } from 'react-native';

// @ts-ignore
interface IProps {
}

export default class ApiService {
    // @ts-ignore
    private readonly props: IProps;
    private readonly configGlobal = ConfigGlobalLoader.config;

    constructor(props: IProps) {
        this.props = props;
        Logger.trace(`ApiService.constructor -  Initialized api service`);

        this.getNodes = this.getNodes.bind(this);
    }

    // Get all nodes, both private and public, and update the redux store
    public async getNodes() {
     let response = await fetch(this.configGlobal.apiServicesUrlBase + this.configGlobal.apiStage + '/getPublicNodes', {
          method: 'GET',
      });

      // This response contains the public nodes currently available in the cache
      let responseBody = await response.json();

      // TODO: add error checking for bad requests here
      let publicNodes = JSON.parse(responseBody);

      // This gets the currently tracked private nodes in ASYNC storage
      let trackedNodes = await AsyncStorage.getItem('trackedNodes');

      // Logger.info(`Fetching these public nodes: ${JSON.stringify(publicNodes)}`);

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

      Logger.info(`Fetching these nodes: ${JSON.stringify(nodesToGet)}`);
      response = await fetch(this.configGlobal.apiServicesUrlBase + this.configGlobal.apiStage + '/getNodes', {
          method: 'POST',
          headers: {'Content-Type': 'text/plain'},
          body: JSON.stringify(nodesToGet),
      });

      // TODO: add error handling here
      let nodeList = await response.json();
      console.log(nodeList);
      return nodeList;
    }

    // Creates a new node at the users position, this can be either public or private
    async CreateNodeAsync(nodeData: any) {
      let requestBody = {
        'node_data': nodeData,
      };

      let response = await fetch(this.configGlobal.apiServicesUrlBase + this.configGlobal.apiStage + '/createNode', {
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

    // Invites a new friend
    async AddFriendAsync(inviteData: any) {
      let requestBody = inviteData;

      let response = await fetch(this.configGlobal.apiServicesUrlBase + this.configGlobal.apiStage + '/addFriend', {
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

    // Accepts a friend request
    async AcceptFriendAsync(inviteData: any) {
      let requestBody = inviteData;

      let response = await fetch(this.configGlobal.apiServicesUrlBase + this.configGlobal.apiStage + '/acceptFriend', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info(`ApiService.AcceptFriendAsync - Unable to accept friend request: ${response.status}`);

        return undefined;
      }

      let newRelation = await response.json();
      return newRelation;
    }

    // Updates the users location node
    async PostLocationAsync(nodeData: any) {
      let response = await fetch(this.configGlobal.apiServicesUrlBase + this.configGlobal.apiStage + '/postNode', {
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

    // Toggles the users 'like status' of a node
    async LikeNodeAsync(requestData: any) {
      let response = await fetch(this.configGlobal.apiServicesUrlBase + this.configGlobal.apiStage + '/likeNode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.CreateNodeAsync - Unable to get user info');

        return undefined;
      }

      response = await response.json();
      return response;
    }

    // Posts a new message to a node
    async PostMessageAsync(messageData: any) {
      let response = await fetch(this.configGlobal.apiServicesUrlBase + this.configGlobal.apiStage + '/postMessage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.CreateNodeAsync - Unable to get user info');

        return undefined;
      }

      response = await response.json();
      return response;
    }

    // Posts a new message to a node
    async GetMessagesAsync(requestBody: any) {
      Logger.info(`ApiService.GetMessagesAsync - Getting messages for node: ${JSON.stringify(requestBody)}`);

      let response = await fetch(this.configGlobal.apiServicesUrlBase + this.configGlobal.apiStage + '/getMessages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.GetMessagesAsync - Unable to get messages');

        return undefined;
      }

      response = await response.json();
      return response;
    }

  }