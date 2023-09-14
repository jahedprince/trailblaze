import * as React from "react";
import {
  Image,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { FontFamily, Color } from "../GlobalStyles";

import SignupComponent from "../components/SignupComponent";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const SignUp = () => {
  return (
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
          <SignupComponent />
        </View>
      </View>
    </ImageBackground>
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
    alignItems: "center", // Center horizontally
    top: windowHeight * 0.34,
    left: windowWidth * 0.12,
  },
});

export default SignUp;
