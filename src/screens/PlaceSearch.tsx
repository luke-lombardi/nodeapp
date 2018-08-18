import React, { Component } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { ListItem, SearchBar } from 'react-native-elements';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';


interface IProps {
    navigation: any;
}

interface IState {
    data: Array<any>;
    places: Array<any>;
    query: any;
    selectedPlace: any;
    selectedDate: any;
    selectedPlaceAddress: any;
    date: any;
    item: any;
    lat: any;
    lng: any;
}

export class PlaceSearch extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
        data: [],
        places: [],
        query: '',
        selectedDate: this.props.navigation.getParam('selectedDate'),
        selectedPlace: this.props.navigation.getParam('selectedPlace'),
        selectedPlaceAddress: this.props.navigation.getParam('selectedPlaceAddress'),
        date: this.props.navigation.getParam('date'),
        item: this.props.navigation.getParam('contact'),
        lat: '',
        lng: '',
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.getPlaces = this.getPlaces.bind(this);
    }

    componentWillMount() {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setState({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
          });
          this.getPlaces();
        });
      }

    async getPlaces() {
        const authToken = 'SBYAMQL0LBBFVXLBDSPGFYAEEWSSQSCZZOWOHIQ05TAEX3CZ';
        let response = await fetch(`https://api.foursquare.com/v2/venues/search?ll=${this.state.lat + ',' + this.state.lng}&oauth_token=${authToken}&v=20180730`, {
          method: 'POST',
        });
        let places = await response.json();
        this.setState({data: places.response.venues});
      }

      searchContact() {
        return this.state.data.filter(
          item => new RegExp(`\\b${this.state.query}`, 'gi').test(item.name || item.name),
        );
      }

    _renderItem = ({item}) => (
      <ListItem
        scaleProps={{
          friction: 90,
          tension: 100,
          activeScale: 0.95,
        }}
        key={item}
        onPress={() => this.selectContact(item)}
        containerStyle={styles.nodeListItem}
        leftIcon={ {name: 'map-pin', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'} }
        rightIcon={ {name: 'chevron-right', color: 'rgba(51, 51, 51, 0.8)'} }
        title={
          <Text style={styles.title}>{item.name}</Text>
        }
        subtitle={
          <Text style={styles.subtitle}>{item.location.address}</Text>
        }
      />
    )

    render() {
      return (
        <View>
        <SearchBar
          onChangeText={query => this.setState({query})}
          lightTheme
          placeholder='Search for a location' />
          <FlatList
          data={this.state.query ? this.searchContact() : this.state.data}
          renderItem={this._renderItem}
          extraData={this.state}
          keyExtractor={item => item.id}
          />

          {
            this.state.data.length === 0 &&
            <Text style={styles.null}>Unable to get locations</Text>
          }
        </View>

      );
    }

    // Private implementation functions
    private async selectContact(item) {
      const selectedPlace = item.name;
      const selectedPlaceAddress = item.location.address;
      this.props.navigation.navigate('CreateMeetup', {
        contact: this.state.item,
        selectedDate: this.state.selectedDate,
        selectedPlaceAddress: selectedPlaceAddress,
        selectedPlace: selectedPlace,
        date: this.state.date,
      });
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

export default connect(mapStateToProps, mapDispatchToProps)(PlaceSearch);

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
  title: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 10,
  },
});