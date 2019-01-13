import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-elements';
import NavigationService from '../services/NavigationService';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

interface IProps {
  title: string;
  description: string;
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

  render() {
    return (
      <View style={styles.view}>
        <Card containerStyle={styles.nodeCard}>
          <Text numberOfLines={1} style={styles.nodeTitle}>
            {this.props.title}
          </Text>
          <Text numberOfLines={1} style={styles.durationTitle}>
          { (this.props.ttl > 0) ? ' Expires in ' + (this.props.ttl / 3600).toFixed(1) + ' hours' : undefined }
          </Text>
          <Text numberOfLines={1} style={styles.description}>
            {this.props.description}
          </Text>
          <View style={styles.buttonContainer}>
          <View style={styles.buttonView}>
            <Button
              icon={{
                name: this.state.currentLikeIcon,
                type: 'feather',
                size: 45,
                color: `rgba(44,55,71,${this.state.likeIconOpacity})`,
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
                size: 45,
                color: 'rgba(44,55,71,0.8)',
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
                size: 45,
                color: 'rgba(44,55,71,0.8)',
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
    );
  }
}

// @ts-ignore
const styles = StyleSheet.create({
  view: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  nodeCard: {
    height: '90%',
    width: '90%',
    borderRadius: 20,
    borderColor: 'rgba(53,53,53,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 2, height: 3 },
  },
  nodeTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
  },
  durationTitle: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 14,
    alignSelf: 'center',
  },
  description: {
    paddingLeft: 10,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  distance: {
    fontSize: 14,
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
    top: 5,
    padding: 0,
    flexDirection: 'row',
    alignSelf: 'center',
    width: '100%',
    height: '100%',
    borderRightWidth: 0,
    borderRightColor: 'rgba(44,55,71,0.3)',
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