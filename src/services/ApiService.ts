import * as HttpStatus from 'http-status-codes';
import Logger from './Logger';
// @ts-ignore
import { AsyncStorage } from 'react-native';

// @ts-ignore
interface IProps {
}

export default class ApiService {
    // @ts-ignore
    private readonly props: IProps;

    constructor(props: IProps) {
        this.props = props;
        Logger.info(`ApiService.constructor -  Initialized api service`);
    }

    // Get all nodes, both private and public, and update the redux store
    public async getNodes() {
     let response = await fetch('https://jwrp1u6t8e.execute-api.us-east-1.amazonaws.com/dev/getPublicNodes', {
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

      Logger.info(`Fetching these nodes: ${JSON.stringify(nodesToGet)}`);
      response = await fetch('https://jwrp1u6t8e.execute-api.us-east-1.amazonaws.com/dev/getNodes', {
          method: 'POST',
          headers: {'Content-Type': 'text/plain'},
          body: JSON.stringify(nodesToGet),
      });

      // TODO: add error handling here
      let nodeList = await response.json();
      return nodeList;
    }

    // Creates a new node at the users position, this can be either public or private
    async CreateNodeAsync(nodeData: any) {
      let requestBody = {
        'node_data': nodeData,
      };

      let response = await fetch('https://jwrp1u6t8e.execute-api.us-east-1.amazonaws.com/dev/createNode', {
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
        let requestBody = {
          'group_data': groupData,
        };

        let response = await fetch('https://jwrp1u6t8e.execute-api.us-east-1.amazonaws.com/dev/createGroup', {
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

    // Updates the users location node
    async PostLocationAsync(nodeData: any) {
      let response = await fetch('https://jwrp1u6t8e.execute-api.us-east-1.amazonaws.com/dev/postNode', {
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

    async sendText(contactInfo: any) {
      let requestBody = {
        'contact_info': contactInfo,
      };

      let response = await fetch('https://jwrp1u6t8e.execute-api.us-east-1.amazonaws.com/dev/sendText', {
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