import Logger from './Logger';
import SleepUtil from './SleepUtil';
import ApiService from '../services/ApiService';
import { AsyncStorage } from 'react-native';
import RNSimpleCompass from 'react-native-simple-compass';
import geolib from 'geolib';

export interface IUserPositionChanged {
  readonly userRegion: any;
}

// @ts-ignore
interface IProps {
  readonly userPositionChanged?: (props: IUserPositionChanged) => Promise<void>;
}

// Node object interfaces
interface NodeData {
  latitude: number;
  longitude: number;
  latDelta: string;
  longDelta: string;
  title: string;
  description: string;
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
}

interface Node {
  node_id: string;
  data: NodeData;
}

// The location service monitors user position and calculates the distance to tracked/public nodes
export default class LocationService {
    // @ts-ignore
    private readonly props: IProps;
    private apiService: ApiService;
    private bearing: number;

    constructor(props: IProps) {
        this.props = props;
        Logger.info(`LocationService.constructor -  Initialized location service`);

        this.updateBearing = this.updateBearing.bind(this);
        this.StartMonitoring = this.StartMonitoring.bind(this);
        this.apiService = new ApiService({});
    }

    public async StartMonitoring() {
      const degreeUpdateRate = 1; // Number of degrees changed before the callback is triggered
      RNSimpleCompass.start(degreeUpdateRate, this.updateBearing);
      let hitCount = 0;

      while (true) {
        let options = { enableHighAccuracy: true, timeout: 1000, maximumAge: 100 };
        let position = await this.getCurrentPositonAsync(options);
        let userRegion = {
              // @ts-ignore
              latitude:       position.coords.latitude,
              // @ts-ignore
              longitude:      position.coords.longitude,
              // @ts-ignore
              speed:          position.coords.speed,
              latitudeDelta:  0.00122 * 1.5,
              longitudeDelta: 0.00121 * 1.5,
              // @ts-ignore
              bearing: this.bearing,
        };

        await this.props.userPositionChanged({userRegion: userRegion});

        if (hitCount >= 10) {
          await this.postLocation(userRegion);
          hitCount = 0;
        }

        await SleepUtil.SleepAsync(1000);
        hitCount += 1;
        RNSimpleCompass.stop();

     }
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
              }
              nodeList[key].node_id = key;
              nodeListArray.push( nodeList[key] );
          }
      }

      // If any nodes were not found in the cache, update the tracked list
      if (modified) {
        await AsyncStorage.setItem('trackedNodes', JSON.stringify(trackedNodes));
      }

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

      let orderedList = geolib.orderByDistance({latitude: userRegion.latitude, longitude: userRegion.longitude}, newNodeList);

      let orderedPublicPersonList = [];
      let orderedPublicPlaceList = [];
      let orderedPrivatePersonList = [];
      let orderedPrivatePlaceList = [];
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
          Logger.info('User orientation not defined, using shortest path vector.');
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
        currentNode.data.title = nodeListArray[key].title;
        currentNode.data.description = nodeListArray[key].description;
        currentNode.data.ttl = nodeListArray[key].ttl;
        currentNode.data.distance_in_meters = orderedList[i].distance;
        currentNode.data.distance_in_miles = milesToNode;
        currentNode.data.bearing = arrowBearing;
        currentNode.data.rank = i;
        currentNode.data.node_id = nodeListArray[key].node_id;
        currentNode.data.private = nodeListArray[key].private;
        currentNode.data.type = nodeListArray[key].type;
        currentNode.data.color = nodeListArray[key].color;

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

      }

      let nodes = {
        'publicPersonList': orderedPublicPersonList,
        'publicPlaceList': orderedPublicPlaceList,
        'privatePersonList': orderedPrivatePersonList,
        'privatePlaceList': orderedPrivatePlaceList,
        'friendList': orderedFriendList,
      };

      return nodes;
    }

    // Private implementation functions

    private async updateBearing(degree) {
      this.bearing = degree;
    }

    // Async wrapper for getPosition
    private async getCurrentPositonAsync(options: any) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    }

    // Sends the users current position to the cache
    private async postLocation(userRegion: any): Promise<any> {
      let currentUUID = await AsyncStorage.getItem('user_uuid');
      if (currentUUID === undefined) {
        Logger.info('LocationService.postLocation - No UUID is defined, not posting location.');
        return ;
      }

      let requestBody = {
        'node_id': currentUUID,
        'node_data': {
          'lat': userRegion.latitude,
          'lng': userRegion.longitude,
          'title': 'test',
          'description': 'test2',
          'public': false,
          'type': 'person',
        },
      };

      let response = await this.apiService.PostLocationAsync(requestBody);

      // console.log('RESPONSE FROM POST LOCATION');
      // console.log(response);
      return response;
    }

}