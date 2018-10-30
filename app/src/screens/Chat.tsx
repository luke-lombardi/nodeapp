import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';

// @ts-ignore
import { View, FlatList, StyleSheet, Text, Alert } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import Snackbar from 'react-native-snackbar';
import Spinner from 'react-native-loading-spinner-overlay';

// Redux imports
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

// Services
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

// @ts-ignore
import moment from 'moment';

import SleepUtil from '../services/SleepUtil';
import DeferredPromise from '../services/DeferredPromise';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

interface IProps {
    navigation: any;
}

interface IState {
    data: any;
    isLoading: boolean;
}

export class Chat extends Component<IProps, IState> {
  private monitoring: boolean = false;
  private stopping: boolean = false;
  private checkNowTrigger: DeferredPromise;
  private readonly configGlobal = ConfigGlobalLoader.config;

  private apiService: ApiService;
  private authService: AuthService;

  // @ts-ignore
  private userUuid: string;
  private nodeId: string;
  private action: any;

  // TODO: figure out a smarter way to do this
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10, paddingRight: 10},
        headerTitleStyle: { color: 'white'},
        title: 'Chat',
        headerLeft: <Icon name='x' type='feather' containerStyle={{padding: 5}} size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () => {
          navigation.dispatch(NavigationActions.navigate(
                {
                  key: 'Map',
                  routeName: 'Map',
                  params: {},
                  action: NavigationActions.navigate({ key: 'Map', routeName: 'Map' }),
                })); }
               } />,
          headerRight: <Icon name='edit' type='feather' containerStyle={{padding: 5}} size={25} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () => {
            params.goToCreateMessage();
           } } />,
          };
  }

  constructor(props: IProps) {
    super(props);

    this.state = {
        data: [],
        isLoading: false,
    };

    this.apiService = new ApiService({});
    this.authService = new AuthService({});

    this._renderItem = this._renderItem.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);

    this.CheckNow = this.CheckNow.bind(this);
    this.monitorMessages = this.monitorMessages.bind(this);
    this.postMessage = this.postMessage.bind(this);

    this.goToCreateMessage = this.goToCreateMessage.bind(this);
    }

    goToCreateMessage() {
      this.props.navigation.navigate({key: 'CreateMessage', routeName: 'CreateMessage', params: { nodeId: this.nodeId }});
    }

    _renderItem = ({item, index}) => (
      <ListItem
        // scaleProps={{
        //   friction: 90,
        //   tension: 100,
        //   activeScale: 0.95,
        // }}
        // onPress={() => this._onTouchGroup(item)}
        containerStyle={{
          minHeight: 100,
          maxHeight: 120,
          backgroundColor: index % 2 === 0 ? '#f9fbff' : 'white',
        }}
        // rightIcon={{
        //   name: 'arrow-up-right',
        //   type: 'feather',
        //   color: 'rgba(51, 51, 51, 0.8)',
        // }}
        title={
          <View style={styles.titleView}>
          <Text style={styles.titleText}>{item.message}</Text>
          </View>
        }
        subtitle={
          <View style={styles.subtitleView}>
          <Text style={styles.ratingText}> {item.timestamp} - { item.display_name } ({ item.user.substr(item.user.length - 5)})</Text>
          </View>
        }
      />
    )

    componentWillMount () {
      // Set params for nav stack
      this.props.navigation.setParams({ goToCreateMessage: this.goToCreateMessage });

      // Grab navigation params
      this.action = this.props.navigation.getParam('action', '');
      this.nodeId = this.props.navigation.getParam('nodeId', '');

      // If we are returning from the CreateMessage screen, post the users message
      if (this.action === 'new_message') {
        console.log('posting a message');
        this.postMessage();
      }

    }

    componentDidMount() {
      // Updates the message data for the node
      this.monitorMessages();
    }

    componentWillUnmount() {
      this.stopping = true;
    }

    // Sends a new message to the API
    async postMessage() {
      let userUuid = await this.authService.getUUID();

      let nodeId = this.props.navigation.getParam('nodeId', undefined);
      let messageBody = this.props.navigation.getParam('messageBody', undefined);

      let requestBody = {
        node_id:  nodeId,
        message: messageBody,
        user_uuid: userUuid,
      };

      let response = await this.apiService.PostMessageAsync(requestBody);

      if (response !== undefined) {
        // console.log('repsonse');
        // console.log(response);

      // Check for new messages
      await this.CheckNow();

      if (this.stopping)
        return;

      // Show the success snackbar
          Snackbar.show({
            title: 'Updated message list',
            duration: Snackbar.LENGTH_SHORT,
          });
      // If the response was undefined, display error snackbar
      } else {
        Snackbar.show({
          title: 'Error sending message, try again',
          duration: Snackbar.LENGTH_SHORT,
        });
      }

    }

    async monitorMessages() {
      if (this.monitoring) return;

      this.monitoring = true;

      while (this.monitoring) {
        if (this.stopping) return;

        // Re-create the check-now trigger in case it was triggered last time
        this.checkNowTrigger = new DeferredPromise();

        let currentUUID = await this.authService.getUUID();
        let requestBody = {
          'node_id': this.nodeId,
          'user_uuid': currentUUID,
        };

        let messages = await this.apiService.GetMessagesAsync(requestBody);

        if (messages !== undefined) {
          console.log('messages');
          console.log(messages);

          if (this.stopping) {
            return;
          }

          // @ts-ignore
          if (messages !== false) {
            try {
              await this.setState({data: messages});
            } catch (error) {
              // If we got here, we unmounted
              // console.log(error);
            }
          }
        }

        const sleepPromise = SleepUtil.SleepAsync(this.configGlobal.messageCheckIntervalMs);
        await Promise.race([ sleepPromise, this.checkNowTrigger ]);
      }

    }

    public CheckNow() {
      // console.log('NodeService.CheckNow - updating the node list');
      this.checkNowTrigger.resolve();
    }

    render() {
      return (
        <View style={styles.flatlist}>
          <FlatList
           data={this.state.data}
           renderItem={this._renderItem}
           keyExtractor={item => item.timestamp}
          />

          {
            this.state.data.length === 0 &&
            <Text style={styles.null}>No messages yet!</Text>
          }

          <Spinner visible={this.state.isLoading} textContent={'Loading...'} textStyle={{color: 'rgba(44,55,71,1.0)'}} />
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
  nodeListItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 51, 51, 0.2)',
    minHeight: 100,
    maxHeight: 120,
  },
  null: {
    fontSize: 22,
    color: 'gray',
    top: 250,
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
    marginBottom: 0,
  },
});