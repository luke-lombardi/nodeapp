import React, { Component } from 'react';
// import { NavigationActions } from 'react-navigation';

// @ts-ignore
import { View, FlatList, StyleSheet, Text, Alert, Animated, TextInput, TouchableOpacity, KeyboardAvoidingView, Keyboard, AsyncStorage } from 'react-native';
import { ListItem, Icon, Button } from 'react-native-elements';
import Snackbar from 'react-native-snackbar';
import Spinner from 'react-native-loading-spinner-overlay';
import NavigationService from '../services/NavigationService';
import ConfirmModal from '../components/ConfirmModal';

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
    functions: any;
}

interface IState {
    data: any;
    isLoading: boolean;
    messageBody: string;
    textInputHeight: number;
    confirmModalVisible: boolean;
    userInfo: string;
}

export class Notifications extends Component<IProps, IState> {
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
    // const { params = {} } = navigation.state;
    return {
      headerStyle: {backgroundColor: 'black', paddingLeft: 10, paddingRight: 10},
        headerTitleStyle: { color: 'white'},
        title: 'Notifications',
        headerLeft:
            <Icon
            name='menu'
            type='feather'
            containerStyle={{padding: 5}}
            size={30}
            underlayColor={'rgba(44,55,71, 0.7)'}
            color={'#ffffff'}
            onPress={ () => { navigation.navigate('DrawerToggle'); }}
            />,
      };
  }

  constructor(props: IProps) {
    super(props);

    this.state = {
        data: [],
        messageBody: '',
        isLoading: false,
        confirmModalVisible: false,
        textInputHeight: 0,
        userInfo: '',
    };

    this.apiService = new ApiService({});
    this.authService = new AuthService({});

    this._renderItem = this._renderItem.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.closeConfirmModal = this.closeConfirmModal.bind(this);
    this.showConfirmModal = this.showConfirmModal.bind(this);

    this.startPrivateChat = this.startPrivateChat.bind(this);
    // this.upvoteComment = this.upvoteComment.bind(this);
    // this.downvoteComment = this.downvoteComment.bind(this);

    this.submitMessage = this.submitMessage.bind(this);
    this.setMessageText = this.setMessageText.bind(this);

    this.CheckNow = this.CheckNow.bind(this);
    this.monitorMessages = this.monitorMessages.bind(this);
    this.postMessage = this.postMessage.bind(this);

    this.getTime = this.getTime.bind(this);
    }

    async closeConfirmModal() {
      await this.setState({confirmModalVisible: false});
    }

    async submitMessage() {
      let nodeId = this.props.navigation.getParam('nodeId');

      await this.setState({
        isLoading: true,
        messageBody: this.state.messageBody,
      });

      // If the message body is empty, don't post the message
      if (this.state.messageBody === '' || this.state.messageBody.length < 1) {
        Snackbar.show({
          title: 'Enter a message to send.',
          duration: Snackbar.LENGTH_SHORT,
        });

        await this.setState({
          isLoading: false,
        });

        return;
      }

      let userUuid = await AsyncStorage.getItem('user_uuid');

      NavigationService.reset('Chat', {
        messageBody: this.state.messageBody,
        action: 'new_message',
        userUuid: userUuid,
        nodeId: nodeId,
      });
    }

    getTime(item) {
      let easternTime = moment(item.timestamp).utcOffset(14);

      let parsedTimestamp = moment(easternTime).calendar();

      return parsedTimestamp;
    }

    async setMessageText(text) {
      try {
        await this.setState({messageBody: text});
      } catch (error) {
        // Ignore
        // The only reason this would fail is if the component unmounted
      }
    }
    async showConfirmModal(item) {
      // show confirm modal and pass userInfo from chat message
      await this.setState({userInfo: item});
      await this.setState({confirmModalVisible: true});
    }

    async startPrivateChat(userInfo: any, shareLocation: boolean) {
      await this.setState({confirmModalVisible: false});
      // initiate private communication in API service when user submits confirm modal
      if (shareLocation) {
        console.log('starting private chat with location tracking for....', userInfo.user);
      } else {
        console.log('starting private chat without location tracking for....', userInfo.user);
      }
    }

    // async upvoteComment(item) {
    //   console.log('upvoting comment....', item);
    // }

    // async downvoteComment(item) {
    //   console.log('downvoting comment....', item);
    // }

    // @ts-ignore
    _renderItem = ({item, index}) => (
      <ListItem
        onLongPress={() => this.showConfirmModal(item)}
        containerStyle={{
          minHeight: 100,
          backgroundColor: index % 2 === 0 ? '#f9fbff' : 'white',
        }}
        // rightElement={
        //   <View style={{flexDirection: 'column', alignContent: 'center', alignSelf: 'center', justifyContent: 'center'}}>
        //     <Icon
        //       name='keyboard-arrow-up'
        //       color='#00aced'
        //       size={32}
        //       onPress={() => this.upvoteComment(item)}
        //     />
        //     <Text style={{fontSize: 18, alignSelf: 'center', alignItems: 'center'}}>39</Text>
        //     <Icon
        //       name='keyboard-arrow-down'
        //       color='#00aced'
        //       size={32}
        //       onPress={() => this.downvoteComment(item)}
        //     />
        //   </View>
        // }
        title={
          <View style={styles.titleView}>
          <View style={{alignSelf: 'flex-start', alignItems: 'flex-end'}}>
          <Text style={[styles.ratingText, {paddingTop: index === 0 ? 5 : 0}]}>softlion393</Text>
          <Text style={{fontSize: 12, color: 'gray'}}>{this.getTime(item)}</Text>
          </View>
          {/* <Text style={styles.titleText}>{item.message}</Text> */}
          </View>
        }
        rightSubtitle={
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Button
            style={{width: 90}}
            titleStyle={{fontSize: 14}}
            containerStyle={{paddingHorizontal: 5}}
            icon={
                <Icon
                name='check'
                type='feather'
                size={15}
                color='white'
                />
            }
            title='Accept'
            />
          <Button
            style={{width: 90}}
            titleStyle={{fontSize: 14}}
            containerStyle={{paddingHorizontal: 5}}
            icon={
                <Icon
                name='x'
                type='feather'
                size={15}
                color='white'
                />
            }
            title='Reject'
            />
          </View>
        }
      />
    )

    componentWillMount () {
      // Grab navigation params
      this.action = this.props.navigation.getParam('action', '');
      this.nodeId = this.props.navigation.getParam('nodeId', '');

      // navigate to my chat if no action is passed in and grab chats by user uuid when component mounts

      if (this.action === '' || undefined) {
        console.log('my chats');
      } else if (this.action === 'general_chat') {
        console.log('general chat');
      } else if (this.action === 'new_message') {
        console.log('posting a message');
        this.postMessage();
      } else if (this.action === 'private_message') {
        console.log('starting private chat...');
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
      const data = [
        {
          'action': 'confirm_friend',
          'relation_id': 'relation:8a8df1bb-b79d-45b3-bfa6-2891b92befd4',
          'from_username': 'SoftLion163',
          'friend_id': 'friend:239ce858-0f0a-4b59-8b99-a529370a6a41',
          'aps': {
            'badge': 1,
            'sound': 'ping.aiff',
            'alert': 'You have received a chat request',
          },
          'from_user': 'a3827ae6-9fa2-4cd5-87e9-413bc0472235',
          'location_tracking': true,
        },
      ];
      return (
      <View style={{flex: 1}}>
      {
        this.state.confirmModalVisible &&
        <ConfirmModal functions={{
          'closeConfirmModal': this.closeConfirmModal,
          'startPrivateChat': this.startPrivateChat,
        }}
        userInfo={this.state.userInfo}
        action={'requestToChat'}
        />
      }
        <View style={{flex: 1}}>
        <View style={styles.flatlist}>
          <FlatList
           data={data}
           renderItem={this._renderItem}
           keyExtractor={item => item.friend_id}
          />
          {
            data.length === 0 &&
            <View style={styles.nullContainer}>
            <Text style={styles.null}>No Notifications</Text>
            <Text style={{fontSize: 14, top: 280, color: 'gray'}}>You can find things that require your attention here.</Text>
            </View>
          }
          </View>
          <Spinner
            visible={this.state.isLoading}
            textStyle={{color: 'rgba(44,55,71,1.0)'}}
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
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);

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
    fontSize: 16,
    paddingTop: 5,
  },
  iconContainer: {
    backgroundColor: 'white',
    bottom: 2,
    position: 'absolute',
    borderWidth: .5,
    marginHorizontal: 5,
    borderColor: 'rgba(220,220,220,1)',
    borderRadius: 30,
  },
  chatMessageContainer: {
    marginTop: -20,
    bottom: 10,
    paddingHorizontal: 10,
    width: '100%',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    backgroundColor: 'rgba(220,220,220,0.1)',
  },
  chatInput: {
    fontSize: 18,
    fontFamily: 'Avenir',
    overflow: 'hidden',
    paddingVertical: 10,
    paddingHorizontal: 10,
    textAlign: 'left',
    flexWrap: 'wrap',
    width: '100%',
    borderWidth: .5,
    borderColor: 'rgba(220,220,220,0.8)',
    borderRadius: 10,
    backgroundColor: 'white',
  },
  submitChatButton: {
    position: 'absolute',
    top: 10,
    bottom: 5,
  },
  inputContainer: {
  },
  titleView: {
    flexDirection: 'column',
    paddingTop: 5,
  },
  subtitleView: {
    flexDirection: 'row',
    paddingTop: 5,
  },
  ratingText: {
    color: 'grey',
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 5,
  },
  flatlist: {
    backgroundColor: 'white',
    flex: 1,
  },
  nullContainer: {
    flex: 1,
    bottom: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
});