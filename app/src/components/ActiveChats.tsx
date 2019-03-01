import React, { Component } from 'react';
import { View, StyleSheet, Text, FlatList, Dimensions } from 'react-native';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import NavigationService from '../services/NavigationService';
import { ButtonGroup, ListItem, Icon } from 'react-native-elements';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';
import Moment from 'moment';

const { height } = Dimensions.get('window');

Moment.locale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s:  'seconds',
    ss: '%ss',
    m:  'a minute',
    mm: '%dm',
    h:  'an hour',
    hh: '%dh',
    d:  'a day',
    dd: '%dd',
    M:  'a month',
    MM: '%dM',
    y:  'a year',
    yy: '%dY',
  },
});

interface IProps {
    navigation?: any;
    nodeList: Array<any>;
    friendList: Array<any>;
    relationList: Array<any>;
    privatePlaceList: Array<any>;
    privatePersonList: Array<any>;
    publicPlaceList: Array<any>;
    publicPersonList: Array<any>;
    trackedNodeList: Array<any>;
}

interface IState {
  numberOfNotifications: number;
  isLoading: boolean;
  selectedIndex: number;
  data: Array<any>;
}

export class ActiveChats extends Component<IProps, IState> {
  resetAction: any;
  // @ts-ignore
  private readonly configGlobal = ConfigGlobalLoader.config;

    constructor(props: IProps) {
        super(props);

        this.state  = {
          isLoading: true,
          numberOfNotifications: undefined,
          selectedIndex: 0,
          data: this.props.trackedNodeList,
        };

        this.componentWillMount = this.componentWillMount.bind(this);
        this.updateIndex = this.updateIndex.bind(this);
        this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    }

    componentWillReceiveProps() {
        if (this.state.selectedIndex === 0) {
          this.setState({ data: this.props.trackedNodeList });
        } else {
          this.setState({ data: this.props.relationList });
        }
    }

    async updateIndex (selectedIndex) {
      await this.setState({isLoading: true});
      if (selectedIndex === 0) {
        await this.setState({
          selectedIndex,
          data: this.props.trackedNodeList,
          isLoading: false,
        });
      } else if (selectedIndex === 1) {
        await this.setState({
          selectedIndex,
          data: this.props.relationList,
          isLoading: false,
        });
      }
    }

    componentWillMount() {
      //
    }

    // @ts-ignore
    _onTouchNode(node: any, index: number) {
      if (this.state.selectedIndex === 0) {
        // @ts-ignore
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

        NavigationService.reset('Chat', { nodeId: node.node_id} );
      } else {
        NavigationService.reset('Chat', { nodeId: node.relation_id, username: node.topic } );
      }

    }

    _renderItem = ({item, index}) => (
      <ListItem
        onPress={() => this._onTouchNode(item, index)}
        containerStyle={styles.nodeListItem}
        titleStyle={{fontWeight: 'bold', fontSize: 18}}
        title={
          <Text style={{fontWeight: 'bold'}} numberOfLines={1} ellipsizeMode='tail'>
          {this.state.selectedIndex === 0 ? item.data.topic : item.topic}
          </Text>
        }
        rightTitleStyle={{fontWeight: '600', fontSize: 14}}
        rightTitle={
            this.state.selectedIndex  ===  1 ?
            <View style={{flexDirection: 'column', right: 10, width: 50, height: 50, alignSelf: 'flex-end'}}>
            <Icon
              name={'eye'}
              type={'feather'}
              color={item.sharing_location ? 'orange' : 'gray'}
              size={28}
              containerStyle={{top: 10}}
            />
            </View>
            :
            <View style={{paddingVertical: 5}}>
              <Text style={{fontWeight: 'bold', alignSelf: 'flex-end', alignItems: 'flex-end'}}>{item.data.distance_in_miles.toString()}</Text>
              <Text style={{paddingVertical: 5, color: 'gray'}}>miles away</Text>
            </View>
          }
        subtitle={
          <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between'}}>
          { this.state.selectedIndex === 0 ?
            <Text style={{fontSize: 14, color: 'gray'}}>{'expires ' + Moment().endOf('minute').seconds(item.data.ttl).fromNow()}</Text>
            :
            undefined
          }
          </View>
        }
      />
    )

    render() {
      const buttons = ['nodes', 'friends'];
      return (
        <View style={{flex: 1}}>
        <View style={{paddingHorizontal: 10, paddingVertical: 10, height: 90, backgroundColor: '#4392F1', flexDirection: 'row'}}>
        <ButtonGroup
          innerBorderStyle={{width: 0, color: 'white'}}
          containerStyle={{alignSelf: 'center', alignItems: 'center', alignContent: 'center', justifyContent: 'space-between', top: 10, borderWidth: 1, width: '90%'}}
          buttonStyle={{height: 20, backgroundColor: '#4392F1'}}
          onPress={this.updateIndex}
          selectedIndex={this.state.selectedIndex}
          selectedButtonStyle={{borderBottomColor: '#4392F1', backgroundColor: 'white'}}
          selectedTextStyle={{color: 'gray'}}
          buttons={buttons}
          textStyle={{fontSize: 18, color: 'white'}}
        />
        </View>
        <View style={styles.flatlist}>
          <FlatList
           data={this.state.data}
           renderItem={this._renderItem}
           extraData={this.state}
           onEndReachedThreshold={0}
           ListHeaderComponent={<View style={{ height: 0, marginTop: 0 }}></View>}
           showsVerticalScrollIndicator={true}
           keyExtractor={item => (this.state.selectedIndex === 0 ? item.node_id : item.relation_id) }
           ListEmptyComponent={
            <View style={styles.nullContainer}>
            <Text style={styles.null}>{this.state.selectedIndex === 0 ? 'no tracked nodes yet' : 'no friends yet'}</Text>
            </View>
           }
          />
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
      trackedNodeList: state.trackedNodeList,
      relationList: state.relationList,
    };
  }

  // @ts-ignore
  function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
    return {
    };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(ActiveChats);

  const styles = StyleSheet.create({
    flatlist: {
      flex: 1,
      marginBottom: -10,
      backgroundColor: 'white',
      height: '100%',
      width: '100%',
    },
    nullContainer: {
      marginTop: height / 3,
      justifyContent: 'center',
      alignItems: 'center',
    },
    null: {
      fontSize: 22,
      color: 'gray',
      top: '100%',
      alignSelf: 'center',
    },
    nodeListItem: {
      width: '100%',
      marginVertical: 5,
      borderBottomWidth: .5,
      borderBottomColor: 'rgba(51, 51, 51, 0.1)',
      minHeight: 50,
      maxHeight: 80,
    },
    nullSubtitle: {
      fontSize: 14,
      color: 'gray',
      top: '40%',
      paddingVertical: 10,
    },
    button: {
      backgroundColor: '#4392F1',
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
      borderBottomColor: '#4392F1',
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