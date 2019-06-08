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
// @ts-ignore
import App from '../components/App';

interface IProps {
}

interface IState {
  permissionsRequested: any;
  pageToRender: any;
  hasPermissions: boolean;
}

export class Splash extends Component<IProps, IState> {

    constructor(props: IProps) {
      super(props);

      this.state = {
        permissionsRequested: {},
        pageToRender: undefined,
        hasPermissions: undefined,
      },

      this.getPermissions = this.getPermissions.bind(this);
      this.componentWillMount = this.componentWillMount.bind(this);
      this.componentDidMount = this.componentWillMount.bind(this);
    }

    componentWillMount() {
      //
      this.getPermissions();
    }

    componentDidMount() {
      console.log('are we doing this correctly');
    }

    async getPermissions() {
      let permissionsRequested = await AuthService.permissionsRequested();
      try  {
        await this.setState({ permissionsRequested: permissionsRequested });
        await this.setState({ hasPermissions: await AuthService.hasPermissions() } );
      } catch (error) {
        // We unmounted, do nothing
      }

      return;
    }

    render() {
      if (this.state.hasPermissions === false) {
         {
          return (
            <View style={{flex: 1}}>
              <GetPermissions
                  functions={{getPermissions: this.getPermissions}}
                  navigation={undefined}
                />
            </View>
          );
        }
      } else if (this.state.hasPermissions === true) {
          return (
            <View style={{flex: 1}}>
               <App />
            </View>
          );
      } else  {
          return (
            <View style={{flex: 1}}>
            </View>
          );
      }
    }

  }

export default Splash;