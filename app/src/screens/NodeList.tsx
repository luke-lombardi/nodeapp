import React, { Component } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { ListItem, ButtonGroup, Icon } from 'react-native-elements';
import { Button } from 'react-native-elements';
import Moment from 'moment';

// import LinearGradient from 'react-native-linear-gradient';

import NavigationService from '../services/NavigationService';

// import Logger from '../services/Logger';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
// import { bindActionCreators } from 'redux';

// const WINDOW_WIDTH = Dimensions.get('window').width;

interface IProps {
    functions: any;
    navigation: any;
    privatePersonList: Array<any>;
    privatePlaceList: Array<any>;
    publicPersonList: Array<any>;
    publicPlaceList: Array<any>;
}

interface IState {
  selectedIndex: number;
  data: Array<any>;
  isRefreshing: boolean;
  isLoading: boolean;
  elaspedTime: number;
  time: any;
}

export class NodeList extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    this.state = {
      selectedIndex: 0,
      data: this.props.publicPlaceList,
      isRefreshing: false,
      isLoading: false,
      elaspedTime: 0,
      time: '',
    };

    this.updateIndex = this.updateIndex.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
    this.countdown = this.countdown.bind(this);
  }

  updateIndex (selectedIndex) {
    this.setState({isLoading: true});
    if (selectedIndex === 0) {
      this.setState({
        selectedIndex,
        data: this.props.publicPlaceList,
        isLoading: false,
      });
    } else if (selectedIndex === 1) {
      this.setState({
        selectedIndex,
        data: this.props.privatePlaceList,
        isLoading: false,
      });
    }
  }

  _onTouchNode(node: any, index: number) {
    let region = {
      latitude: parseFloat(node.data.latitude),
      longitude: parseFloat(node.data.longitude),
      latitudeDelta: parseFloat(node.data.latDelta),
      longitudeDelta: parseFloat(node.data.longDelta),
    };

    let nodeType = undefined;

    if (node.data.type === 'place' && node.data.private) {
      nodeType = 'privatePlace';
    } else if (node.data.type === 'person' && node.data.private) {
      nodeType = 'privatePerson';
    } else if (node.data.type === 'place' && !node.data.private) {
      nodeType = 'publicPlace';
    } else if (node.data.type === 'person' && !node.data.private) {
      nodeType = 'publicPerson';
    }

    NavigationService.reset('Map', {
      region: region,
      nodeType: nodeType,
      nodeIndex: index,
    });
  }

    // TODO: figure out a better way to do this
    async countdown(item) {
      // {this.interval = setInterval(() => { this.countdown(item); }, 1000)}
      let elaspedTime = this.state.elaspedTime;
      elaspedTime += 1;

      let timeInMinutes = Moment().startOf('day').seconds(item.data.ttl - elaspedTime).format('HH:mm:ss');
      await this.setState({
        elaspedTime: elaspedTime,
        time: timeInMinutes,
      });
    }

  _renderItem = ({item, index}) => (
    <ListItem
      onPress={() => this._onTouchNode(item, index)}
      containerStyle={styles.nodeListItem}
      titleStyle={{fontWeight: 'bold', fontSize: 14}}
      title={item.data.topic}
      rightTitleStyle={{fontWeight: '600', fontSize: 14}}
      rightTitle={
      <View style={{paddingVertical: 5}}>
        <Text style={{fontWeight: 'bold', alignSelf: 'flex-end', alignItems: 'flex-end'}}>{item.data.distance_in_miles.toString()}</Text>
        <Text style={{paddingVertical: 5, color: 'gray'}}>miles away</Text>
        </View>
      }
      subtitle={
        <View style={{paddingVertical: 5}}>
          <Text style={{fontSize: 14, color: 'gray'}}>Expires in {(item.data.ttl / 3600).toFixed(1)} hours</Text>
          {
            item.data.likes &&
            <Text style={{paddingVertical: 5, fontSize: 14, color: 'gray'}}>Saved by {Object.keys(item.data.likes).length} {Object.keys(item.data.likes).length < 2 ? 'person' : 'people'}</Text>
          } */}
        </View>
      }
    />
  )

  async onRefresh() {
    await this.setState({isRefreshing: true});
    await this.setState({isRefreshing: false});

    // let newList = await this.props.publicPlaceList;
    // // @ts-ignore
    // let newPrivateList = await this.props.privatePlaceList;
    // if (newList) {
    //   this.setState({isRefreshing: false});
    // } else {
    //   return;
    // }
  }

  render() {
    const buttons = ['Public', 'Private'];
    const { selectedIndex } = this.state;
    return (
      <View style={{flex: 1}}>
      <View style={{paddingTop: 5, height: 100, backgroundColor: 'black', flexDirection: 'row'}}>
      <Icon
          name={'x'}
          type={'feather'}
          size={30}
          underlayColor={'black'}
          color={'#ffffff'}
          containerStyle={{alignSelf: 'flex-start', top: 40, left: 10, paddingVertical: 0}}
          onPress={() => this.props.navigation.navigate('Map')}
        />
        <ButtonGroup
          innerBorderStyle={{width: 0.0, color: 'black'}}
          containerStyle={{flex: 1, alignSelf: 'center', borderWidth: 0, paddingTop: 15, backgroundColor: 'rgba(0, 0, 0, 0.9);'}}
          buttonStyle={{height: 20, backgroundColor: 'black'}}
          // containerStyle={styles.buttonContainer}
          onPress={this.updateIndex}
          selectedIndex={selectedIndex}
          selectedButtonStyle={{backgroundColor: 'black', borderBottomColor: 'black'}}
          buttons={buttons}
          textStyle={{fontWeight: 'bold', fontSize: 18}}
        />
      </View>
      <View style={styles.flatlist}>
      {
        this.state.isLoading &&
          <ActivityIndicator size={'large'} />
      }
        <FlatList
         data={this.state.data}
         renderItem={this._renderItem}
         extraData={this.state}
         onEndReachedThreshold={0}
         ListHeaderComponent={<View style={{ height: 0, marginTop: 0 }}></View>}
         showsVerticalScrollIndicator={true}
         keyExtractor={item => item.node_id}
         refreshing={this.state.isRefreshing ? true : false}
         onRefresh={this.onRefresh}
        />

        {
          this.state.selectedIndex === 1 && this.props.privatePlaceList.length === 0 &&
          <View style={styles.nullContainer}>
          <Text style={styles.null}>No nodes have been created yet.</Text>
          <Button
            containerStyle={styles.createNodeButton}
            buttonStyle={{borderRadius: 10}}
            title={'Create Node'}
            onPress = {() => this.props.navigation.navigate('CreateNode')}
          />
          </View>
        }
        {
          this.state.selectedIndex === 0 && this.props.publicPlaceList.length === 0 &&
          <View style={styles.nullContainer}>
          <Text style={styles.null}>No nodes have been created yet.</Text>
          <Button
            containerStyle={styles.createNodeButton}
            buttonStyle={{borderRadius: 10}}
            title={'Create Node'}
            onPress = {() => this.props.navigation.navigate('CreateNode')}
          />
          </View>
        }
        </View>
     </View>
    );
  }
}

