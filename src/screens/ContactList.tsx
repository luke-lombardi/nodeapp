import React, { Component } from 'react';
// @ts-ignore
import { View, FlatList, StyleSheet, Text, AsyncStorage } from 'react-native';
import { ListItem, SearchBar } from 'react-native-elements';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import ApiService from '../services/ApiService';

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
}

export class ContactList extends Component<IProps, IState> {
  // @ts-ignore
  private apiService: ApiService;
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
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.getContacts = this.getContacts.bind(this);
    this.selectContact = this.selectContact.bind(this);
    this.searchContact = this.searchContact.bind(this);
    this._renderItem = this._renderItem.bind(this);
    this.apiService = new ApiService({});

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
              // console.log(contacts);
          }
      });
    }

      searchContact() {
        return this.state.data.filter(
          item => new RegExp(`\\b${this.state.query}`, 'gi').test(item.givenName || item.familyName),
        );
      }

    _renderItem(item) {
      return (<ListItem
        key={item.item.recordID}
        onPress={() => this.selectContact(item.item)}
        containerStyle={styles.nodeListItem}
        // Commented out to stop those annoying URI errors until we add handling around that
        // leftAvatar={this.state.query ? { source: { uri: item.thumbnailPath } } : { source: { uri: item.thumbnailPath }}}
        leftIcon={ {name: 'map-pin', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'} }
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
          placeholder='Search here...' />
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
        </View>

      );
    }

    // Private implementation functions
    private async selectContact(item) {
      // let userUuid = await AsyncStorage.getItem('user_uuid');
      // let phoneNumber = item.phoneNumbers[0].number;
      // let name = item.givenName + ' ' + item.familyName;

      if (this.action === 'add_friend') {
        console.log('sending text to your boy');
      } else if (this.action === 'add_friend_to_group') {
        this.props.navigation.state.params.returnData(item);
        this.props.navigation.goBack(undefined);
      } else if (this.action === 'meetup_invite') {
        this.props.navigation.navigate('CreateMeetup', {
          contact: item,
          selectedPlace: this.state.selectedPlace,
          selectedDate: this.state.selectedDate,
          date: this.state.date,
          selectedPlaceAddress: this.state.selectedPlaceAddress,
        });
      }

      // let requestBody = {
      //   'name': name,
      //   'phone': phoneNumber,
      //   'user_uuid': userUuid,
      // };

      // console.log('Submitted text invite for', phoneNumber);
      // await this.apiService.sendText(requestBody);
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
    marginTop: 25,
    alignSelf: 'center',
  },
});