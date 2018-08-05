import React, { Component } from 'react';
import { View, StyleSheet, FlatList, AsyncStorage } from 'react-native';

// @ts-ignore
import Logger from '../services/Logger';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

import { Input, Button, ListItem, Slider } from 'react-native-elements';

import ApiService from '../services/ApiService';
import NodeService from '../services/NodeService';

interface IProps {
  navigation: any;
}

interface IState {
  title: string;
  userRegion: any;
  isLoading: boolean;
  uuid: string;
  public: boolean;
  peopleInGroup: any;
  editing: boolean;
}

export class GroupEditor extends Component<IProps, IState> {
  _map: any;

  private apiService: ApiService;
  private nodeService: NodeService;
  private action: string;

  constructor(props: IProps) {
    super(props);

    this.state = {
      title: '',
      userRegion: {},
      isLoading: false,
      uuid: '',
      public: false,
      editing: false,
      peopleInGroup: [
        {
            'recordID': 'add_button',
            'title': 'Add someone to the group',
        },
      ],
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

    this.submitSaveGroup = this.submitSaveGroup.bind(this);
    this.submitEditGroup = this.submitEditGroup.bind(this);
    this.submitDeleteGroup = this.submitDeleteGroup.bind(this);

    this._addPerson = this._addPerson.bind(this);
    this._renderPeopleInGroup = this._renderPeopleInGroup.bind(this);

    this.apiService = new ApiService({});
    this.nodeService = new NodeService({});
  }

  componentWillMount() {
    console.log('component will mount');

    let userRegion = this.props.navigation.getParam('userRegion', {});
    let uuid = this.props.navigation.getParam('uuid', '');

    this.action = this.props.navigation.getParam('action', '');

    this.setState({userRegion: userRegion});
    this.setState({uuid: uuid});
  }

  componentWillUnmount() {
    console.log('component will unmount');
  }

  componentDidMount() {
    console.log('component mounted');

    if (this.action === 'edit_group') {
      console.log('editing the group');
      let groupData = this.props.navigation.getParam('group_data', '');

      this.setState({
        title: groupData.title,
        editing: true,
      });
    }

  }

  async returnData(item) {
    let existingContact = this.state.peopleInGroup.find(
        n => n.recordID === item.recordID,
    );

    if (existingContact === undefined) {
        let newGroup = this.state.peopleInGroup;
        let newPerson = {
          'name': item.givenName + ' ' + item.familyName,
          'phone': item.phoneNumbers[0].number,
          'recordID': item.recordID,
        };

        newGroup.push(newPerson);
        await this.setState({peopleInGroup: newGroup});
        console.log('Adding new contact');
    } else {
        console.log('Contact already added');
    }

    console.log(this.state.peopleInGroup);
  }

  _addPerson() {
      let params = {action: 'add_friend_to_group', returnData: this.returnData.bind(this)};
      this.props.navigation.navigate('ContactList', params);
  }

  async _removePerson(item) {
    let index = this.state.peopleInGroup.findIndex(
        n => n.recordID === item.recordID,
    );

    let newGroup = this.state.peopleInGroup;
    newGroup.splice(index, 1);

    await this.setState({peopleInGroup: newGroup});
  }

  _renderPeopleInGroup(item) {
      console.log(item);
    if (item.item.recordID === 'add_button') {
        return(<ListItem
            onPress={this._addPerson}
            containerStyle={styles.peopleListItem}
            rightIcon={{name: 'plus-circle', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
            title={'Add someone to the group'}
            />);
    } else {
        return(<ListItem
        onPress={() => this._removePerson(item.item)}
        containerStyle={styles.peopleListItem}
        leftIcon={{name: 'user', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
        rightIcon={{name: 'minus-circle', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
        title={item.item.name}
        subtitle={'Status: Pending, ' + item.item.phone}
        />);
    }

}

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.groupForm}>

          <View style={styles.inputView}>
            <Input
              placeholder='Group title'
              leftIcon={
                {name: 'type', type: 'feather', color: 'rgba(51, 51, 51, 0.5)', size: 35}
              }
                containerStyle={styles.inputPadding}
                // @ts-ignore
                inputContainerStyle={{ borderBottomWidth: 0, 'height': '100%'}}
                onChangeText={(title) => this.setState({title: title})}
                value={this.state.title}
                autoFocus={true}
            />

          </View>
          <View style={styles.peopleView}>
            <FlatList
            data={this.state.peopleInGroup}
            renderItem={this._renderPeopleInGroup}
            extraData={this.state}
            // @ts-ignore
            keyExtractor={item => item.recordID}
            showsVerticalScrollIndicator={true}
            >

            </FlatList>

          </View>

          <View style={styles.buttonContainer}>
            <View style={styles.buttonView}>
                <Button style={styles.bottomButton} buttonStyle={{width: '100%', height: '100%'}}
                    onPress={this.state.editing ? this.submitEditGroup : this.submitSaveGroup}
                    loading={this.state.isLoading}
                    disabled={this.state.isLoading}
                    loadingStyle={styles.loading}
                    title={this.state.editing ? 'Update' : 'Create'}
                />
            </View>
            <View style={styles.buttonView}>
                <Button style={styles.bottomButton} buttonStyle={{width: '100%', height: '100%', backgroundColor: 'red'}}
                    onPress={this.submitDeleteGroup}
                    loading={false}
                    disabled={this.state.editing ? false : true}
                    loadingStyle={styles.loading}
                    title='Delete'
                />
            </View>
        </View>

        <View style={styles.configView}>
            <Slider
                // value={this.state.value}
                // onValueChange={(value) => this.setState({})}
                minimumTrackTintColor={'rgba(51, 51, 51, 0.9)'}
                maximumTrackTintColor={'rgba(51, 51, 51, 0.3)'}
                thumbTintColor={'rgba(51, 51, 51, 0.8)'}
                />
            {/* <Text>Value: {this.state.value}</Text> */}
        </View>

        </View>
      </View>
    );
  }

  private async submitSaveGroup() {
    let currentUUID = await AsyncStorage.getItem('user_uuid');

    let groupData = {
      'group_data': {
        'title': this.state.title,
        'public': false,
        'type': 'group',
        'owner': 'private:' + currentUUID,
        'ttl': 36000,
        'members': {},
      },
      'people_to_invite': this.state.peopleInGroup.slice(1),
    };

    console.log('Submitted group request');
    console.log(groupData);

    await this.setState({isLoading: true});
    let newGroupId = await this.apiService.CreateGroupAsync(groupData);
    await this.setState({isLoading: false});

    if (newGroupId !== undefined) {
      await this.nodeService.storeGroup(newGroupId);
      await this.setState({editing: true});
    } else {
      Logger.info('CreateNode.submitCreateGroup - invalid response from create group.');
    }

    // this.props.navigation.navigate('Map', {updateNodes: true});
  }

  private async submitEditGroup() {
    console.log('edit action');
  }

  private async submitDeleteGroup() {
    console.log('delete action');
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

export default connect(mapStateToProps, mapDispatchToProps)(GroupEditor);

const styles = StyleSheet.create({
  container: {
    padding: 0,
    flex: 1,
    backgroundColor: '#ffffff',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },
  miniMapView: {
    flex: 1,
    padding: 10,
  },
  map: {
    borderRadius: 10,
  },
  inputView: {
    flex: 1,
  },
  peopleView: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 51, 51, 0.1)',
    flex: 4,
    padding: 10,
    margin: 20,
  },
  configView: {
    flex: 2,
    padding: 20,
  },
  peopleListItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 51, 51, 0.2)',
    minHeight: 80,
    maxHeight: 80,
  },
  addButton: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(51, 51, 51, 0.2)',
    minHeight: 80,
    maxHeight: 80,
    padding: 20,
  },
  groupForm: {
    flex: 6,
    alignSelf: 'stretch',
  },
  inputPadding: {
    marginTop: 20,
    marginLeft: 15,
    borderWidth: 0,
  },
  descriptionInput: {
    padding: 10,
    height: 100,
  },
  buttonView: {
    flex: 1,
  },
  bottomButton: {
    width: '100%',
    height: 75,
    borderWidth: 1,
    borderColor: 'white',
  },
  loading: {
    alignSelf: 'center',
    width: 300,
    height: 50,
  },
});
