import React, { Component } from 'react';
// @ts-ignore
import { NavigationActions } from 'react-navigation';

// @ts-ignore
import { View, FlatList, StyleSheet, Text, Alert, Animated, ScrollView,TextInput, TouchableOpacity, KeyboardAvoidingView, Keyboard, AsyncStorage } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import Snackbar from 'react-native-snackbar';
import Spinner from 'react-native-loading-spinner-overlay';
// @ts-ignore
import NavigationService from '../services/NavigationService';
import ConfirmModal from '../components/ConfirmModal';

// Redux imports
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

// Services
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';
import NodeService from '../services/NodeService';

// @ts-ignore
import moment from 'moment';

import SleepUtil from '../services/SleepUtil';
import DeferredPromise from '../services/DeferredPromise';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';
import Logger from '../services/Logger';

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
    nodeId: string;
    userUuid: string;
    username: string;
}

const MINIMUM_MSG_LENGTH = 2;

export class Chat extends Component<IProps, IState> {
  private monitoring: boolean = false;
  private stopping: boolean = false;
  private checkNowTrigger: DeferredPromise;
  private readonly configGlobal = ConfigGlobalLoader.config;

  // @ts-ignore
  private userUuid: string;
  private nodeId: string;
  private action: any;
  private _textInput: any;

  // TODO: figure out a smarter way to do this
  static navigationOptions = ({ navigation }) => {
    let username: string = undefined;
    const {params = {}} = navigation.state;

    try {
      if (params.nodeId.includes('relation')) {
        username = '  ' + params.username;
      } else {
        username = '';
      }
    } catch (error) {
      username = 'Chat';
      // Do nothing if there is no node id defined for now
    }

    // @ts-ignore
      return {
      headerStyle: {backgroundColor: 'black', paddingLeft: 10, paddingTop: -10, height: 70},
      headerTitleStyle: { color: 'white', fontSize: 16, fontWeight: 'bold', paddingLeft: -20 },
        title: username ,
        headerLeft:
          <Icon
            name='menu'
            type='feather'
            containerStyle={{padding: 5}}
            size={30}
            underlayColor={'black'}
            color={'#ffffff'}
            onPress={ () => { navigation.navigate('DrawerToggle'); }}
          />,
          headerRight:
            <Icon
              name='arrow-right'
              type='feather'
              containerStyle={{padding: 5, right: 15}}
              size={30}
              underlayColor={'black'}
              color={'#ffffff'}
              onPress={ () => { NavigationService.reset('Map', {}); }}
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
        nodeId: '',
        userUuid: '',
        username: '',
    };

    this._renderItem = this._renderItem.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.closeConfirmModal = this.closeConfirmModal.bind(this);
    this.showConfirmModal = this.showConfirmModal.bind(this);

    // chat display functions
    this.stackMessages = this.stackMessages.bind(this);
    this.isSameDay = this.isSameDay.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);

    this.startPrivateChat = this.startPrivateChat.bind(this);
    this.upvoteComment = this.upvoteComment.bind(this);
    this.downvoteComment = this.downvoteComment.bind(this);

    this.submitMessage = this.submitMessage.bind(this);
    this.setMessageText = this.setMessageText.bind(this);

    this.CheckNow = this.CheckNow.bind(this);
    this.monitorMessages = this.monitorMessages.bind(this);
    this.postMessage = this.postMessage.bind(this);
    this.onBlur = this.onBlur.bind(this);

