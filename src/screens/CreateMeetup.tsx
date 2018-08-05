import React, { Component } from 'react';

// @ts-ignore
import { View, StyleSheet, Text, DatePickerIOS, TouchableOpacity, FlatList } from 'react-native';

// @ts-ignore
import MapView, { Marker}   from 'react-native-maps';

import Logger from '../services/Logger';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

import ApiService from '../services/ApiService';
import NodeService from '../services/NodeService';

// import ContactList from '../screens/ContactList';
// import PlaceSearch from '../screens/PlaceSearch';

// const CLIENT_ID = 'K14FVC2J10UYPEHTE2JL1PHXNRX3CCPXSB0KUMCYOSNQUY5Y';
// const CLIENT_SECRET = 'STMMKGZ3JNJEOTTUPQBQBUYBQF0V1M1RUZFTKN4EIUP2UNUT';

interface IProps {
  navigation: any;
}

interface IState {
  title: string;
  description: string;
  userRegion: any;
  isLoading: boolean;
  uuid: string;
  public: boolean;
  place: any;
  calendarVisible: boolean;
  selectedPlace: any;
  selectedDate: boolean;
  selectedContact: boolean;
  selectedPlaceAddress: any;
  item: any;
  date: any;
}

export class CreateMeetup extends Component<IProps, IState> {
  _map: any;
  private apiService: ApiService;
  private nodeService: NodeService;

  constructor(props: IProps) {
    super(props);

    this.state = {
      title: '',
      description: '',
      userRegion: {},
      isLoading: false,
      uuid: '',
      public: false,
      date: this.props.navigation.getParam('date'),
      place: '',
      calendarVisible: false,
      selectedPlace: this.props.navigation.getParam('selectedPlace'),
      item: this.props.navigation.getParam('contact'),
      selectedDate: this.props.navigation.getParam('selectedDate'),
      selectedPlaceAddress: this.props.navigation.getParam('selectedPlaceAddress'),
      selectedContact: false,
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);

    this.submitCreateMeetup = this.submitCreateMeetup.bind(this);

    this.goToContactList = this.goToContactList.bind(this);

    this.goToSearch = this.goToSearch.bind(this);

    this.showCalendar = this.showCalendar.bind(this);
    this.showPlace = this.showPlace.bind(this);

    this.apiService = new ApiService({});
    this.nodeService = new NodeService({});
  }

  goToContactList() {
    this.props.navigation.navigate('ContactList', {
      action: 'meetup_invite',
      contact: this.state.item,
      selectedPlace: this.state.selectedPlace,
      date: this.state.date,
      selectedDate: this.state.selectedDate,
      selectedPlaceAddress: this.state.selectedPlaceAddress,
    });
  }

  goToSearch() {
    this.props.navigation.navigate('PlaceSearch', {
      contact: this.state.item,
      date: this.state.date,
      selectedPlace: this.state.selectedPlace,
      selectedDate: this.state.selectedDate,
    });
  }

  async submitCreateMeetup() {
    this.setState({isLoading: true});
    let requestBody = {
      'date': this.state.date,
      'location': this.state.selectedPlace,
      'member': this.state.selectedContact,
    };
    await this.apiService.createMeetup(requestBody);
  }

  componentWillMount() {
    console.log('got date', this.state.date);
    console.log('component will mount');
  }

  componentWillUnmount() {
    console.log('component will unmount');
  }

  componentDidMount() {
    console.log('got your selected place', this.state.selectedPlace);
    this.showPlace();
    console.log('component mounted');
  }

  openContacts() {
    console.log('opening contacts');
  }

  showCalendar() {
    this.state.calendarVisible ?
    this.setState({calendarVisible: false}) :
    this.setState({calendarVisible: true});
  }

