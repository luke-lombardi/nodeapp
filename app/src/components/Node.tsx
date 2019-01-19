import React, { Component } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Icon } from 'react-native-elements';
import NavigationService from '../services/NavigationService';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

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
}

export default class Node extends Component<IProps, IState> {
  private apiService: ApiService;
  private authService: AuthService;
  private scrollView: any;

  constructor(props: IProps) {
    super(props);
    this.state = {
      loadingLikeIcon: true,
      currentLikeIcon: 'loader',
      likeIconOpacity: 0.4,
    };

    this.goToFinder = this.goToFinder.bind(this);
    this.goToChat = this.goToChat.bind(this);
    this.shareNode = this.shareNode.bind(this);

    this.toggleLikeStatus = this.toggleLikeStatus.bind(this);
    this.updateLikeStatus = this.updateLikeStatus.bind(this);
    this.updateLikeIcon  = this.updateLikeIcon.bind(this);

    this.upvoteComment = this.upvoteComment.bind(this);
    this.downvoteComment = this.downvoteComment.bind(this);

    this.apiService = new ApiService({});
    this.authService = new AuthService({});

    this.componentDidMount = this.componentDidMount.bind(this);
  }

  async toggleLikeStatus() {
    let currentUUID = await this.authService.getUUID();
    let requestBody = {
        'node_id': this.props.nodeId,
        'user_uuid': currentUUID,
        'toggle': true,
    };

    await this.setState({loadingLikeIcon: true, currentLikeIcon: 'loader'});

    let response  = await this.apiService.LikeNodeAsync(requestBody);
    await this.updateLikeIcon(currentUUID, response);
  }

  componentDidMount() {
    this.updateLikeStatus();
    this.scrollView.scrollToEnd({ animated: true });
  }

  async updateLikeStatus() {
    let currentUUID = await this.authService.getUUID();

    let requestBody = {
      'node_id': this.props.nodeId,
      'user_uuid': currentUUID,
      'toggle': false,
    };

    await this.setState({loadingLikeIcon: true, currentLikeIcon: 'loader'});

    let response  = await this.apiService.LikeNodeAsync(requestBody);
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

    await this.setState({loadingLikeIcon: false, currentLikeIcon: 'thumbs-up'});

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

  async upvoteComment(item) {
    console.log('upvoting comment....', item);
  }

  async downvoteComment(item) {
    console.log('downvoting comment....', item);
  }

  render() {
    return (
      <View style={styles.view}>
        <View style={styles.nodeCardContainer}>
        <Card containerStyle={styles.nodeCard}>
        <View style={{width: '80%'}}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            ref={ref => {
              this.scrollView = ref;
            }}
          >
            <Text numberOfLines={1} style={styles.nodeTopic}>
            {this.props.topic}
            </Text>
          </ScrollView>
          <Text numberOfLines={1} style={styles.durationTitle}>
          { (this.props.ttl > 0) ? 'Expires in ' + (this.props.ttl / 3600).toFixed(1) + ' hours' : undefined }
          </Text>
          </View>
          <View style={{paddingHorizontal: 10, position: 'absolute', flexDirection: 'column', alignContent: 'flex-end', alignSelf: 'flex-end', justifyContent: 'flex-end'}}>
            <Icon
              name='keyboard-arrow-up'
              color='#00aced'
              size={36}
              //onPress={() => this.upvoteComment(item)}
            />
            <Text style={{fontSize: 20, color: 'white', alignSelf: 'center', alignItems: 'center'}}>39</Text>
            <Icon
              name='keyboard-arrow-down'
              color='#00aced'
              size={36}
              //onPress={() => this.downvoteComment(item)}
            />
          </View>
          <View style={styles.buttonContainer}>
          <View style={styles.buttonView}>
            <Button
              icon={{
                name: this.state.currentLikeIcon,
                type: 'feather',
                size: 36,
                color: `rgba(255,255,255,${this.state.likeIconOpacity})`,
              }}
              style={styles.mapButton}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.transparentButton}
              title=''
              onPress={this.toggleLikeStatus}
              disabled={this.state.loadingLikeIcon}
            />
             <Button
              icon={{
                name: 'message-circle',
                type: 'feather',
                size: 36,
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
                size: 36,
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
    backgroundColor: 'transparent',
  },
  nodeCardContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
    paddingBottom: 15,
  },
  nodeCard: {
    height: '90%',
    width: '90%',
    borderRadius: 20,
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(44,55,71,.9)',
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 2, height: 3 },
  },
  nodeTopic: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
    alignSelf: 'flex-start',
    marginVertical: 5,
    paddingHorizontal: 10,
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
    flex: 3,
    backgroundColor: 'rgba(44,55,71,0.0)',
    flexDirection: 'row',
    alignSelf: 'center',
    width: '100%',
    height: '60%',
  },
  buttonView: {
    width: '100%',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(44,55,71,0.1)',
  },
  middleButton: {
    width: '70%',
    height: '100%',
    top: 1,
    alignSelf: 'center',
    marginLeft: 15,
  },
  mapButton: {
    width: '70%',
    height: '100%',
    alignSelf: 'center',
    marginLeft: 15,
  },
  directionsButton: {
    width: '70%',
    height: '100%',
    alignSelf: 'center',
    marginLeft: 15,
  },
  transparentButton: {
    backgroundColor: 'rgba(44,55,71,0.0)',
    paddingTop: 15,
  },
});