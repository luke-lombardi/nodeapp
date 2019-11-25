import React, { Component } from "react";
// @ts-ignore
import { View, StyleSheet, AsyncStorage, AppState, Alert } from "react-native";
import IStoreState from "../store/IStoreState";
import { connect, Dispatch } from "react-redux";
import Permissions from "react-native-permissions";
import { Text, Icon, CheckBox, Button } from "react-native-elements";
import OpenSettings from "react-native-open-settings";
import Swiper from "react-native-swiper";

// Services
import Logger from "../services/Logger";
import AuthService from "../services/AuthService";
import NavigationService from "../services/NavigationService";

interface IProps {
  functions: any;
  navigation: any;
}

interface IState {
  notificationPermissions: string;
  motionPermissions: string;
  locationPermissions: string;
}

export class GetPermissions extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      notificationPermissions: "",
      motionPermissions: "",
      locationPermissions: ""
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.setInitialPermissionState = this.setInitialPermissionState.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.checkPermissions = this.checkPermissions.bind(this);
    this.showModal = this.showModal.bind(this);
  }

  componentWillMount() {
    this.setInitialPermissionState();
  }

  componentDidMount() {
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this.handleAppStateChange);
  }

  handleAppStateChange = appState => {
    Logger.info(
      `GetPermissions.handleAppStateChange - app state changed: ${appState}`
    );
    if (appState === "active") {
      this.setInitialPermissionState();
    }
  };

  async setInitialPermissionState() {
    let currentPermissions = await AuthService.permissionsGranted();
    try {
      await this.setState({
        notificationPermissions: currentPermissions.notification,
        motionPermissions: currentPermissions.motion,
        locationPermissions: currentPermissions.location
      });
    } catch (error) {
      // Do nothing we unmounted
    }
  }

  async showModal(type: string) {
    // so if no props are passed, check permissionsRequested from async storage directly
    let permissionsRequested = await AuthService.permissionsRequested();

    switch (type) {
      case "location":
        Alert.alert(
          "background location request",
          "enable background location to discover events happening nearby.",
          [
            {
              text: "cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            // background location always requires user to give permission manually, so go directly to settings
            {
              text: "ok",
              onPress:
                permissionsRequested.location !== true
                  ? async () => {
                      await this.requestPermissions("location");
                      await AuthService.setPermissionsRequested("location");
                    }
                  : OpenSettings.openSettings()
            }
          ],
          { cancelable: false }
        );
        break;
      case "notification":
        Alert.alert(
          "notification request",
          "enable notifications to receive updates about events.",
          [
            {
              text: "cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            {
              text: "ok",
              onPress:
                permissionsRequested.notification !== true
                  ? async () => {
                      await this.requestPermissions("notification");
                      await AuthService.setPermissionsRequested("notification");
                    }
                  : OpenSettings.openSettings()
            }
          ],
          { cancelable: false }
        );
        break;
      case "motion":
        Alert.alert(
          "motion request",
          "enable motion to receive updates when you are nearby an event.",
          [
            {
              text: "cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            {
              text: "ok",
              onPress:
                permissionsRequested.motion !== true
                  ? async () => {
                      await this.requestPermissions("motion");
                      await AuthService.setPermissionsRequested("motion");
                    }
                  : OpenSettings.openSettings()
            }
          ],
          { cancelable: false }
        );
        break;
      default:
    }
  }

  async requestPermissions(type: string) {
    Logger.info(`GetPermissions.requestPermissions - called with type ${type}`);

    let hasPermissions: string = "";
    let response: string = undefined;

    // Check each permission type
    switch (type) {
      case "location":
        hasPermissions = await Permissions.check("location", {
          type: "always"
        });
        if (hasPermissions !== "authorized") {
          response = await Permissions.request("location", { type: "always" });
        }

        try {
          await this.setState({ locationPermissions: response });
        } catch (error) {
          //
        }
        break;
      case "motion":
        hasPermissions = await Permissions.check("motion");
        if (hasPermissions !== "authorized") {
          response = await Permissions.request("motion");
        }
        try {
          await this.setState({ motionPermissions: response });
        } catch (error) {
          //
        }
        break;
      case "notification":
        hasPermissions = await Permissions.check("notification");
        Logger.info(
          `GetPermissions.requestPermissions - permissions: ${hasPermissions}`
        );

        if (hasPermissions !== "authorized") {
          response = await Permissions.request("notification");
        }
        try {
          await this.setState({ notificationPermissions: response });
        } catch (error) {
          //
        }
        break;
      default:
      //
    }

    await AuthService.permissionsGranted();
  }

  async checkPermissions() {
    if (this.props.navigation !== undefined) {
      let hasNavigation = this.props.navigation.getParam(
        "hasNavigation",
        false
      );
      let hasPermissions = await AuthService.hasPermissions();

      if (hasNavigation && hasPermissions) {
        NavigationService.reset("Map", {});
      }
    } else {
      await this.props.functions.getPermissions();
    }
  }

  render() {
    return (
      <Swiper
        // style={{alignSelf: 'center', flex: 1, height: '100%', flexDirection: 'row', justifyContent: 'center'}}
        showsButtons={false}
        index={0}
        paginationStyle={{ position: "absolute", bottom: "5%" }}
        loop={false}
      >
        <View style={styles.slide}>
          <Text style={styles.header}>welcome to sudo! {"\u2728"}</Text>
          <Text style={styles.headerText}>
            an app for sharing interesting things in your neighborhood
          </Text>
          {/* <Text style={styles.text}>send private messages.</Text>
        <Text style={styles.text}>share your location.</Text>
        <Text style={styles.subtitle}>no accounts. always anonymous.</Text> */}
        </View>
        {/* USER AGREEMENT */}
        <View style={styles.container}>
          <Icon
            reverse
            // @ts-ignore
            name="list"
            type="material-icons"
            color="#517fa4"
            size={40}
            containerStyle={styles.rulesIcon}
          />
          <Text style={styles.agreementTitle}>user agreement</Text>
          <Text
            style={{
              fontSize: 14,
              paddingVertical: 20,
              width: "80%",
              alignSelf: "center",
              alignItems: "center"
            }}
          >
            let's keep our community an enjoyable and productive place to be.
          </Text>
          <View style={{ width: "100%", alignSelf: "flex-start" }}>
            <Text style={styles.rulesText}>
              1. don't threaten or bully other users
            </Text>
            <Text style={styles.rulesText}>
              2. don't post another user's sensitive information
            </Text>
            <Text style={styles.rulesText}>3. don't bully other users</Text>
            <Text style={styles.rulesText}>4. don't be a jerk</Text>
          </View>
        </View>
        <View style={styles.container}>
          <Icon
            reverse
            // @ts-ignore
            name="location-disabled"
            type="material-icons"
            color="#517fa4"
            size={40}
            containerStyle={styles.largeIcon}
          />
          <Text style={styles.centeredTextLarge}>let's get setup</Text>
          <Text
            style={{
              fontSize: 14,
              paddingVertical: 20,
              width: "80%",
              alignSelf: "center",
              alignItems: "center"
            }}
          >
            your location is required to use the app and connect with people
            nearby.
          </Text>
          <CheckBox
            center
            title={
              <View
                style={{
                  alignContent: "center",
                  alignItems: "center",
                  width: 200
                }}
              >
                <Text>enable background location</Text>
              </View>
            }
            iconRight
            containerStyle={{
              width: "80%",
              alignSelf: "center",
              borderRadius: 10
            }}
            checkedIcon="check"
            uncheckedIcon="circle-o"
            checkedColor="green"
            uncheckedColor="gray"
            onPress={async () => {
              await this.showModal("location");
            }}
            onIconPress={async () => {
              await this.showModal("location");
            }}
            checked={this.state.locationPermissions === "authorized"}
          />
          <CheckBox
            center
            title={
              <View
                style={{
                  alignContent: "center",
                  alignItems: "center",
                  width: 200
                }}
              >
                <Text>enable motion</Text>
              </View>
            }
            iconRight
            containerStyle={{
              width: "80%",
              alignSelf: "center",
              borderRadius: 10
            }}
            checkedIcon="check"
            uncheckedIcon="circle-o"
            checkedColor="green"
            uncheckedColor="gray"
            onPress={async () => {
              await this.showModal("motion");
            }}
            onIconPress={async () => {
              await this.showModal("motion");
            }}
            checked={this.state.motionPermissions === "authorized"}
          />
          <CheckBox
            center
            title={
              <View
                style={{
                  alignContent: "center",
                  alignItems: "center",
                  width: 200
                }}
              >
                <Text>enable push notifications</Text>
              </View>
            }
            iconRight
            containerStyle={{
              width: "80%",
              alignSelf: "center",
              borderRadius: 10
            }}
            checkedIcon="check"
            uncheckedIcon="circle-o"
            checkedColor="green"
            uncheckedColor="gray"
            onIconPress={async () => {
              await this.showModal("notification");
            }}
            onPress={async () => {
              await this.showModal("notification");
            }}
            checked={this.state.notificationPermissions === "authorized"}
          />
          <Button
            title="Continue"
            containerStyle={{ padding: 20, alignSelf: "center", width: "90%" }}
            onPress={async () => {
              await this.checkPermissions();
            }}
            disabled={
              this.state.locationPermissions !== "authorized" ||
              this.state.motionPermissions !== "authorized"
            }
          />
        </View>
      </Swiper>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
    padding: 10,
    width: "100%"
  },
  centeredTextLarge: {
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20
  },
  centeredTextSmall: {
    alignSelf: "center",
    marginBottom: 40,
    fontSize: 15
  },
  largeIcon: {
    alignSelf: "center",
    marginBottom: 10
  },
  rulesIcon: {
    alignSelf: "center",
    marginBottom: 10
  },
  rulesText: {
    width: "100%",
    paddingVertical: 5,
    paddingHorizontal: 30,
    fontSize: 20
  },
  agreementTitle: {
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20
  },
  slide: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#006494"
  },
  header: {
    width: "90%",
    marginTop: 100,
    alignSelf: "center",
    alignItems: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 30
  },
  subtitle: {
    width: "90%",
    paddingTop: 20,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontSize: 24
  },
  headerText: {
    marginVertical: 20,
    width: "90%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    // fontWeight: "bold",
    fontSize: 24
  },
  text: {
    width: "90%",
    marginVertical: 10,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontSize: 24
  }
});

// @ts-ignore
function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {};
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(GetPermissions);
