import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-elements';

interface IProps{
  title: string;
  description: string;
  navigation: any;
}

interface IState{

}

export default class Node extends Component<IProps, IState> {
  constructor(props: IProps){
    super(props);
    this.state = {
    };

    this.goToFinder = this.goToFinder.bind(this);

  }

  goToFinder(){
    this.props.navigation.navigate('Finder', {action: "scan_node"});
  }

  render() {
    return (
      <View style={styles.view}>
        <Card containerStyle={styles.nodeCard}> 

          <Text numberOfLines={1} ellipsizeMode={'head'} style={styles.nodeTitle}>
      
            {this.props.title}

          </Text>
          <Text numberOfLines={1} ellipsizeMode={'head'} style={styles.description}>
          {this.props.description}
          </Text>
         
          <View style={styles.buttonView}>
            <Button
              icon={{
                name: 'camera',
                type: 'feather',
                size: 60,
                color: 'rgba(44,55,71,0.8)'
              }}
              style={styles.cameraButton}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.transparentButton}
              title=''
              onPress={this.goToFinder}
            />
          </View>
        </Card>
      </View>
    )
  }


};

// @ts-ignore
const styles = StyleSheet.create({
  view: {
    flex: 1,
  },
  nodeCard: { 
    height: '85%',
    borderRadius: 20,
    borderColor: 'rgba(53,53,53,0.1)',
    flexDirection: 'row',
    padding: 10,
  },
  nodeTitle: {
    fontSize: 24,
    alignSelf:'center',
    marginBottom: 10
  },
  description: {
    alignSelf: 'center',
  },
  buttonContainer: {
    backgroundColor: 'rgba(44,55,71,0.0)',
    padding:0,
    width:'100%',
    height:'100%',
    borderRightWidth: 0,
    borderRightColor: 'rgba(44,55,71,0.3)',
  },
  buttonView: {
    flex: 1,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(44,55,71,0.1)',
    //marginTop: 15
  },
  cameraButton: {
    width:'100%',
    height:'100%',
    alignItems: 'center',
    padding:0,
  },
  transparentButton: {
    backgroundColor: 'rgba(44,55,71,0.0)',
    paddingTop: 15,
  }
});