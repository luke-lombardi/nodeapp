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
      backgroundLocationPermission = await Permissions.request('location', { type: 'always'} );
      // If we got it this time, setup location tracking
      if (backgroundLocationPermission === 'authorized') {
        NavigationService.reset('Map', {});
      } else {
        // Otherwise, see if we can get whenInUse location tracking permission
        let inUsePermission = await Permissions.request('location');
        // If we can, let them proceed with the app, but set a flag so background services are disabled
        if (inUsePermission === 'authorized') {
          NavigationService.reset('Map', {});

          return;
        } else {
          // We have no location permission, the app is useless
          // Show them a modal saying we need more permissions
          Snackbar.show({
            title: 'Location services is disabled.',
            duration: Snackbar.LENGTH_SHORT,
          });

          await SleepUtil.SleepAsync(100);

          this.openSettings();
          return;
        }
      }
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
        <Text style={styles.centeredTextLarge}> Please enable location services to proceed. </Text>
        <Text style={styles.centeredTextSmall}> Settings -> Smartshare -> Location -> Always</Text>
        <Button title='Check permissions' containerStyle={{width: '80%', height: '30%', marginLeft: 0, alignSelf: 'center'}}
        onPress={this.checkPermissions} />
      </View>
      );
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#ecf0f1',
      padding: 10,
    },
    centeredTextLarge: {
      alignSelf: 'center',
      marginBottom: 10,
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