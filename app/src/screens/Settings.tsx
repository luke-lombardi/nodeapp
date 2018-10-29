import React, { Component } from 'react';
import { View, TextInput, StyleSheet, Text, AsyncStorage } from 'react-native';
// @ts-ignore
import { Button, Card } from 'react-native-elements';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
// import { Switch } from 'react-native-switch';

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
        savedTitle: 'Name',
        savedDescription: 'Description',
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
          {/* <Card containerStyle={styles.card}> */}
            <View style={styles.inputContainer}>
            <Text style={styles.settingsHeader}>Display Name</Text>
            <TextInput
              onChangeText={(title) => this.setState({title: title})}
              blurOnSubmit
              keyboardAppearance={'dark'}
              style={styles.input}
              maxLength={100}
              underlineColorAndroid='transparent'
              placeholder={this.state.savedTitle !== null ? this.state.savedTitle : 'Display Name'}
              placeholderTextColor={'lightgray'}
          />
            <TextInput
              onChangeText={(description) => this.setState({description: description})}
              blurOnSubmit
              keyboardAppearance={'dark'}
              style={styles.input}
              maxLength={100}
              underlineColorAndroid='transparent'
              placeholder={this.state.savedDescription !== null ? this.state.savedDescription : 'Display Description'}
              placeholderTextColor={'lightgray'}
          />

            <Button
                style={styles.button}
                onPress={this.saveSettings}
                title={'Save'}
            />

            </View>
          {/* </Card> */}
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
    alignItems: 'center',
    padding: 25,
  },
  settings: {
    marginTop: 100,
    alignItems: 'center',
  },
  settingsHeader: {
    fontSize: 22,
    color: 'gray',
  },
  button: {
    marginTop: 30,
    alignSelf: 'center',
    position: 'absolute',
    width: '100%',
  },
  card: {
    // backgroundColor: '#fffaf0',
    margin: '10%',
    width: '90%',
    height: '75%',
  },
  inputPadding: {
    marginTop: 10,
    width: '100%',
  },
  descriptionInput: {
    height: 50,
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 20,
    fontSize: 26,
  },
});