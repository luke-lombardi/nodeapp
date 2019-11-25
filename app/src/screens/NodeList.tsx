import React, { Component } from "react";
// @ts-ignore
import {
  View,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  InteractionManager,
  AsyncStorage,
  Alert
} from "react-native";
import { ButtonGroup, Icon } from "react-native-elements";
import { Button } from "react-native-elements";
import Moment from "moment";
// import Vote from '../components/Vote';
import NavigationService from "../services/NavigationService";
// import Logger from '../services/Logger';
// @ts-ignore
import IStoreState from "../store/IStoreState";
// @ts-ignore
import { connect, Dispatch } from "react-redux";
// import { bindActionCreators } from 'redux';
import Snackbar from "react-native-snackbar";

// const { height, width } = Dimensions.get("window");

interface IProps {
  functions: any;
  navigation: any;
  privatePersonList: Array<any>;
  privatePlaceList: Array<any>;
  publicPersonList: Array<any>;
  publicPlaceList: Array<any>;
}

interface IState {
  selectedIndex: number;
  data: Array<any>;
  isRefreshing: boolean;
  isLoading: boolean;
  elaspedTime: number;
  time: any;
  blacklist: any;
  refresh: boolean;
}

Moment.locale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "seconds",
    ss: "%ss",
    m: "a minute",
    mm: "%dm",
    h: "an hour",
    hh: "%dh",
    d: "a day",
    dd: "%dd",
    M: "a month",
    MM: "%dM",
    y: "a year",
    yy: "%dY"
  }
});

