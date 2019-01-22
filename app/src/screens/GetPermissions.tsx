import React, { Component } from 'react';
import { View, StyleSheet} from 'react-native';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import NavigationService from '../services/NavigationService';
import Permissions from 'react-native-permissions';
import { Text, Button, Icon } from 'react-native-elements';
import Snackbar from 'react-native-snackbar';
import OpenSettings from 'react-native-open-settings';
import SleepUtil from '../services/SleepUtil';

// import Icon from 'react-native-vector-icons/Ionicons';
// import ActionButton from 'react-native-circular-action-menu';

interface IProps {
  functions: any;
}

interface IState {
}

export class GetPermissions extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    this.checkPermissions = this.checkPermissions.bind(this);
    this.checkMinorPermissions = this.checkMinorPermissions.bind(this);
    this.openSettings = this.openSettings.bind(this);
  }

  openSettings() {
    OpenSettings.openSettings();
  }

  async checkPermissions() {
    let backgroundLocationPermission = await Permissions.check('location', { type: 'always'} );

    // First, check if the user has allowed background location tracking
    if (backgroundLocationPermission === 'authorized') {
      NavigationService.reset('Map', {});
    // If they haven't, request access
    } else {
      setTimeout(this.checkMinorPermissions(), 10000);
    }
  }

  async checkMinorPermissions() {
    let backgroundLocationPermission = await Permissions.request('location', { type: 'always'} );
    // If we got it this time, setup location tracking
    if (backgroundLocationPermission === 'authorized') {
      NavigationService.reset('Map', {});
    } else {
      setTimeout(this.checkInUsePermissions(), 10000);
    }
  }

  async checkInUsePermissions() {
      let inUsePermission = await Permissions.request('location');
      // If we can, let them proceed with the app, but set a flag so background services are disabled
      if (inUsePermission === 'authorized') {
        NavigationService.reset('Map', {});

        return;
      } else {
        setTimeout(this.showSnackbar(), 10000);
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
        <Text style={styles.centeredTextLarge}>Please enable location services.</Text>
        <Text style={{fontSize: 14, paddingVertical: 20, width: '80%', alignSelf: 'center', alignItems: 'center'}}>Your location is required to use the app and connect with people nearby.</Text>
        <Text style={styles.centeredTextSmall}> Settings -> Smartshare -> Location -> Always</Text>
        <Button title='Enable Permissions' containerStyle={{width: '80%', height: '30%', marginLeft: 0, alignSelf: 'center'}}
        onPress={this.checkPermissions} />
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