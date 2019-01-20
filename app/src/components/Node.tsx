import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Icon } from 'react-native-elements';
import NavigationService from '../services/NavigationService';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

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

export default class Node extends Component<IProps, IState> {
  private authService: AuthService;
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

    this.authService = new AuthService({});

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }

  async toggleLikeStatus() {
    let currentUUID = await this.authService.getUUID();
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
    let currentUUID = await this.authService.getUUID();

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

  goToChat() {
    NavigationService.reset('Chat', {
      action: 'join_chat', nodeId: this.props.nodeId,
    });
  }

  goToFinder() {
    this.props.navigation.navigate({key: 'Finder', routeName: 'Finder', params: {action: 'scan_node', nodeId: this.props.nodeId, nodeType: this.props.nodeType }});
  }

  shareNode() {
    this.props.navigation.navigate({key: 'ContactList', routeName: 'ContactList', params: { action: 'share_node', nodeId: this.props.nodeId } });
  }

  async upvoteComment() {
    let currentUUID = await this.authService.getUUID();

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
          <View style={{paddingHorizontal: 15, position: 'absolute', flexDirection: 'column', alignContent: 'flex-end', alignSelf: 'flex-end', justifyContent: 'flex-end'}}>
            <Icon
              name='keyboard-arrow-up'
              color='#00aced'
              size={40}
              onPress={() => this.upvoteComment()}
              underlayColor={'transparent'}
            />
            {/* <Text style={{fontSize: 20, color: 'white', alignSelf: 'center', alignItems: 'center'}}>{Object.keys(this.props.likes).length}</Text> */}
            <Icon
              name='keyboard-arrow-down'
              color='#00aced'
              size={40}
              onPress={() => this.downvoteComment()}
              underlayColor={'transparent'}
            />
          </View>
          <View style={styles.buttonContainer}>
          <View style={styles.buttonView}>
            <Button
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
              onPress={this.toggleLikeStatus}
              disabled={this.state.loadingLikeIcon}
              disabledStyle={{backgroundColor: 'rgba(44,55,71,.9)'}}
            />
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
              onPress={this.goToChat}
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
              onPress={this.shareNode}
              />
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeCardContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
  },
  nodeCard: {
    height: 220,
    width: '90%',
    borderRadius: 20,
    borderColor: 'rgba(255,255,255,0.2)',
    borderTopWidth: 0,
    borderWidth: .5,
    borderTopLeftRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 10,
    bottom: 20,
    backgroundColor: 'rgba(44,55,71,.9)',
    // shadowColor: 'black',
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // shadowOffset: { width: 2, height: 3 },
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
    left: 16,
    position: 'relative',
    backgroundColor: 'rgba(44,55,71,.9)',
    alignSelf: 'flex-start',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    width: 200,
    height: 50,
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
    backgroundColor: 'rgba(44,55,71,.9)',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    height: 50,
    width: '100%',
  },
  buttonView: {
    // height: 35,
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
    // marginLeft: 15,
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