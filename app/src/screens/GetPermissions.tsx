import React, { Component } from 'react';
import { View, StyleSheet} from 'react-native';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
// @ts-ignore
import NavigationService from '../services/NavigationService';
import Permissions from 'react-native-permissions';
import { Text, Icon, CheckBox } from 'react-native-elements';
import Snackbar from 'react-native-snackbar';
import OpenSettings from 'react-native-open-settings';
import SleepUtil from '../services/SleepUtil';

// import Icon from 'react-native-vector-icons/Ionicons';
// import ActionButton from 'react-native-circular-action-menu';

// import AuthService from '../services/AuthService';

interface IProps {
  functions: any;
}

interface IState {
  notificationPermissions: boolean;
  motionPermissions: boolean;
  locationPermissions: boolean;
}

export class GetPermissions extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    this.state = {
      notificationPermissions: false,
      motionPermissions: false,
      locationPermissions: false,
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.checkPermissions = this.checkPermissions.bind(this);
    this.grantNotificationPermissions = this.grantNotificationPermissions.bind(this);
    this.grantLocationPermissions = this.grantLocationPermissions.bind(this);
    this.grantMotionPermissions = this.grantMotionPermissions.bind(this);
    this.openSettings = this.openSettings.bind(this);
  }

  openSettings() {
    OpenSettings.openSettings();
  }

  // async checkPermissions() {
  //   let backgroundLocationPermission = await Permissions.check('location', { type: 'always'} );

  //   // First, check if the user has allowed background location tracking
  //   if (backgroundLocationPermission === 'authorized') {
  //     NavigationService.reset('Map', {});
  //   // If they haven't, request access
  //   } else {
  //     setTimeout(this.checkMinorPermissions(), 10000);
  //   }
  // }

  // async checkMinorPermissions() {
  //   let backgroundLocationPermission = await Permissions.request('location', { type: 'always'} );
  //   // If we got it this time, setup location tracking
  //   if (backgroundLocationPermission === 'authorized') {
  //     NavigationService.reset('Map', {});
  //   } else {
  //     setTimeout(this.checkInUsePermissions(), 10000);
  //   }
  // }

  // async checkInUsePermissions() {
  //     let inUsePermission = await Permissions.request('location');
  //     // If we can, let them proceed with the app, but set a flag so background services are disabled
  //     if (inUsePermission === 'authorized') {
  //       NavigationService.reset('Map', {});

  //       return;
  //     } else {
  //       setTimeout(this.showSnackbar(), 10000);
  //     }
  //   }

  componentDidMount() {
    this.getPermissions();
  }

  async getPermissions() {
    let locationPermissions = await Permissions.check('location');
    console.log('background location permissions', locationPermissions);
    if (locationPermissions === 'authorized') {
      this.setState({locationPermissions: true});
    }
  }

  async showSnackbar() {
      // We have no location permission, the app is useless
      // Show them a modal saying we need more permissions
      Snackbar.show({
        title: 'You must enable location services to use the app.',
        duration: Snackbar.LENGTH_SHORT,
      });

      await SleepUtil.SleepAsync(100);

      this.openSettings();
      return;
    }

  async checkPermissions() {
    //let permissions = await AuthService.permissionsGranted();
  }

  async grantLocationPermissions() {
    this.openSettings();
  }

  async grantNotificationPermissions() {
    let permissions = await Permissions.request('notification');
    console.log('notification permissions', permissions);
    if (permissions === 'authorized') {
      this.setState({notificationPermissions: true});
    } else {
      Snackbar.show({
        title: 'You must enable notifications to use the app.',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  }

  async grantMotionPermissions() {
    let permissions = await Permissions.request('motion');
    console.log('motion permissions', permissions);
    if (permissions === 'authorized') {
      this.setState({motionPermissions: true});
    } else {
      Snackbar.show({
        title: 'You must enable motion to use the app.',
        duration: Snackbar.LENGTH_SHORT,
      });
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
        <Text style={styles.centeredTextLarge}>Please enable required services.</Text>
        <Text style={{fontSize: 14, paddingVertical: 20, width: '80%', alignSelf: 'center', alignItems: 'center'}}>Your location is required to use the app and connect with people nearby.</Text>
        {/* <Text style={styles.centeredTextSmall}> Settings -> Smartshare -> Location -> Always</Text> */}
        {/* <Button title='Enable Permissions' containerStyle={{width: '80%', height: '30%', marginLeft: 0, alignSelf: 'center'}}
        onPress={this.checkPermissions} /> */}
        <CheckBox
            center
            title={
              <View style={{alignContent: 'center', alignItems: 'center', width: 200}}>
              <Text>Enable Push Notifications</Text>
              </View>
            }
            iconRight
            //textStyle={this.state.shareLocationActive ? {color: 'red'} : {color: 'gray'}}
            containerStyle={{width: '80%', alignSelf: 'center', borderRadius: 10}}
            checkedIcon='check'
            uncheckedIcon='circle-o'
            checkedColor='red'
            uncheckedColor='gray'
            onIconPress={() => this.grantNotificationPermissions()}
            onPress={() => this.grantNotificationPermissions()}
            checked={this.state.notificationPermissions}
            />
        <CheckBox
            center
            title={
              <View style={{alignContent: 'center', alignItems: 'center', width: 200}}>
              <Text>Enable Background Location</Text>
              </View>
            }
            iconRight
            //textStyle={this.state.shareLocationActive ? {color: 'red'} : {color: 'gray'}}
            containerStyle={{width: '80%', alignSelf: 'center', borderRadius: 10}}
            checkedIcon='check'
            uncheckedIcon='circle-o'
            checkedColor='red'
            uncheckedColor='gray'
            onIconPress={() => this.openSettings()}
            onPress={() => this.openSettings()}
            checked={this.state.locationPermissions}
            />
        <CheckBox
            center
            title={
              <View style={{alignContent: 'center', alignItems: 'center', width: 200}}>
              <Text>Enable Motion</Text>
              </View>
            }
            iconRight
            //textStyle={this.state.shareLocationActive ? {color: 'red'} : {color: 'gray'}}
            containerStyle={{width: '80%', alignSelf: 'center', borderRadius: 10}}
            checkedIcon='check'
            uncheckedIcon='circle-o'
            checkedColor='red'
            uncheckedColor='gray'
            onPress={() => this.grantMotionPermissions()}
            onIconPress={() => this.grantMotionPermissions()}
            checked={this.state.motionPermissions}
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