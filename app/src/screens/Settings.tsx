import React, { Component } from 'react';
import { View, StyleSheet, Text, AsyncStorage } from 'react-native';
// @ts-ignore
import { Button, Input } from 'react-native-elements';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';

interface IProps {
    navigation: any;
}

interface IState {
    title: string;
    description: string;
    savedTitle: any;
    savedDescription: any;
    privacy: boolean;
}

export class Settings extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
        title: '',
        description: '',
        savedTitle: 'Not Set',
        savedDescription: 'Not Set',
        privacy: false,
    };

    this.saveSettings = this.saveSettings.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.getSettings = this.getSettings.bind(this);
}

    componentDidMount() {
      this.getSettings();
    }

    async getSettings() {
      let response = await AsyncStorage.getItem('userSettings');
      let storage = JSON.parse(response);

      if (storage !== null) {
        let savedTitle = storage.savedTitle;
        let savedDescription = storage.savedDescription;

        await this.setState({
          savedDescription: savedDescription,
          savedTitle: savedTitle,
          title: savedTitle,
          description: savedDescription,
        });
      }
        return;
    }

    render() {
      return (
        <View style={styles.settings}>
            <View style={styles.inputContainer}>
            <Text style={styles.settingsHeader}>Set Alias</Text>
            <Input
              label={'Name'}
              leftIcon={
                <Icon
                  name='user'
                  size={24}
                  color='black'
                />}
              onChangeText={(title) => this.setState({title: title})}
              inputContainerStyle={styles.input}
              leftIconContainerStyle={{left: -10}}
              placeholder={this.state.savedTitle !== null ? this.state.savedTitle : 'Display Name'}
              placeholderTextColor={'lightgray'}
            />
            <Input
            label={'Description'}
            leftIcon={
              <Icon
                name='info'
                size={24}
                color='black'
              />}
              onChangeText={(description) => this.setState({description: description})}
              inputContainerStyle={styles.input}
              leftIconContainerStyle={{left: -10}}
              placeholder={this.state.savedDescription !== null ? this.state.savedDescription : 'Display Description'}
              placeholderTextColor={'lightgray'}
          />
            <Button
                style={styles.button}
                onPress={this.saveSettings}
                title={'Save'}
            />
            </View>
        </View>
      );
    }

private async saveSettings() {
    let userSettings = {
      'userUuid': await AsyncStorage.getItem('user_uuid'),
      'savedTitle': this.state.title,
      'savedDescription': this.state.description,
    };

    let savedSettings = await AsyncStorage.setItem('userSettings', JSON.stringify(userSettings));

    if (savedSettings !== null) {
      console.log('saved user settings', savedSettings);
    } else {
      console.log('unable to save settings');
    }

    this.props.navigation.navigate({Key: 'Map', routeName: 'Map', params: {updateNodes: true}});
  }
}

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

export default connect(mapStateToProps, mapDispatchToProps)(Settings);

const styles = StyleSheet.create({
  inputContainer: {
    top: 25,
    backgroundColor: 'white',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    paddingHorizontal: 25,
  },
  settings: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  inputHeader: {
    fontSize: 16,
    color: 'gray',
    paddingVertical: 10,
  },
  settingsHeader: {
    fontSize: 22,
    color: 'gray',
    paddingVertical: 22,
  },
  button: {
    top: 250,
    position: 'absolute',
    width: '100%',
  },
  inputPadding: {
    marginTop: 10,
    width: '100%',
  },
  descriptionInput: {
    height: 50,
  },
  input: {
    paddingVertical: 10,
    marginBottom: 10,
    width: '110%',
    fontSize: 26,
  },
});