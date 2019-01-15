import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';

// @ts-ignore
import { View, FlatList, StyleSheet, Text, Alert, Animated, TextInput, TouchableOpacity, KeyboardAvoidingView, Keyboard, AsyncStorage } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import Snackbar from 'react-native-snackbar';
import Spinner from 'react-native-loading-spinner-overlay';
import NavigationService from '../services/NavigationService';
import Moment from 'moment';

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
    messageBody: string;
    textInputHeight: number;
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
    // const { params = {} } = navigation.state;
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
      };
  }

  constructor(props: IProps) {
    super(props);

    this.state = {
        data: [],
        messageBody: '',
        isLoading: false,
        textInputHeight: 0,
    };

    this.apiService = new ApiService({});
    this.authService = new AuthService({});

    this._renderItem = this._renderItem.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);

    this.submitMessage = this.submitMessage.bind(this);
    this.setMessageText = this.setMessageText.bind(this);

    this.CheckNow = this.CheckNow.bind(this);
    this.monitorMessages = this.monitorMessages.bind(this);
    this.postMessage = this.postMessage.bind(this);

    this.getTime = this.getTime.bind(this);
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
    // @ts-ignore
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
          //backgroundColor: '#f9fbff',
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
          <Text style={styles.ratingText}> {this.getTime(item)} | { item.display_name } ({ item.user.substr(item.user.length - 5)})</Text>
          </View>
        }
      />
    )

    componentWillMount () {
      // Grab navigation params
      this.action = this.props.navigation.getParam('action', '');
      this.nodeId = this.props.navigation.getParam('nodeId', '');

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
      <View style={{flex: 1}}>
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
            this.state.data.length === 0 &&
            <Text style={styles.null}>No messages yet!</Text>
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
          {/* <TouchableOpacity
              onPress={this.submitMessage}
              style={{width: 100}}
            >
            <Icon
              iconStyle={{padding: 10}}
              containerStyle={styles.iconContainer}
              size={20}
              name='send'
              color={'black'}
            />
          </TouchableOpacity> */}
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
    maxHeight: 120,
  },
  null: {
    fontSize: 22,
    color: 'gray',
    top: 250,
    alignSelf: 'center',
  },
  titleText: {
    left: 4,
    color: 'black',
    fontSize: 16,
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
    backgroundColor: 'white',
    flex: 1,
    marginBottom: 40,
  },
});