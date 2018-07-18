// import * as HttpStatus from 'http-status-codes';
import Logger from './Logger';
import SleepUtil from './SleepUtil';

import geolib from 'geolib';

export interface IUserPositionChanged {
  readonly userRegion: any;
}

// @ts-ignore
interface IProps {
  readonly userPositionChanged?: (props: IUserPositionChanged) => Promise<void>;
}

export default class NodeService{
    // @ts-ignore
    private readonly props: IProps;

    constructor(props: IProps){
        this.props = props;
        Logger.info(`LocationService.constructor -  Initialized location service`);
    }

    private async getCurrentPositonAsync(options: any){
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    }

    public async StartMonitoring(){
      while(true){
        let options = { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        let position = await this.getCurrentPositonAsync(options);
        
        let userRegion = {
              // @ts-ignore
              latitude:       position.coords.latitude,
              // @ts-ignore
              longitude:      position.coords.longitude,
              latitudeDelta:  0.00122*1.5,
              longitudeDelta: 0.00121*1.5,
              // @ts-ignore
              bearing: position.coords.heading
        }

          await this.props.userPositionChanged({userRegion: userRegion});

          await SleepUtil.SleepAsync(1000);
      }
    }
    

    orderNodes(userRegion: any, nodeList: any): any{
      console.log('ORDERING THIS NODE LIST');
      console.log(nodeList);

      // @ts-ignore
      let newNodeList = nodeList.map((val, index, arr) => {
        return { latitude: parseFloat(val.lat), longitude: parseFloat(val.long)}
      });

      let orderedList = geolib.orderByDistance({latitude: userRegion.latitude, longitude: userRegion.longitude}, newNodeList);
      
      let orderedNodeList = [];

      for(let i=0;i<orderedList.length;i++){
        let key = orderedList[i].key;
        let milesToNode = geolib.convertUnit('mi', orderedList[i].distance)
        let currentNodeId = nodeList[key].node_id;
        
        let currentNode = {};
        currentNode['id'] = currentNodeId.toString();
        currentNode['data'] = {};

        let testBearing = geolib.getBearing(
          {latitude: nodeList[key].lat, longitude: nodeList[key].long}, 
          {latitude: userRegion.latitude, longitude: userRegion.longitude}
        );
        
        console.log(userRegion);
        
        currentNode['data'].latitude = nodeList[key].lat;
        currentNode['data'].longitude = nodeList[key].long;
        currentNode['data'].latDelta = nodeList[key].lat_delta;
        currentNode['data'].longDelta = nodeList[key].long_delta;
        currentNode['data'].title = nodeList[key].title;
        currentNode['data'].description = nodeList[key].description;
        currentNode['data'].distance_in_meters = orderedList[i].distance;
        currentNode['data'].distance_in_miles = milesToNode;
        currentNode['data'].bearing = testBearing - userRegion.bearing;
        currentNode['data'].rank = i;

        console.log('TEST BEARING');
        console.log(testBearing - userRegion.bearing);
        console.log(userRegion);
        orderedNodeList.push(currentNode);
      }

      console.log(orderedNodeList);

   

      return orderedNodeList;
      //return nodeList;
    }

    




}