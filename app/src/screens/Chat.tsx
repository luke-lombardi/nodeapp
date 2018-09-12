import React, { Component } from 'react';
// @ts-ignore
import { View, FlatList, StyleSheet, Text, AsyncStorage, Alert } from 'react-native';
import { ListItem } from 'react-native-elements';
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
    this.postMessages = this.postMessages.bind(this);
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

    componentDidMount() {
      this.action = this.props.navigation.getParam('action', '');
      console.log('ACTION ID');
      console.log(this.action);

      if (this.action === 'join_chat') {
        this.nodeId = this.props.navigation.getParam('nodeId', '');
        console.log('NODE ID');
        console.log(this.nodeId);
      }

      if (this.action === 'new_message') {
        this.postMessages();
      }
      this.setMessages();
    }

    async postMessages() {

      const nodeType = this.props.navigation.getParam('nodeType', '');
      const nodeId = this.props.navigation.getParam('nodeId', '');
      const userUuid = await AsyncStorage.getItem('user_uuid');
      // let nodeId = 'private:4317f67a-ae7a-4347-8184-992967623882';
      let messageBody = this.props.navigation.getParam('messageBody', '');
      // let userUuid =  '05e9c779-de02-4a8a-9fad-097e2f153f62';

      let requestBody = {
        node_id: nodeType + ':' + nodeId,
        message: messageBody,
        user_uuid: userUuid,
      };

      console.log('got message body', requestBody);

      let response = await this.apiService.PostMessageAsync(requestBody);
      if (response !== undefined) {
        console.log('got response!', response);
        await this.setMessages();
      }
    }

    async setMessages() {
      console.log('set messages');
      let currentUUID = await AsyncStorage.getItem('user_uuid');
      let requestBody = {
        'node_id': this.nodeId,
        'user_uuid': currentUUID,
      };

      let messages = await this.apiService.GetMessagesAsync(requestBody);
      console.log('set messages---->', messages);

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
    marginTop: 25,
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