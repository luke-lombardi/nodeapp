import React, { Component } from 'react';
import { AppRegistry, Platform } from 'react-native';
// @ts-ignore
import Splash from './components/Splash';

import { Provider } from 'react-redux';
import ConfigureStore from './store/ConfigureStore';

import Logger, { LogLevel } from './services/Logger';
import { YellowBox } from 'react-native';
import codePush from 'react-native-code-push';

console.disableYellowBox = true;
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
YellowBox.ignoreWarnings(['Class RCTCxxModule']);

const store = ConfigureStore();

class Smartshare extends Component {

  componentWillMount() {

    Logger.CreateLogger({
      logzToken: 'WyJyaJmkFiduXkqHFVDccOXYWdfxjNFE',  // <-- Put Logz.io (looks like an MD5 hash) here
      toConsole: __DEV__,
      level: LogLevel.Info,
      sendIntervalMs: 60000,
      logzType: `Smartshare-${Platform.OS}`,
      bufferSize: 1000,
      deviceId: '',
      bundleId: '',
      logAppState: true,
      logNetState: true,
      logRNErrors: true,
    });

    Logger.info(`Smartshare - Starting up`);

  }

  render() {
    return (
      <Provider store={store}>
        <Splash
          />
      </Provider>
    );
  }
}

let codePushOptions = { checkFrequency: codePush.CheckFrequency.ON_APP_RESUME };

AppRegistry.registerComponent('Smartshare', () => codePush(codePushOptions)(Smartshare));