import * as HttpStatus from 'http-status-codes';
import Logger from './Logger';
// @ts-ignore
import { AsyncStorage } from 'react-native';

export interface IVisitedNodesUpdated {
  readonly nodeList: Array<any>;
}

// @ts-ignore
interface IProps {
}

export default class ApiService { 
    // @ts-ignore
    private readonly props: IProps;

    constructor(props: IProps){
        this.props = props;
        Logger.info(`ApiService.constructor -  Initialized api service`);
    }

    public async getNodes(){
      // TODO: get this pin list from AsyncStorage
      let trackedNodes = {
        "pins": [12345]
      }

      let response = await fetch('https://jwrp1u6t8e.execute-api.us-east-1.amazonaws.com/dev/getNodes', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(trackedNodes)
      }); 

      if(response.status != HttpStatus.OK){
        Logger.info('NodeService.GetNodeListAsync - Unable to fetch node list');
        return undefined;
      }

      let nodeList = await response.json();
      return nodeList;
    }
                                                                          
   
    async CreateNodeAsync(requestBody: any) {
      let response = await fetch('https://jwrp1u6t8e.execute-api.us-east-1.amazonaws.com/dev/createNode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          }); 
      
      if(response.status != HttpStatus.OK){
        Logger.info('ApiService.CreateNodeAsync - Unable to get user info');

        return undefined;
      }
      let nodePin = await response.json(); 
      return nodePin;
    }
  

}
