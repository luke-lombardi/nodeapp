// @ts-ignore
import * as HttpStatus from 'http-status-codes';
import SleepUtil from './SleepUtil';
import { AuthService }  from './AuthService';

import { ConfigGlobalLoader } from './config/ConfigGlobal';

interface IProps {
  functions: any;
}

export default class ApiService {
  private stopping: boolean = false;
  private monitoring: boolean = false;
  private authService: AuthService;
  private readonly configGlobal = ConfigGlobalLoader.config;

  // @ts-ignore
  private readonly props: IProps;

  constructor(props: IProps) {
    this.props = props;

    this.authService = new AuthService({});
    this.PopulateData = this.PopulateData.bind(this);
    this.getSubscribers = this.getSubscribers.bind(this);
    this.getResponses = this.getResponses.bind(this);
    this.getGroups = this.getGroups.bind(this);
  }

  //
  // Interface functions
  //

  public StartMonitoring(table: string, filters: any) {
    console.log(`Starting to monitor with: ${table}, ${JSON.stringify(filters)}`);

    if (this.monitoring) return;

    this.monitoring = true;

    // Start the monitor loop - don't await this because it runs forever
    this.MonitorAsync(table, filters);
  }

  public async PopulateData() {
      console.log('populating');
      // Start the monitor loop - don't await this because it runs forever
      let url = 'http://localhost:3000/campaigns';
      // return await this.getListRequest(url);

      let response = await fetch(url, {
        method: 'GET',
      });

      console.log(response);

      if (response !== undefined) {
        console.log('got list-------> ', response);
        response = await response.json();
        return response;
        }

        console.log('unable to get list', response);
        return undefined;
  }

public async getResponses() {
  console.log('populating');
  // Start the monitor loop - don't await this because it runs forever
  let url = 'http://localhost:3000/responses';
  // return await this.getListRequest(url);

  let response = await fetch(url, {
    method: 'GET',
  });

  console.log(response);

  if (response !== undefined) {
    console.log('got responses-------> ', response);
    response = await response.json();
    return response;
    }

    console.log('unable to get responses', response);
    return undefined;
}

public async getSubscribers() {
  console.log('populating');
  // Start the monitor loop - don't await this because it runs forever
  let url = 'http://localhost:3000/subscribers';
  // return await this.getListRequest(url);

  let response = await fetch(url, {
    method: 'GET',
  });

  console.log(response);

  if (response !== undefined) {
    console.log('got subscribers-------> ', response);
    response = await response.json();
    return response;
    }

    console.log('unable to get subscribers', response);
    return undefined;
}

public async getGroups() {
  console.log('populating');
  // Start the monitor loop - don't await this because it runs forever
  let url = 'http://localhost:3000/groups';
  // return await this.getListRequest(url);

  let response = await fetch(url, {
    method: 'GET',
  });

  console.log(response);

  if (response !== undefined) {
    console.log('got groups-------> ', response);
    response = await response.json();
    return response;
    }

    console.log('unable to get groups', response);
    return undefined;
}

  StopMonitoring() {
    this.stopping = true;
  }

  public async GetLeadsListAsync() {
    let url = 'http://localhost:3000/campaigns';
    return await this.getListRequest(url);
  }

  public async GetClientsAsync() {
    let url = this.configGlobal.apiUrlBase + this.configGlobal.apiStage + 'getClients';
    return await this.getListRequest(url);
  }

  // Creates an athlete
  public async CreateAthlete(model: any) {
    return await this.sendCreateRequest('createAthlete', model);
  }

  // Updates an athlete
  public async UpdateAthlete(id: number, model: any) {
    return await this.sendUpdateRequest('updateAthlete', 'athlete_id', id, model);
  }

  // Deletes an athlete
  public async DeleteAthlete(athleteId: number) {
    return await this.sendDeleteRequest('deleteAthlete', 'athlete_id', athleteId);
  }

  // upload new customer
  public async createLead(args: any) {

    console.log('args', args);

    let response = await fetch('http://localhost:3000/createCampaign', {
          method: 'POST',
          body: JSON.stringify(args),
      });

    if (response !== undefined) {
      response = await response.json();
      console.log('success', response);
      return response;
      }

      console.log('unable to create campaign', response);
      return undefined;
  }

