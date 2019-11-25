import React, { Component } from "react";
// @ts-ignore
import {
  StyleSheet,
  View,
  Text
  // TextInput,
  // ActivityIndicator
  // @ts-ignore
} from "react-native";
import { Button } from "react-native-elements";
import Modal from "react-native-modal";
import Swiper from "react-native-swiper";

interface IProps {
  functions: any;
}

interface IState {
  visibleModal: boolean;
}

export default class Tour extends Component<IProps, IState> {
  // @ts-ignore
  private action: string;

  constructor(props: IProps) {
    super(props);
    this.state = {
      visibleModal: true
    };

    // this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    //
  }

  render() {
    return (
      <Modal
        isVisible={this.state.visibleModal}
        onBackdropPress={this.props.functions.closeTourModal}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          alignSelf: "center"
        }}
      >
        <Swiper
          style={{
            alignSelf: "center",
            flex: 1,
            height: "100%",
            flexDirection: "row",
            justifyContent: "center"
          }}
          showsButtons={false}
          paginationStyle={{ position: "absolute", bottom: "10%" }}
          loop={false}
        >
          <View style={styles.slide}>
            <Text style={styles.header}>
              got something to share with your neighborhood?
            </Text>
            <Text style={styles.text}>drop a node!</Text>
            <Text style={styles.altText}>popular topics include...</Text>
            <Text style={styles.text}>
              {"\u2022"} a party happening nearby{" "}
            </Text>
            <Text style={styles.text}>{"\u2022"} lost and found </Text>
            <Text style={styles.text}>{"\u2022"} missed connections </Text>
            <Text style={styles.text}>{"\u2022"} rants and raves </Text>

            <Text style={styles.subtitle}>
              whether it's an open bar, parking spot, or free burrito at
              chipotle, your neighborhood wants to hear about it!
            </Text>
            {/* <Text style={styles.subtitle}>no accounts. always anonymous.</Text> */}
            <Button
              title="let's go!"
              titleStyle={{
                color: "rgba(0,0,0, 0.9)",
                fontWeight: "bold",
                fontSize: 24
              }}
              buttonStyle={{
                height: 100,
                backgroundColor: "white",
                borderWidth: 0.5,
                borderColor: "gray",
                borderRadius: 0
              }}
              containerStyle={{
                position: "absolute",
                width: "100%",
                bottom: 15,
                opacity: 0.9
              }}
              onPress={this.props.functions.closeTourModal}
            />
          </View>
        </Swiper>
      </Modal>
    );
  }
}

// @ts-ignore
const styles = StyleSheet.create({
  wrapper: {},
  slide: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#006494"
  },
  header: {
    width: "90%",
    paddingTop: 60,
    alignSelf: "center",
    alignItems: "center",
    color: "white",
    fontSize: 24
  },
  altText: {
    width: "90%",
    marginVertical: 20,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    color: "rgba(255,255,255, 0.5)",
    fontSize: 24
  },
  text: {
    width: "90%",
    marginVertical: 5,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontSize: 24
  },
  subtitle: {
    width: "90%",
    paddingTop: 30,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    color: "rgba(255,255,255, 0.6)",
    fontSize: 24
  },
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0,
    bottom: 0
  },
  scrollableModal: {
    height: "32%",
    width: "100%"
  },
  scrollableModalContent1: {
    width: "100%",
    height: 90,
    backgroundColor: "#006494",
    alignItems: "center",
    justifyContent: "center"
  },
  fullWidthButton: {
    paddingTop: 20,
    paddingBottom: 10,
    // flex: 1,
    alignSelf: "stretch",
    backgroundColor: "#ffffff",
    height: 90,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonStyle: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
    borderColor: "rgba(51, 51, 51, 0.8)",
    borderWidth: 2.0
  },
  modalContent: {
    backgroundColor: "#006494",
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)"
  }
});
