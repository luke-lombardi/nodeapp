import React, { Component } from 'react';
// @ts-ignore
import { View, StyleSheet, AsyncStorage, AppState, Alert } from 'react-native';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
// @ts-ignore
import NavigationService from '../services/NavigationService';
import Permissions from 'react-native-permissions';
import { Text, Icon, CheckBox, Button } from 'react-native-elements';
// import Snackbar from 'react-native-snackbar';
import OpenSettings from 'react-native-open-settings';

// Services
import Logger from '../services/Logger';
import AuthService from '../services/AuthService';

interface IProps {
  functions: any;
  Navigation: any;
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
    // AuthService.checkPermissions(false);
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
    await this.setState({
      notificationPermissions: currentPermissions.notification,
      motionPermissions: currentPermissions.motion,
      locationPermissions: currentPermissions.location,
    });
  }

  async showModal(type: string) {

    switch (type) {
      case 'location':
      Alert.alert(
        'Background Location Request',
        'Dropping nodes works best with background location enabled',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => this.requestPermissions(type)},
        ],
        { cancelable: false },
      );
    break;
      case 'notification':
      Alert.alert(
        'Notification Request',
        'Enable notifications to receive updates when other users message you',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => this.requestPermissions(type)},
        ],
        { cancelable: false },
      );
    break;
      case 'motion':
      Alert.alert(
        'Motion Request',
        'Motion tracking helps us keep our node train running on schedule',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => this.requestPermissions(type)},
        ],
        { cancelable: false },
      );
    break;
  default:
  }
}

  async requestPermissions(type: string) {
    Logger.info(`GetPermissions.requestPermissions - called with type ${type}`);
    let firstRun = await AuthService.permissionsSet();
    if (!firstRun) {
      Logger.info(`GetPermissions.requestPermissions - first run ${firstRun}`);
      OpenSettings.openSettings();
      return;
    }

    let hasPermissions: string = '';
    let response: string = undefined;

    // Check each permission type
    switch (type) {
      case 'location':
        hasPermissions = await Permissions.check('location', { type: 'always'} );
        if (hasPermissions !== 'authorized') {

          // permission request modal

          // if the user accepts the modal permissions, send the real request

          response = await Permissions.request('location', { type: 'always'} );
        } else if (!firstRun) {
          OpenSettings.openSettings();
        }

        await this.setState({ locationPermissions: response});
        break;
      case 'motion':
        hasPermissions = await Permissions.check('motion');
        if (hasPermissions !== 'authorized') {

          // permission request modal

          // if the user accepts the modal permissions, send the real request

          response = await Permissions.request('motion');
        }

        await this.setState({ motionPermissions: response});
        break;
      case 'notification':
        hasPermissions = await Permissions.check('notification');
        Logger.info(`GetPermissions.requestPermissions - permissions: ${hasPermissions}`);

        if (hasPermissions !== 'authorized') {

          // permission request modal

          // if the user accepts the modal permissions, send the real request

          response = await Permissions.request('notification', { type: ['alert', 'badge', 'sound'] });
        }

        await this.setState({ notificationPermissions: response});
        break;
      default:
        //
    }

    await AuthService.permissionsGranted();
  }

  async checkPermissions() {
    if (
      this.state.notificationPermissions === 'authorized' &&
      this.state.motionPermissions === 'authorized' &&
      this.state.locationPermissions === 'authorized'
    ) {
      return true;
    }
    return false;
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
        <Text style={styles.centeredTextLarge}>Please enable required services.</Text>
        <Text style={{fontSize: 14, paddingVertical: 20, width: '80%', alignSelf: 'center', alignItems: 'center'}}>Your location is required to use the app and connect with people nearby.</Text>
        <CheckBox
            center
            title={
              <View style={{alignContent: 'center', alignItems: 'center', width: 200}}>
              <Text>Enable Background Location</Text>
              </View>
            }
            iconRight
            // textStyle={this.state.shareLocationActive ? {color: 'red'} : {color: 'gray'}}
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
              <Text>Enable Push Notifications</Text>
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
              <Text>Enable Motion</Text>
              </View>
            }
            iconRight
            // textStyle={this.state.shareLocationActive ? {color: 'red'} : {color: 'gray'}}
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
          onPress={async () => { await AuthService.checkPermissions(true); }}
          disabled={
            this.state.locationPermissions !== 'authorized' &&
            this.state.motionPermissions !== 'authorized' ?
            true :
            false
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