import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';

// @ts-ignore
import { View, FlatList, StyleSheet, Text, AsyncStorage, Alert } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import ApiService from '../services/ApiService';

interface IProps {
    navigation: any;
}

interface IState {
    data: any;
    isLoading: boolean;
}

export class Chat extends Component<IProps, IState> {

  private apiService: ApiService;

  // @ts-ignore
  private userUuid: string;
  private nodeId: string;
  private action: any;

  // TODO: figure out a smarter way to do this
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
        headerTitleStyle: { color: 'white'},
        title: 'Chat',
        headerLeft: <Icon name='x' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () => {
          navigation.dispatch(NavigationActions.navigate(
                {
                  routeName: 'Map',
                  params: {},
                  action: NavigationActions.navigate({ routeName: 'Map' }),
                })); }
               } />,
          headerRight: <Icon name='edit' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () => {
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

    this._renderItem = this._renderItem.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

    // this.updateList = this.updateList.bind(this);
    this.setMessages = this.setMessages.bind(this);
    this.postMessage = this.postMessage.bind(this);

    this.goToCreateMessage = this.goToCreateMessage.bind(this);
    }

    goToCreateMessage() {
      this.props.navigation.navigate({key: 'CreateMessage', routeName: 'CreateMessage', params: { nodeId: this.nodeId }});
    }

    // updateList() {
    //   this.messageBody = this.props.navigation.getParam('messageBody', '');
    //   let newList = this.state.data.push(this.messageBody);
    //   this.setState({data: newList});
    //   console.log('newList', this.state.data);
    // }

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
          <Text style={styles.ratingText}>{item.timestamp}</Text>
          </View>
        }
      />
    )

    componentDidMount () {
      // Set params for nav stack
      this.props.navigation.setParams({ goToCreateMessage: this.goToCreateMessage });

      // Grab navigation params
      this.action = this.props.navigation.getParam('action', '');
      this.nodeId = this.props.navigation.getParam('nodeId', '');

      // If we are returning from the CreateMessage screen, post the users message
      if (this.action === 'new_message') {
        this.postMessage();
      }

      // Updates the message data for the node
      this.setMessages();
    }

    // Sends a new message to the API
    async postMessage() {
      const nodeId = this.props.navigation.getParam('nodeId', undefined);
      const userUuid = await AsyncStorage.getItem('user_uuid');
      let messageBody = this.props.navigation.getParam('messageBody', undefined);

      let requestBody = {
        node_id:  nodeId,
        message: messageBody,
        user_uuid: userUuid,
      };

      console.log('Sending request body', requestBody);

      let response = await this.apiService.PostMessageAsync(requestBody);
      if (response !== undefined) {
        console.log('Response: ', response);
        await this.setMessages();
      }
    }

    async setMessages() {
      console.log('Setting messages...');

      let currentUUID = await AsyncStorage.getItem('user_uuid');
      let requestBody = {
        'node_id': this.nodeId,
        'user_uuid': currentUUID,
      };

      let messages = await this.apiService.GetMessagesAsync(requestBody);
      console.log(messages);

      if (messages !== undefined) {
        await this.setState({data: messages});
      }
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