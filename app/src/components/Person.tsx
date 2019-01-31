import React, { Component } from 'react';
// @ts-ignore
import { View, StyleSheet, AsyncStorage } from 'react-native';
import { Card, Text, Button } from 'react-native-elements';
// @ts-ignore
import NavigationService from '../services/NavigationService';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';
import NodeService from '../services/NodeService';

// @ts-ignore
import Moment from 'moment';

interface IProps {
  topic: string;
  nodeId: string;
  nodeType: string;
  ttl: number;
  navigation: any;
  origin: any;
  destination: any;
  likes: any;
}

interface IState {
  loadingLikeIcon: boolean;
  currentLikeIcon: string;
  likeIconOpacity: number;
  time: any;
  elaspedTime: number;
}

export default class Person extends Component<IProps, IState> {
  private interval: any;

  constructor(props: IProps) {
    super(props);
    this.state = {
      loadingLikeIcon: true,
      currentLikeIcon: 'loader',
      likeIconOpacity: 0.4,
      time: '',
      elaspedTime: 0,
    };

    this.goToFinder = this.goToFinder.bind(this);
    this.goToChat = this.goToChat.bind(this);
    this.shareNode = this.shareNode.bind(this);

    this.toggleLikeStatus = this.toggleLikeStatus.bind(this);
    this.updateLikeStatus = this.updateLikeStatus.bind(this);
    this.updateLikeIcon  = this.updateLikeIcon.bind(this);

    this.upvoteComment = this.upvoteComment.bind(this);
    this.downvoteComment = this.downvoteComment.bind(this);

    this.countdown = this.countdown.bind(this);

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }

  async toggleLikeStatus() {
    let currentUUID = await AuthService.getUUID();
    let requestBody = {
        'node_id': this.props.nodeId,
        'user_uuid': currentUUID,
        'toggle': true,
    };

    await this.setState({loadingLikeIcon: true, currentLikeIcon: 'loader'});

    let response  = await ApiService.LikeNodeAsync(requestBody);
    await this.updateLikeIcon(currentUUID, response);
  }

  componentWillMount() {
    clearInterval(this.interval);
    this.interval = setInterval(() => { this.countdown(); }, 1000);
    this.updateLikeStatus();
    this.countdown();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  // TODO: figure out a better way to do this
  async countdown() {
    let elaspedTime = this.state.elaspedTime;
    elaspedTime += 1;

    let timeInMinutes = Moment().startOf('day').seconds(this.props.ttl - elaspedTime).format('HH:mm:ss');
    await this.setState({
      elaspedTime: elaspedTime,
      time: timeInMinutes,
    });
  }

  async updateLikeStatus() {
    let currentUUID = await AuthService.getUUID();

    let requestBody = {
      'node_id': this.props.nodeId,
      'user_uuid': currentUUID,
      'toggle': false,
    };

    await this.setState({loadingLikeIcon: true, currentLikeIcon: 'loader'});

    let response  = await ApiService.LikeNodeAsync(requestBody);
    await this.updateLikeIcon(currentUUID, response);
  }

  async updateLikeIcon(uuid: string, response: any) {
    if (response !== undefined) {
      try {
        // @ts-ignore
        if (response.likes[uuid] === true) {
          await this.setState({likeIconOpacity: 0.8});
        } else {
          await this.setState({likeIconOpacity: 0.4});
        }
      } catch (error) {
        await this.setState({likeIconOpacity: 0.4});
        // User does not exist in dictionary
      }
    }

    await this.setState({loadingLikeIcon: false, currentLikeIcon: 'heart'});

  }

  async goToChat() {
    console.log('THIS NODE ID', this.props.nodeId);
    let friendId = 'friend:438d1b11-9fbb-4374-b66e-085727e5d884';

      let relation: string = await NodeService.getRelation(friendId);
      console.log('GOT RELATION', relation);
      }

  goToFinder() {
    this.props.navigation.navigate({key: 'Finder', routeName: 'Finder', params: {action: 'scan_node', nodeId: this.props.nodeId, nodeType: this.props.nodeType }});
  }

  shareNode() {
    this.props.navigation.navigate({key: 'FriendList', routeName: 'FriendList', params: { action: 'share_node', nodeId: this.props.nodeId } });
  }

  async upvoteComment() {
    let currentUUID = await AuthService.getUUID();

    let requestBody = {
      'node_id': this.props.nodeId,
      'user_uuid': currentUUID,
      'toggle': false,
    };

    let response  = await ApiService.LikeNodeAsync(requestBody);
    console.log('upvoting comment....', response);
  }

  async downvoteComment() {
    console.log('downvoting comment....');
  }

  render() {
    return (
      <View style={styles.view}>
        <View style={styles.nodeCardContainer}>
          <Card containerStyle={styles.nodeCard}>
            <View style={{width: '100%', maxHeight: 150, minHeight: 30}}>
              <Text numberOfLines={1} style={styles.nodeTopic}>
                {this.props.topic}
              </Text>
              <Text numberOfLines={1} style={styles.nodeSubtitle}>
                {this.props.destination.distance_in_miles} miles away
              </Text>
              <Button
                  icon={{
                    name: 'message-circle',
                    type: 'feather',
                    size: 40,
                    color: 'rgba(255,255,255,.8)',
                  }}
                  style={{alignSelf: 'flex-end', alignContent: 'flex-end'}}
                  containerStyle={{position: 'absolute', bottom: '20%', alignContent: 'flex-end', alignSelf: 'flex-end', alignItems: 'flex-end'}}
                  buttonStyle={styles.transparentButton}
                  title=''
                  onPress={ async () => { await this.goToChat(); } }
                />
              </View>
            </Card>
          </View>
        </View>
      );
    }
  }

// @ts-ignore
const styles = StyleSheet.create({
  view: {
    flex: 1,
  },
  nodeCardContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nodeCard: {
    width: '90%',
    borderRadius: 20,
    borderColor: 'rgba(44,55,71,.9)',
    borderTopWidth: 0,
    borderWidth: .5,
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(44,55,71,.9)',
  },
  nodeTopic: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
    alignSelf: 'flex-start',
    marginVertical: 5,
    paddingHorizontal: 10,
    maxHeight: 100,
    width: '90%',
  },
  nodeSubtitle: {
    color: 'white',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginVertical: 5,
    paddingHorizontal: 10,
    maxHeight: 100,
    width: '50%',
  },
  durationTitle: {
    color: 'white',
    fontSize: 14,
    alignSelf: 'flex-start',
    padding: 10,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    height: 50,
    width: '100%',
  },
  buttonView: {
    width: '100%',
    flexDirection: 'row',
    alignSelf: 'center',
    alignContent: 'center',
  },
  middleButton: {
    width: '70%',
    height: '100%',
    top: 1,
    marginLeft: 15,
  },
  mapButton: {
    width: '70%',
    height: '100%',
  },
  directionsButton: {
    width: '70%',
    height: '100%',
    marginLeft: 30,
  },
  transparentButton: {
    backgroundColor: 'rgba(44,55,71,0.0)',
    paddingTop: 15,
  },
});