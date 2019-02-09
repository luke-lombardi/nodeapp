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
    }

    componentWillMount() {
    //
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
                  title='Map'
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
                  title='Nodes'
                  titleStyle={{fontSize: 22}}
                  leftIcon={{name: 'map-pin', size: 22, type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => { this.props.privatePlaceList.length && this.props.publicPlaceList.length === 0 ?
                    NavigationService.reset('CreateNode', {}) :
                    NavigationService.reset('Nodes', {});
                  }}
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
                  title='People'
                  titleStyle={{fontSize: 22}}
                  leftIcon={{name: 'users', size: 22, type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => {
                    NavigationService.reset('FriendList', {});
                  }}
                />

                {/* <ListItem
                  scaleProps={{
                    friction: 90,
                    tension: 100,
                    activeScale: 0.95,
                  }}
                  containerStyle={styles.navItem}
                  badge={{ value: this.props.friendList.length, textStyle: { color: 'white', fontSize: 16 }, containerStyle: { padding: 20 } }}
                  // key='chat'
                  title='Chat'
                  titleStyle={{fontSize: 22}}
                  leftIcon={{name: 'message-circle', size: 22, type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => { this.props.friendList.length === 0 ?
                    this.props.navigation.navigate('Chat', {action: 'general_chat'}) :
                    this.resetNavigation('Chat');
                  }}
                /> */}

                {/* <ListItem
                  scaleProps={{
                    friction: 90,
                    tension: 100,
                    activeScale: 0.95,
                  }}
                  containerStyle={styles.navItem}
                  badge={{ value: this.props.friendList.length, textStyle: { color: 'white', fontSize: 16 }, containerStyle: { padding: 20 } }}
                  // key='chat'
                  title='Messages'
                  titleStyle={{fontSize: 22}}
                  leftIcon={{name: 'lock', size: 22, type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => { this.props.friendList.length === 0 ?
                    this.props.navigation.navigate('Chat', {action: 'user_chat'}) :
                    this.resetNavigation('Chat');
                  }}
                /> */}

                <ListItem
                  scaleProps={{
                    friction: 90,
                    tension: 100,
                    activeScale: 0.95,
                  }}
                  containerStyle={styles.navItem}
                  badge={{ value: this.props.notificationList.length, textStyle: { color: 'white', fontSize: 16 }, containerStyle: { padding: 20 } }}
                  // key='chat'
                  title='Notifications'
                  titleStyle={{fontSize: 22}}
                  leftIcon={{name: 'bell', size: 22, type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => { this.props.notificationList.length === 0 ?
                    this.props.navigation.navigate('Notifications') :
                    NavigationService.reset('Notifications', {});

                  }}
                />

        <Text style={styles.version}>{this.configGlobal.jsVersion}</Text>
        <Text
        onPress={() => Alert.alert(
          'How can we help?',
          '',
          [
            {text: 'Contact Support', onPress: () => Linking.openURL('https://docs.google.com/document/d/1ZhI10eOghYWE5PBjMH_afhwBfhWe-zJ04U9TQflslHI/edit')},
            {text: 'View User Agreement', onPress: () => Linking.openURL('https://docs.google.com/document/d/1ZhI10eOghYWE5PBjMH_afhwBfhWe-zJ04U9TQflslHI/edit')},
          ],
          { cancelable: true},
        )}
        style={styles.legal}>Help</Text>

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