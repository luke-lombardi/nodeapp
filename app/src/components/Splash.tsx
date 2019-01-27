import React, {Component} from 'react';
// import { StackNavigator, DrawerNavigator, NavigationActions } from 'react-navigation';

// @ts-ignore
import { View, StatusBar, AsyncStorage, Linking, PushNotificationIOS, AppState, Text } from 'react-native';

// @ts-ignore
import Logger from '../services/Logger';

// Redux imports
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

import AuthService from '../services/AuthService';
// @ts-ignore
import { GetPermissions } from '../screens/GetPermissions';
import App from '../components/App';
// import { GetPermissions } from '../screens/GetPermissions';

interface IProps {
  navigation: any;
}

interface IState {
  firstRun: boolean;
}

export class Splash extends Component<IProps, IState> {

    constructor(props: IProps) {
      super(props);

      this.state = {
        firstRun: false,
      },

      this.getPermissions = this.getPermissions.bind(this);
      this.componentWillMount = this.componentWillMount.bind(this);
    }

    componentWillMount() {
      this.getPermissions();
    }

    async getPermissions() {
      let firstRun = await AuthService.permissionsSet();
      Logger.info(`SPLASH SCREEN - FIRST RUN: ${firstRun}`);
      if (firstRun) {
        this.setState({firstRun: true});
    }
    return;
  }

    render() {
      const props = {};
      // @ts-ignore
      const permissions = <View style={{flex: 1}}> <GetPermissions {...props} /> </View>;
      const app = <View style={{flex: 1}}> <App /> </View>;
      return (
        <View style={{flex: 1}}>
          {this.state.firstRun ? permissions : app};
      </View>
      );
    }
  }

// @ts-ignore
function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
  };
}

  // @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Splash);