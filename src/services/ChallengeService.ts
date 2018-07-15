import Logger from './Logger';
import SleepUtil from './SleepUtil';
import DeferredPromise from './DeferredPromise';

import { AsyncStorage } from 'react-native';

// services
import ApiService from './ApiService';

export interface IChallengeSettingsUpdated {
  readonly challengeSettings: any;
}

// @ts-ignore
interface IProps {
  readonly currentUserRegion?: () => any;
  readonly challengeSettingsUpdated?: (props: IChallengeSettingsUpdated) => Promise<void>;
}

export default class NodeService{
    // @ts-ignore
    private readonly props: IProps;
    private stopping: boolean = false;
    private monitoring: boolean = false;
    private checkNowTrigger: DeferredPromise;

    private apiService: ApiService;

    constructor(props: IProps){
        this.props = props;
        this.apiService = new ApiService({});
        Logger.info(`ChallengeService.constructor -  Initialized challenge service`);
    }

    StartMonitoring() {
        if (this.monitoring) return;
        this.monitoring = true;

        // Start the monitoring loops - don't await this because it runs forever
        this.MonitorChallengeSettingsAsync();
    }

    CheckNow() {
        this.checkNowTrigger.resolve();
    }

    StopMonitoring() {
        this.stopping = true;
        Logger.info(`ChallengeService.StopMonitoring -  Disabling monitoring loop.`);
    }
   
    private async MonitorChallengeSettingsAsync(){
        while(true){
            if(this.stopping) return;

            // Re-create the check-now trigger in case it was triggered last time
            this.checkNowTrigger = new DeferredPromise();

            await this.GetChallengeSettingsAsync();

            const sleepPromise = SleepUtil.SleepAsync(10000);
            await Promise.race([ sleepPromise, this.checkNowTrigger ]);

            Logger.info('NodeService.MonitorChallengeSettingsAsync - Looping around to check settings again');
        }
      }
        

    private async GetChallengeSettingsAsync(){
      Logger.info('ChallengeService.GetChallengeSettingsAsync - Getting the settings.');
      let challengeSettings = await this.apiService.challengeSettings();

      if(challengeSettings){
        let storedChallengeSettings = await AsyncStorage.getItem('challengeSettings');

        if(storedChallengeSettings == null){
          await AsyncStorage.setItem('challengeSettings', JSON.stringify(challengeSettings));
        }
        else{
          if(storedChallengeSettings != JSON.stringify(challengeSettings)){
            await AsyncStorage.setItem('challengeSettings', JSON.stringify(challengeSettings));
            Logger.info('ChallengeService.GetChallengeSettingsAsync - challenge settings have changed, updated local storage');
          }
          else{
            console.log(storedChallengeSettings);
            console.log(JSON.stringify(challengeSettings));
          }
        }

        await this.props.challengeSettingsUpdated({challengeSettings: challengeSettings});

      }
    }

}
