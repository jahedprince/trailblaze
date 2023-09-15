import * as React from "react";
import {
  Image,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { FontFamily, Color } from "../GlobalStyles";
import LoginComponent from "../components/LoginComponent";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const SignIn = () => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("../assets/cover2.png")}
        style={styles.backgroundImage}
      >
        <View style={styles.iphone14Pro}>
          <View
            style={[
              styles.ellipseParent,
              styles.groupChildLayout,
              styles.centeredAtBottom,
            ]}
          >
            <LoginComponent />
          </View>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  unsplashrajnd0b3hdwIcon: {
    zIndex: -1,
  },
  groupChild: {
    opacity: 0.7,
    left: 0,
    top: 0,
  },
  ellipseParent: {
    position: "absolute",
  },
  centeredAtBottom: {
    alignItems: "center",
    top: windowHeight * 0.3,
    left: windowWidth * 0.13,
  },
});

export default SignIn;
