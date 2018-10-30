import React, { Component } from 'react';
// @ts-ignore
import { View, FlatList, StyleSheet, Text, AsyncStorage, Alert } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

import { ListItem, SearchBar } from 'react-native-elements';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

import ApiService from '../services/ApiService';
import NodeService from '../services/NodeService';

import Logger from '../services/Logger';

import Contacts from 'react-native-contacts';

interface IProps {
    navigation: any;
}

interface IState {
    data: Array<any>;
    query: any;
    selectedPlace: any;
    date: any;
    item: any;
    selectedDate: boolean;
    selectedPlaceAddress: any;
    nodeId: string;
    isLoading: boolean;
}

export class ContactList extends Component<IProps, IState> {
  // @ts-ignore
  private apiService: ApiService;
  private nodeService: NodeService;

  private action: any;

  constructor(props: IProps) {
    super(props);

    this.state = {
        data: [],
        query: '',
        selectedPlace: this.props.navigation.getParam('selectedPlace'),
        date: this.props.navigation.getParam('date'),
        item: this.props.navigation.getParam('contact'),
        selectedDate: this.props.navigation.getParam('selectedDate'),
        selectedPlaceAddress: this.props.navigation.getParam('selectedPlaceAddress'),
        nodeId: this.props.navigation.getParam('nodeId', ''),
        isLoading: false,
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.getContacts = this.getContacts.bind(this);
    this.selectContact = this.selectContact.bind(this);
    this.searchContact = this.searchContact.bind(this);
    this._renderItem = this._renderItem.bind(this);

    this.apiService = new ApiService({});
    this.nodeService = new NodeService({});

    }

    componentWillMount() {
        this.getContacts();
        this.action = this.props.navigation.getParam('action', '');
    }

    getContacts() {
      Contacts.getAll((err, contacts) => {
          if (err && err.type === 'permissionDenied') {
              console.log(err);
          } else {
              this.setState({data: contacts});
          }
      });
    }

    searchContact() {
      let match = this.state.data.filter(
        item => new RegExp(`\\b${this.state.query}`, 'gi').test(item.givenName),
      );

      if (match.length === 0) {
        match = this.state.data.filter(
          item => new RegExp(`\\b${this.state.query}`, 'gi').test(item.familyName),
        );
      }

      return match;
    }

    _renderItem(item) {
      return (
      <ListItem
        scaleProps={{
          friction: 90,
          tension: 100,
          activeScale: 0.95,
        }}
        key={item.item.recordID}
        onPress={() => this.selectContact(item.item)}
        containerStyle={styles.nodeListItem}
        // leftAvatar={item.thumbnailPath ? { source: { uri: item.thumbnailPath } } : { source: require('./../../assets/images/big-guy.png') }}
        leftIcon={ {name: 'circle', type: 'font-awesome', size: 10, color: 'rgba(51, 51, 51, 0.8)'} }
        rightIcon={ {name: 'chevron-right', color: 'rgba(51, 51, 51, 0.8)'} }
        title={item.item.givenName + ' ' + item.item.familyName}
      />
    );
  }

    render() {
      return (
        <View>
        <SearchBar
          onChangeText={query => this.setState({query})}
          lightTheme
          inputStyle={{fontFamily: 'Avenir'}}
          inputContainerStyle={{borderRadius: 10}}
          placeholder='Search Contacts...' />
          <FlatList
          data={this.state.query ? this.searchContact() : this.state.data}
          renderItem={this._renderItem}
          extraData={this.state}
          keyExtractor={item => item.recordID}
          />

          {
            this.state.data.length === 0 &&
            <Text style={styles.null}>Unable to access contacts</Text>
          }

          <Spinner visible={this.state.isLoading} textContent={'Loading...'} textStyle={{color: 'rgba(44,55,71,1.0)'}} />

        </View>

      );
    }

    // Private implementation functions
    private async selectContact(item) {

      console.log('ACTION');
      console.log(this.action);

      if (this.action === 'share_node') {
        let nodeId = this.props.navigation.getParam('nodeId', undefined);

        // If the node id is undefined, just log it and return to the map
        if (nodeId === undefined) {
          Logger.info(`ContactList.selectContact - Passed in invalid nodeId: ${nodeId}`);
          this.props.navigation.goBack(undefined);
          return;
        }

        // Grab the contact info from the item obj.
        let phoneNumber = item.phoneNumbers[0].number.replace(/\D/g, '');

        let name = item.givenName + ' ' + item.familyName;

        // Grab current users UUID
        let userUuid = await AsyncStorage.getItem('user_uuid');

        // Construct request payload
        let requestData = {
            'from': 'private:' + userUuid,
            'node_id': nodeId,
            'name': name,
            'phone': phoneNumber,
            'action': 'share_node',
        };

        Logger.info(`ContactList.selectContact-  Sending the following request body ${JSON.stringify(requestData)}`);

        let messageText = '';

        await this.setState({isLoading: true});
        // Send the node sharing request to API
        let response = await this.apiService.sendText(requestData);
        await this.setState({isLoading: false});

        // If we got an undefined response, something went wrong
        if (response !== undefined) {
          messageText = 'Shared node with ' + item.givenName;
          Logger.info(`ContactList.selectContact-  Got response from sendText ${JSON.stringify(response)}`);
        } else {
          messageText = 'Error sharing node';
          Logger.info('ContactList.selectContact - invalid response from add friend.');
        }

        // Regardless of success or failure, return to the map
        this.props.navigation.navigate({key: 'Map', routeName: 'Map', params: { showMessage: true, messageText: messageText }});

      // If we are adding a new friend
      } else if (this.action === 'add_friend') {

        let phoneNumber = item.phoneNumbers[0].number.replace(/\D/g, '');

        let name = item.givenName + ' ' + item.familyName;

        let userUuid = await AsyncStorage.getItem('user_uuid');

        let inviteData = {
          'invite_data': {
            'from': 'private:' + userUuid,
            'to': undefined,
          },
          'person_to_invite': {
            'name': name,
            'phone': phoneNumber,
          },
        };

        Logger.info(`ContactList.selectContact - Sending friend request ${JSON.stringify(inviteData)}`);

        await this.setState({isLoading: true});
        let newRelation = await this.apiService.AddFriendAsync(inviteData);
        await this.setState({isLoading: false});

        let messageText = '';

        // If we got a valid relation ID from the API, then proceed
        if (newRelation !== undefined) {
          let newFriendId = newRelation.their_id;

          let exists = await this.nodeService.storeFriend(newFriendId);

          // If it is a new friend, then store the friend ID
          if (!exists) {
            Logger.info(`ContactList.selectContact - Got response ${JSON.stringify(newRelation)}`);
            await this.nodeService.storeNode(newFriendId);
            messageText = 'Sent invite to ' + item.givenName;
          }

        } else {
          Logger.info('ContactList.selectContact - unable to invite friend');
          messageText = 'Could not send invite';
        }

        this.props.navigation.navigate({key: 'Map', routeName: 'Map', params: { showMessage: true, messageText: messageText }});

      // This route returns to the group editor with a new contact to invite to the group
      } else if (this.action === 'add_friend_to_group') {
        this.props.navigation.state.params.returnData(item);
        this.props.navigation.goBack(undefined);
      }
    }
  }

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

export default connect(mapStateToProps, mapDispatchToProps)(ContactList);

const styles = StyleSheet.create({
  searchBar: {
    position: 'absolute',
  },
  nodeListItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 51, 51, 0.2)',
    minHeight: 80,
    maxHeight: 80,
  },
  null: {
    fontSize: 22,
    color: 'gray',
    top: 250,
    alignSelf: 'center',
  },
});