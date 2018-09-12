import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-elements';
import getDirections from 'react-native-google-maps-directions';

interface IProps {
  title: string;
  description: string;
  nodeId: string;
  nodeType: string;
  ttl: number;
  navigation: any;
  origin: any;
  destination: any;
}

interface IState {
}

export default class Node extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
    };

    this.goToFinder = this.goToFinder.bind(this);
    this.goToChat = this.goToChat.bind(this);
    this.shareNode = this.shareNode.bind(this);
    this.handleGetDirections = this.handleGetDirections.bind(this);
  }

  handleGetDirections = () => {
    const { origin, destination } = this.props;
    const data = {
      source: {
        latitude: origin.latitude,
        longitude: origin.longitude,
      },
      destination: {
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
      params: [
        {
          key: 'travelmode',
          value: 'walking',       // may be "walking", "bicycling" or "transit" as well
        },
        {
          key: 'dir_action',
          value: 'navigate',      // this instantly initializes navigation using the given travel mode
        },
      ],
    };
    getDirections(data);
  }

  goToChat() {
    this.props.navigation.navigate({key: 'Chat', routeName: 'Chat', params: { action: 'join_chat', nodeId: this.props.nodeId, nodeType: this.props.nodeType }});
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

          {/* <Text numberOfLines={1} ellipsizeMode={'head'} style={styles.distance}>
            {this.props.distance ? this.props.distance + ' miles away' : ''}
          </Text>

          <Text numberOfLines={1} ellipsizeMode={'head'} style={styles.distance}>
            {this.props.minutesAway ? this.props.minutesAway + ' minutes away' : ''}
          </Text> */}

          <Text numberOfLines={1} ellipsizeMode={'head'} style={styles.nodeTitle}>
            {this.props.title} { (this.props.ttl > 0) ? ' (expires in ' + (this.props.ttl / 3600).toFixed(1) + ' hours)' : undefined }
          </Text>

          <Text numberOfLines={1} ellipsizeMode={'head'} style={styles.description}>
            {this.props.description}
          </Text>

          <View style={styles.buttonContainer}>
          <View style={styles.buttonView}>
            <Button
              icon={{
                name: 'map',
                type: 'feather',
                size: 50,
                color: 'rgba(44,55,71,0.8)',
              }}
              style={styles.mapButton}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.transparentButton}
              title=''
              onPress={this.handleGetDirections}
            />
             {/* <Button
              icon={{
                name: 'message-circle',
                type: 'feather',
                size: 50,
                color: 'rgba(44,55,71,0.8)',
              }}
              style={styles.cameraButton}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.transparentButton}
              title=''
              onPress={this.goToFinder}
            /> */}

             <Button
              icon={{
                name: 'message-circle',
                type: 'feather',
                size: 50,
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
                size: 50,
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
    height: '85%',
    width: '90%',
    borderRadius: 20,
    borderColor: 'rgba(53,53,53,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 2, height: 3 },
  },
  nodeTitle: {
    fontSize: 24,
    alignSelf: 'center',
    marginBottom: 10,
  },
  description: {
    alignSelf: 'center',
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