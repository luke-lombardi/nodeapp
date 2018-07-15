// import * as HttpStatus from 'http-status-codes';
import Logger from './Logger';
// import SleepUtil from './SleepUtil';
// import DeferredPromise from './DeferredPromise';

import geolib from 'geolib';


// @ts-ignore
interface IProps {
}

export default class NodeService{
    // @ts-ignore
    private readonly props: IProps;

    constructor(props: IProps){
        this.props = props;
        Logger.info(`LocationService.constructor -  Initialized location service`);
    }

    orderNodes(userRegion: any, nodeList: any): any{
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
        currentNode['data'].created_at = nodeList[key].created_at;
        currentNode['data'].difficulty = nodeList[key].difficulty;
        currentNode['data'].status = nodeList[key].status;
        currentNode['data'].user_id = nodeList[key].user_id;
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