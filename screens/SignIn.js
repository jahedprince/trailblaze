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
        <View style={styles.container}>
          <View style={[styles.ellipseParent, styles.centeredAtBottom]}>
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
  container: {
    flex: 1,
    textAlign: "center",
    marginTop: windowHeight * 0.23,
    alignItems: "center",
  },
  ellipseParent: {
    position: "absolute",
  },
  centeredAtBottom: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SignIn;
