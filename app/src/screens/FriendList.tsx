import React, { Component } from 'react';
// @ts-ignore
import { View, Switch, FlatList, StyleSheet, Text, Alert, ActivityIndicator, AsyncStorage } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import Swipeout from 'react-native-swipeout';

import Logger from '../services/Logger';

// @ts-ignore
import NodeService from '../services/NodeService';
// @ts-ignore
import AuthService from '../services/AuthService';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import ApiService from '../services/ApiService';

import { RelationListUpdatedActionCreator } from '../actions/RelationActions';

interface IProps {
    navigation: any;
    privatePersonList: Array<any>;
    privatePlaceList: Array<any>;
    friendList: Array<any>;
    relationList: Array<any>;
    RelationListUpdated: (relationList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
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
    this.componentDidMount = this.componentDidMount.bind(this);

    this._renderItem = this._renderItem.bind(this);
    this.shareNode = this.shareNode.bind(this);
    this.removeFriend = this.removeFriend.bind(this);
    this.sendPrivateMessage = this.sendPrivateMessage.bind(this);

  }

  componentWillMount() {
    this.action = this.props.navigation.getParam('action', '');
    this.nodeId = this.props.navigation.getParam('nodeId', '');
  }

  componentDidMount() {
    // Do nothing
  }

  async _onTouchNode(node: any) {
    let friendNode = undefined;

    for (let i = 0; i < this.props.friendList.length; i++) {
      if (this.props.friendList[i].node_id === node.their_friend_id) {
        friendNode = this.props.friendList[i];
        break;
      }
    }

    if (friendNode === undefined) {
      Alert.alert(`This user is not sharing location data`);
      return;
    }

    node = friendNode;

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
    this.props.navigation.navigate({Key: 'Chat', routeName: 'Chat', params: { nodeId: row.relation_id }});
  }

  async toggleLocationSharing(row) {
    let currentUUID = await AuthService.getUUID();
    let requestBody = {
      'user_id': currentUUID,
      'relation_id': row.relation_id,
      'friend_id': row.your_friend_id,
    };

    let response = await ApiService.ToggleLocationSharingAsync(requestBody);

    if (response !== undefined) {
      Logger.info(`FriendList.toggleLocationSharing: toggled location sharing, response ${JSON.stringify(response)}`);
      let relationList: any = await NodeService.getRelations();
      await this.props.RelationListUpdated(relationList);
    }
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
          underlayColor={'transparent'}
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
            onPress={async () => { await this._onTouchNode(row); }}
            underlayColor={'transparent'}
            containerStyle={{paddingHorizontal: 20, right: 20}}
          />
          <Switch
          onTouchEnd={async () => {  await this.toggleLocationSharing(row); }}
          value={row.sharing_location}
          />
          </View>
        }
        title={row.topic}
        subtitle={ 'Status: ' + row.status }
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
          data={this.props.relationList}
         renderItem={this._renderItem}
         extraData={this.state}
         keyExtractor={item => item.relation_id}
        />

        {
          this.state.isLoading &&
          <View style={[styles.container, styles.horizontal]}>
          <ActivityIndicator size='large' color='#0000ff' />
        </View>
        }

        {
          this.props.relationList.length === 0 &&
          <View style={{flexDirection: 'column', alignSelf: 'center', alignContent: 'center', width: '100%', height: '100%'}}>
          <Text style={styles.null}>No friends yet.</Text>
          <Text style={{fontSize: 14, top: '45%', alignSelf: 'center', color: 'gray'}}>You can track other users here.</Text>
          </View>
        }

     </View>
     </View>
    );
  }

  private async removeFriend(row: any): Promise<any> {
    await this.setState({isLoading: true});

    let relationId = row.relation_id;
    let response: any = undefined;

    // let foundRelation = await NodeService.getRelation(friendId);

    // If a matching relation is found in AsyncStorage, delete it
    if (relationId !== undefined) {
      let requestBody = {
        'relation_id': relationId,
      };

      // Delete the relation from the cache
      response = await ApiService.DeleteFriendAsync(requestBody);
    }

    if (response !== undefined) {
      Logger.info(`FriendList.removeFriend - got response from delete friend: ${JSON.stringify(response)}`);

      // Ok, it's removed from the cache, so lets delete the node from AsyncStorage too
      if (response.result === true) {
        await NodeService.deleteNode(row.their_friend_id);
        await NodeService.deleteRelation(row.their_uuid);
      }
    }

    let relationList: any = await NodeService.getRelations();
    if (relationList !== undefined) {
      await this.props.RelationListUpdated(relationList);
    }

    // await this.props.RelationListUpdated(props.relationList);
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
    relationList: state.relationList,
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    RelationListUpdated: bindActionCreators(RelationListUpdatedActionCreator, dispatch),
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
    top: '40%',
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