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

export default class LocationService {
    // @ts-ignore
    private readonly props: IProps;
    private apiService: ApiService;

    private bearing: number;

    constructor(props: IProps){
        this.props = props;
        Logger.info(`LocationService.constructor -  Initialized location service`);

        this.updateBearing = this.updateBearing.bind(this);
        this.StartMonitoring = this.StartMonitoring.bind(this);
        this.apiService = new ApiService({});
    }

    private async updateBearing(degree){
      this.bearing = degree;
    }

    private async getCurrentPositonAsync(options: any){
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    }

    public async StartMonitoring(){
      const degree_update_rate = 1; // Number of degrees changed before the callback is triggered
      RNSimpleCompass.start(degree_update_rate, this.updateBearing);
      
      let hitCount = 0;

      while(true){

        let options = { enableHighAccuracy: true, timeout: 1000, maximumAge: 100 }
        let position = await this.getCurrentPositonAsync(options);
        
        let userRegion = {
              // @ts-ignore
              latitude:       position.coords.latitude,
              // @ts-ignore
              longitude:      position.coords.longitude,
              latitudeDelta:  0.00122*1.5,
              longitudeDelta: 0.00121*1.5,
              // @ts-ignore
              bearing: this.bearing
        }

        await this.props.userPositionChanged({userRegion: userRegion});

        if(hitCount >= 10){
          await this.postLocation(userRegion);
          hitCount = 0;
        }

        await SleepUtil.SleepAsync(100);
        hitCount += 1;
      }

      RNSimpleCompass.stop();
    }
    

    private async postLocation(userRegion: any){
      let currentUUID = await AsyncStorage.getItem('user_uuid');
      if(currentUUID === undefined){
        Logger.info('LocationService.postLocation - No UUID is defined, not posting location.')
      }

      let requestBody = {
        "node_id": currentUUID,
        "node_data": {
          "lat": userRegion.latitude,
          "lng": userRegion.longitude,
          "title": "test",
          "description": "test2"
        }
      }

      let response = await this.apiService.PostNodeAsync(requestBody);

      console.log('RESPONSE');
      console.log(response);
    }


    orderNodes(userRegion: any, nodeList: any): any{
      // TODO: have the API return a list as the response
      let nodeListArray = [];

      for (var key in nodeList) {
          if (nodeList.hasOwnProperty(key)) {
              nodeList[key]['node_id'] = key;
              nodeListArray.push( nodeList[key] );
          }
      }

      // @ts-ignore
      let newNodeList = nodeListArray.map((val, index, arr) => {
        return { latitude: parseFloat(val.lat), longitude: parseFloat(val.lng)}
      });

      let orderedList = geolib.orderByDistance({latitude: userRegion.latitude, longitude: userRegion.longitude}, newNodeList);
      let orderedNodeList = [];

      for(let i=0;i<orderedList.length;i++){
        let key = orderedList[i].key;

        let milesToNode = geolib.convertUnit('mi', orderedList[i].distance)
        
        let currentNode = {};
        currentNode['node_id'] = nodeListArray[key].node_id;
        currentNode['data'] = {};

        let bearing = geolib.getBearing(
          {latitude: nodeListArray[key].lat, longitude: nodeListArray[key].lng}, 
          {latitude: userRegion.latitude, longitude: userRegion.longitude}
        );

        Logger.info('NODE: ' + nodeListArray[key].title);
        Logger.info('Figure out the bearing...');
        Logger.info('Shortest path bearing:' + bearing.toString());
        Logger.info('Your orientation:' + userRegion.bearing.toString());

        let arrowBearing = 0.0;
        if(userRegion.bearing == undefined){
          Logger.info('User orientation not defined, using shortest path vector.');
          arrowBearing = bearing;
        }
        else{
          // shift bearing by 180 degrees so it lines up with compass angles
          bearing = (bearing - 180);
          arrowBearing = (bearing - userRegion.bearing) * -1; 

          Logger.info('Adjusted shortest path bearing bearing:' + bearing.toString());
        }

        currentNode['data'].latitude = nodeListArray[key].lat;
        currentNode['data'].longitude = nodeListArray[key].lng;
        currentNode['data'].latDelta = '0.000183';
        currentNode['data'].longDelta = '0.000183';
        currentNode['data'].title = nodeListArray[key].title;
        currentNode['data'].description = nodeListArray[key].description;
        currentNode['data'].distance_in_meters = orderedList[i].distance;
        currentNode['data'].distance_in_miles = milesToNode;
        currentNode['data'].bearing = arrowBearing;
        currentNode['data'].rank = i;
        currentNode['data'].node_id = nodeListArray[key].node_id;

        orderedNodeList.push(currentNode);
      }

      return orderedNodeList;
      //return nodeList;
    }

}