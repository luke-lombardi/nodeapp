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
  hasPermissions: boolean;
}

export class Splash extends Component<IProps, IState> {

    constructor(props: IProps) {
      super(props);

      this.state = {
        firstRun: false,
        pageToRender: undefined,
        hasPermissions: undefined,
      },

      this.getPermissions = this.getPermissions.bind(this);
      this.componentWillMount = this.componentWillMount.bind(this);
      this.componentDidMount = this.componentWillMount.bind(this);
      // this.setPageToRender  = this.setPageToRender.bind(this);
    }

    componentWillMount() {
      //
      this.getPermissions();
    }

    componentDidMount() {
      console.log('are we doing this correctly');
    }

    async getPermissions() {
      const firstRun = await AuthService.permissionsSet();
      try  {
        if (firstRun) {
          await this.setState({firstRun: true});
        }

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
                  firstRun={this.state.firstRun}
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