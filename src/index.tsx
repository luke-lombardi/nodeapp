import React, { Component } from 'react';
import { AppRegistry, Platform } from 'react-native';
import App from './components/App';
import { Provider } from 'react-redux';
import ConfigureStore from './store/ConfigureStore';

import Logger, { LogLevel } from './services/Logger';
import { YellowBox } from 'react-native';

console.disableYellowBox = true
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
YellowBox.ignoreWarnings(['Class RCTCxxModule']);

const store = ConfigureStore();

class MobileApp extends Component {

  componentWillMount() {
    Logger.CreateLogger({
      logzToken: 'oPnvyWXcbTWyjQjjHEmQhqDHOzZjGnuB',  // <-- Put Logz.io (looks like an MD5 hash) here
      toConsole: __DEV__,
      level: LogLevel.Info,
      sendIntervalMs: 60000,
      logzType: `mobileapp-${Platform.OS}`,
      bufferSize: 1000,
      deviceId: '',
      bundleId: '',
      logAppState: true,
      logNetState: true,
      logRNErrors: true,
    });

    Logger.info(` MobileApp - Starting up`);
  }

  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}

AppRegistry.registerComponent('MobileApp', () => MobileApp);
