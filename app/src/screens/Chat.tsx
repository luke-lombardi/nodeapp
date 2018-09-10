import React, { Component } from 'react';
// @ts-ignore
import { View, FlatList, StyleSheet, Text, AsyncStorage, Alert } from 'react-native';
import { ListItem } from 'react-native-elements';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

import ApiService from '../services/ApiService';

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
}

export class Chat extends Component<IProps, IState> {
  // @ts-ignore
  private apiService: ApiService;

  constructor(props: IProps) {
    super(props);

    this.state = {
        data: [
          {
            name: 'eli mernit',
            message: 'MFW I open the basket of envelopes for the first time lmaooo',
            submitted: '5 minutes ago',
            location: 'Bronx, NY',
            id: 1,
          },
          {
            name: 'eli mernit',
            message: 'jw if anyone knows good bud around here',
            submitted: '12 minutes ago',
            location: 'Bronx, NY',
            id: 2,
          },
        ],
        query: '',
        selectedPlace: this.props.navigation.getParam('selectedPlace'),
        date: this.props.navigation.getParam('date'),
        item: this.props.navigation.getParam('contact'),
        selectedDate: this.props.navigation.getParam('selectedDate'),
        selectedPlaceAddress: this.props.navigation.getParam('selectedPlaceAddress'),
        nodeId: this.props.navigation.getParam('nodeId', ''),
    };
    this._renderItem = this._renderItem.bind(this);

    this.apiService = new ApiService({});
    }

    _renderItem = ({item}) => (
      <ListItem
        scaleProps={{
          friction: 90,
          tension: 100,
          activeScale: 0.95,
        }}
        // onPress={() => this._onTouchGroup(item)}
        containerStyle={styles.nodeListItem}
        rightIcon={{name: 'chevron-right', color: 'rgba(51, 51, 51, 0.8)'}}
        title={
          <View style={styles.titleView}>
          <Text style={styles.titleText}>{item.message}</Text>
          </View>
        }
        subtitle={
          <View style={styles.subtitleView}>
          <Text style={styles.ratingText}>{item.submitted}</Text>
          </View>
        }
      />
    )

    render() {
      return (
        <View style={styles.flatlist}>
          <FlatList
           data={this.state.data}
           renderItem={this._renderItem}
           keyExtractor={item => item.id}
          />

          {
            this.state.data.length === 0 &&
            <Text style={styles.null}>No messages yet!</Text>
          }
        </View>

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

export default connect(mapStateToProps, mapDispatchToProps)(Chat);

const styles = StyleSheet.create({
  searchBar: {
    position: 'absolute',
  },
  nodeListItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 51, 51, 0.2)',
    minHeight: 100,
    maxHeight: 120,
  },
  null: {
    fontSize: 22,
    marginTop: 25,
    alignSelf: 'center',
  },
  titleText: {
    color: 'black',
    fontSize: 14,
  },
  titleView: {
    flexDirection: 'row',
    paddingTop: 5,
  },
  subtitleView: {
    flexDirection: 'row',
    paddingTop: 5,
  },
  ratingText: {
    color: 'grey',
  },
  flatlist: {
    marginBottom: 200,
  },
});