import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

// @ts-ignore
import MapView, { Marker}   from 'react-native-maps';

// import Logger from '../services/Logger';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

import { Input, Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Loading from '../components/Loading';

import ApiService from '../services/ApiService';


interface IProps {
  navigation: any,
  challengeSettings: any
}

interface IState {
  title: string,
  description: string,
  userRegion: any,
  isLoading: boolean,
  uuid: string
}

export class CreateNode extends Component<IProps, IState> {
  _map: any;
  private apiService: ApiService;

  constructor(props: IProps){
    super(props);


    this.state = {
      title: '',
      description: '',
      userRegion: {},
      isLoading: false,
      uuid: ''
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);

    this.submitCreateNode = this.submitCreateNode.bind(this);

    this.apiService = new ApiService({});
    }

  componentWillMount() {
    
  }

  componentWillUnmount() {
  }

  componentDidMount(){
    let userRegion = this.props.navigation.getParam('userRegion', {});
    let uuid = this.props.navigation.getParam('uuid', '');

    this.setState({userRegion: userRegion});
    this.setState({uuid: uuid});


    setTimeout(() => {
      // this._map.animateToRegion(this.userRegion, 100);
    }, 10)

  }


  private async submitCreateNode(){
    let requestBody = {
        "title": this.state.title,
        "description": this.state.description,
        "challenge_id": this.props.challengeSettings.challenge_id,
        "lat": this.state.userRegion.latitude,
        "long": this.state.userRegion.longitude,
        "lat_delta":  0.00122*1.5,
        "long_delta": 0.00121*1.5,
        "difficulty": 0,
        "uuid": this.state.uuid
    };

    console.log('Submitted node request');
    await this.setState({isLoading: true});
    await this.apiService.CreateNodeAsync(requestBody);
    await this.setState({isLoading: false});
    this.props.navigation.navigate('Map', {updateNodes: true});

  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.nodeForm}>
         
          { 
            this.state.isLoading &&
            <Loading/>
          }

          <View style={styles.miniMapView}>
           {
            // Main map view
              <MapView
                provider="google"
                ref={component => {this._map = component;}}
                style={[StyleSheet.absoluteFillObject, styles.map]}
                showsUserLocation={true}
                followsUserLocation={true}
                initialRegion={this.state.userRegion}
              >
              </MapView>
           }
          </View>
          <View style={styles.inputView}> 
           
            <Input
              placeholder='Whats here?'
              leftIcon={
                <Icon
                  name='question-circle'
                  size={20}
                  color='rgba(44,55,71,0.3)'
                />
              }
                containerStyle={styles.inputPadding}
                onChangeText={(title) => this.setState({title: title})}
                value={this.state.title}
            />

            <Input
              placeholder='Why should I go here?'
              containerStyle={styles.inputPadding}
              // style={styles.descriptionInput}
              inputStyle={styles.descriptionInput}
              //onChangeText={(username) => this.setState({username})}
              //value={this.state.username}
              onChangeText={(description) => this.setState({description: description})}
              value={this.state.description}
              multiline={true}
              numberOfLines={6}
              
            />

          </View>
          <Button style={styles.fullWidthButton} buttonStyle={{width:"100%", height:"100%"}}
            onPress={this.submitCreateNode}
            title="Create new node"
          />

        </View>
      </View>
    );
  }
}

 // @ts-ignore
 function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    challengeSettings: state.challengeSettings
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateNode);

const styles = StyleSheet.create({
  container: {
    padding:0,
    flex: 1,
    backgroundColor: '#ffffff'
  },
  miniMapView: {
    flex:1,
    padding:10
  },
  map:{
    borderRadius: 10
  },
  inputView: {
    flex:2
  },
  nodeForm: {
    flex: 6,
    alignSelf: 'stretch',
  },
  inputPadding:{
    marginTop: 20,
    marginLeft: 15,
  },
  descriptionInput: {
    padding:10,
    height:100,
  },
  fullWidthButton: {
    backgroundColor: 'blue',
    height:70,
    justifyContent: 'center',
    alignItems: 'center',
    width:'100%',
    position:'absolute',
    bottom: 0,
    padding: 0
  }
});
  
  