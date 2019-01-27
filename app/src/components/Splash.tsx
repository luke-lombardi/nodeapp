import React, {Component} from 'react';
// @ts-ignore
import { View, StatusBar, AsyncStorage, Linking, PushNotificationIOS, AppState, Text } from 'react-native';
// @ts-ignore
import Logger from '../services/Logger';
import AuthService from '../services/AuthService';
// @ts-ignore
import { GetPermissions } from '../screens/GetPermissions';
import App from '../components/App';

interface IProps {
  functions: any;
  firstRun: boolean;
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
      this.setPermissions = this.setPermissions.bind(this);
      this.componentWillMount = this.componentWillMount.bind(this);
    }

    componentWillMount() {
      this.getPermissions();
    }

    async setPermissions() {
      this.setState({firstRun: false});
    }

    async getPermissions() {
      const firstRun = await AuthService.permissionsSet();
      if (firstRun) {
        this.setState({firstRun: true});
    }
    return;
  }

    render() {
      const permissions =
      <View style={{flex: 1}}>
        <GetPermissions
          functions={{'setPermissions': this.setPermissions}}
          firstRun={this.state.firstRun}
        />
      </View>;
      const app = <View style={{flex: 1}}> <App /> </View>;
      return (
        <View style={{flex: 1}}>
          { this.state.firstRun ? permissions : app };
      </View>
      );
    }
  }

export default Splash;