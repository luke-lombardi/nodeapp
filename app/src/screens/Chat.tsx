import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';

// @ts-ignore
import { View, FlatList, StyleSheet, Text, Alert, Animated, TextInput, TouchableOpacity, KeyboardAvoidingView, Keyboard, AsyncStorage } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
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

  // TODO: figure out a smarter way to do this
  static navigationOptions = ({ navigation }) => {
    // const { params = {} } = navigation.state;
    return {
      headerStyle: {backgroundColor: 'black', height: 50, paddingLeft: 10, paddingRight: 10},
        headerTitleStyle: { color: 'white'},
        title: 'Chat',
        headerLeft:
          <Icon
          name='x' type='feather' iconStyle={{right: 30}} containerStyle={{padding: 5, width: 100, height: 50}} size={30} underlayColor={'transparent'} color={'#ffffff'} onPress={ () => {
          navigation.dispatch(NavigationActions.navigate(
                {
                  key: 'Map',
                  routeName: 'Map',
                  params: {},
                  action: NavigationActions.navigate({ key: 'Map', routeName: 'Map' }),
                })); }
               } />,
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

    this._renderItem = this._renderItem.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.closeConfirmModal = this.closeConfirmModal.bind(this);
    this.showConfirmModal = this.showConfirmModal.bind(this);

    this.startPrivateChat = this.startPrivateChat.bind(this);
    this.upvoteComment = this.upvoteComment.bind(this);
    this.downvoteComment = this.downvoteComment.bind(this);

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
      if (this.state.messageBody === '' || this.state.messageBody.length < MINIMUM_MSG_LENGTH) {
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

      // @ts-ignore
      let currentUUID = await AuthService.getUUID();

      // If a person is clicking themselves in the list, don't open the confirm modal
      // if ('private:' + currentUUID === item.user) {
      //   return;
      // }

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

        if (shareLocation) {
          await NodeService.storeNode(response.their_id);
        }

        Snackbar.show({
          title: 'Sent direct message request',
          duration: Snackbar.LENGTH_SHORT,
        });

        Logger.info(`Chat.startPrivateChat - stored new relation data.`);
      }
    }

    async upvoteComment(item) {
      console.log('upvoting comment....', item);
    }

    async downvoteComment(item) {
      console.log('downvoting comment....', item);
    }

    // @ts-ignore
    _renderItem = ({item, index}) => (
      <ListItem
        onLongPress={() => this.showConfirmModal(item)}
        containerStyle={{
          minHeight: 100,
          // backgroundColor: index % 2 === 0 ? '#f9fbff' : 'white',
        }}
        rightElement={this.action === 'general_chat' &&
          <View style={{flexDirection: 'column', alignContent: 'center', alignSelf: 'center', justifyContent: 'center'}}>
            <Icon
              name='keyboard-arrow-up'
              color='#00aced'
              size={32}
              onPress={() => this.upvoteComment(item)}
            />
            <Text style={{fontSize: 18, alignSelf: 'center', alignItems: 'center'}}>39</Text>
            <Icon
              name='keyboard-arrow-down'
              color='#00aced'
              size={32}
              onPress={() => this.downvoteComment(item)}
            />
          </View>
        }
        title={
          <View style={styles.titleView}>
          <Text style={this.userUuid === item.user.slice(0) ?
            [styles.ratingText, {paddingTop: index === 0 ? 5 : 0}] :
            [styles.ratingText, {paddingTop: index === 0 ? 5 : 0}]}>{item.display_name}
          </Text>
          <Text style={styles.titleText}>{item.message}</Text>
          </View>
        }
        subtitle={
          <View style={styles.subtitleView}>
          <Text style={styles.ratingText}>{this.getTime(item)}</Text>
          {/* ({ item.user.substr(item.user.length - 5)}) */}
          </View>
        }

        // CODE BELOW PUTS USER CHATS ON RIGHT SIDE OF SCREEN

        // title={this.userUuid === item.user.slice(8) ?
        //   <View style={styles.titleView}>
        //   <Text style={this.userUuid === item.user.slice(0) ?
        //     [styles.senderRatingText, {paddingTop: index === 0 ? 5 : 0}] :
        //     [styles.senderRatingText, {paddingTop: index === 0 ? 5 : 0}]}>{item.display_name}
        //   </Text>
        //   <Text style={styles.senderTitleText}>{item.message}</Text>
        //   </View>
        //   :
        //   <View style={styles.titleView}>
        //   <Text style={this.userUuid === item.user.slice(0) ?
        //     [styles.ratingText, {paddingTop: index === 0 ? 5 : 0}] :
        //     [styles.ratingText, {paddingTop: index === 0 ? 5 : 0}]}>{item.display_name}
        //   </Text>
        //   <Text style={styles.titleText}>{item.message}</Text>
        //   </View>
        // }
        // subtitle={this.userUuid === item.user.slice(8) ?
        //   <View style={styles.senderSubtitleView}>
        //   <Text style={styles.senderRatingText}>{this.getTime(item)}</Text>
        //   {/* ({ item.user.substr(item.user.length - 5)}) */}
        //   </View>
        //   :
        //   <View style={styles.subtitleView}>
        //   <Text style={styles.ratingText}>{this.getTime(item)}</Text>
        //   {/* ({ item.user.substr(item.user.length - 5)}) */}
        //   </View>
        // }
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
      let userUuid = await AuthService.getUUID();

      let nodeId = this.props.navigation.getParam('nodeId', undefined);
      let messageBody = this.props.navigation.getParam('messageBody', undefined);

      let requestBody = {
        node_id:  nodeId,
        message: messageBody,
        user_uuid: userUuid,
      };

      let response = await ApiService.PostMessageAsync(requestBody);

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

      this.userUuid = await AuthService.getUUID();

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

        let messages = await ApiService.GetMessagesAsync(requestBody);

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
      this.checkNowTrigger.resolve();
    }

    render() {
      return (
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
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior='padding'
          keyboardVerticalOffset={65}
        >
        <View style={{flex: 1}}>
        <View style={styles.flatlist}>
          <FlatList
           keyboardDismissMode={'on-drag'}
           data={this.state.data}
           renderItem={this._renderItem}
           keyExtractor={item => item.timestamp}
          />
          {
            this.state.data.length < 1 &&
            <View style={styles.nullContainer}>
            <Text style={styles.null}>No messages yet.</Text>
            <Text style={{fontSize: 14, top: '90%', color: 'gray'}}>You can find messages here.</Text>
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
            onContentSizeChange={(e) => this.setState({textInputHeight: e.nativeEvent.contentSize.height})}
            underlineColorAndroid={'transparent'}
            multiline
            blurOnSubmit
            maxLength={500}
            allowFontScaling
            onSubmitEditing={this.submitMessage}
            placeholder={'Type your message...'}
            returnKeyType='send'
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
  },
  null: {
    fontSize: 22,
    color: 'gray',
    top: '80%',
    alignSelf: 'center',
  },
  titleText: {
    color: 'black',
    fontSize: 16,
    paddingTop: 5,
    // alignSelf: 'flex-end',
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
  senderSubtitleView: {
    flexDirection: 'row',
    paddingTop: 5,
    alignSelf: 'flex-end',
  },
  ratingText: {
    color: 'grey',
  },
  senderRatingText: {
    color: 'grey',
    alignSelf: 'flex-end',
  },
  senderTitleText: {
    alignSelf: 'flex-end',
    fontSize: 16,
    paddingTop: 5,
  },
  flatlist: {
    backgroundColor: 'white',
    flex: 1,
    marginBottom: 40,
  },
  nullContainer: {
    flex: 1,
    bottom: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
});