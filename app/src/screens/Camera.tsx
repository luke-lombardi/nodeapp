import React, { Component } from 'react';
import { TouchableOpacity, View, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import { RNCamera } from 'react-native-camera';
import ViewFinder from 'react-native-view-finder';
import Icon from 'react-native-vector-icons/Entypo';

// import Logger from '../services/Logger';
// import ApiService from '../services/ApiService';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

// import { List, ListItem } from 'react-native-elements';
interface IProps {
  navigation: any;
  visitedNodeList: any;
}

interface IState {
  uuid: string;
  scanSuccess: boolean;
  isLoading: boolean;
  torchMode: boolean;
}

export class Camera extends Component<IProps, IState> {
  // private action: string;
  // private nextRoute: string;
  // private apiService: ApiService;
  // private nodeId: number;

  constructor(props: IProps) {
    super(props);

    this.state = {
      uuid: '',
      scanSuccess: false,
      isLoading: false,
      torchMode: false,
    },

    this.onBarCodeRead = this.onBarCodeRead.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.forwardData = this.forwardData.bind(this);
    this.toggleFlash = this.toggleFlash.bind(this);

    // this.apiService = new ApiService({});
    }

  onBarCodeRead(e) {
      if (this.state.scanSuccess) {
        return;
      }
      this.setState({scanSuccess: true});

      this.forwardData(e);
  }

  async forwardData(e) {
    console.log('Camera captured QR with data:' + JSON.stringify(e));
    // let uuid = e.data;

    if (e) {
      Alert.alert(e.title, e.message, [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ],
        { cancelable: false });
      return;
    }

  }

  componentWillMount() {
    //
  }

  componentWillUnmount() {
    //
  }

  componentDidMount() {
    // this.action = this.props.navigation.getParam('action', null);
    // this.nodeId = this.props.navigation.getParam('nodeId', null);
  }

  toggleFlash() {
    this.state.torchMode === false ?
    this.setState({torchMode: true}) :
    this.setState({torchMode: false});
  }

  render() {
    return (
      <View style={styles.container}>

        {
          this.state.isLoading &&
          <ActivityIndicator />
        }

        <RNCamera
            style={styles.container}
            barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
            onBarCodeRead={this.onBarCodeRead}
            type={RNCamera.Constants.Type.back}
            flashMode={
              this.state.torchMode ?
              RNCamera.Constants.FlashMode.torch :
              RNCamera.Constants.FlashMode.off
            }
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need permission to use your camera'}/>
            <ViewFinder />

              <TouchableOpacity
                style={styles.button}
                onPress={this.toggleFlash}
              >
              <Icon
                name='flashlight'
                size={35}
                color='rgba(44,55,71,1.0)'
              />
              </TouchableOpacity>

        </View>
    );
  }
}

 // @ts-ignore
 function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    // visitedNodeList: state.visitedNodeList
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Camera);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    borderWidth: 1,
    borderColor: 'rgba(44,55,71,0.3)',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 100,
    position: 'absolute',
    bottom: '5%',
    left: '5%',
  },
});