  showPlace() {
    if (this.state.selectedPlace) {
      console.log('got your selected place', this.state.selectedPlace);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.nodeForm}>
          <View style={styles.inputView}>
            <View style={styles.textBackground}>
              <Text style={styles.text}>Create a Meetup</Text>
            </View>

            <TouchableOpacity
            style={styles.calendar}
            onPress={this.showCalendar}
            >
            <Text style={styles.dateSelect}>{this.state.selectedDate ? this.state.date.toString().slice(3, 21) : 'When?'}</Text>
            <Icon
            size={20}
            style={this.state.selectedDate ?
            { color: 'green', alignSelf: 'flex-end', right: 50, bottom: '50%'} :
            { color: 'black', alignSelf: 'flex-end', right: 50, bottom: '50%'}}
              name={this.state.selectedDate ? 'check' : 'arrow-right'}/>

            </TouchableOpacity>

          {
            this.state.calendarVisible &&
            <View>
            <DatePickerIOS
            style={styles.datePicker}
            date={this.state.date || new Date()}
            onDateChange={date => this.setState({date, selectedDate: true})}
          />
          <Button
            icon={
            <Icon
              name='check'
              size={15}
              color='white'
            />
            }
            buttonStyle={styles.calendarButton}
            title='Confirm'
            onPress={this.showCalendar}
          />
          </View>
          }

          {
            !this.state.calendarVisible &&
            <TouchableOpacity
            style={styles.calendar}
            onPress={this.goToSearch}
            >
            <Text style={styles.placeText}>{this.state.selectedPlace ? this.state.selectedPlace : 'Where?'}</Text>

            {
              this.state.selectedPlaceAddress &&
              <Text style={styles.addressText}>{this.state.selectedPlaceAddress}</Text>
            }

            <Icon
            size={20}
            style={this.state.selectedPlace ?
            { color: 'green', alignSelf: 'flex-end', right: 50, bottom: '50%'} :
            { color: 'black', alignSelf: 'flex-end', right: 50, bottom: '50%'}}
              name={this.state.selectedPlace ? 'check' : 'arrow-right'} />
            </TouchableOpacity>

          }

          {/* {
            this.state.selectedPlace &&
            <Card
            title='Where?'
            containerStyle={styles.mapCard}>
            {
              <MapView
              provider='google'
              ref={component => { this._map = component; } }
              style={styles.map}
              showsUserLocation={true}
              followsUserLocation={true}
              initialRegion={this.state.userRegion}
            >
            </MapView>
            }
          </Card>
          } */}

          {
            !this.state.calendarVisible &&
            <TouchableOpacity
            style={styles.contactSelect}
            onPress={this.goToContactList}
            >
              <Text style={styles.dateSelect}>{this.state.item ? `${this.state.item.givenName} ${this.state.item.familyName}` : 'Who?'}</Text>

              <Icon
              size={20}
              style={this.state.item ?
              { color: 'green', alignSelf: 'flex-end', right: 50, bottom: '50%'} :
              { color: 'black', alignSelf: 'flex-end', right: 50, bottom: '50%'}}
              name={this.state.item ? 'check' : 'arrow-right'} />
            </TouchableOpacity>
          }

          </View>

          <Button style={styles.fullWidthButton} buttonStyle={{width: '100%', height: '100%'}}
            onPress={this.submitCreateMeetup}
            loading={this.state.isLoading}
            disabled={
              this.state.isLoading ||
              this.state.item === undefined ||
              this.state.selectedPlace === undefined ||
              this.state.selectedDate === false
            }
            loadingStyle={styles.loading}
            title='Create Meetup'
          />

        </View>
      </View>
    );
  }

  // @ts-ignore
  private async submitCreateNode() {
    let nodeData = {
      'title': this.state.title,
      'description': this.state.description,
      'lat': this.state.userRegion.latitude,
      'lng': this.state.userRegion.longitude,
      'public': this.state.public,
      'type': 'place',
    };

    console.log('Submitted node request');

    await this.setState({isLoading: true});
    let newUuid = await this.apiService.CreateNodeAsync(nodeData);

    if (newUuid !== undefined) {
      await this.nodeService.storeNode(newUuid);
    } else {
      Logger.info('CreateNode.submitCreateNode - invalid response from create node.');
    }

    await this.setState({isLoading: false});
    this.props.navigation.navigate('Map', {updateNodes: true});
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateMeetup);

const styles = StyleSheet.create({
  container: {
    padding: 0,
    flex: 1,
    backgroundColor: 'white',
  },
  textBackground: {
    backgroundColor: 'purple',
  },
  mapCard: {
    marginBottom: 20,
    height: 250,
  },
  calendarButton: {
    backgroundColor: 'limegreen',
    height: '65%',
  },
  placesInput: {
    width: '100%',
    borderBottomColor: 'black',
  },
  miniMapView: {
    flex: 1,
    padding: 10,
  },
  inputView: {
    flex: 2,
  },
  nodeForm: {
    flex: 6,
    alignSelf: 'stretch',
  },
  inputPadding: {
    marginTop: 20,
    marginLeft: 15,
  },
  descriptionInput: {
    padding: 10,
    height: 100,
  },
  fullWidthButton: {
    backgroundColor: 'blue',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    padding: 0,
  },
  loading: {
    alignSelf: 'center',
    width: 300,
    height: 50,
  },
  text: {
    marginTop: 0,
    padding: 20,
    alignSelf: 'center',
    fontSize: 24,
    fontWeight: '100',
    color: 'white',
  },
  datePicker: {
    marginTop: 10,
  },
  dateSelect: {
    width: '75%',
    padding: 25,
    left: 20,
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'normal',
  },
  placeText: {
    width: '75%',
    padding: 25,
    left: 20,
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'normal',
  },
  addressText: {
    width: '75%',
    marginTop: -10,
    paddingBottom: 10,
    paddingLeft: 25,
    left: 20,
    alignSelf: 'flex-start',
    fontSize: 14,
  },
  calendar: {
    paddingTop: 10,
    borderTopColor: 'gray',
    borderBottomColor: 'gray',
    borderTopWidth: .5,
    borderBottomWidth: .5,
    width: '100%',
    backgroundColor: 'white',
  },
  contactSelect: {
    paddingTop: 5,
    borderTopColor: 'gray',
    borderBottomColor: 'gray',
    borderTopWidth: .5,
    borderBottomWidth: .5,
    width: '100%',
    maxHeight: 85,
    backgroundColor: 'white',
  },
  map: {
    alignSelf: 'center',
    height: 150,
    width: '100%',
  },
});
