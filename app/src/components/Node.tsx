import React, { Component } from 'react';
// @ts-ignore
import { View, StyleSheet, AsyncStorage, Dimensions, Animated } from 'react-native';
import { Card, Text, Button, Icon } from 'react-native-elements';
import NavigationService from '../services/NavigationService';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

// @ts-ignore
import Moment from 'moment';

// @ts-ignore
const { width, height } = Dimensions.get('window');
// @ts-ignore
const CARD_HEIGHT = height / 4;
// @ts-ignore
const CARD_WIDTH = width;

interface IProps {
  topic: string;
  nodeId: string;
  nodeType: string;
  ttl: number;
  navigation: any;
  origin: any;
  destination: any;
  likes: any;
  direction: number;
  index: number;
}

interface IState {
  loadingLikeIcon: boolean;
  currentLikeIcon: string;
  likeIconOpacity: number;
  time: any;
  elaspedTime: number;
  totalVoteCount: number;
  x: any;
}

export default class Node extends Component<IProps, IState> {
  private interval: any;

  constructor(props: IProps) {
    super(props);

    this.state = {
      loadingLikeIcon: true,
      currentLikeIcon: 'loader',
      likeIconOpacity: 0.4,
      time: '',
      elaspedTime: 0,
      totalVoteCount: 0,
      x: new Animated.Value(this.props.direction),
    };

    this.goToFinder = this.goToFinder.bind(this);
    this.goToChat = this.goToChat.bind(this);
    this.shareNode = this.shareNode.bind(this);

    this.updateVote = this.updateVote.bind(this);
    this.updateVoteStatus = this.updateVoteStatus.bind(this);
    this.calculateVotes = this.calculateVotes.bind(this);
    // this.updateVoteIcon  = this.updateLikeIcon.bind(this);

    this.countdown = this.countdown.bind(this);

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.slideIn = this.slideIn.bind(this);
  }

  async updateVote(vote: number) {
    let currentUUID = await AuthService.getUUID();
    let requestBody = {
        'node_id': this.props.nodeId,
        'user_uuid': currentUUID,
        'vote': vote,
    };

    // await this.setState({loadingLikeIcon: true, currentLikeIcon: 'loader'});

    let response  = await ApiService.LikeNodeAsync(requestBody);

    let totalVoteCount: number = this.calculateVotes(response);
    await this.setState({totalVoteCount: totalVoteCount});
    // await this.updateLikeIcon(currentUUID, response);
  }

  calculateVotes(response: any) {
    let totalVoteCount = 0;
    for (let user in response.votes) {
      if (response.votes.hasOwnProperty(user)) {
        // console.log(response.votes[user]);
        totalVoteCount += response.votes[user];
      }
    }
    return totalVoteCount;
  }

  componentWillMount() {
    clearInterval(this.interval);
    this.interval = setInterval(() => { this.countdown(); }, 1000);
    this.countdown();
  }

  componentDidMount() {
    this.updateVoteStatus();
    this.slideIn();
  }

