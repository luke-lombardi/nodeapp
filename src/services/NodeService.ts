import Logger from './Logger';
import SleepUtil from './SleepUtil';
import DeferredPromise from './DeferredPromise';

import { AsyncStorage } from 'react-native';

// services
import LocationService from './LocationService';
import ApiService from './ApiService';

export interface INodeListUpdated {
  readonly nodeList: Array<any>;
}

// @ts-ignore
interface IProps {
  readonly currentUserRegion?: () => any;
  readonly nodeListUpdated?: (props: INodeListUpdated) => Promise<void>;
}

export default class NodeService {
    private readonly props: IProps;
    private stopping: boolean = false;
    private monitoring: boolean = false;
    private checkNowTrigger: DeferredPromise;

    private locationService: LocationService;
    private apiService: ApiService;

    constructor(props: IProps) {
        this.props = props;
        this.locationService = new LocationService({});
        this.apiService = new ApiService({});

        this.checkNowTrigger = new DeferredPromise();

        this.MonitorNodeListAsync = this.MonitorNodeListAsync.bind(this);

        this.CheckNow = this.CheckNow.bind(this);
        Logger.info(`NodeService.constructor -  Initialized node service`);
    }

    StartMonitoring() {
        if (this.monitoring) return;
        this.monitoring = true;

        // Start the monitoring loops - don't await this because it runs forever
        this.MonitorNodeListAsync();
    }

    CheckNow() {
        Logger.info('NodeService.CheckNow - updating the node list');
        this.checkNowTrigger.resolve();
    }

    StopMonitoring() {
        this.stopping = true;
        Logger.info(`NodeService.StopMonitoring -  Disabling monitoring loop.`);
    }

    // Public interface functions
    public async addNode() {
        await AsyncStorage.setItem('user_uuid', '');
    }

    public createNode() {
        console.log('creating');
    }

    public clearNodes() {
        console.log('clearing');
    }

    // Private implementation functions
    private async MonitorNodeListAsync() {
        while (true) {
            if (this.stopping) return;

            // Re-create the check-now trigger in case it was triggered last time
            this.checkNowTrigger = new DeferredPromise();

            await this.GetNodeListAsync();

            const sleepPromise = SleepUtil.SleepAsync(5000);
            await Promise.race([ sleepPromise, this.checkNowTrigger ]);

            Logger.info('NodeService.MonitorNodeListAsync - Looping around to check nodes again');
        }
    }

    private async GetNodeListAsync() {
      Logger.info('NodeService.GetNodeListAsync - Getting the node list.');
      let nodes = await this.apiService.getNodes();
      if (nodes) {
        let orderedNodeList = this.locationService.orderNodes(this.props.currentUserRegion(), nodes);
        await this.props.nodeListUpdated({nodeList: orderedNodeList});
      }
    }

}
