import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { UserLoggedInActionCreator } from '../actions/AuthActions';

import { ListItem } from 'react-native-elements';

import { NavigationActions } from 'react-navigation';

interface IProps {
    navigation?: any;
    nodeList: Array<any>;
}

export class SideBar extends Component<IProps> {
  resetAction: any;

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
                  // roundAvatar
                  // avatar={{uri:l.avatar_url}}
                  containerStyle={styles.navItem}
                  key='map'
                  title='Map'
                  leftIcon={{name: 'map', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => {
                    this.resetNavigation('Map');
                  }}
                />

                <ListItem
                  containerStyle={styles.navItem}
                  // badge={{ value: nodeList.length, textStyle: { color: 'black' }, containerStyle: { marginTop: -20 } }}
                  key='nodes'
                  title='Pins'
                  leftIcon={{name: 'map-pin', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => {
                    this.resetNavigation('Nodes');
                  }}
                />

                <ListItem
                  containerStyle={styles.navItem}
                  // badge={{ value: nodeList.length, textStyle: { color: 'black' }, containerStyle: { marginTop: -20 } }}
                  key='people'
                  title='People'
                  leftIcon={{name: 'user', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => {
                    this.resetNavigation('Nodes');
                }}
                />

                <ListItem
                  containerStyle={styles.navItem}
                  // badge={{ value: nodeList.length, textStyle: { color: 'black' }, containerStyle: { marginTop: -20 } }}
                  key='groups'
                  title='Groups'
                  leftIcon={{name: 'users', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => {
                    this.resetNavigation('Nodes');
                }}
                />

                <ListItem
                  containerStyle={styles.navItem}
                  // badge={{ value: nodeList.length, textStyle: { color: 'black' }, containerStyle: { marginTop: -20 } }}
                  key='meetups'
                  title='Meetups'
                  leftIcon={{name: 'calendar', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                  onPress={ () => {
                    this.resetNavigation('Nodes');
                }}
                />

        </View>
      );
    }
}

// @ts-ignore
export function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
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
});