export class NodeList extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      selectedIndex: 0,
      data: this.props.publicPlaceList,
      isRefreshing: false,
      isLoading: false,
      elaspedTime: 0,
      time: "",
      blacklist: [],
      refresh: false
    };

    this.updateIndex = this.updateIndex.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
    this.countdown = this.countdown.bind(this);
    this.reportNode = this.reportNode.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.getBlacklist = this.getBlacklist.bind(this);
    this.goToChat = this.goToChat.bind(this);
  }

  componentDidMount() {
    // AsyncStorage.clear();
    this.getBlacklist();
  }

  componentWillReceiveProps(newProps: any) {
    if (
      newProps.publicPlaceList.length !== this.props.publicPlaceList.length ||
      newProps.privatePlaceList.length !== this.props.privatePlaceList.length
    ) {
      if (this.state.selectedIndex === 0) {
        this.setState({ data: this.props.publicPlaceList });
      } else {
        // this.setState({ data: this.props.privatePlaceList });
        return;
      }
    }
  }

  async getBlacklist() {
    let blacklist: any = await AsyncStorage.getItem("blacklist");

    if (blacklist !== null) {
      blacklist = JSON.parse(blacklist);
    } else {
      blacklist = [];
    }

    await this.setState({ blacklist: blacklist });
    console.log("this.state.blacklist", this.state.blacklist);
  }

  async goToChat(item, index) {
    NavigationService.reset("Chat", {
      action: "node_chat",
      nodeId: item.node_id,
      selectedNode: item,
      index: index,
      fromChat: true
      // nodeType: this.props.nodeType,
      // nodeIndex: this.state.nodeIndex,
    });
  }

  async reportNode(item: any) {
    Snackbar.show({
      title: `thanks for reporting offensive content. the content has been removed from your feed.`,
      duration: Snackbar.LENGTH_LONG
    });

    let blacklist: any = await AsyncStorage.getItem("blacklist");

    if (blacklist !== null) {
      blacklist = JSON.parse(blacklist);
    } else {
      blacklist = [];
    }

    blacklist.push(item.node_id);
    console.log("newBlacklist", blacklist);
    await AsyncStorage.setItem("blacklist", JSON.stringify(blacklist));
    // refresh nodelist after content is blocked
    this.setState({
      data: this.props.publicPlaceList,
      refresh: !this.state.refresh
    });
  }

  updateIndex(selectedIndex) {
    this.setState({ isLoading: true });
    if (selectedIndex === 0) {
      let closestNodes = this.props.publicPlaceList.sort((a, b) =>
        a.data.distance_in_miles < b.data.distance_in_miles ? -1 : 1
      );
      this.setState({
        selectedIndex: selectedIndex,
        data: closestNodes,
        isLoading: false
      });
    } else if (selectedIndex === 1) {
      let trendingNodes = this.props.publicPlaceList.sort((a, b) =>
        (a.data.total_messages !== undefined ? a.data.total_messages : 0) >
        (b.data.total_messages !== undefined ? b.data.total_messages : 0)
          ? -1
          : 1
      );
      this.setState({
        selectedIndex: selectedIndex,
        data: trendingNodes,
        isLoading: false
      });
    }
  }

  _onTouchNode(node: any, index: number) {
    let region = {
      latitude: parseFloat(node.data.latitude),
      longitude: parseFloat(node.data.longitude),
      latitudeDelta: parseFloat(node.data.latDelta),
      longitudeDelta: parseFloat(node.data.longDelta)
    };

    let nodeType = undefined;

    if (node.data.type === "place" && node.data.private) {
      nodeType = "privatePlace";
    } else if (node.data.type === "person" && node.data.private) {
      nodeType = "privatePerson";
    } else if (node.data.type === "place" && !node.data.private) {
      nodeType = "publicPlace";
    } else if (node.data.type === "person" && !node.data.private) {
      nodeType = "publicPerson";
    }

    NavigationService.reset("Map", {
      region: region,
      nodeType: nodeType,
      nodeIndex: index
    });
  }

  // TODO: figure out a better way to do this
  async countdown(item) {
    // {this.interval = setInterval(() => { this.countdown(item); }, 1000)}
    let elaspedTime = this.state.elaspedTime;
    elaspedTime += 1;

    let timeInMinutes = Moment()
      .startOf("day")
      .seconds(item.data.ttl - elaspedTime)
      .format("HH:mm:ss");
    await this.setState({
      elaspedTime: elaspedTime,
      time: timeInMinutes
    });
  }

  // @ts-ignore
  _renderItem = ({ item, index }) => (
    <View>
      <View style={{ alignSelf: "flex-end", zIndex: 5, right: "5%", top: 10 }}>
        <Icon
          name="flag"
          color="gray"
          size={18}
          type="feather"
          onPress={() =>
            Alert.alert(
              `report this node?`,
              `the content will be removed from your feed immediately.`,
              [
                { text: "submit", onPress: () => this.reportNode(item) },
                { text: "cancel" }
              ],
              { cancelable: true }
            )
          }
          containerStyle={{
            flex: 1,
            position: "absolute",
            top: 5,
            alignSelf: "flex-end"
          }}
        />
      </View>
      <TouchableOpacity
        onPress={async () => await this.goToChat(item.data, index)}
        activeOpacity={0.7}
        style={{
          flex: 1,
          backgroundColor: "white",
          borderColor: "rgba(218, 219, 221, 1)",
          // borderWidth: .5,
          marginTop: index === 0 ? 5 : 5,
          marginBottom: index === index.length - 1 ? 5 : 0,
          marginHorizontal: 5,
          paddingHorizontal: 5,
          borderRadius: 5,
          minHeight: 90
          // padding: 15,
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{ padding: 10, width: "90%", justifyContent: "flex-start" }}
          >
            <Text
              style={{
                color: "#262626",
                alignSelf: "flex-start",
                fontWeight: "600",
                fontSize: 18
              }}
            >
              {item.data.topic}
            </Text>
          </View>
          {/* <View style={{flex: 1, flexDirection: 'row', right: -10, width: '20%', position: 'absolute', justifyContent: 'center', alignSelf: 'flex-end', alignItems: 'center'}}>
          <Vote selectedNode={item.data} />
          </View> */}
        </View>
        <View
          style={{
            width: "100%",
            paddingHorizontal: 10,
            paddingVertical: 10,
            flex: 1,
            flexDirection: "row",
            alignItems: "flex-start",
            alignSelf: "flex-start",
            justifyContent: "space-between"
          }}
        >
          <Text style={{ fontSize: 14, color: "gray" }}>
            {item.data.distance_in_miles.toFixed(0) + " miles"}
          </Text>
          <Text
            onPress={async () => await this.goToChat(item.data, index)}
            style={{ fontSize: 14, color: "gray" }}
          >
            {item.data.total_messages !== undefined
              ? item.data.total_messages + " replies"
              : 0 + " replies"}
          </Text>
          <Text style={{ fontSize: 14, color: "gray" }}>
            {"expires " +
              Moment()
                .endOf("minute")
                .seconds(item.data.ttl)
                .fromNow()}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  async onRefresh() {
    await this.setState({ isRefreshing: true });
    let newList = await this.props.publicPlaceList;
    if (newList) {
      console.log("newlist", newList);
      this.setState({
        isRefreshing: false,
        data: newList
      });
      console.log("newlist", newList);
      this.setState({ isRefreshing: false });
    }
    // @ts-ignore
    this.setState({
      isRefreshing: false,
      data: newList
    });
  }

  render() {
    const buttons = ["nearest", "trending"];
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingTop: 45,
            paddingBottom: 10,
            flexDirection: "row",
            width: "100%",
            alignItems: "flex-start",
            alignSelf: "flex-start",
            justifyContent: "space-between",
            flex: 1,
            backgroundColor: "#006494"
          }}
        >
          <Icon
            name={"map-pin"}
            type={"feather"}
            size={30}
            underlayColor={"#006494"}
            color={"#ffffff"}
            containerStyle={{ flex: 1, top: 10 }}
            // containerStyle={{ top: 40, left: 10 }}
            onPress={() => NavigationService.reset("Map", {})}
          />
          <ButtonGroup
            innerBorderStyle={{ width: 0, color: "white" }}
            //
            containerStyle={{ flex: 4 }}
            // containerStyle={{ top: 30, borderWidth: 1, width: "60%" }}
            buttonStyle={{ height: 20, backgroundColor: "#006494" }}
            onPress={this.updateIndex}
            selectedIndex={this.state.selectedIndex}
            selectedButtonStyle={{
              borderBottomColor: "#262626",
              backgroundColor: "white"
            }}
            selectedTextStyle={{ color: "gray" }}
            buttons={buttons}
            textStyle={{ fontSize: 18, color: "white" }}
          />
          <Icon
            name={"edit"}
            type={"feather"}
            size={30}
            underlayColor={"#006494"}
            color={"#ffffff"}
            containerStyle={{ flex: 1, top: 10 }}
            // containerStyle={{ top: 40, right: 10 }}
            onPress={() => NavigationService.reset("CreateNode", {})}
          />
        </View>
        <View style={styles.flatlist}>
          <FlatList
            // filter blacklist nodes from nodeList
            data={this.state.data.filter(
              node => !this.state.blacklist.includes(node.data.node_id)
            )}
            renderItem={this._renderItem}
            extraData={this.state}
            onEndReachedThreshold={0}
            ListHeaderComponent={
              <View style={{ height: 0, marginTop: 0 }}></View>
            }
            showsVerticalScrollIndicator={true}
            keyExtractor={item => item.node_id}
            refreshing={this.state.isRefreshing}
            onRefresh={this.onRefresh}
            ListEmptyComponent={
              <View style={styles.nullContainer}>
                <Text style={styles.null}>no nodes have been created yet.</Text>
                <Button
                  containerStyle={styles.createNodeButton}
                  buttonStyle={{ borderRadius: 10 }}
                  title={"create node"}
                  onPress={() => NavigationService.reset("CreateNode", {})}
                />
              </View>
            }
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
    privatePersonList: state.privatePersonList,
    privatePlaceList: state.privatePlaceList,
    publicPersonList: state.publicPersonList,
    publicPlaceList: state.publicPlaceList
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeList);

const styles = StyleSheet.create({
  flatlist: {
    flex: 12,
    backgroundColor: "#F6F4F3",
    height: "100%",
    width: "100%"
  },
  nodeListItem: {
    width: "100%",
    marginTop: 10,
    marginBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(51, 51, 51, 0.1)",
    minHeight: 100,
    maxHeight: 120
  },
  nullContainer: {
    flex: 1,
    marginTop: "50%",
    justifyContent: "center",
    alignItems: "center"
  },
  null: {
    fontSize: 18,
    color: "gray",
    alignSelf: "center"
  },
  nullSubtitle: {
    fontSize: 14,
    color: "gray",
    paddingVertical: 10
  },
  button: {
    backgroundColor: "#262626"
  },
  createNodeButton: {
    top: 30,
    width: 150,
    borderRadius: 30
  },
  buttonContainer: {
    height: 50,
    // bottom: 45,
    paddingHorizontal: 100,
    borderBottomColor: "#262626",
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9);",
    width: "110%"
  },
  transparentButton: {},
  locationButton: {
    width: 20,
    height: 20,
    alignSelf: "flex-start",
    padding: 0
  }
});