    this.getTime = this.getTime.bind(this);
    }

    async closeConfirmModal() {
      await this.setState({confirmModalVisible: false});
    }

    async submitMessage() {
      let nodeId = this.props.navigation.getParam('nodeId');

      await this.setState({
        isLoading: false,
        messageBody: this.state.messageBody,
        nodeId: nodeId,
      });

      // If the message body is empty, don't post the message
      if (this.state.messageBody === '' || this.state.messageBody.length < MINIMUM_MSG_LENGTH) {
        Snackbar.show({
          title: 'Enter a message to send (has to be longer than 2 characters).',
          duration: Snackbar.LENGTH_SHORT,
        });

        await this.setState({
          nodeId: nodeId,
        });

        return;
      }

      await this.postMessage();
    }

    async getUserInfo() {
      let userInfo = await AuthService.getUUID();

      if (userInfo !== undefined) {
        await this.setState({userInfo: userInfo});
      }
      return;
    }

    getTime(item) {
      let easternTime = moment(item.timestamp).utcOffset(14);

      // make sure it does not return a date that is ahead of the current date
      let timestamp = moment(easternTime).max(moment().min(easternTime));

      let parsedTimestamp = moment(timestamp).calendar();

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

      // @ts-ignore
      let currentUUID = await AuthService.getUUID();

      // If a person is clicking themselves in the list, don't open the confirm modal
      if (currentUUID === item.user) {
        return;
      }

      // show confirm modal and pass userInfo from chat message
      await this.setState({userInfo: item});
      await this.setState({confirmModalVisible: true});
    }

    async startPrivateChat(userInfo: any, shareLocation: boolean) {
      await this.setState({confirmModalVisible: false});

      let currentUUID = await AuthService.getUUID();

      let requestBody = {
        'from': currentUUID,
        'to': userInfo.user,
        'share_location': shareLocation,
      };

      let alreadyAdded = await NodeService.doesRelationExist(userInfo.user);

      if (alreadyAdded) {
        Snackbar.show({
          title: 'You already requested a chat with this user',
          duration: Snackbar.LENGTH_SHORT,
        });

        Logger.info(`Chat.startPrivateChat - you already requested a DM w/ this user.`);
        return;
      }

      let response = await ApiService.AddFriendAsync(requestBody);
      if (response !== undefined) {
        Logger.info(`Chat.startPrivateChat - Received response ${JSON.stringify(response)}`);
        let stored = await NodeService.storeRelation(userInfo.user, response);

        if (!stored) {
          Snackbar.show({
            title: 'Could not save new relation',
            duration: Snackbar.LENGTH_SHORT,
          });

          Logger.info(`Chat.startPrivateChat - could not save new relation.`);
          return;
        }

        await NodeService.storeNode(response.their_id);

        Snackbar.show({
          title: 'Sent direct message request',
          duration: Snackbar.LENGTH_SHORT,
        });

        Logger.info(`Chat.startPrivateChat - stored new relation data.`);
      }
    }

    async upvoteComment() {
      console.log('upvoting comment....');
    }

    async downvoteComment(item) {
      console.log('downvoting comment....', item);
    }

    // @ts-ignore
    stackMessages(index, item) {
      let previousItem = this.state.data[index + 1];
      if (previousItem !== undefined) {
        if (item.user === previousItem.user) {
          return true;
        } else if (previousItem === undefined) {
          return false;
        }
        return false;
      }
      return false;
    }

    isSameDay(item, index) {
      let previousItem  = this.state.data[(index - 1)];
      if (previousItem !== undefined) {
        if (moment(item.timestamp).startOf('day') === moment(previousItem).startOf('day')) {
          return false;
        }
    }
    return true;
  }

    // @ts-ignore
    _renderItem = ({item, index}) => (
      <ListItem
        onLongPress={() => this.showConfirmModal(item)}
        containerStyle={{
          marginBottom: -15,
        }}

        //
        // UPVOTE DOWNVOTE ARROWS FOR GENERAL CHAT
        //
        // rightElement={this.action === 'general_chat' &&
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
        //
        title={!this.stackMessages(index, item) ?
          <View style={styles.titleView}>
          <Text style={this.state.userInfo === item.user ?
            [styles.thisDisplayName, {marginTop: index === 0 ? 10 : 10}] :
            [styles.thatDisplayName, {marginTop: index === 0 ? 10 : 10}]}>{item.display_name + '  - ' + this.getTime(item)}

          </Text>
          <View style={this.state.userInfo === item.user ? styles.thisUser : styles.thatUser}>
          <Text style={styles.myTitleText}>{item.message}</Text>
          </View>
          </View>
          :
          <View style={styles.titleView}>
          <View style={this.state.userInfo === item.user ? styles.thisUser : styles.thatUser}>
          <Text style={styles.titleText}>{item.message}</Text>
          </View>
          </View>
        }
      />
    )

    componentWillMount () {
      // Grab navigation params
      this.action = this.props.navigation.getParam('action', '');
      this.nodeId = this.props.navigation.getParam('nodeId', '');

      // this.props.navigation.setParams({title: userInfo.user});

      // navigate to my chat if no action is passed in and grab chats by user uuid when component mounts

      if (this.action === '' || undefined) {
        console.log('my chats');
      } else if (this.action === 'general_chat') {
        console.log('general chat');
      } else if (this.action === 'new_message') {
        console.log('posting a message');
      } else if (this.action === 'private_message') {
        console.log('starting private chat...');
      }
    }

    componentDidMount() {
      // Updates the message data for the node
      this.monitorMessages();
      this.getUserInfo();
    }

    componentWillUnmount() {
      this.stopping = true;
    }

    // Sends a new message to the API
    async postMessage() {
      let userUuid = await AuthService.getUUID();

      let requestBody = {
        node_id:  this.state.nodeId,
        message: this.state.messageBody,
        user_uuid: userUuid,
      };

      let response = await ApiService.PostMessageAsync(requestBody);

      if (response !== undefined) {
        // Check for new messages
        await this.CheckNow();

        if (this.stopping)
          return;

        await this.setState({messageBody: '', isLoading: false});

      // If the response was undefined, display error snackbar
      } else {
        this.setState({isLoading: false});
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

        let currentUUID = await AuthService.getUUID();
        let requestBody = {
          'node_id': this.nodeId,
          'user_uuid': currentUUID,
        };

        let messages: any = await ApiService.GetMessagesAsync(requestBody);

        if (messages !== undefined) {
          console.log('messages');
          console.log(messages);

          if (this.stopping) {
            return;
          }

          if (messages !== false) {
            try {
              await this.setState({data: messages});
            } catch (error) {
              // If we got here, we unmounted
              // console.log(error);
              break;
            }
          }
        }

        const sleepPromise = SleepUtil.SleepAsync(this.configGlobal.messageCheckIntervalMs);
        await Promise.race([ sleepPromise, this.checkNowTrigger ]);
      }

    }

    onBlur() {
      console.log('CALLING ON BLUE');
      this._textInput.focus();
    }

    public CheckNow() {
      this.checkNowTrigger.resolve();
    }

    render() {
      return (

      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor: 'white'}}
        behavior='padding'
        contentContainerStyle={{flex: 1}}
        keyboardVerticalOffset={90}
      >
      <View style={{flex: 1}}>
      {
        this.state.confirmModalVisible &&
        <ConfirmModal functions={{
          'closeConfirmModal': this.closeConfirmModal,
          'startPrivateChat': this.startPrivateChat,
        }}
        action={'add_friend'}
        data={this.state.userInfo}
        />
      }
        <View style={styles.flatlist}>
          <FlatList
           keyboardDismissMode={'on-drag'}
           keyboardShouldPersistTaps
           data={this.state.data}
           inverted
           renderItem={this._renderItem}
           keyExtractor={item => item.timestamp}
           ListHeaderComponent={<View style={{ height: 0, marginTop: 40 }}></View>}
          />
          {
            this.state.data.length < 1 &&
            <View style={styles.nullContainer}>
            <Text style={styles.null}>No messages yet.</Text>
            <Text style={styles.nullSubtitle}>You can find messages here.</Text>
            </View>
          }
          </View>
          <View
            style={[
              styles.chatMessageContainer, {
                height: Math.min(120, Math.max(50, this.state.textInputHeight)),
              },
            ]}
          >
          <TextInput
            ref= {(el) => { this._textInput = el; }}
            onContentSizeChange={(e) => this.setState({textInputHeight: e.nativeEvent.contentSize.height})}
            underlineColorAndroid={'transparent'}
            multiline
            autoCorrect
            autoFocus
            maxLength={500}
            allowFontScaling
            onBlur={this.onBlur}
            onSubmitEditing={this.submitMessage}
            blurOnSubmit={true}
            placeholder={'Type your message...'}
            returnKeyType='done'
            style={[
              styles.chatInput, {
                height: Math.min(120, Math.max(50, this.state.textInputHeight)),
              },
            ]}
            onChangeText={text => this.setMessageText(text)}
            value={this.state.messageBody}
          />
          <Spinner
            visible={this.state.isLoading}
            textStyle={{color: 'rgba(44,55,71,1.0)'}}
          />
        </View>
      </View>
      </KeyboardAvoidingView>
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
    minHeight: 10,
  },
  null: {
    fontSize: 22,
    color: 'gray',
    top: '40%',
    alignSelf: 'center',
  },
  nullSubtitle: {
    fontSize: 14,
    color: 'gray',
    top: '40%',
    paddingVertical: 10,
  },
  titleText: {
    color: 'black',
    fontSize: 18,
    left: 2,
    paddingVertical: 2,
  },
  myTitleText: {
    color: 'black',
    fontSize: 18,
    left: 2,
    paddingVertical: 2,
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
    position: 'absolute',
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
    borderRadius: 5,
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
    marginTop: -1,
    marginBottom: -15,
  },
  subtitleView: {
    flexDirection: 'row',
  },
  senderSubtitleView: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  ratingText: {
    color: 'grey',
    // paddingTop: 5,
    left: -1,
  },
  thisDisplayName: {
    color: 'rgba(140, 20, 252, 1)',
    marginVertical: 5,
    left: -1,
    fontWeight: 'bold',
  },
  thatDisplayName: {
    color: 'rgba(52, 152, 219, 1)',
    marginVertical: 5,
    left: -1,
    fontWeight: 'bold',
  },
  thisUser: {
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(140, 20, 252, 1)',
    paddingHorizontal: 5,
  },
  thatUser: {
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(52, 152, 219, 1)',
    paddingHorizontal: 5,
  },
  timestamp: {
    color: 'grey',
    paddingTop: 5,
    left: -1,
  },
  senderRatingText: {
    color: 'grey',
    alignSelf: 'flex-end',
  },
  senderTitleText: {
    alignSelf: 'flex-end',
    fontSize: 16,
  },
  flatlist: {
    backgroundColor: 'white',
    marginBottom: 40,
    top: -10,
  },
  nullContainer: {
    marginVertical: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});