import React, { Component } from 'react';
// @ts-ignore
import { NavigationActions } from 'react-navigation';
import { ScaledSheet } from 'react-native-size-matters';

// @ts-ignore
import { View, FlatList, StyleSheet, Text, Alert, Animated, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Keyboard, AsyncStorage } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import Snackbar from 'react-native-snackbar';
import Spinner from 'react-native-loading-spinner-overlay';

import ConfirmModal from '../components/ConfirmModal';
// import Vote from '../components/Vote';

// Redux imports
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

// Services
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';
import NodeService from '../services/NodeService';
import NavigationService from '../services/NavigationService';
import SleepUtil from '../services/SleepUtil';
import Logger from '../services/Logger';

import moment from 'moment';
import uuid from 'react-native-uuid';

import DeferredPromise from '../services/DeferredPromise';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

moment.locale('en', {
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

const MINIMUM_MSG_LENGTH = 1;

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
        username = 'Chat';
      }
    } catch (error) {
      username = 'Chat';
      // Do nothing if there is no node id defined for now
    }

    // @ts-ignore
      return {
      headerStyle: {backgroundColor: '#006494', paddingTop: -10, height: 50},
      headerTitleStyle: { color: 'white', fontSize: 20, fontWeight: 'bold', paddingLeft: -20 },
        title: username ,
        headerLeft:
          <Icon
            name='x'
            type='feather'
            containerStyle={{padding: 5}}
            size={30}
            underlayColor={'#006494'}
            color={'#ffffff'}
            onPress={ () => {
              NavigationService.reset('Map', {
              nodeType: params.nodeType,
              nodeIndex: params.nodeIndex,
            }); }}
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
    this._renderDirectMessage = this._renderDirectMessage.bind(this);
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
    this.getTime = this.getTime.bind(this);
    this.reportUser = this.reportUser.bind(this);
    }

    async closeConfirmModal() {
      await this.setState({confirmModalVisible: false});
    }

    async reportUser(displayName) {
      Snackbar.show({
        title: `reported ${displayName}`,
        duration: Snackbar.LENGTH_SHORT,
      });
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
          title: 'enter a message to send (has at least 1 character).',
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
      let userUuid = await AuthService.getUUID();

      if (userUuid !== undefined) {
        await this.setState({userUuid: userUuid});
      }
      return;
    }

    getTime(item) {
      let easternTime = moment.parseZone(item.timestamp).local().format();
      let parsedTimestamp = moment(easternTime).endOf('second').fromNow();
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
          title: 'you already requested a chat with this user',
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
            title: 'could not save new relation',
            duration: Snackbar.LENGTH_SHORT,
          });

          Logger.info(`Chat.startPrivateChat - could not save new relation.`);
          return;
        }

        await NodeService.storeNode(response.their_id);

        Snackbar.show({
          title: 'sent direct message request',
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
        // stack messages if the user is the same AND the messages were posted within one minute of each other
        if (item.user === previousItem.user && moment(item.timestamp).diff(moment(previousItem.timestamp), 'minutes') < 1) {
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
        <TouchableOpacity
        onLongPress={() => this.showConfirmModal(item)}
        activeOpacity={0.7}
        style={{
          flex: 1,
          backgroundColor: 'white',
          borderColor: 'rgba(218, 219, 221, 1)',
          borderWidth: .5,
          marginTop: index === index.length - 1 ? 10 : 5,
          marginBottom: index === 0 ? 5 : 0,
          minHeight: 90,
          marginHorizontal: 5,
          borderRadius: 10,
          // padding: 15,
        }}>
        <View style={{flex: 1, paddingHorizontal: 15, paddingVertical: 10}}>
          <View style={{width: '100%', justifyContent: 'flex-start'}}>
            <Text style={{color: '#262626', alignSelf: 'flex-start', paddingBottom: 5, fontSize: 14, fontWeight: 'bold'}}>{item.display_name}</Text>
            <Text style={{color: '#262626', alignSelf: 'flex-start', paddingBottom: 5, fontSize: 18}}>{item.message}</Text>
          </View>
          {/* <View style={{flex: 1, flexDirection: 'row', width: '20%', position: 'absolute', justifyContent: 'center', alignSelf: 'flex-end', alignItems: 'center'}}>
          <Vote selectedNode={item.data} />
          </View> */}
          <View style={{
              width: '100%',
              flex: 1, flexDirection: 'row', alignItems: 'flex-start', alignSelf: 'flex-start', justifyContent: 'space-between'}}>
              <Text style={{fontSize: 14, color: 'lightgray'}}>{this.getTime(item)}</Text>
              {
                this.state.userUuid !== item.user &&
                <Text onPress={() => this.showConfirmModal(item)} style={{fontSize: 14, color: 'lightgray'}}>send dm</Text>
              }
            </View>
          </View>
      </TouchableOpacity>
    )

    // @ts-ignore
    _renderDirectMessage = ({item, index}) => (
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
          <Text numberOfLines={1} ellipsizeMode={'tail'} style={this.state.userUuid === item.user ?
            [styles.thisDisplayName, {marginTop: index === 0 ? 10 : 10}] :
            [styles.thatDisplayName, {marginTop: index === 0 ? 10 : 10}]}>{item.display_name + '  - ' + this.getTime(item)}

          </Text>
          <View style={this.state.userUuid === item.user ? styles.thisUser : styles.thatUser}>
          <Text style={styles.myTitleText}>{item.message}</Text>
          </View>
          </View>
          :
          <View style={styles.titleView}>
          <View style={this.state.userUuid === item.user ? styles.thisUser : styles.thatUser}>
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
        // console.log('my chats');
      } else if (this.action === 'general_chat') {
        // console.log('general chat');
      } else if (this.action === 'new_message') {
        // console.log('posting a message');
      } else if (this.action === 'private_message') {
        // console.log('starting private chat...');
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
        message_uuid: uuid.v4(),
      };

      let response = await ApiService.PostMessageAsync(requestBody);

      if (response !== undefined) {
        // Check for new messages
        await this.CheckNow();

        if (this.stopping)
          return;

        await this.setState({messageBody: '', isLoading: false});
        this._textInput.focus();

        // When a message is successfully posted, track the node
        let exists = await NodeService.storeNode(this.state.nodeId);
        if (!exists) {
          //
        }
      // If the response was undefined, display error snackbar
      } else {
        this.setState({isLoading: false});
        Snackbar.show({
          title: 'error sending message, try again',
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
          // console.log('messages');
          // console.log(messages);

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

    public CheckNow() {
      this.checkNowTrigger.resolve();
    }

    render() {
      let selectedNode = this.props.navigation.getParam('selectedNode');
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
          'reportUser': this.reportUser,
        }}
        action={'add_friend'}
        data={this.state.userInfo}
        />
      }
        <View style={styles.flatlist}>
          <FlatList
           keyboardDismissMode={'on-drag'}
           keyboardShouldPersistTaps='always'
           data={this.state.data}
           inverted
           renderItem={this.action === 'private_message' ? this._renderDirectMessage : this._renderItem}
           keyExtractor={item => item.timestamp}
           ListEmptyComponent={
            <View style={{flex: 1, backgroundColor: 'white', width: '100%', flexDirection: 'column', paddingVertical: '10%', justifyContent: 'center', alignSelf: 'center'}}>
            <Text style={styles.null}>no messages yet.</Text>
            <Text style={styles.nullSubtitle}>you can find messages here.</Text>
            </View>
           }
           ListHeaderComponent={<View style={{ height: 0 }}></View>}
           ListFooterComponent={
             this.action === 'node_chat' ?
             <TouchableOpacity
             activeOpacity={1}
             style={{
               marginTop: 10,
               flex: 1,
               backgroundColor: 'white',
               borderBottomColor: 'rgba(218, 219, 221, 1)',
               // marginHorizontal: 10,
               minHeight: 100,
               borderBottomWidth: 0.5,
               // padding: 15,
             }}>
             <View style={{marginTop: 10, flex: 1, paddingHorizontal: 10}}>
               <View style={{padding: 10, width: '90%', justifyContent: 'flex-start'}}>
                 <Text style={{color: 'rgba(27, 28, 29, 1)', alignSelf: 'flex-start', fontWeight: '600', fontSize: 18}}>{selectedNode.topic}</Text>
               </View>
               {/* <View style={{height: '100%', flex: 1, flexDirection: 'row', width: '20%', position: 'absolute', justifyContent: 'center', alignSelf: 'flex-end', alignItems: 'center'}}>
               <Vote selectedNode={selectedNode} />
               </View> */}
               </View>
                 <View style={{
                   width: '100%', paddingHorizontal: 20,
                   flex: 1, flexDirection: 'row', alignItems: 'flex-start', alignSelf: 'flex-start', justifyContent: 'space-between'}}>
                   <Text style={{fontSize: 14, color: 'gray'}}>{selectedNode.distance_in_miles.toFixed(0) + ' miles'}</Text>
                   <Text style={{fontSize: 14, color: 'gray'}}>
                   {selectedNode.total_messages !== undefined ? selectedNode.total_messages + ' replies' : 0 + ' replies'}
                   </Text>
                   <Text style={{fontSize: 14, color: 'gray'}}>
                   expires {moment().endOf('minute').seconds(selectedNode.ttl).fromNow()}
                   </Text>
                 </View>
           </TouchableOpacity>
           :
           <View></View>
            }
          />
          </View>
          <View
            style={[
              styles.chatMessageContainer, {
                bottom: 0,
                height: Math.min(120, Math.max(50, this.state.textInputHeight)),
              },
            ]}
          >
          <TextInput
            ref= {(el) => { this._textInput = el; }}
            onContentSizeChange={(e) => this.setState({textInputHeight: e.nativeEvent.contentSize.height})}
            underlineColorAndroid={'transparent'}
            autoCapitalize='none'
            multiline
            autoCorrect
            autoFocus
            maxLength={500}
            allowFontScaling
            onSubmitEditing={this.submitMessage}
            blurOnSubmit={true}
            placeholder={'type your message...'}
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

const styles = ScaledSheet.create({
  nodeListItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 51, 51, 0.2)',
    minHeight: 10,
  },
  null: {
    fontSize: 22,
    color: 'gray',
    alignSelf: 'center',
  },
  nullSubtitle: {
    fontSize: 14,
    color: 'gray',
    paddingVertical: 10,
    alignSelf: 'center',
  },
  titleText: {
    color: 'black',
    fontSize: 18,
    top: -3,
    paddingVertical: 2,
    left: 2,
  },
  myTitleText: {
    color: 'black',
    fontSize: 18,
    top: -3,
    left: 2,
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
    bottom: '10@vs',
    paddingHorizontal: '10@s',
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
    color: '#F03A47',
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
    flex: 1,
    height: '100%',
    borderLeftWidth: 3,
    borderLeftColor: '#F03A47',
    paddingHorizontal: 5,
  },
  thatUser: {
    flex: 1,
    height: '100%',
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
    backgroundColor: '#F6F4F3',
    marginBottom: 40,
    top: -10,
  },
  nullContainer: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});