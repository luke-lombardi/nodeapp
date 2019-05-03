// @ts-ignore
import * as HttpStatus from 'http-status-codes';
import Cookies from 'js-cookie';

// @ts-ignore
import SleepUtil from './SleepUtil';
import { ConfigGlobalLoader } from './config/ConfigGlobal';
// import json5 = require('json5');

interface IProps {
}

export class AuthService {
  private readonly configGlobal = ConfigGlobalLoader.config;

  // @ts-ignore
  private readonly props: IProps;

  constructor(props: IProps) {
    this.props = props;
  }

  public async loginUser(args: any) {
    let response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      body: JSON.stringify(args),
    });
    if (response !== undefined) {
      console.log('found user in db', response);
      return response;
    }
    return 'unable to find user';
  }

  public async getAuthToken() {
    let idToken = Cookies.get('id_token');
    return idToken;
  }

  public async getAuthHeaders() {
    let headers = {
      'Authorization': '',
      'Content-type': 'application/json',
    };

    if (this.configGlobal.buildEnvironment !== 'STAGING') {
      let idToken = await this.getAuthToken();

      if (idToken === undefined) {
        console.log('JWT token is undefined');
      } else {
        headers.Authorization = idToken;
      }
    }
    return headers;

  }

}