// @ts-ignore
function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    privatePersonList: state.privatePersonList,
    privatePlaceList: state.privatePlaceList,
    publicPersonList: state.publicPersonList,
    publicPlaceList: state.publicPlaceList,
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeList);

const styles = StyleSheet.create({
  flatlist: {
    flex: 1,
    marginBottom: -10,
    backgroundColor: 'white',
    height: '100%',
    width: '100%',
  },
  nodeListItem: {
    width: '100%',
    marginTop: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 51, 51, 0.2)',
    minHeight: 100,
    maxHeight: 120,
  },
  nullContainer: {
    flex: 1,
    bottom: '35%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  null: {
    fontSize: 22,
    color: 'gray',
    alignSelf: 'center',
  },
  nullSubtitle: {
    fontSize: 14,
    color: 'gray',
    top: '40%',
    paddingVertical: 10,
  },
  button: {
    backgroundColor: 'black',
  },
  createNodeButton: {
    top: 30,
    width: 150,
    borderRadius: 30,
  },
  buttonContainer: {
    height: 50,
    // bottom: 45,
    paddingHorizontal: 100,
    borderBottomColor: 'black',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9);',
    width: '110%',
  },
  transparentButton: {
  },
  locationButton: {
    width: 20,
    height: 20,
    alignSelf: 'flex-start',
    padding: 0,
  },
});