import React, { Component } from 'react';
// @ts-ignore
import { View, Switch, FlatList, StyleSheet, Text, Alert, Dimensions, ActivityIndicator, AsyncStorage } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import Swipeout from 'react-native-swipeout';
import Snackbar from 'react-native-snackbar';
import Logger from '../services/Logger';
import PaymentModal from '../components/PaymentModal';

// @ts-ignore
import NodeService from '../services/NodeService';
// @ts-ignore
import AuthService from '../services/AuthService';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import ApiService from '../services/ApiService';

import { RelationListUpdatedActionCreator } from '../actions/RelationActions';
// @ts-ignore
import NavigationService from '../services/NavigationService';
import { AnimatedRegion } from 'react-native-maps';

const { height } = Dimensions.get('window');

interface IProps {
    navigation: any;
    wallet: any;
    privatePersonList: Array<any>;
    privatePlaceList: Array<any>;
    friendList: Array<any>;
    relationList: Array<any>;
    RelationListUpdated: (relationList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
}

interface IState {
  isLoading: boolean;
  paymentModalVisible: boolean;
  selectedNode: any;
}

export class FriendList extends Component<IProps, IState> {
  private action: any;
  private nodeId: any;

  static navigationOptions = ({ navigation }) => {
    // @ts-ignore
    const { state: { params = {} } } = navigation;
    return {
      headerStyle: {backgroundColor: '#006494', height: 50},
      headerTitleStyle: { color: 'white', fontSize: 22, fontWeight: 'bold'},
        title: params.action === 'share_node' ? 'share node' : 'friends',
        headerLeft:
          <Icon
            name='chevron-left'
            type='feather'
            containerStyle={{padding: 5}}
            size={30}
            underlayColor={'#006494'}
            color={'#ffffff'}
            onPress={ () => { NavigationService.reset('Map', {}); }}
          />,
      };
  }

  constructor(props: IProps) {
    super(props);

    this.state = {
      isLoading: false,
      paymentModalVisible: false,
      selectedNode: undefined,
    },

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

    this._renderItem = this._renderItem.bind(this);
    this.shareNode = this.shareNode.bind(this);
    this.removeFriend = this.removeFriend.bind(this);
    this.sendPrivateMessage = this.sendPrivateMessage.bind(this);
    this.showPaymentModal = this.showPaymentModal.bind(this);
    this.closePaymentModal = this.closePaymentModal.bind(this);
  }

  componentWillMount() {
    this.action = this.props.navigation.getParam('action', '');
    this.nodeId = this.props.navigation.getParam('nodeId', '');
  }

  componentDidMount() {
    // Do nothing
  }

  async showPaymentModal(node) {
    let friendNode = undefined;

    for (let i = 0; i < this.props.friendList.length; i++) {
      if (this.props.friendList[i].node_id === node.their_friend_id) {
        friendNode = this.props.friendList[i];
        break;
      }
    }

    if (friendNode.data.wallet !== undefined) {
      await this.setState({
        paymentModalVisible: true,
        selectedNode: friendNode,
      });
    } else if (this.props.wallet.address === undefined) {
      Alert.alert(`You need a wallet hooked up to send funds.`);
    } else if (friendNode.data.wallet === undefined) {
      Alert.alert(`This friend has no wallet.`);
    }
  }

  async closePaymentModal() {
    await this.setState({
      paymentModalVisible: false,
      selectedNode: undefined,
    });
  }

  async _onTouchNode(node: any) {
    let friendNode = undefined;
    let nodeIndex = undefined;

    for (let i = 0; i < this.props.friendList.length; i++) {
      if (this.props.friendList[i].node_id === node.their_friend_id) {
        friendNode = this.props.friendList[i];
        nodeIndex = i;
        break;
      }
    }

    if (friendNode === undefined) {
      Alert.alert(`${node.topic} is not sharing location data`);
      return;
    }

    node = friendNode;

    let region = {
      latitude: parseFloat(node.data.latitude),
      longitude: parseFloat(node.data.longitude),
      latitudeDelta: parseFloat(node.data.latDelta),
      longitudeDelta: parseFloat(node.data.longDelta),
    };

    let nodeType = 'friend';

    NavigationService.reset('Map', { region: region, nodeType: nodeType, nodeIndex: nodeIndex } );
  }

