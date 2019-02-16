import * as HttpStatus from 'http-status-codes';
import Logger from './Logger';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

// @ts-ignore
import { AsyncStorage } from 'react-native';

// @ts-ignore
interface IProps {
}

const configGlobal = ConfigGlobalLoader.config;
export default class ApiService {
    // @ts-ignore
    private readonly props: IProps;

    // Get all nodes, both private and public, and update the redux store
    public static async getNodes() {
     let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/getPublicNodes', {
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

      Logger.trace(`Fetching these nodes: ${JSON.stringify(nodesToGet)}`);
      response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/getNodes', {
          method: 'POST',
          headers: {'Content-Type': 'text/plain'},
          body: JSON.stringify(nodesToGet),
      });

      // TODO: add error handling here
      let nodeList = await response.json();
      return nodeList;
    }

    // Checks which local relations are still present in the cache
    public static async getRelations(requestBody) {
        Logger.trace(`Fetching these relations: ${JSON.stringify(requestBody)}`);

        let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/getRelations', {
            method: 'POST',
            headers: {'Content-Type': 'text/plain'},
            body: JSON.stringify(requestBody),
        });

        // TODO: add error handling here
        let relationList = await response.json();
        return relationList;
    }

    // Queries a specific relation
    public static async getRelation(requestBody) {
      Logger.info(`Fetching this relation: ${JSON.stringify(requestBody)}`);

      let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/getRelation', {
          method: 'POST',
          headers: {'Content-Type': 'text/plain'},
          body: JSON.stringify(requestBody),
      });

      // TODO: add error handling here
      let relation = await response.json();
      return relation;
  }

    // Creates a new node at the users position, this can be either public or private
    public static async CreateNodeAsync(nodeData: any) {
      let requestBody = {
        'node_data': nodeData,
      };

      let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/createNode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.CreateNodeAsync - Unable to get user info');
        Logger.info('ApiService.CreateNodeAsync - Minor change');
        return undefined;
      }

      let newNode = await response.json();
      return newNode;
    }

    // Invites a new friend
    public static async AddFriendAsync(inviteData: any) {
      let requestBody = inviteData;

      let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/addFriend', {
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
    public static async AcceptFriendAsync(inviteData: any) {
      let requestBody = inviteData;

      let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/acceptFriend', {
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

    // Deletes an existing friend
    public static async DeleteFriendAsync(requestBody: any) {

      let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/deleteFriend', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info(`ApiService.DeleteFriendAsync - Unable to delete friend: ${response.status}`);

        return undefined;
      }

      let result = await response.json();
      return result;
    }

    public static async ToggleLocationSharingAsync(requestBody: any) {

      let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/toggleLocationSharing', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info(`ApiService.ToggleLocationSharingAsync - Unable to toggle location sharing: ${response.status}`);

        return undefined;
      }

      let result = await response.json();
      return result;
    }

    // Updates the users location node
    public static async PostLocationAsync(nodeData: any) {
      let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/postNode', {
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
    public static async LikeNodeAsync(requestData: any) {
      let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/likeNode', {
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
    public static async PostMessageAsync(messageData: any) {
      let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/postMessage', {
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
    public static async GetMessagesAsync(requestBody: any) {
      Logger.trace(`ApiService.GetMessagesAsync - Getting messages for node: ${JSON.stringify(requestBody)}`);

      let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/getMessages', {
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

    // Shares a private node w/ a friend
    public static async ShareNodeAsync(requestData: any) {
      let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/sendPush', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.ShareNodeAsync - Unable to share node');

        return undefined;
      }

      response = await response.json();
      return response;
    }

    // ETH DENVER

    // Gets the tracked transactions
    public static async GetTransactionsAsync(requestBody: any) {
      let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/getTransactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.GetTransactionsAsync - Unable to get user transactions');

        return undefined;
      }

      response = await response.json();
      return response;
    }

    // Sends a transaction to another user / node
    public static async SendTransactionAsync(requestBody: any) {
      let response = await fetch(configGlobal.apiServicesUrlBase + configGlobal.apiStage + '/sendTransaction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

      if (response.status !== HttpStatus.OK) {
        Logger.info('ApiService.GetTransactionsAsync - Unable to send transaction');

        return undefined;
      }

      response = await response.json();
      return response;
    }

  }