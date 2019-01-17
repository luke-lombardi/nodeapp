import React, { Component } from 'react';
import { View, StyleSheet, Text, Linking } from 'react-native';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { UserLoggedInActionCreator } from '../actions/AuthActions';

import { ListItem } from 'react-native-elements';

import { NavigationActions } from 'react-navigation';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

interface IProps {
    navigation?: any;
    nodeList: Array<any>;
    groupList: Array<any>;
    friendList: Array<any>;
    privatePlaceList: Array<any>;
    publicPlaceList: Array<any>;
}

export class SideBar extends Component<IProps> {
  resetAction: any;
  private readonly configGlobal = ConfigGlobalLoader.config;

    constructor(props: IProps) {
        super(props);

        this.resetAction = NavigationActions.replace({ routeName: 'Map' });
        this.navigateToScreen = this.navigateToScreen.bind(this);
        this.resetNavigation = this.resetNavigation.bind(this);
    }

    resetNavigation(route) {
      const resetAction = NavigationActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({ routeName: route }),
        ],
      });
      this.props.navigation.dispatch(resetAction);
    }

    navigateToScreen = (route) => () => {
      const navigateAction = NavigationActions.navigate({
        routeName: route,
      });
      this.props.navigation.dispatch(navigateAction);
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
                    this.resetNavigation('Map');
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
                    this.resetNavigation('CreateNode') :
                    this.resetNavigation('Nodes');
                  }}
                />

                <ListItem
                  scaleProps={{
                    friction: 90,
                    tension: 100,
                    activeScale: 0.95,
                  }}
                  containerStyle={styles.navItem}
                  badge={{ value: this.props.friendList.length, textStyle: { color: 'white', fontSize: 16 }, containerStyle: { padding: 20 } }}
                  key='friends'
                  title='People'
                  titleStyle={{fontSize: 22}}
                  leftIcon={{name: 'user', size: 22, type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => { this.props.friendList.length === 0 ?
                    this.props.navigation.navigate('Friends', {action: 'add_friend'}) :
                    this.resetNavigation('Friends');
                  }}
                />

        <Text style={styles.version}>{this.configGlobal.jsVersion}</Text>
        <Text
        onPress={() => Linking.openURL('https://docs.google.com/document/d/1ZhI10eOghYWE5PBjMH_afhwBfhWe-zJ04U9TQflslHI/edit')}
        style={styles.legal}>Legal</Text>

        </View>
      );
    }
}

// @ts-ignore
export function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    friendList: state.friendList,
    privatePlaceList: state.privatePlaceList,
    publicPlaceList: state.publicPlaceList,
  };
}

// @ts-ignore
export function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    UserLoggedIn: bindActionCreators(UserLoggedInActionCreator, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);

const styles = StyleSheet.create({
  view: {
    marginTop: 20,
    flex: 1,
  },
  navItem: {
    borderBottomWidth: 1,
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