import Logger from './Logger';
import { AsyncStorage } from 'react-native';

import ApiService from './ApiService';


export interface IUserLoggedIn {
  readonly loggedIn: boolean;
}


// @ts-ignore
interface IProps {
  readonly userLoggedIn?: (props: IUserLoggedIn) => Promise<void>;
  readonly navigateToScreen: any;
}

export default class AuthService { 
    // @ts-ignore
    private readonly props: IProps;
    private apiService: ApiService;


    constructor(props: IProps){
        this.props = props;

        this.apiService = new ApiService({});
        Logger.info(`AuthService.constructor -  Initialized auth service`);
    }

    // @ts-ignore
    private async getIdToken(){
      let idToken = await AsyncStorage.getItem('idToken');
      return idToken;
    }

    async storeSession(result: any): Promise<boolean> {
      console.log('Access token + ' + result.getAccessToken().getJwtToken());
      console.log(result.getIdToken().getJwtToken())
  
      await AsyncStorage.setItem('session', JSON.stringify(result));
      await AsyncStorage.setItem('idToken', result.getIdToken().getJwtToken());
  
      let userInfo = await this.apiService.GetUserInfoAsync();
      if(userInfo){
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        await this.props.userLoggedIn({loggedIn: true});
        return true;
      }
      else{
        await this.props.userLoggedIn({loggedIn: false});
        return false;
      }
  

    }

    async clearSession(){
      await AsyncStorage.removeItem('session');
      await AsyncStorage.removeItem('idToken');  
      await AsyncStorage.removeItem('userInfo');
      
      Logger.info('AuthService.clearSession - removed user session');

      await this.props.userLoggedIn({loggedIn: false});
      
      this.props.navigateToScreen('Map');
    }
  



}