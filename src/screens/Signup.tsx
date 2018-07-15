import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { CognitoUserPool, CognitoUserAttribute } from 'react-native-aws-cognito-js';
import Logger from '../services/Logger';
import SleepUtil from '../services/SleepUtil';

import Icon from 'react-native-vector-icons/FontAwesome';
import { Input, Button } from 'react-native-elements';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

// @ts-ignore
import { bindActionCreators } from 'redux';

// import { UsernameChangedActionCreator } from '../actions/AuthActions';
import Toast from 'react-native-easy-toast';

import LinearGradient from 'react-native-linear-gradient';



interface IProps {
  navigation: any;
  // Actions
  //  UsernameChanged?: (username: string) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
}

interface IState {
  username: string,
  password: string,
  confirmPassword: string,
  phoneNumber: string
  createButtonDisabled: boolean
}

export class Signup extends Component<IProps, IState> {
  userPool: CognitoUserPool;

  constructor(props: IProps){
    super(props);

    this.state = {
      username: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      createButtonDisabled: false
    };

    this.createUser = this.createUser.bind(this);
    this.validateSignup = this.validateSignup.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.updateUsername = this.updateUsername.bind(this);
  }

  componentWillMount(){
  }

  componentDidMount(){
    this.userPool = new CognitoUserPool({
      UserPoolId: 'us-east-1_qEU8dAgtl',
      ClientId: '7i8lcrp8i56gepd8k3s5afoe9i'
    });

  }

  async updateUsername(username: string){
      await this.setState({username: username});
  }

  createUser() {
    this.setState({createButtonDisabled: true});

    Logger.info('Currently has this value: ');
    Logger.info(`${this.userPool}`);

    const attributeList = [];
    const attributePhoneNumber = new CognitoUserAttribute({
        Name: "phone_number",
        Value: this.state.phoneNumber
    });
  
    attributeList.push(attributePhoneNumber);

    if(this.state.password != this.state.confirmPassword){
      this.validateSignup({code:'PasswordsDoNotMatch'}, null);
      return;
    }

    this.userPool.signUp(this.state.username, this.state.password, 
      attributeList, null, this.validateSignup);
  }

  async validateSignup(err,  result){
    var err_msg = '';

    if (err) {
      console.log(err);
      switch(err.code){
        case 'NetworkingError': 
          err_msg = 'Unable to connect to server.';
          break;
        case 'UsernameExistsException':
          err_msg = 'That username is taken.';
          break;
        case 'InvalidPasswordException':
          err_msg = 'Passwords must contain at least 1 uppercase letter and 1 number.';
          break;
        case 'InvalidParameterException':
          err_msg = 'Enter a valid phone number (e.g. +12124331111)';
          break;
        case 'PasswordsDoNotMatch':
          err_msg = 'Passwords do not match.';
          break;
        default: 
          err_msg = 'Unhandled error: ' + err.code
      }
   }
    else{
      console.log(result);
      // cognitoUser = result.user;
      this.setState({createButtonDisabled: false});
      this.props.navigation.navigate('ConfirmSignup', {username: this.state.username});
    }

    if(err_msg != ''){
      // @ts-ignore
      this.refs.toast.show(err_msg);
      await SleepUtil.SleepAsync(2000);
      this.setState({createButtonDisabled: false});
      return;
    }


  }

  render() {
    return (
      <View style={styles.view}>

      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.linearGradient}>

       <Text style={styles.header}>Sign up</Text>

        <View style={styles.loginCard}> 
          <Input
            placeholderTextColor='#CCFFCC'
            placeholder='Username'
            leftIcon={
              <Icon
                name='user'
                size={20}
                color='#CCFFCC'
              />
            }
            inputStyle={styles.inputText}
            containerStyle={styles.inputPadding}
            onChangeText={this.updateUsername}
            value={this.state.username}
            />

          <Input
            placeholderTextColor='#CCFFCC'
            keyboardType={'phone-pad'}
            placeholder='Phone number'
            leftIcon={
              <Icon
                name='phone'
                size={20}
                color='#CCFFCC'
              />
            }
            inputStyle={styles.inputText}
            containerStyle={styles.inputPadding}
            onChangeText={(phoneNumber) => this.setState({phoneNumber})}
            value={this.state.phoneNumber}
          />
          
          <Input
            placeholderTextColor='#CCFFCC'
            placeholder='Password'
            leftIcon={
              <Icon
                name='lock'
                size={20}
                color='#CCFFCC'
              />
            }
            secureTextEntry
            inputStyle={styles.inputText}
            containerStyle={styles.inputPadding}
            //@ts-ignore
            // inputContainerStyle={styles.containerPadding}
            onChangeText={(password) => this.setState({password})}
            value={this.state.password}
            />

          <Input
            placeholderTextColor='#CCFFCC'
            placeholder='Confirm Password'
            leftIcon={
              <Icon
                name='lock'
                size={20}
                color='#CCFFCC'
              />
            }
            secureTextEntry
            inputStyle={styles.inputText}
            containerStyle={styles.inputPadding}
            onChangeText={(confirmPassword) => this.setState({confirmPassword})}
            value={this.state.confirmPassword} 

          />
      
          <Button 
                  onPress={this.createUser}
                  title='Create Account'
                  disabled={this.state.createButtonDisabled}
                  buttonStyle={styles.button}
                  containerStyle={
                    {marginTop: 20, marginBottom:20}
                  }
          />

          </View>

          <Toast ref="toast"
            style={{backgroundColor:'#333333'}}
            position='bottom'
            positionValue={225}
            fadeInDuration={750}
            fadeOutDuration={1000}
            opacity={0.8}
            textStyle={{color:'white'}}
          />

      </LinearGradient>


      </View>

    )
  }
};

 // @ts-ignore
function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
  };
}


// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);

// define styles
const styles = StyleSheet.create({
  loginCard: {
    flex: 6,
  },
  header:{
    //position: 'absolute',
    color: '#CCFFCC',
    marginTop: 60,
    fontSize: 32,
    alignSelf: 'flex-start',
    left: 30,
    marginBottom: 40,
  },
  view: {
    flex: 1,
    alignItems: 'center',
  },
  linearGradient: {
    width: '100%',
    flex: 3,
  },
  button: {
    height:50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width:'80%',
    marginTop: 30,
    padding: 0,
    borderRadius: 100
  },
  inputPadding:{
    color: 'white',
    marginTop: 20,
    height: 50,
    borderColor: 'gray',
    borderRadius: 50,
    marginLeft: 15
  },
  inputText: {
    color: 'white',
    fontSize: 16,
  },
  containerPadding: {
    borderColor:'#CCFFCC',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRadius: 5,
    padding: 5,
  },
  subText: {
    marginTop: 20,
    alignSelf: 'center',
  }
});