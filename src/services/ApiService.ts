import * as HttpStatus from 'http-status-codes';
import Logger from './Logger';
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

    private async getIdToken(){
      let idToken = await AsyncStorage.getItem('idToken');
      return idToken;
    }

    public async getVisitedNodes(){
      let idToken = await this.getIdToken();

      let response = await fetch('https://mlbrfh44gb.execute-api.us-east-1.amazonaws.com/staging/getVisitedNodes', {
        method: 'GET',
        headers: {
          'Authorization': idToken
        },
        body: null
      }); 

      if(response.status != HttpStatus.OK){
        Logger.info('NodeService.GetNodeListAsync - Unable to fetch visited node list');
        return undefined;
      }

      let nodeList = await response.json();
      return nodeList;
    }

    public async getNodes(){

      let storedChallengeSettings = await AsyncStorage.getItem('challengeSettings');
      let challengeId: string = "0";

      if(storedChallengeSettings != null){
        let settings: any = JSON.parse(storedChallengeSettings);
        challengeId = settings.challenge_id.toString()
      }

      if(challengeId == "0"){
        return undefined;
      }

      console.log('USING THIS CHALLENGE ID: ' + challengeId);

      let response = await fetch('https://mlbrfh44gb.execute-api.us-east-1.amazonaws.com/staging/listNodes?challenge_id=' + challengeId, {
        method: 'GET',
        headers: null,
        body: null
      }); 

      if(response.status != HttpStatus.OK){
        Logger.info('NodeService.GetNodeListAsync - Unable to fetch node list');
        return undefined;
      }

      let nodeList = await response.json();
      return nodeList;
    }
                                                                          
    async visitNode(nodeId: string) {
      let storedChallengeSettings = await AsyncStorage.getItem('challengeSettings');
      let challengeId: string = "0";

      if(storedChallengeSettings != null){
        let settings: any = JSON.parse(storedChallengeSettings);
        challengeId = settings.challenge_id.toString()
      }

      if(challengeId == "0"){
        return undefined;
      }

      let idToken = await AsyncStorage.getItem('idToken');

      let response = await fetch('https://mlbrfh44gb.execute-api.us-east-1.amazonaws.com/staging/visitNode?challenge_id=' + challengeId + '&node_id=' + nodeId, {
              method: 'GET',
              headers: {
                'Authorization': idToken
              },
              body: null
            }); 
        if(response.status != HttpStatus.OK){
              console.log('error');
              return undefined;
        }

        let returnedNodeData = await response.json(); 
        return returnedNodeData;
      }
  
      async rateNode(nodeId: string, userRating: number) {
        let storedChallengeSettings = await AsyncStorage.getItem('challengeSettings');
        let challengeId: string = "0";

        if(storedChallengeSettings != null){
          let settings: any = JSON.parse(storedChallengeSettings);
          challengeId = settings.challenge_id.toString()
        }
  
        if(challengeId == "0"){
          return undefined;
        }
  
        let idToken = await AsyncStorage.getItem('idToken');
  
        let response = await fetch('https://mlbrfh44gb.execute-api.us-east-1.amazonaws.com/staging/rateNode?challenge_id=' + challengeId + '&node_id=' + nodeId + '&user_rating=' + userRating, {
                method: 'GET',
                headers: {
                  'Authorization': idToken
                },
                body: null
              }); 
          if(response.status != HttpStatus.OK){
                console.log('error');
                return undefined;
          }
  
          let returnedNodeData = await response.json(); 
          return returnedNodeData;
    }
    

    async GetUserInfoAsync() {
      let idToken = await AsyncStorage.getItem('idToken');
      let response = await fetch('https://mlbrfh44gb.execute-api.us-east-1.amazonaws.com/staging/getUserInfo', {
            method: 'GET',
            headers: {
              'Authorization': idToken
            },
            body: null
          }); 
      
      if(response.status != HttpStatus.OK){
        Logger.info('ApiService.GetUserInfoAsync - Unable to get user info');

        return undefined;
      }
      let userInfo = await response.json(); 
      return userInfo;
    }
   
    /*

    */
    async CreateNodeAsync(requestBody: any) {
      //title=test&description=some+description&challenge_id=280&lat=42.640266&long=-74.079053&lat_delta=0.001&long_delta=0.001&user_id=1&difficulty=0
      let idToken = await AsyncStorage.getItem('idToken');

      requestBody.user_id = 1;

      let response = await fetch('https://mlbrfh44gb.execute-api.us-east-1.amazonaws.com/staging/createNode', {
            method: 'POST',
            headers: {
              'Authorization': idToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          }); 
      
      if(response.status != HttpStatus.OK){
        Logger.info('ApiService.CreateNodeAsync - Unable to get user info');

        return undefined;
      }
      let nodeInfo = await response.json(); 
      return nodeInfo;
    }


    async challengeSettings(){
      let response = await fetch('https://mlbrfh44gb.execute-api.us-east-1.amazonaws.com/staging/getSettings', {
            method: 'GET',
            headers: {
            },
            body: null
          }); 
      
      if(response.status != HttpStatus.OK){
        Logger.info('ApiService.GetChallengeSettingsAsync - Unable to get challenge settings');

        return undefined;
      }

      let challengeSettings = await response.json(); 
      return challengeSettings;
    }

    async checkSticker(uuid: string){
      let idToken = await AsyncStorage.getItem('idToken');

      console.log('USING UUID: ' + uuid);
      let response = await fetch('https://mlbrfh44gb.execute-api.us-east-1.amazonaws.com/staging/checkSticker?uuid='+uuid, {
        method: 'GET',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        },
        body: null
      }); 
  
      if(response.status != HttpStatus.OK){
        Logger.info('ApiService.checkSticker - Unable to verify sticker');

        return undefined;
      }

      let stickerDetails = null;

      try{
        stickerDetails = await response.json();
      }
      catch(error){
        ;
      }

      return stickerDetails;
    }


}
