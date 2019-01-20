import React, { Component } from 'react';
import { View, Switch, FlatList, StyleSheet, Text, Alert, ActivityIndicator } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import Swipeout from 'react-native-swipeout';

// import Logger from '../services/Logger';

import NodeService from '../services/NodeService';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

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
  private nodeService: NodeService;

  constructor(props: IProps) {
    super(props);

    this.state = {
      isLoading: false,
    },

    this._renderItem = this._renderItem.bind(this);
    this.removeFriend = this.removeFriend.bind(this);

    this.sendPrivateMessage = this.sendPrivateMessage.bind(this);

    this.nodeService = new NodeService({});
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

    let nodeType = 'friend';

    this.props.navigation.navigate({Key: 'Map', routeName: 'Map', params: {region: region, nodeType: nodeType}});
  }

  async sendPrivateMessage(row) {
    console.log('starting private chat');

    this.props.navigation.navigate({Key: 'Chat', routeName: 'Chat', params: {row}});

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

    return (
      <Swipeout right={swipeBtns}
        autoClose={true}
        backgroundColor='#ffffff'
      >

        <ListItem
          onPress={() => this.sendPrivateMessage(row)}
          scaleProps={{
            friction: 90,
            tension: 100,
            activeScale: 0.95,
          }}
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
              containerStyle={{paddingHorizontal: 20}}
            />
            <Switch
            />
            </View>
          }
          title={'shinywizard2939'}
          //title={ row.data.title ? row.data.title : row.node_id }
          //subtitle={ 'Status: ' + (row.data.status === 'inactive' ? 'pending' : 'active')  }
        />

      </Swipeout>
    );
  }

  render() {
    const data = [
      {
        'node_ids': [
          'public:628dc255-f3ca-4634-91b9-be596633e864',
          'public:04d8b648-7da2-4642-a4f0-4c01845400c7',
          'public:9718a6db-3a29-4920-85b1-f951ba8bdb21',
          ],
        },
      ];
    return (
      <View style={{backgroundColor: 'white', height: '100%', flex: 1}}>
      <View style={styles.flatlist}>
        <FlatList
          data={data}
         //data={this.props.friendList}
         renderItem={this._renderItem}
         extraData={this.state}
         //keyExtractor={item => item.node_id}
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
    let initialLength = this.props.friendList.length;
    this.setState({isLoading: true});
    // TODO: call deleteRelation endpoint to remove friend from cache
    let friendId = row.node_id;
    await this.nodeService.deleteFriend(friendId);
    await this.nodeService.deleteNode(friendId);
    if (this.props.friendList.length !== initialLength) {
      this.setState({isLoading: false});
    }
    this.setState({isLoading: false});
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