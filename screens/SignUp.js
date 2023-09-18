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
import SignupComponent from "../components/SignupComponent";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const SignUp = () => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("../assets/cover.png")}
        style={styles.backgroundImage}
      >
        <View style={styles.container}>
          <View style={[styles.ellipseParent, styles.centeredAtBottom]}>
            <SignupComponent />
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
    justifyContent: "center",
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

export default SignUp;
