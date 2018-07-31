import React, { Component } from 'react';
import { View, StyleSheet, Text, DatePickerIOS, TouchableOpacity } from 'react-native';

// @ts-ignore
import MapView, { Marker}   from 'react-native-maps';

import Logger from '../services/Logger';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

import { Button} from 'react-native-elements';
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
  chosenDate: any;
  place: any;
  calendarVisible: boolean;
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
      chosenDate: new Date(),
      place: '',
      calendarVisible: false,
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);

    this.submitCreateNode = this.submitCreateNode.bind(this);

    this.goToContactList = this.goToContactList.bind(this);

    this.goToSearch = this.goToSearch.bind(this);

    this.setDate = this.setDate.bind(this);
    this.showCalendar = this.showCalendar.bind(this);

    this.apiService = new ApiService({});
    this.nodeService = new NodeService({});
  }

  setDate(date) {
    this.setState({chosenDate: date});
  }

  goToContactList() {
    this.props.navigation.navigate('ContactList', {action: 'meetup_invite'});
  }

  goToSearch() {
    this.props.navigation.navigate('PlaceSearch');
  }

  componentWillMount() {
    console.log('component will mount');
  }

  componentWillUnmount() {
    console.log('component will unmount');
  }

  componentDidMount() {
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

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.nodeForm}>
          <View style={styles.inputView}>
          {/* <Text style={styles.text}>Coordinate a Meetup</Text> */}

          <TouchableOpacity
          style={styles.calendar}
          onPress={this.showCalendar}
          >
          <Text style={styles.dateSelect}>When?</Text>
          <Icon style={{ alignSelf: 'flex-end', right: 50, bottom: '50%'}}
          name='arrow-right' />
          </TouchableOpacity>

          {
            this.state.calendarVisible &&
            <View>
            <DatePickerIOS
            style={styles.datePicker}
            date={this.state.chosenDate}
            onDateChange={this.setDate}
          />
          <Button
            icon={
            <Icon
              name='check'
              size={15}
              color='white'
            />
            }
            buttonStyle={{backgroundColor: 'limegreen'}}
            title='Confirm'
            onPress={this.showCalendar}
          />
          </View>
          }

          <TouchableOpacity
          style={styles.calendar}
          onPress={this.goToSearch}
          >
          <Text style={styles.dateSelect}>Where?</Text>
          <Icon style={{ alignSelf: 'flex-end', right: 50, bottom: '50%'}}
          name='arrow-right' />
          </TouchableOpacity>

          <TouchableOpacity
          style={styles.calendar}
          onPress={this.goToContactList}
          >
          <Text style={styles.dateSelect}>Who?</Text>
          <Icon style={{ alignSelf: 'flex-end', right: 50, bottom: '50%'}}
          name='arrow-right' />
          </TouchableOpacity>

          </View>

          <Button style={styles.fullWidthButton} buttonStyle={{width: '100%', height: '100%'}}
            onPress={this.submitCreateNode}
            loading={this.state.isLoading}
            disabled={this.state.isLoading}
            loadingStyle={styles.loading}
            title='Create Meetup'

          />

        </View>
      </View>
    );
  }

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
    backgroundColor: '#ffffff',
  },
  placesInput: {
    width: '100%',
    borderBottomColor: 'black',
  },
  miniMapView: {
    flex: 1,
    padding: 10,
  },
  map: {
    borderRadius: 10,
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
    marginTop: 10,
    marginBottom: 10,
    padding: 20,
    alignSelf: 'center',
    fontSize: 16,
  },
  datePicker: {
    marginTop: 20,
  },
  dateSelect: {
    padding: 25,
    left: 20,
    alignSelf: 'flex-start',
    fontSize: 16,
  },
  calendar: {
    borderTopColor: 'gray',
    borderBottomColor: 'gray',
    borderTopWidth: .5,
    borderBottomWidth: .5,
    width: '100%',
    backgroundColor: 'white',
  },
});
