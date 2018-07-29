import React, { Component } from 'react';
import { View, FlatList, StyleSheet, Text, Alert, AsyncStorage } from 'react-native';
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
}

export class ContactList extends Component<IProps, IState> {
  private apiService: ApiService;

  constructor(props: IProps) {
    super(props);

    this.state = {
        data: [],
        query: '',
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.getContacts = this.getContacts.bind(this);
    this.selectContact = this.selectContact.bind(this);
    this.searchContact = this.searchContact.bind(this);
    this.apiService = new ApiService({});
    }

    componentWillMount() {
        this.getContacts();
    }

    getContacts() {
      Contacts.getAll((err, contacts) => {
          if (err && err.type === 'permissionDenied') {
              console.log(err);
          } else {
              this.setState({data: contacts});
              console.log(contacts);
          }
      });
    }

      searchContact() {
        return this.state.data.filter(
          item => new RegExp(`\\b${this.state.query}`, 'gi').test(item.givenName || item.familyName),
        );
      }

    _renderItem = ({item}) => (
      <ListItem
        key={item}
        onPress={() => this.selectContact(item)}
        containerStyle={styles.nodeListItem}
        leftAvatar={this.state.query ? { source: { uri: item.thumbnailPath } } : { source: { uri: item.thumbnailPath }}}
        leftIcon={ {name: 'map-pin', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'} }
        rightIcon={ {name: 'chevron-right', color: 'rgba(51, 51, 51, 0.8)'} }
        title={item.givenName + ' ' + item.familyName}
      />
    )

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
          keyExtractor={item => item.id}
          />

          {
            this.state.data.length === 0 &&
            <Text style={styles.null}>Unable to access contacts</Text>
          }
        </View>

      );
    }

    private async selectContact(item) {
      let userUuid = await AsyncStorage.getItem('user_uuid');
      let phoneNumber = item.phoneNumbers[0].number;
      let name = item.givenName + ' ' + item.familyName;
      let requestBody = {
        'name': name,
        'phone': phoneNumber,
        'user_uuid': userUuid,
      };

      console.log('Submitted text invite for', phoneNumber);
      await this.apiService.sendText(requestBody);

      Alert.alert(
        'Invite sent!',
        'You will find your boy',
        [
          {text: 'Invite more', onPress: () => {this.setState({ query: undefined }); } },
        ],
        { cancelable: true },
      );
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