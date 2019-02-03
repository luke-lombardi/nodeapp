import React, { Component } from 'react';
import { View, StyleSheet, AsyncStorage } from 'react-native';
import { Card, Text, Button } from 'react-native-elements';
import NavigationService from '../services/NavigationService';

// import ApiService from '../services/ApiService';
// import AuthService from '../services/AuthService';
// import NodeService from '../services/NodeService';

// @ts-ignore
import Moment from 'moment';
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
}

interface IState {
}

export default class Person extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
    };

    this.goToChat = this.goToChat.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }

  componentWillMount() {
    //
  }

  componentWillUnmount() {
    //
  }

  async goToChat() {
    let nodeId = undefined;
    let username = this.props.topic;

    let trackedRelations: any = await AsyncStorage.getItem('trackedRelations');
    if (trackedRelations !== null) {
      trackedRelations = JSON.parse(trackedRelations);
    } else {
      trackedRelations = {};
    }

    // TODO: return more data for the rcpt so this looping isn't necessary
    let relationsToGet = [];
    for (let key in trackedRelations) {
        if (trackedRelations.hasOwnProperty(key)) {
            relationsToGet.push(trackedRelations[key].relation_id);
      }
    }

    let currentUUID  = await AuthService.getUUID();
    let requestBody = {
      'relations': relationsToGet,
      'user_id': currentUUID,
    };

    let relations = await ApiService.getRelations(requestBody);

    for (let relationId in relations) {
      if (relations.hasOwnProperty(relationId)) {
        for (let member in relations[relationId].members) {
          if (relations[relationId].members.hasOwnProperty(member)) {
              if (member === this.props.nodeId) {
                nodeId = relationId;
                break;
              }
          }
        }
      }
    }

    if (nodeId !== undefined) {
      NavigationService.reset('Chat', {
        action: 'join_chat',
        nodeId: nodeId,
        username: username,
      });
    }
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