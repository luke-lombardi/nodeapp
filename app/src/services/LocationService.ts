import Logger from './Logger';
// @ts-ignore
import SleepUtil from './SleepUtil';
// import ApiService from '../services/ApiService';
import NodeService from '../services/NodeService';

import { AsyncStorage } from 'react-native';
import geolib from 'geolib';

// @ts-ignore
interface IProps {
}

// Node object interfaces
interface NodeData {
  latitude: number;
  longitude: number;
  latDelta: string;
  longDelta: string;
  topic: string;
  distance_in_meters: number;
  distance_in_miles: number;
  bearing: number;
  rank: number;
  node_id: string;
  type: string;
  private: boolean;
  color: string;
  speed: number;
  ttl: number;
  status: string;
  total_messages: number;
  likes: any;
}

interface Node {
  node_id: string;
  data: NodeData;
}

// The location service monitors user position and calculates the distance to tracked/public nodes
export default class LocationService {
    // @ts-ignore
    private readonly props: IProps;

    constructor(props: IProps) {
        this.props = props;
        Logger.trace(`LocationService.constructor -  Initialized location service`);
    }

    public async orderNodes(userRegion: any, nodeList: any): Promise<any> {
      // TODO: have the API return a list as the response
      let nodeListArray = [];

      // Load this here so we can remove nodes from async that aren't in the cache anymore
      let trackedNodes = await AsyncStorage.getItem('trackedNodes');
      if (trackedNodes !== null) {
        trackedNodes = JSON.parse(trackedNodes);
      }

      let modified = false;

      for (let key in nodeList) {
          if (nodeList.hasOwnProperty(key)) {

              if (nodeList[key].status === 'not_found') {

                Logger.info(`Cannot find node ${key}, removing from storage.`);

                if (trackedNodes) {
                  let index = trackedNodes.indexOf(key);
                  if (index !== -1) {
                    // @ts-ignore
                    trackedNodes.splice(index, 1);
                    modified = true;
                  }
                }
                continue;
              } else if (nodeList[key].status === 'hidden') {
                Logger.info(`Node ${key}, is hidden.`);
                continue;
              }
              nodeList[key].node_id = key;
              nodeListArray.push( nodeList[key] );
          }
      }

      // If any nodes were not found in the cache, update the tracked list
      if (modified) {
        await AsyncStorage.setItem('trackedNodes', JSON.stringify(trackedNodes));
      }

      // Filter out nodes with invalid coords
      nodeListArray = nodeListArray.filter((val => isNaN(parseFloat(val.lat)) !== true));

      // @ts-ignore
      let newNodeList = nodeListArray.map((val, index, arr) => {
        let nodeCoords = { latitude: parseFloat(val.lat), longitude: parseFloat(val.lng) };

        if (val.status === 'inactive') {
          Logger.info(`Inactive: ${JSON.stringify(val)}`);
          nodeCoords.latitude = 0.0;
          nodeCoords.longitude = 0.0;
        }

        return nodeCoords;
      });

      let orderedList = undefined;
      try {
        orderedList = geolib.orderByDistance({latitude: userRegion.latitude, longitude: userRegion.longitude}, newNodeList);
      } catch (error) {
        Logger.error(`LocationService.orderNodes - error ordering nodes, returning: ${error}`);
        return {
          'publicPersonList': [],
          'publicPlaceList': [],
          'privatePersonList': [],
          'privatePlaceList': [],
          'friendList': [],
        };
      }

      let orderedPublicPersonList = [];
      let orderedPublicPlaceList = [];
      let orderedPrivatePersonList = [];
      let orderedPrivatePlaceList = [];
      let orderedTrackedNodeList = [];
      let orderedFriendList = [];

      for (let i = 0; i < orderedList.length; i++) {
        let key = orderedList[i].key;

        let milesToNode = geolib.convertUnit('mi', orderedList[i].distance);

        let currentNode: Node = {} as Node;
        currentNode.node_id = nodeListArray[key].node_id;
        currentNode.data = {} as NodeData;

        let bearing = 0.0;

        try {
          bearing = geolib.getBearing(
            { latitude: nodeListArray[key].lat, longitude: nodeListArray[key].lng },
            { latitude: userRegion.latitude, longitude: userRegion.longitude },
          );
        } catch (error) {
          Logger.info(`Unable to calculate bearing for node: ${JSON.stringify(currentNode)}`);
        }

        // Logger.info('Ordering node: ' + nodeListArray[key].title);
        // Logger.info('Figure out the bearing...');
        // Logger.info('Shortest path bearing:' + bearing.toString());

        // Logger.info('Your orientation:' + userRegion.bearing.toString());

        let arrowBearing = 0.0;
        if (userRegion.bearing == undefined) {
          // Logger.info('User orientation not defined, using shortest path vector.');
          arrowBearing = bearing;
        } else {
          // shift bearing by 180 degrees so it lines up with compass angles
          bearing = (bearing - 180);
          arrowBearing = (bearing - userRegion.bearing) * -1;

          // Logger.info('Adjusted shortest path bearing bearing:' + bearing.toString());
        }

        currentNode.data.latitude = nodeListArray[key].lat;
        currentNode.data.longitude = nodeListArray[key].lng;
        currentNode.data.latDelta = '0.000183';
        currentNode.data.longDelta = '0.000183';
        currentNode.data.topic = nodeListArray[key].topic;
        currentNode.data.ttl = nodeListArray[key].ttl;
        currentNode.data.distance_in_meters = orderedList[i].distance;
        currentNode.data.distance_in_miles = milesToNode;
        currentNode.data.bearing = arrowBearing;
        currentNode.data.rank = i;
        currentNode.data.node_id = nodeListArray[key].node_id;
        currentNode.data.private = nodeListArray[key].private;
        currentNode.data.type = nodeListArray[key].type;
        currentNode.data.color = nodeListArray[key].color;
        currentNode.data.status = nodeListArray[key].status;
        currentNode.data.total_messages = nodeListArray[key].total_messages;
        currentNode.data.likes = nodeListArray[key].likes;

        if (currentNode.data.type === 'person' && !currentNode.data.private) {
          orderedPublicPersonList.push(currentNode);
        } else if (currentNode.data.type === 'place' && !currentNode.data.private) {
          orderedPublicPlaceList.push(currentNode);
        } else if (currentNode.data.type === 'person' && currentNode.data.private) {
          orderedPrivatePersonList.push(currentNode);
        } else if (currentNode.data.type === 'place' && currentNode.data.private) {
          orderedPrivatePlaceList.push(currentNode);
        } else if (currentNode.data.type === 'friend') {
          orderedFriendList.push(currentNode);
        }

        if (await NodeService.nodeTracked(currentNode.node_id)
          && (currentNode.data.type !== 'person' && currentNode.data.type !== 'friend')) {
          orderedTrackedNodeList.push(currentNode);
        }

      }

      let nodes = {
        'publicPersonList': orderedPublicPersonList,
        'publicPlaceList': orderedPublicPlaceList,
        'privatePersonList': orderedPrivatePersonList,
        'privatePlaceList': orderedPrivatePlaceList,
        'trackedNodeList': orderedTrackedNodeList,
        'friendList': orderedFriendList,
      };

      return nodes;
    }

    // Private implementation functions

    // Async wrapper for getPosition
    // private async getCurrentPositonAsync(options: any) {
    //   return new Promise((resolve, reject) => {
    //     navigator.geolocation.getCurrentPosition(resolve, reject, options);
    //   });
    // }

}