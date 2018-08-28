import React, { Component } from 'react';
import { View, StyleSheet, Text, AsyncStorage } from 'react-native';
import { Input, Icon, Button, Card } from 'react-native-elements';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { Switch } from 'react-native-switch';

interface IProps {
    navigation: any;
}

interface IState {
    name: string;
    description: string;
    savedTitle: any;
    savedDescription: any;
}

export class Settings extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
        name: '',
        description: '',
        savedTitle: '',
        savedDescription: '',
    };
    this.saveSettings = this.saveSettings.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.getSettings = this.getSettings.bind(this);
}

    componentWillMount() {
      this.getSettings();
    }

    async getSettings() {
      let response = await AsyncStorage.getItem('userSettings');
      let storage = JSON.parse(response);

      let savedTitle = storage.savedTitle;
      let savedDescription = storage.savedDescription;

      if (savedTitle && savedDescription !== null) {
        console.log('got title', savedTitle);
        this.setState({
          savedDescription: savedDescription,
          savedTitle: savedTitle,
        });
        return;
      }
    }

    render() {
      return (
        <View style={styles.settings}>
            <Card
            containerStyle={styles.card}>
            <View style={styles.inputContainer}>
            <Input
              placeholder={this.state.savedTitle !== null ? this.state.savedTitle : 'Display Name'}
              leftIcon={
                <Icon
                  name='settings'
                  size={20}
                  color='rgba(44,55,71,0.3)'
                />
              }
              containerStyle={styles.inputPadding}
              inputStyle={styles.descriptionInput}
              onChangeText={(name) => this.setState({name: name})}
              // enablesReturnKeyAutomatically={true}
              // onSubmitEditing={this.submitCreateNode}
              value={this.state.name}
            />
            <Input
              placeholder={this.state.savedDescription !== null ? this.state.savedDescription : 'Display Description'}
              leftIcon={
                <Icon
                  name='settings'
                  size={20}
                  color='rgba(44,55,71,0.3)'
                />
              }
              containerStyle={styles.inputPadding}
              inputStyle={styles.descriptionInput}
              onChangeText={(description) => this.setState({description: description})}
              // enablesReturnKeyAutomatically={true}
              // onSubmitEditing={this.submitCreateNode}
              value={this.state.description}
            />
                </View>
            <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Toggle Description</Text>
            <Switch
              circleBorderWidth={1}
              backgroundActive={'green'}
              backgroundInactive={'gray'}
              circleSize={30}
              style={styles.switch}
              value={'true'}
              onValueChange={ () => {this.setState({name: name});
            }
          }
            />

            <Button
                style={styles.button}
                onPress={this.saveSettings}
                title={'Save'}
            />

            </View>
          </Card>
        </View>

      );
    }

private async saveSettings() {
    let userSettings = {
      'userUuid': await AsyncStorage.getItem('user_uuid'),
      'savedTitle': this.state.name,
      'savedDescription': this.state.description,
    };

    let savedSettings = await AsyncStorage.setItem('userSettings', JSON.stringify(userSettings));

    if (savedSettings !== null) {
      console.log('saved user settings', savedSettings);
    } else {
      console.log('unable to save settings');
    }
    this.props.navigation.navigate('Map', {updateNodes: true});
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
        width: '100%',
        alignItems: 'center',
        padding: 20,
    },
    settings: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    button: {
        alignSelf: 'center',
        position: 'absolute',
        width: 200,
        top: 70,
    },
    switch: {
        padding: 20,
    },
    switchContainer: {
        top: 40,
        alignItems: 'center',
    },
    switchText: {
        marginBottom: 20,
        fontSize: 16,
        color: 'gray',
        alignSelf: 'center',
    },
    card: {
        marginTop: '10%',
        width: '90%',
        height: '90%',
    },
    inputPadding: {
        marginTop: 10,
        width: '100%',
      },
      descriptionInput: {
        height: 50,
      },
});