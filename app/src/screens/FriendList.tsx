import React, { Component } from 'react';
import { View, Switch, FlatList, StyleSheet, Text, Alert, ActivityIndicator } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import Swipeout from 'react-native-swipeout';

import Logger from '../services/Logger';

// @ts-ignore
import NodeService from '../services/NodeService';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import ApiService from '../services/ApiService';

interface IProps {
    navigation: any;
    privatePersonList: Array<any>;
    privatePlaceList: Array<any>;
    friendList: Array<any>;
}

interface IState {
  isLoading: boolean;
}

export class FriendList extends Component<IProps, IState> {
  private action: any;
  private nodeId: any;

  constructor(props: IProps) {
    super(props);

    this.state = {
      isLoading: false,
    },

    this.componentWillMount = this.componentWillMount.bind(this);
    this._renderItem = this._renderItem.bind(this);
    this.shareNode = this.shareNode.bind(this);
    this.removeFriend = this.removeFriend.bind(this);
    this.sendPrivateMessage = this.sendPrivateMessage.bind(this);
  }

  componentWillMount() {
    this.action = this.props.navigation.getParam('action', '');
    this.nodeId = this.props.navigation.getParam('nodeId', '');
  }

  _onTouchNode(node: any) {
    if (node.data.status === 'inactive') {
      Alert.alert(`This invite is still pending.`);
      return;
    }

    let region = {
      latitude: parseFloat(node.data.latitude),
      longitude: parseFloat(node.data.longitude),
      latitudeDelta: parseFloat(node.data.latDelta),
      longitudeDelta: parseFloat(node.data.longDelta),
    };

    const nodeType = 'friend';
    this.props.navigation.navigate({Key: 'Map', routeName: 'Map', params: {region: region, nodeType: nodeType}});
  }

  async sendPrivateMessage(row) {
    this.props.navigation.navigate({Key: 'Chat', routeName: 'Chat', params: {row}});
  }

  shareNode(row) {
    console.log(`sharing ${this.nodeId} with...`, row);
  }

  _renderItem(item) {

    let row = item.item;

    let swipeBtns = [{
      component: (
        <View
            style={{
              flex: 1,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'red',
              borderLeftWidth: 1,
              borderLeftColor: 'rgba(44,55,71,0.3)',
            }}
        >
        <Icon
          name='trash-2'
          type='feather'
          size={30}
          color='white'
        />
        </View>
      ),
      onPress: () => { this.removeFriend(row); },
    },
  ];

    if (this.action === 'share_node') {

    return (
        <ListItem
          onPress={() => this.shareNode(row)}
          containerStyle={[styles.friendListItem, {backgroundColor: 'white'}]}
          title={'shinywizard2939'}
          // title={ row.data.title ? row.data.title : row.node_id }
          // subtitle={ 'Status: ' + (row.data.status === 'inactive' ? 'pending' : 'active')  }
        />
    );
  } else {

  return (
    <Swipeout right={swipeBtns}
      autoClose={true}
      backgroundColor='#ffffff'
    >

      <ListItem
        onPress={() => this.sendPrivateMessage(row)}
        containerStyle={[styles.friendListItem, {backgroundColor: 'white'}]}
        rightElement={
          <View style={{flexDirection: 'row'}}>
          <Icon
            name='eye'
            type='feather'
            color='black'
            size={32}
            onPress={() => this._onTouchNode(row) }
            underlayColor={'transparent'}
            containerStyle={{paddingHorizontal: 20, right: 20}}
          />
          <Switch
          />
          </View>
        }
        title={'shinywizard2939'}
        // title={ row.data.title ? row.data.title : row.node_id }
        // subtitle={ 'Status: ' + (row.data.status === 'inactive' ? 'pending' : 'active')  }
      />

    </Swipeout>
    );
  }
}

  render() {
    return (
      <View style={{backgroundColor: 'white', height: '100%', flex: 1}}>
      <View style={styles.flatlist}>
        <FlatList
          data={this.props.friendList}
         // data={this.props.friendList}
         renderItem={this._renderItem}
         extraData={this.state}
         // keyExtractor={item => item.node_id}
        />

        {
          this.state.isLoading &&
          <View style={[styles.container, styles.horizontal]}>
          <ActivityIndicator size='large' color='#0000ff' />
        </View>
        }

        {
          this.props.friendList.length === 0 &&
          <Text style={styles.null}>No friends have been added yet</Text>
        }
     </View>
     </View>
    );
  }

  private async removeFriend(row: any): Promise<any> {
    await this.setState({isLoading: true});

    let friendId = row.node_id;
    let response: any = undefined;

    let foundRelation = await NodeService.getRelation(friendId);

    // If a matching relation is found in AsyncStorage, delete it
    if (foundRelation !== undefined) {
      let requestBody = {
        'relation_id': foundRelation.relation.relation_id,
      };

      // Delete the relation from the cache
      response = await ApiService.DeleteFriendAsync(requestBody);
    }

    if (response !== undefined) {
      Logger.info(`FriendList.removeFriend - got response from delete friend: ${JSON.stringify(response)}`);
      // Ok, it's removed from the cache, so lets delete the node from AsyncStorage too
      if (response.result === true) {
        await NodeService.deleteNode(friendId);
        await NodeService.deleteRelation(foundRelation.user);
      }
    }

    await this.setState({isLoading: false});
  }
}

// @ts-ignore
function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    privatePersonList: state.privatePersonList,
    privatePlaceList: state.privatePlaceList,
    friendList: state.friendList,
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FriendList);

const styles = StyleSheet.create({
  friendListItem: {
    minHeight: 80,
    maxHeight: 80,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 51, 51, 0.2)',
  },
  flatlist: {
  },
  null: {
    fontSize: 20,
    color: 'gray',
    top: 250,
    alignSelf: 'center',
  },
  button: {
  },
  buttonContainer: {
    top: -10,
    height: 80,
    alignSelf: 'center',
    width: '100%',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      margin: '50%',
    },
    horizontal: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 10,
    },
});