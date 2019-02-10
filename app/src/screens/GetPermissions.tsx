import React, { Component } from 'react';
// @ts-ignore
import { View, StyleSheet, AsyncStorage, AppState, Alert } from 'react-native';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import Permissions from 'react-native-permissions';
import { Text, Icon, CheckBox, Button } from 'react-native-elements';
import OpenSettings from 'react-native-open-settings';

// Services
import Logger from '../services/Logger';
import AuthService from '../services/AuthService';
import NavigationService from '../services/NavigationService';

interface IProps {
  firstRun: boolean;
  functions: any;
  navigation: any;
}

interface IState {
  notificationPermissions: string;
  motionPermissions: string;
  locationPermissions: string;
}

export class GetPermissions extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    this.state = {
      notificationPermissions: '',
      motionPermissions: '',
      locationPermissions: '',
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.setInitialPermissionState = this.setInitialPermissionState.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.checkPermissions = this.checkPermissions.bind(this);
    this.showModal = this.showModal.bind(this);
  }

  componentWillMount() {
    this.setInitialPermissionState();
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = appState => {
    Logger.info(`GetPermissions.handleAppStateChange - app state changed: ${appState}`);
    if (appState === 'active') {
      this.setInitialPermissionState();
    }
  }

  async setInitialPermissionState() {
    let currentPermissions = await AuthService.permissionsGranted();
    try {
      await this.setState({
        notificationPermissions: currentPermissions.notification,
        motionPermissions: currentPermissions.motion,
        locationPermissions: currentPermissions.location,
      });
    } catch (error) {
      // Do nothing we unmounted
    }

  }

  async showModal(type: string) {
    // we check firstRun in the splash screen to avoid a race condition with AuthService.permissionsSet()
    // so if no props are passed, check firstRun from async storage directly
    let firstRun = this.props.firstRun ? this.props.firstRun : await AuthService.permissionsSet();

    switch (type) {
      case 'location':
      Alert.alert(
        'Background Location Request',
        'dropping nodes works best with background location enabled',
        [
          {text: 'cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          // background location always requires user to give permission manually, so go directly to settings
          {text: 'ok', onPress: firstRun ? async () => { await this.requestPermissions('location'); } : OpenSettings.openSettings()},
        ],
        { cancelable: false },
      );
    break;
      case 'notification':
      Alert.alert(
        'notification request',
        'enable notifications to receive updates when other users message you',
        [
          {text: 'cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'ok', onPress: firstRun ? async () => { await this.requestPermissions('notification'); } : OpenSettings.openSettings()},
        ],
        { cancelable: false },
      );
    break;
      case 'motion':
      Alert.alert(
        'motion request',
        'motion tracking helps us keep our node train running on schedule',
        [
          {text: 'cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'ok', onPress: firstRun ? async () => { await this.requestPermissions('motion'); } : OpenSettings.openSettings()},
        ],
        { cancelable: false },
      );
    break;
  default:
  }
}

  async requestPermissions(type: string) {
    Logger.info(`GetPermissions.requestPermissions - called with type ${type}`);

    let hasPermissions: string = '';
    let response: string = undefined;

    // Check each permission type
    switch (type) {
      case 'location':
        hasPermissions = await Permissions.check('location', { type: 'always'} );
        if (hasPermissions !== 'authorized') {
          response = await Permissions.request('location', { type: 'always'});
          OpenSettings.openSettings();
        }

        try {
          await this.setState({ locationPermissions: response});
        } catch (error) {
          //
        }
        break;
      case 'motion':
        hasPermissions = await Permissions.check('motion');
        if (hasPermissions !== 'authorized') {
          response = await Permissions.request('motion');
        }
        try {
          await this.setState({ motionPermissions: response});
        } catch (error) {
          //
        }
        break;
      case 'notification':
        hasPermissions = await Permissions.check('notification');
        Logger.info(`GetPermissions.requestPermissions - permissions: ${hasPermissions}`);

        if (hasPermissions !== 'authorized') {
          response = await Permissions.request('notification');
        }
        try {
          await this.setState({ notificationPermissions: response});
        } catch (error) {
          //
        }
        break;
      default:
        //
    }

    await AuthService.permissionsGranted();
  }

  async checkPermissions() {
    if (this.props.navigation !== undefined) {

      let hasNavigation = this.props.navigation.getParam('hasNavigation', false);
      let hasPermissions = await AuthService.hasPermissions();

      if (hasNavigation && hasPermissions) {
        NavigationService.reset('Map', {});
      }

    } else  {
      await this.props.functions.getPermissions();
    }
  }

  render() {
    return(
      <View style={styles.container}>
        <Icon
          reverse
          // @ts-ignore
          name='location-disabled'
          type='material-icons'
          color='#517fa4'
          size={40}
          containerStyle={styles.largeIcon}
        />
        <Text style={styles.centeredTextLarge}>please enable required services.</Text>
        <Text style={{fontSize: 14, paddingVertical: 20, width: '80%', alignSelf: 'center', alignItems: 'center'}}>your location is required to use the app and connect with people nearby.</Text>
        <CheckBox
            center
            title={
              <View style={{alignContent: 'center', alignItems: 'center', width: 200}}>
              <Text>enable background location</Text>
              </View>
            }
            iconRight
            containerStyle={{width: '80%', alignSelf: 'center', borderRadius: 10}}
            checkedIcon='check'
            uncheckedIcon='circle-o'
            checkedColor='green'
            uncheckedColor='gray'
            onIconPress={async () => { await  this.showModal('location'); }}
            onPress={async () => { await this.showModal('location'); }}
            checked={this.state.locationPermissions === 'authorized'}
            />
        <CheckBox
            center
            title={
              <View style={{alignContent: 'center', alignItems: 'center', width: 200}}>
              <Text>enable push notifications</Text>
              </View>
            }
            iconRight
            containerStyle={{width: '80%', alignSelf: 'center', borderRadius: 10}}
            checkedIcon='check'
            uncheckedIcon='circle-o'
            checkedColor='green'
            uncheckedColor='gray'
            onIconPress={async () => { await this.showModal('notification'); }}
            onPress={async () => { await this.showModal('notification'); }}
            checked={this.state.notificationPermissions === 'authorized'}
            />
        <CheckBox
            center
            title={
              <View style={{alignContent: 'center', alignItems: 'center', width: 200}}>
              <Text>enable motion</Text>
              </View>
            }
            iconRight
            containerStyle={{width: '80%', alignSelf: 'center', borderRadius: 10}}
            checkedIcon='check'
            uncheckedIcon='circle-o'
            checkedColor='green'
            uncheckedColor='gray'
            onPress={async () => { await this.showModal('motion'); }}
            onIconPress={async () => { await this.showModal('motion'); }}
            checked={this.state.motionPermissions === 'authorized'}
            />
        <Button
          title='Continue'
          containerStyle={{padding: 20, alignSelf: 'center', width: '90%'}}
          onPress={ async () => { await this.checkPermissions(); } }
          disabled={
            this.state.locationPermissions !== 'authorized' ||
            this.state.motionPermissions !== 'authorized' ||
            this.state.notificationPermissions !== 'authorized'
          }
        />
      </View>
      );
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'white',
      padding: 10,
      width: '100%',
    },
    centeredTextLarge: {
      alignSelf: 'center',
      fontSize: 20,
    },
    centeredTextSmall: {
      alignSelf: 'center',
      marginBottom: 40,
      fontSize: 15,
    },
    largeIcon: {
      alignSelf: 'center',
      marginBottom: 30,
    },
  });

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

export default connect(mapStateToProps, mapDispatchToProps)(GetPermissions);