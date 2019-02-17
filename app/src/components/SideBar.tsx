import React, { Component } from 'react';
import { View, StyleSheet, Text, Linking, Alert } from 'react-native';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NotificationListUpdatedActionCreator } from '../actions/NotificationActions';

import { ListItem } from 'react-native-elements';

import { ConfigGlobalLoader } from '../config/ConfigGlobal';
import NavigationService from '../services/NavigationService';

interface IProps {
    navigation?: any;
    nodeList: Array<any>;
    friendList: Array<any>;
    relationList: Array<any>;
    privatePlaceList: Array<any>;
    publicPlaceList: Array<any>;
    notificationList: Array<any>;
    transactionList: any;
    wallet: any;

    NotificationListUpdated: (notificationList: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
}

interface IState {
}

export class SideBar extends Component<IProps, IState> {
  resetAction: any;
  private readonly configGlobal = ConfigGlobalLoader.config;

    constructor(props: IProps) {
        super(props);

        this.state  = {
        };

        this.componentWillMount = this.componentWillMount.bind(this);
        this.navigateToCamera = this.navigateToCamera.bind(this);
        this.numberOfTransactions = this.numberOfTransactions.bind(this);
    }

    componentWillMount() {
    //
    }

    navigateToCamera() {
      this.props.navigation.navigate('Camera', {} );
    }

    numberOfTransactions() {
      if (this.props.transactionList.transactions !== undefined) {
        return Object.keys(this.props.transactionList.transactions).length;
      }
      return 0;
    }

    render() {
        return (
        <View style={styles.view}>

                <ListItem
                  scaleProps={{
                    friction: 90,
                    tension: 100,
                    activeScale: 0.95,
                  }}
                  containerStyle={styles.navItem}
                  key='map'
                  title='map'
                  titleStyle={{fontSize: 22}}
                  leftIcon={{name: 'map', size: 22, type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => {
                    NavigationService.reset('Map', {});
                  }}
                />

                <ListItem
                  scaleProps={{
                    friction: 90,
                    tension: 100,
                    activeScale: 0.95,
                  }}
                  containerStyle={styles.navItem}
                  badge={{ value: (this.props.privatePlaceList.length + this.props.publicPlaceList.length), textStyle: { color: 'white', fontSize: 16 }, containerStyle: { padding: 20 } }}
                  key='nodes'
                  title='nodes'
                  titleStyle={{fontSize: 22}}
                  leftIcon={{name: 'map-pin', size: 22, type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => {  NavigationService.reset('Nodes', {}); } }
                />

                <ListItem
                  scaleProps={{
                    friction: 90,
                    tension: 100,
                    activeScale: 0.95,
                  }}
                  containerStyle={styles.navItem}
                  badge={{ value: this.props.relationList.length, textStyle: { color: 'white', fontSize: 16 }, containerStyle: { padding: 20 } }}
                  key='friendlist'
                  title='people'
                  titleStyle={{fontSize: 22}}
                  leftIcon={{name: 'users', size: 22, type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => {
                    NavigationService.reset('FriendList', {});
                  }}
                />

                <ListItem
                  scaleProps={{
                    friction: 90,
                    tension: 100,
                    activeScale: 0.95,
                  }}
                  containerStyle={styles.navItem}
                  badge={{ value: this.props.notificationList.length, textStyle: { color: 'white', fontSize: 16 }, containerStyle: { padding: 20 } }}
                  // key='chat'
                  title='notifications'
                  titleStyle={{fontSize: 22}}
                  leftIcon={{name: 'bell', size: 22, type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => { this.props.notificationList.length === 0 ?
                    this.props.navigation.navigate('Notifications') :
                    NavigationService.reset('Notifications', {});

                  }}
                />
                <ListItem
                  scaleProps={{
                    friction: 90,
                    tension: 100,
                    activeScale: 0.95,
                  }}
                  containerStyle={styles.navItem}
                  badge={{ value: this.numberOfTransactions() , textStyle: { color: 'white', fontSize: 16 }, containerStyle: { padding: 20 } }}
                  title='transactions'
                  titleStyle={{fontSize: 22}}
                  leftIcon={{name: 'layers', size: 22, type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => { this.props.notificationList.length === 0 ?
                    this.props.navigation.navigate('Transactions') :
                    NavigationService.reset('Transactions', {});
                  }}
                />
        <Text style={styles.version}>{this.configGlobal.jsVersion}</Text>
        <Text
        onPress={() => Alert.alert(
          'how can we help?',
          '',
          [
            {text: 'contact support', onPress: () => Linking.openURL('https://smartshare.io')},
            {text: 'view user agreement', onPress: () => Linking.openURL('https://smartshare.io/terms')},
          ],
          { cancelable: true},
        )}
        style={styles.legal}>help</Text>

        </View>
      );
    }
}

// @ts-ignore
export function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    friendList: state.friendList,
    relationList: state.relationList,
    privatePlaceList: state.privatePlaceList,
    publicPlaceList: state.publicPlaceList,
    notificationList: state.notificationList,
    transactionList: state.transactionList,
    wallet: state.wallet,
  };
}

// @ts-ignore
export function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    NotificationListUpdated: bindActionCreators(NotificationListUpdatedActionCreator, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);

const styles = StyleSheet.create({
  view: {
    marginTop: 20,
    flex: 1,
  },
  navItem: {
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomColor: 'rgba(51, 51, 51, 0.2)',
  },
  importButton: {
    position: 'absolute',
    alignSelf: 'flex-start',
    bottom: 50,
    width: '100%',
  },
  version: {
    fontSize: 16,
    position: 'absolute',
    paddingRight: '5%',
    alignSelf: 'flex-end',
    bottom: 10,
  },
  legal: {
    fontSize: 16,
    alignSelf: 'flex-start',
    paddingLeft: '5%',
    position: 'absolute',
    bottom: 10,
  },
});