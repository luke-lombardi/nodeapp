import React, { Component } from 'react';
// import { NavigationActions } from 'react-navigation';

// @ts-ignore
import { View, FlatList, StyleSheet, Text, Alert, Animated, TextInput, TouchableOpacity, KeyboardAvoidingView, Keyboard, AsyncStorage } from 'react-native';
import { ListItem, Icon, Button } from 'react-native-elements';

// @ts-ignore
import Snackbar from 'react-native-snackbar';
import Spinner from 'react-native-loading-spinner-overlay';
// @ts-ignore
import NavigationService from '../services/NavigationService';

// Redux imports
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

// Services
// @ts-ignore
import ApiService from '../services/ApiService';
// @ts-ignore
import AuthService from '../services/AuthService';

// @ts-ignore
import moment from 'moment';

import { ConfigGlobalLoader } from '../config/ConfigGlobal';
import NotificationService from '../services/NotificationService';

interface IProps {
    navigation: any;
    functions: any;
}

interface IState {
    data: any;
    isLoading: boolean;
    textInputHeight: number;
    userInfo: string;
}

export class Notifications extends Component<IProps, IState> {
  // @ts-ignore
  private readonly configGlobal = ConfigGlobalLoader.config;

  // @ts-ignore
  private userUuid: string;
  private action: any;

  // TODO: figure out a smarter way to do this
  // @ts-ignore
  static navigationOptions = ({ navigation }) => {
    // const { params = {} } = navigation.state;
    return {
      headerStyle: {backgroundColor: 'black', paddingLeft: 10, height: 70},
      headerTitleStyle: { color: 'white', fontSize: 22, fontWeight: 'bold'},
        title: 'Notifications',
        headerLeft:
            <Icon
            name='x'
            type='feather'
            containerStyle={{padding: 5}}
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
        isLoading: true,
        textInputHeight: 0,
        userInfo: '',
    };

    this._renderItem = this._renderItem.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);

    this.loadNotifications = this.loadNotifications.bind(this);
    this.getTime = this.getTime.bind(this);
    }

    getTime(item) {
      console.log('THIS ITEM', item);
      let easternTime = moment(item.timestamp).utcOffset(14);

      let parsedTimestamp = moment(easternTime).calendar();

      return parsedTimestamp;
    }

    // @ts-ignore
    _renderItem = ({item, index}) => (
      <ListItem
        // onLongPress={() => this.showConfirmModal(item)}
        containerStyle={{
          minHeight: 100,
          backgroundColor: index % 2 === 0 ? '#f9fbff' : 'white',
        }}
        title={
          <View style={styles.titleView}>
          <View style={{alignSelf: 'flex-start', alignItems: 'flex-end'}}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.ratingText, {paddingTop: index === 0 ? 5 : 0}]}>{item.from_username}</Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{fontSize: 12, color: 'gray', alignSelf: 'flex-start'}}>
            {item.action === 'add_node' ? 'Add Node' : 'Add Friend'}
          </Text>
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
            onPress={
              async () =>  {
                await NotificationService.handleAction(item);
                await this.loadNotifications();
              }
            }
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
            onPress={ async () => {
              await NotificationService.removeNotification(item);
              await this.loadNotifications();
              } }
            />
          </View>
        }
      />
    )

    componentWillMount () {
      // Grab navigation params
      // this.action = this.props.navigation.getParam('action', '');

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

      // Load existing notifications from AsyncStorage
      this.loadNotifications();
    }

    componentDidMount() {
      // @ts-ignore
    }

    componentWillUnmount() {
      // @ts-ignore
    }

    async loadNotifications() {

      // Pull notifications from async storage
      let notifications: any = await AsyncStorage.getItem('notifications');
      if (notifications !== null) {
        notifications = JSON.parse(notifications);
      } else {
        // @ts-ignore
        notifications = [];
      }

      console.log('LOADED THESE NOTIFICATIONS');
      console.log(notifications);

      // Parse out notifications that are actual requests
      let parsedNotifications = [];

      for (let i = 0; i < notifications.length; i++) {
        if (notifications[i].action !== undefined) {
          parsedNotifications.push(notifications[i]);
        }
      }

      // Update the state w/ parsed notifications
      await this.setState({
        isLoading: false,
        data: parsedNotifications,
      });
    }

    render() {
      return (
      <View style={{flex: 1}}>
        <View style={{flex: 1}}>
        <View style={styles.flatlist}>
          <FlatList
           data={this.state.data}
           renderItem={this._renderItem}
           keyExtractor={item => item.friend_id}
          />
          {
            this.state.data.length === 0 &&
            <View style={styles.nullContainer}>
            <Text style={styles.null}>No Notifications.</Text>
            <Text style={styles.nullSubtitle}>You can find things that require your attention here.</Text>
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
    color: 'black',
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
    bottom: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});