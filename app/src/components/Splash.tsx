import React, {Component} from 'react';
// @ts-ignore
import { View, StatusBar, AsyncStorage, Linking, PushNotificationIOS, AppState, Text } from 'react-native';
// @ts-ignore
import Logger from '../services/Logger';
import AuthService from '../services/AuthService';
// @ts-ignore
import NavigationService from '../services/NavigationService';

// @ts-ignore
import { GetPermissions } from '../screens/GetPermissions';
import App from '../components/App';

interface IProps {
}

interface IState {
  firstRun: boolean;
  pageToRender: any;
}

export class Splash extends Component<IProps, IState> {

    constructor(props: IProps) {
      super(props);

      this.state = {
        firstRun: false,
        pageToRender: undefined,
      },

      this.getPermissions = this.getPermissions.bind(this);
      this.renderApp = this.renderApp.bind(this);
      this.componentWillMount = this.componentWillMount.bind(this);
      this.componentDidMount = this.componentWillMount.bind(this);
    }

    componentWillMount() {
      this.getPermissions();
    }

    componentDidMount() {
      //
    }

    async renderApp() {
      await this.setPageToRender();
    }

    async setPageToRender() {
      const permissions =
      <View style={{flex: 1}}>
        <GetPermissions
          firstRun={this.state.firstRun}
          functions={{renderApp: this.renderApp }}
        />
      </View>;

      const app = <App />;

      if (this.state.firstRun || !( await AuthService.hasPermissions() ) ) {
        await this.setState({pageToRender: permissions});
      } else {
        await this.setState({pageToRender: app});
      }
    }

    async getPermissions() {
      const firstRun = await AuthService.permissionsSet();
      if (firstRun) {
        await this.setState({firstRun: true});
      }

      await this.setPageToRender();
      return;
    }

    render() {
      return (
        <View style={{flex: 1}}>
           { this.state.pageToRender }
        </View>
      );
    }
  }

export default Splash;