  slideIn() {
    Animated.spring(this.state.x, {
      toValue: 0,
    }).start();
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

  async updateVoteStatus() {
    let currentUUID = await AuthService.getUUID();

    let requestBody = {
      'node_id': this.props.nodeId,
      'user_uuid': currentUUID,
      'vote': undefined,
    };

    await this.setState({loadingLikeIcon: true, currentLikeIcon: 'loader'});

    let response  = await ApiService.LikeNodeAsync(requestBody);
    // await this.updateLikeIcon(currentUUID, response);
    let totalVoteCount: number = await this.calculateVotes(response);
    await this.setState({totalVoteCount: totalVoteCount});
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
    NavigationService.reset('Chat', {
      action: 'join_chat',
      nodeId: this.props.nodeId,
      nodeType: this.props.nodeType,
      nodeIndex: this.props.index,
     });
  }

  goToFinder() {
    this.props.navigation.navigate({key: 'Finder', routeName: 'Finder', params: {action: 'scan_node', nodeId: this.props.nodeId, nodeType: this.props.nodeType }});
  }

  shareNode() {
    NavigationService.reset('FriendList', { action: 'share_node', nodeId: this.props.nodeId } );
  }

  render() {
    return (
      <Animated.View
          style={[styles.view, {
            transform: [
              {
                translateX: this.state.x,
              },
            ],
          }]}
        >
        <View style={styles.nodeCardContainer}>
        <View style={styles.countdownContainer}>
        <Icon
          name='clock'
          type='feather'
          size={22}
          color={'rgba(255,255,255,.8)'}
          containerStyle={{position: 'absolute', left: 10, top: 1, padding: 10, alignSelf: 'flex-start'}}
        />
        <Text style={{color: 'rgba(255,255,255,.8)', alignSelf: 'center', paddingTop: 10, left: 10, letterSpacing: 3, fontSize: 18}}>{this.state.time}</Text>
        </View>
        <Card containerStyle={styles.nodeCard}>
        <View style={{width: '80%', maxHeight: 150, minHeight: 100}}>

            <Text numberOfLines={6} style={styles.nodeTopic}>
            {this.props.topic}
            </Text>
          {/* <Text numberOfLines={1} style={styles.durationTitle}>
          { (this.props.ttl > 0) ? 'Expires in ' + (this.props.ttl / 3600).toFixed(1) + ' hours' : undefined }
          </Text> */}
          </View>
          <View style={{paddingHorizontal: 29, position: 'absolute', flexDirection: 'column', alignContent: 'flex-end', alignSelf: 'flex-end', justifyContent: 'flex-end'}}>
            <Icon
              name='keyboard-arrow-up'
              color='#00aced'
              size={30}
              onPress={async () => { await this.updateVote(1); }}
              underlayColor={'transparent'}
            />
            <Text style={{fontSize: 20, color: 'white', alignSelf: 'center', alignItems: 'center'}}>{this.state.totalVoteCount}</Text>
            <Icon
              name='keyboard-arrow-down'
              color='#00aced'
              size={30}
              onPress={async () => { await this.updateVote(-1); }}
              underlayColor={'transparent'}
            />
          </View>
          <View style={styles.buttonContainer}>
          <View style={styles.buttonView}>
            {/* <Button
              icon={{
                name: this.state.currentLikeIcon,
                type: 'feather',
                size: 34,
                underlayColor: 'transparent',
                color: `rgba(255,255,255,${this.state.likeIconOpacity})`,
              }}
              style={styles.mapButton}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.transparentButton}
              title=''
              // onPress={}
              disabled={this.state.loadingLikeIcon}
              disabledStyle={{backgroundColor: 'rgba(44,55,71,.9)'}}
            /> */}
             <Button
              icon={{
                name: 'message-circle',
                type: 'feather',
                size: 34,
                color: 'rgba(255,255,255,.8)',
              }}
              style={styles.middleButton}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.transparentButton}
              title=''
              onPress={ async () => { await this.goToChat(); } }
            />
            <Button
              icon={{
                name: 'share',
                type: 'feather',
                size: 34,
                color: 'rgba(255,255,255,.8)',
              }}
              style={styles.directionsButton}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.transparentButton}
              title=''
              onPress={() => this.shareNode()}
              />
          </View>
          </View>
        </Card>
        </View>
      </Animated.View>
    );
  }
}

// @ts-ignore
const styles = StyleSheet.create({
  view: {
    width: CARD_WIDTH,
    alignItems: 'center',
  },
  nodeCardContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
    alignContent: 'center',
    bottom: 0,
  },
  nodeCard: {
    height: 180,
    width: '90%',
    borderRadius: 20,
    borderColor: 'rgba(44,55,71,.9)',
    borderTopWidth: 0,
    borderWidth: .5,
    borderTopLeftRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    bottom: 0,
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
  },
  countdownContainer: {
    left: 15,
    position: 'relative',
    backgroundColor: 'rgba(44,55,71,.9)',
    alignSelf: 'flex-start',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    width: 200,
    height: 50,
    bottom: -15,
  },
  durationTitle: {
    color: 'white',
    fontSize: 14,
    alignSelf: 'flex-start',
    padding: 10,
  },
  distance: {
    fontSize: 14,
    color: 'white',
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  minutesAway: {
    fontSize: 14,
    alignSelf: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    height: 80,
    width: '100%',
  },
  buttonView: {
    // height: 35,
    width: '100%',
    flexDirection: 'row',
    alignSelf: 'center',
    alignContent: 'center',
    borderColor: 'rgba(255,255,255,.1)',
    paddingTop: 5,
    marginTop: 20,
    borderTopWidth: 0.5,
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