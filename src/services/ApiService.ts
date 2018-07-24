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
      /*
      // TODO: get this pin list from AsyncStorage
      let trackedNodes = {
        "pins": [16313]
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
      */

     let response = await fetch('https://jwrp1u6t8e.execute-api.us-east-1.amazonaws.com/dev/getAllNodes', {
          method: 'GET'
      }); 

      let responseBody = await response.json();
      let requestBody = JSON.parse(responseBody);
      
      // console.log(requestBody);
      // console.log(JSON.stringify(requestBody));

      response = await fetch('https://jwrp1u6t8e.execute-api.us-east-1.amazonaws.com/dev/getNodes', {
          method: 'POST',
          headers: {'Content-Type': 'text/plain'},
          body: JSON.stringify(requestBody)
      }); 

      let nodeList = await response.json();

      return nodeList;
    }
                                                                          
   
    async CreateNodeAsync(node_data: any) {
      let response = await fetch('https://jwrp1u6t8e.execute-api.us-east-1.amazonaws.com/dev/createNode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(node_data)
          }); 
      
      if(response.status != HttpStatus.OK){
        Logger.info('ApiService.CreateNodeAsync - Unable to get user info');

        return undefined;
      }
      let nodePin = await response.json(); 
      return nodePin;
    }


    async PostNodeAsync(node_data: any) {
      let response = await fetch('https://jwrp1u6t8e.execute-api.us-east-1.amazonaws.com/dev/postNode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(node_data)
          }); 
      
      if(response.status != HttpStatus.OK){
        Logger.info('ApiService.CreateNodeAsync - Unable to get user info');

        return undefined;
      }
      
      response = await response.json(); 
      return response;
    }
  


    async sendText(contact_info: any) {

      console.log('got contact info', contact_info)

      let response = await fetch('https://jwrp1u6t8e.execute-api.us-east-1.amazonaws.com/dev/sendText', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(contact_info)
          }); 
      
      if(response.status != HttpStatus.OK){
        Logger.info('ApiService.sendText - Unable to send text');

        return undefined;
      }
      let node_id = await response.json(); 
      return node_id;
    }
}

