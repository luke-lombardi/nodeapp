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

        // @ts-ignore
        console.log(position.coords);
        console.log('COORDS');

        console.log('USER BEARING');
        console.log(userRegion.bearing);

        await this.props.userPositionChanged({userRegion: userRegion});
        await SleepUtil.SleepAsync(1000);
      }
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

        let testBearing = geolib.getBearing(
          {latitude: nodeListArray[key].lat, longitude: nodeListArray[key].lng}, 
          {latitude: userRegion.latitude, longitude: userRegion.longitude}
        );

        // console.log('TEST BEARING: ');
        // console.log(testBearing);
        
        // console.log(userRegion);
        
        currentNode['data'].latitude = nodeListArray[key].lat;
        currentNode['data'].longitude = nodeListArray[key].lng;
        currentNode['data'].latDelta = '0.000183';
        currentNode['data'].longDelta = '0.000183';
        currentNode['data'].title = nodeListArray[key].title;
        currentNode['data'].description = nodeListArray[key].description;
        currentNode['data'].distance_in_meters = orderedList[i].distance;
        currentNode['data'].distance_in_miles = milesToNode;
        currentNode['data'].bearing = testBearing;
        currentNode['data'].rank = i;
        currentNode['data'].node_id = nodeListArray[key].node_id;

        orderedNodeList.push(currentNode);
      }

      return orderedNodeList;
      //return nodeList;
    }

}