  // Shared request code
  // upload new customer
  private async sendCreateRequest(endpoint: string, model: any) {
    let headers = await this.authService.getAuthHeaders();
    console.log(headers);

    let response = await fetch(this.configGlobal.apiUrlBase + this.configGlobal.apiStage + endpoint, {
          method: 'POST',
          body: JSON.stringify(model),
          headers: headers,
        });

    // If we our token expired, redirect to the login page
    if (response.status === HttpStatus.UNAUTHORIZED) {
      await this.props.functions.authChanged({
        loggedIn: false,
        username: undefined,
      });

      return undefined;
    } else if (response.status !== HttpStatus.OK) {
      console.log(response);
      // Logger.info('ApiService.sendCreateRequest - ');
      return undefined;
    }

    response = await response.json();

    return response;
  }

  private async sendDeleteRequest(endpoint: string, param: string, id: number) {
    let url = this.configGlobal.apiUrlBase + this.configGlobal.apiStage + endpoint;
    let headers = await this.authService.getAuthHeaders();

    let response = undefined;

    try {
      response = await fetch(url + '?' + param + '=' + id.toString(), {
        method: 'DELETE',
        headers: headers,
      });

      // If we our token expired, redirect to the login page
      if (response.status === HttpStatus.UNAUTHORIZED) {
        await this.props.functions.authChanged({
          loggedIn: false,
          username: undefined,
        });

        return undefined;
      } else if (response.status !== HttpStatus.OK) {
        console.log(response);
        // Logger.info('ApiService.CreateGroupAsync - Unable to get user info');
        return undefined;
      }

      // Read response
      response = await response.json();
    } catch (error) {
      console.log('Caught exception: ' + JSON.stringify(error));
    }

    return response;
  }

  private async sendUpdateRequest(endpoint: string, param: string, id: number, model: any) {
    let headers = await this.authService.getAuthHeaders();

    model[param] = id;

    let response = await fetch(this.configGlobal.apiUrlBase + this.configGlobal.apiStage + `${endpoint}`, {
          method: 'PUT',
          body: JSON.stringify(model),
          headers: headers,
        });

    // If we our token expired, redirect to the login page
    if (response.status === HttpStatus.UNAUTHORIZED) {
      await this.props.functions.authChanged({
        loggedIn: false,
        username: undefined,
      });

      return undefined;
    } else if (response.status !== HttpStatus.OK) {
      console.log(response);
      // Logger.info('ApiService.CreateGroupAsync - Unable to get user info');
      return undefined;
    }

    response = await response.json();
    return response;
  }

  private async getListRequest(url: string) {
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    response = await response.json();
    return response;
  }

  // @ts-ignore
  private async getItemRequest(url: string) {
    let headers = await this.authService.getAuthHeaders();
    let response = undefined;

    try {
      response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

    // If we our token expired, redirect to the login page
    if (response.status === HttpStatus.UNAUTHORIZED) {
      await this.props.functions.authChanged({
        loggedIn: false,
        username: undefined,
      });

      return undefined;
    } else if (response.status !== HttpStatus.OK) {
      console.log(response);
      // Logger.info('ApiService.CreateGroupAsync - Unable to get user info');
      return undefined;
    }
      // Read response
      response = await response.json();
    } catch (error) {
      console.log('Caught exception: ' + JSON.stringify(error));
    }

    return response;
  }

  //
  // Private monitoring loops
  //

  private async MonitorAsync(table: string, filters: any) {

    while (true) {
        if (this.stopping) return;
        let results = undefined;

        switch (table) {
          case 'athletes':
            results =  await this.GetAthleteListAsync(filters);
            break;
          case 'clients':
            results =  await this.GetClientsAsync();
            break;
          default:
            console.log('Unhandled');
        }

        if (results !== undefined) {
          await this.props.functions.setList(results);
        }

        await SleepUtil.SleepAsync(this.configGlobal.nodeUpdateIntervalMS);
    }

  }

  private async GetAthleteListAsync(filters: any) {
    let url = this.configGlobal.apiUrlBase + this.configGlobal.apiStage + 'listAthletes?';

    if (filters.client.value !== 0) {
      url += `client_id=${filters.client.value}&`;
    }

    if (filters.warehouse.value !== 0) {
      url += `warehouse_id=${filters.warehouse.value}&`;
    }

    if (filters.group.value !== 0) {
      url += `group_id=${filters.group.value}`;
    }

    return await this.getListRequest(url);
  }
}