  async sendPrivateMessage(row) {
    NavigationService.reset('Chat', { nodeId: row.relation_id, username: row.topic} );
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

  async shareNode(row) {
    Logger.info(`FriendList.shareNode: sharing ${this.nodeId} node with ${JSON.stringify(row)}`);

    let currentUUID = await AuthService.getUUID();
    let toUser = undefined;

    for (let member in row.member_data) {
        if (row.member_data.hasOwnProperty(member)) {
          if (member !== currentUUID) {
            toUser = member;
            break;
          }
        }
    }

    let requestBody = {
      'from_user': currentUUID,
      'friend_id': row.their_friend_id,
      'to_user': toUser,
      'node_id': this.nodeId,
      'action': 'share_node',
    };

    let response = await ApiService.ShareNodeAsync(requestBody);

    if (response !== undefined) {
      Logger.info(`FriendList.shareNode: shared node with user, response ${JSON.stringify(response)}`);
      NavigationService.reset('Map', {showMessage: true, messageText: `shared node with ${row.topic}`});
    }
  }

  _renderItem(item, index) {
    let row = item.item;

    let swipeBtns = [{
      component: (
        <View
          style={{
            flex: 1,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F03A47',
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
          onPress={async () => row.status === 'accepted' ?
          await this.shareNode(row) :
          Snackbar.show({
            title: `${row.topic} has not accepted your friend request.`,
            duration: Snackbar.LENGTH_SHORT,
          })}
          containerStyle={[styles.friendListItem, { marginVertical: index === 0 ? 10 : 5 }]}
          title={<Text style={{fontWeight: 'bold', fontSize: 16}}>{row.topic}</Text>}
          subtitle={<Text style={{color: 'gray', paddingVertical: 5}}>{row.status}</Text>}
          rightIcon={
            <Icon
              name={'arrow-up-right'}
              type={'feather'}
              color={'#00b200'}
              size={36}
            />
          }
        />
      );
  } else {

  return (
    <Swipeout
      right={swipeBtns}
      autoClose={true}
      backgroundColor='#ffffff'
    >
      <ListItem
        onPress={async () => row.status === 'accepted' ?
        await this.sendPrivateMessage(row) :
        Snackbar.show({
          title: `${row.topic} has not accepted your friend request.`,
          duration: Snackbar.LENGTH_SHORT,
        })
      }
        containerStyle={[styles.friendListItem, { marginVertical: index === 0 ? 10 : 5 }]}
        rightElement={
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{width: '50%', flexDirection: 'column', alignItems: 'center'}}>
          <Icon
            name='eye'
            type='feather'
            color='black'
            size={38}
            onPress={() => { this._onTouchNode(row); }}
            underlayColor={'transparent'}
          />
          <Text style={{fontSize: 12, color: 'gray', textAlign: 'center', top: 7}}>view on map</Text>
          </View>
          <View style={{left: 10, width: '50%', flexDirection: 'column', alignItems: 'center'}}>
            <Switch
              style={{top: 4}}
              onTouchStart={async () => { await this.toggleLocationSharing(row); }}
              value={row.sharing_location}
            />
            <Text style={{fontSize: 12, color: 'gray', textAlign: 'center', top: 14}}>share location</Text>
          </View>
        </View>

        }
        title={<Text numberOfLines={1} ellipsizeMode={'tail'} style={{top: 10, fontWeight: 'bold', fontSize: 16}}>{row.topic}</Text>}
        subtitle={
        <View style={{paddingTop: 20, flexDirection: 'row', alignSelf: 'flex-end', right: 5}}>
        <Icon
          name={row.status === 'accepted' ? 'check-circle' : 'more-horizontal'}
          type={'feather'}
          size={18}
          color={row.status === 'accepted' ? 'green' : '#F03A47'}
          containerStyle={row.status === 'accepted' ? {width: '20%'} : {width: '20%', left: -1}}
        />
        <Text style={{width: '80%', color: 'gray', left: 1}}>{row.status}</Text>
        </View>
      }
      />
    </Swipeout>
    );
  }
}

  render() {
    return (
      <View style={{backgroundColor: 'white', height: '100%', flex: 1}}>
        {
          this.state.paymentModalVisible &&
          <PaymentModal
            functions={{
              'showPaymentModal': this.showPaymentModal,
              'closePaymentModal': this.closePaymentModal,
            }}
            wallet={this.state.selectedNode.data.wallet}
            toUser={this.state.selectedNode.data.creator}
            balanceUSD={this.props.wallet.balance_usd}
          />
        }
        <View style={styles.flatlist}>
          <FlatList
            data={this.props.relationList}
            // @ts-ignore
            renderItem={this._renderItem}
            extraData={this.state}
            keyExtractor={item => item.relation_id}
            ListEmptyComponent={
              <View style={styles.nullContainer}>
                <Text style={styles.null}>no friends yet.</Text>
                <Text style={{fontSize: 14, top: 10, alignSelf: 'center', color: 'gray'}}>you can track other users here.</Text>
              </View>
             }
          />
          {
            this.state.isLoading &&
              <View style={[styles.container, styles.horizontal]}>
                <ActivityIndicator size='large' color='#0000ff' />
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
    wallet: state.wallet,
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
    minHeight: 100,
    maxHeight: 120,
    // borderBottomWidth: .5,
    borderBottomColor: 'rgba(51, 51, 51, 0.1)',
    flex: 1,
    backgroundColor: 'white',
    borderColor: 'rgba(218, 219, 221, 1)',
    // borderWidth: 0.5,
    borderRadius: 5,
    padding: 15,
    marginHorizontal: 5,
  },
  flatlist: {
    flex: 1,
    backgroundColor: '#F6F4F3',
  },
  null: {
    fontSize: 20,
    color: 'gray',
    alignSelf: 'center',
  },
  nullContainer: {
    marginTop: height / 3,
    justifyContent: 'center',
    alignItems: 'center',
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