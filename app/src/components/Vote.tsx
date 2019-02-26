import React, { Component } from 'react';
// @ts-ignore
import { View, StyleSheet, AsyncStorage, Dimensions, Animated } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { ScaledSheet } from 'react-native-size-matters';
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
  selectedNode: any;
}

interface IState {
  totalVoteCount: number;
  vote: number;
}

export default class Vote extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    this.state = {
      totalVoteCount: 0,
      vote: 0,
    };

    this.updateVote = this.updateVote.bind(this);
    this.updateVoteStatus = this.updateVoteStatus.bind(this);
    this.calculateVotes = this.calculateVotes.bind(this);
  }

  async updateVote(vote: number) {

    await this.setState({vote: vote});

    let currentUUID = await AuthService.getUUID();
    let requestBody = {
        'node_id': this.props.selectedNode.node_id,
        'user_uuid': currentUUID,
        'vote': vote,
    };

    let response = await ApiService.LikeNodeAsync(requestBody);

    let totalVoteCount: number = await this.calculateVotes(response);
    await this.setState({totalVoteCount: totalVoteCount});
  }

  async calculateVotes(response: any) {
    let currentUUID = await AuthService.getUUID();
    let totalVoteCount = 0;
    for (let user in response.votes) {
      if (response.votes.hasOwnProperty(user)) {

        if (user === currentUUID) {
          await this.setState({vote: response.votes[user]});
        }

        totalVoteCount += response.votes[user];
      }
    }
    return totalVoteCount;
  }

  componentDidMount() {
    this.updateVoteStatus();
  }

  async updateVoteStatus() {
    let currentUUID = await AuthService.getUUID();

    let requestBody = {
      'node_id': this.props.selectedNode.node_id,
      'user_uuid': currentUUID,
      'vote': undefined,
    };

    let response  = await ApiService.LikeNodeAsync(requestBody);
    let totalVoteCount: number = await this.calculateVotes(response);
    await this.setState({totalVoteCount: totalVoteCount});
  }

  render() {
    return (
      <View style={{flex: 1, alignItems: 'center', flexDirection: 'column', alignContent: 'flex-end', alignSelf: 'flex-end', justifyContent: 'flex-end'}}>
        <Icon
          name='keyboard-arrow-up'
          color={this.state.vote === 1 ? 'rgba(0,172,237, 0.5)' : 'rgba(0,172,237, 1)'}
          size={34}
          onPress={async () => { await this.updateVote(1); }}
          underlayColor={'transparent'}
        />
        <Text style={{margin: -5, fontSize: 18, color: 'gray', alignSelf: 'center', alignItems: 'center'}}>{this.state.totalVoteCount}</Text>
        <Icon
          name='keyboard-arrow-down'
          color={this.state.vote === -1 ? 'rgba(0,172,237, 0.5)' : 'rgba(0,172,237, 1)'}
          size={34}
          onPress={async () => { await this.updateVote(-1); }}
          underlayColor={'transparent'}
        />
      </View>
    );
  }
}

// @ts-ignore
const styles = ScaledSheet.create({
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
    height: '200@vs',
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
    marginVertical: '5@vs',
    bottom: '5@vs',
    paddingHorizontal: 10,
    maxHeight: '100@vs',
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
    height: 50,
    width: '100%',
  },
  buttonView: {
    // height: 35,
    width: '100%',
    flexDirection: 'row',
    alignSelf: 'center',
    alignContent: 'center',
    borderColor: 'rgba(255,255,255,.1)',
    borderTopWidth: 0.5,
  },
  middleButton: {
    width: '70%',
    height: '100%',
    top: 1,
    // marginLeft: 15,
  },
  mapButton: {
    width: '70%',
    height: '100%',
    left: 10,
  },
  directionsButton: {
    width: '70%',
    height: '100%',
    // marginLeft: 30,
  },
  transparentButton: {
    backgroundColor: 'rgba(44,55,71,0.0)',
    paddingTop: 15,
  },
});