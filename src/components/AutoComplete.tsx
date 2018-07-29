import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface IProps {

}

interface IState {

}

export default class AutoComplete extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
        <GooglePlacesAutocomplete
        placeholder='Where are you meeting?'
        minLength={2} // minimum length of text to search
        autoFocus={false}
        returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
        listViewDisplayed='auto'    // true/false/undefined
        fetchDetails={true}
        renderDescription={row => row.description} // custom description render
        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
            console.log(data, details);
        }}
        getDefaultValue={() => ''}
        query={{
            // available options: https://developers.google.com/places/web-service/autocomplete
            key: 'AIzaSyDsq6jsNHyKSNZtVzrXRL4EcZeqZPKDNhU',
            language: 'en', // language of the results
            types: 'geocode', // default: 'geocode'
        }}
        styles={{
            textInputContainer: {
            backgroundColor: 'white',
            borderTopWidth: 0,
            borderBottomWidth: 1,
            marginBottom: 10,
            },
            container: {
                height: '10%',
                padding: 20,
            },
            description: {
            fontWeight: 'bold',
            },
            row: {
                flex: 3,
            },
            predefinedPlacesDescription: {
            color: '#1faadb',
            },
        }}
        nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
        GoogleReverseGeocodingQuery={{
            // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
        }}
        GooglePlacesSearchQuery={{
            // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
            rankby: 'distance',
            types: 'food',
        }}
        filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
        debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
            />
        );
    }
}

const styles = StyleSheet.create({
    autoComplete: {
        position: 'absolute',
        //marginTop: 100,
        maxHeight: '10%',
    },
});